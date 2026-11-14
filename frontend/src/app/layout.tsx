import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "ResQAI - Disaster Relief & Intelligent Route Optimization Platform",
  description: "AI-Powered Emergency Response, Equitable Resource Allocation, and Dynamic Route Optimization Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
          <p>© 2026 ResQAI Capstone Project - Autonomous Disaster Management, Max-Min Allocation & Geospatial VRP Engine.</p>
        </footer>
      </body>
    </html>
  );
}

