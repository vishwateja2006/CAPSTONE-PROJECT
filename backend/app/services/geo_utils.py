import math
from typing import List, Tuple, Dict, Any, Optional

Point = Tuple[float, float]  # (latitude, longitude)

def point_in_polygon(point: Point, polygon: List[Point]) -> bool:
    """
    Ray-casting algorithm to determine if a GPS coordinate is inside a polygon.
    point: (lat, lon)
    polygon: list of (lat, lon) tuples forming closed or open ring.
    """
    x, y = point[1], point[0]  # lon (x), lat (y)
    n = len(polygon)
    inside = False

    p1x, p1y = polygon[0][1], polygon[0][0]
    for i in range(n + 1):
        p2x, p2y = polygon[i % n][1], polygon[i % n][0]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y

    return inside

def ccw(A: Point, B: Point, C: Point) -> bool:
    """Check if three points are listed in counter-clockwise order."""
    return (C[0] - A[0]) * (B[1] - A[1]) > (B[0] - A[0]) * (C[1] - A[1])

def segments_intersect(A: Point, B: Point, C: Point, D: Point) -> bool:
    """Check if line segment AB intersects line segment CD."""
    return (ccw(A, C, D) != ccw(B, C, D)) and (ccw(A, B, C) != ccw(A, B, D))

def path_intersects_polygon(start: Point, end: Point, polygon: List[Point]) -> bool:
    """
    Checks if the direct line of travel between start and end intersects any edge of the hazard polygon,
    or if either endpoint is inside the polygon.
    """
    if point_in_polygon(start, polygon) or point_in_polygon(end, polygon):
        return True

    n = len(polygon)
    for i in range(n):
        edge_start = polygon[i]
        edge_end = polygon[(i + 1) % n]
        if segments_intersect(start, end, edge_start, edge_end):
            return True

    return False

def find_detour_around_polygon(start: Point, end: Point, polygon: List[Point]) -> List[Point]:
    """
    Calculates a detour waypoint around the hazardous polygon perimeter.
    Finds the polygon vertex that adds the minimum excess travel distance.
    """
    from app.services.route_optimizer import haversine_distance_km

    best_vertex = None
    min_detour_dist = float("inf")

    for vertex in polygon:
        # Distance: start -> vertex -> end
        d = haversine_distance_km(start[0], start[1], vertex[0], vertex[1]) + \
            haversine_distance_km(vertex[0], vertex[1], end[0], end[1])
        if d < min_detour_dist:
            min_detour_dist = d
            best_vertex = vertex

    if best_vertex:
        return [best_vertex]
    return []

