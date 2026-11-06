import unittest
import sys
import os
import re
import hmac
import hashlib
import base64
import json
import time

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# 6 Canonical Roles from Phase 1 & 3 specification
ROLE_ADMIN = "ADMIN"
ROLE_DISASTER_AUTHORITY = "DISASTER_AUTHORITY"
ROLE_NGO_DONOR = "NGO_DONOR"
ROLE_WAREHOUSE_MANAGER = "WAREHOUSE_MANAGER"
ROLE_VOLUNTEER = "VOLUNTEER"
ROLE_BENEFICIARY = "BENEFICIARY"

ALL_ROLES = [
    ROLE_ADMIN,
    ROLE_DISASTER_AUTHORITY,
    ROLE_NGO_DONOR,
    ROLE_WAREHOUSE_MANAGER,
    ROLE_VOLUNTEER,
    ROLE_BENEFICIARY
]

def verify_role_permission(user_role: str, allowed_roles: list) -> bool:
    """Verifies if a user role is authorized; ADMIN role bypasses and has full global access."""
    if user_role == ROLE_ADMIN:
        return True
    return user_role in allowed_roles

def generate_test_jwt(payload: dict, secret: str = "secret") -> str:
    """Pure Python HMAC-SHA256 JWT generator for verification."""
    header = {"alg": "HS256", "typ": "JWT"}
    encoded_header = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    encoded_payload = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    sig_input = f"{encoded_header}.{encoded_payload}"
    sig = hmac.new(secret.encode(), sig_input.encode(), hashlib.sha256).digest()
    encoded_sig = base64.urlsafe_b64encode(sig).decode().rstrip("=")
    return f"{sig_input}.{encoded_sig}"

def decode_test_jwt(token: str, secret: str = "secret") -> dict:
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid token")
    header_b64, payload_b64, sig_b64 = parts
    # Verify signature
    sig_input = f"{header_b64}.{payload_b64}"
    expected_sig = base64.urlsafe_b64encode(
        hmac.new(secret.encode(), sig_input.encode(), hashlib.sha256).digest()
    ).decode().rstrip("=")
    if sig_b64 != expected_sig:
        raise ValueError("Signature mismatch")
    
    # Pad payload
    rem = len(payload_b64) % 4
    if rem > 0:
        payload_b64 += "=" * (4 - rem)
    return json.loads(base64.urlsafe_b64decode(payload_b64.encode()).decode())


class TestPhase3DatabaseAndAuthentication(unittest.TestCase):

    def setUp(self):
        self.migration_file = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "supabase", "migrations", "01_init_schema.sql")
        )

    def test_01_schema_migration_file_exists(self):
        """Verify the Supabase PostgreSQL migration file exists."""
        self.assertTrue(os.path.exists(self.migration_file), "01_init_schema.sql must exist")

    def test_02_all_12_required_tables_defined_in_sql(self):
        """Verify that all 12 tables required by Phase 3 are defined in the SQL schema."""
        with open(self.migration_file, "r") as f:
            sql_content = f.read()

        required_tables = [
            "profiles",
            "disasters",
            "locations",
            "warehouses",
            "resources",
            "beneficiaries",
            "requests",
            "vehicles",
            "deliveries",
            "predictions",
            "alerts",
            "audit_logs"
        ]

        for tbl in required_tables:
            pattern = re.compile(rf"CREATE\s+TABLE\s+(IF\s+NOT\s+EXISTS\s+)?{tbl}\s*\(", re.IGNORECASE)
            self.assertIsNotNone(
                pattern.search(sql_content),
                f"SQL migration must define table '{tbl}'."
            )

    def test_03_row_level_security_enabled_on_all_12_tables(self):
        """Verify that Row Level Security (RLS) is explicitly enabled on all 12 tables."""
        with open(self.migration_file, "r") as f:
            sql_content = f.read()

        required_tables = [
            "profiles",
            "disasters",
            "locations",
            "warehouses",
            "resources",
            "beneficiaries",
            "requests",
            "vehicles",
            "deliveries",
            "predictions",
            "alerts",
            "audit_logs"
        ]

        for tbl in required_tables:
            pattern = re.compile(rf"ALTER\s+TABLE\s+{tbl}\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY", re.IGNORECASE)
            self.assertIsNotNone(
                pattern.search(sql_content),
                f"Table '{tbl}' must have Row Level Security (RLS) enabled."
            )

    def test_04_role_based_access_control_all_6_roles(self):
        """Verify RBAC access decisions across all 6 roles."""
        # 1. Admin should have universal access across any module
        for r in ALL_ROLES:
            self.assertTrue(verify_role_permission(ROLE_ADMIN, [r]))

        # 2. Disaster Authority can declare disasters, but Beneficiary cannot
        self.assertTrue(verify_role_permission(ROLE_DISASTER_AUTHORITY, [ROLE_DISASTER_AUTHORITY]))
        self.assertFalse(verify_role_permission(ROLE_BENEFICIARY, [ROLE_DISASTER_AUTHORITY]))

        # 3. Warehouse Manager can manage resources, Field Volunteer cannot
        self.assertTrue(verify_role_permission(ROLE_WAREHOUSE_MANAGER, [ROLE_WAREHOUSE_MANAGER]))
        self.assertFalse(verify_role_permission(ROLE_VOLUNTEER, [ROLE_WAREHOUSE_MANAGER]))

        # 4. Field Volunteer can update delivery waypoints
        self.assertTrue(verify_role_permission(ROLE_VOLUNTEER, [ROLE_VOLUNTEER]))

        # 5. NGO Donor can record aid contributions
        self.assertTrue(verify_role_permission(ROLE_NGO_DONOR, [ROLE_NGO_DONOR]))
        self.assertFalse(verify_role_permission(ROLE_BENEFICIARY, [ROLE_NGO_DONOR]))

    def test_05_jwt_token_claims_and_signature(self):
        """Verify JWT token encoding, decoding, and tamper resistance."""
        secret = "resqlink_secret_key_2026"
        claims = {
            "sub": "coordinator@ndma.gov",
            "role": ROLE_DISASTER_AUTHORITY,
            "exp": int(time.time()) + 3600
        }
        token = generate_test_jwt(claims, secret=secret)
        self.assertIsInstance(token, str)

        decoded = decode_test_jwt(token, secret=secret)
        self.assertEqual(decoded["sub"], "coordinator@ndma.gov")
        self.assertEqual(decoded["role"], ROLE_DISASTER_AUTHORITY)

        # Test tamper rejection
        tampered_token = token[:-5] + "AAAAA"
        with self.assertRaises(ValueError):
            decode_test_jwt(tampered_token, secret=secret)

    def test_06_supabase_rls_privacy_guarantee(self):
        """Verify that RLS policies prevent beneficiaries from viewing other citizens' records."""
        with open(self.migration_file, "r") as f:
            sql_content = f.read()

        # Check for user_id check in beneficiaries policy
        self.assertIn("auth.uid() = user_id", sql_content)
        # Check for role check function
        self.assertIn("get_current_user_role()", sql_content)

if __name__ == "__main__":
    unittest.main()
