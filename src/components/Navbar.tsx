"use client";

import React, { useState } from "react";
import { PERSONAL, NAV } from "@/lib/data";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navTo = (href: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }, menuOpen ? 400 : 0);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav id="navbar" className="init-hidden-nav">
        <button
          className="nav-logo magnetic"
          onClick={() => navTo("#hero")}
          style={{ fontFamily: "var(--f-display)", background: "none", border: "none" }}
        >
          MAA<span style={{ color: "var(--c-ember)" }}>.</span>
        </button>
        
        <div className="nav-links hidden md:flex">
          {NAV.map((n) => (
            <button key={n.href} className="nav-link" onClick={() => navTo(n.href)}>
              {n.label}
            </button>
          ))}
        </div>
        
        <button className="nav-cta magnetic hidden md:block" onClick={() => navTo("#contact")} data-hover>
          Hire Me ↗
        </button>
        
        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "none",
            display: "flex",
            flexDirection: "column",
            gap: 5,
            padding: 4,
            zIndex: 501,
          }}
        >
          <span style={{ display: "block", width: 24, height: 1.5, background: "var(--c-text)", transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translateY(8px)" : "none" }} />
          <span style={{ display: "block", width: 24, height: 1.5, background: "var(--c-text-3)", opacity: menuOpen ? 0 : 1, transition: "all 0.3s" }} />
          <span style={{ display: "block", width: 24, height: 1.5, background: "var(--c-text)", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translateY(-8px)" : "none" }} />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 450,
          background: "rgba(248,247,244,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          transform: menuOpen ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderBottom: menuOpen ? "1px solid var(--c-border)" : "none",
        }}
      >
        {NAV.map((n, i) => (
          <button
            key={n.href}
            onClick={() => navTo(n.href)}
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(36px,10vw,64px)",
              fontWeight: 800,
              color: "var(--c-text)",
              background: "none",
              border: "none",
              cursor: "none",
              letterSpacing: "-0.02em",
              opacity: menuOpen ? 1 : 0,
              transform: menuOpen ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.5s ease ${0.15 + i * 0.06}s, transform 0.5s ease ${0.15 + i * 0.06}s`,
            }}
          >
            <span style={{ color: "var(--c-ember)", fontSize: "0.45em", fontFamily: "var(--f-mono)", letterSpacing: "0.1em", verticalAlign: "super", marginRight: 8 }}>
              0{i + 1}
            </span>
            {n.label}
          </button>
        ))}
        <a
          href={`mailto:${PERSONAL.email}`}
          style={{
            marginTop: 24,
            fontFamily: "var(--f-mono)",
            fontSize: 13,
            color: "var(--c-ember)",
            letterSpacing: "0.1em",
            opacity: menuOpen ? 1 : 0,
            transition: "opacity 0.5s ease 0.5s",
          }}
        >
          {PERSONAL.email}
        </a>
      </div>
    </>
  );
}
