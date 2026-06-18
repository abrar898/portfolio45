"use client";

import { useEffect, useRef, useState } from "react";
import { PERSONAL, STATS, SKILLS, PROJECTS, EXPERIENCE, NAV } from "@/lib/data";
import HeroCanvas from "@/components/HeroCanvas";
import ContactForm from "@/components/ContactForm";
import CyberTerminal from "@/components/CyberTerminal";
import ProjectCard from "@/components/ProjectCard";
import Navbar from "@/components/Navbar";

export default function Home() {
  const mountedRef = useRef(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    Promise.all([
      import("gsap").then((m) => m.gsap),
      import("gsap/ScrollTrigger"),
      import("lenis"),
    ]).then(([gsap, stMod, LenisModule]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ScrollTrigger = (stMod as any).ScrollTrigger ?? stMod.default;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Lenis = (LenisModule as any).default ?? LenisModule;

      gsap.registerPlugin(ScrollTrigger);

      /* ── Lenis Smooth Scroll ── */
      const lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time: number) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      /* ── Scroll progress bar ── */
      const progressBar = document.getElementById("scroll-progress");
      if (progressBar) {
        ScrollTrigger.create({
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self: { progress: number }) => {
            progressBar.style.transform = `scaleX(${self.progress})`;
          },
        });
      }

      /* ── Active nav section tracker ── */
      const sections = ["hero", "about", "skills", "projects", "experience", "contact"];
      sections.forEach((id) => {
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: "top 50%",
          end: "bottom 50%",
          onEnter: () => setActiveSection(id),
          onEnterBack: () => setActiveSection(id),
        });
      });

      /* ── Custom Cursor & Event Delegation ── */
      const dot = document.getElementById("cursor-dot");
      const ring = document.getElementById("cursor-ring");
      
      if (dot && ring) {
        // Global mouse movement handling for cursor position and hover effects
        const handleGlobalMouseMove = (e: MouseEvent) => {
          gsap.set(dot, { x: e.clientX - 4, y: e.clientY - 4 });
          gsap.to(ring, { x: e.clientX - 20, y: e.clientY - 20, duration: 0.45, ease: "expo.out" });

          // Elegant hover detection on headers/interactive elements using event delegation
          const target = e.target as HTMLElement;
          if (target) {
            const isText = target.closest("h1, h2");
            const isInteractive = target.closest("a, button, [data-hover], input, textarea");

            if (isText) {
              ring.classList.add("is-text");
              ring.classList.remove("is-hovered");
            } else if (isInteractive) {
              ring.classList.remove("is-text");
              ring.classList.add("is-hovered");
            } else {
              ring.classList.remove("is-text");
              ring.classList.remove("is-hovered");
            }
          }
        };

        const handleMouseLeaveWindow = () => gsap.to([dot, ring], { opacity: 0 });
        const handleMouseEnterWindow = () => gsap.to([dot, ring], { opacity: 1 });

        window.addEventListener("mousemove", handleGlobalMouseMove);
        document.addEventListener("mouseleave", handleMouseLeaveWindow);
        document.addEventListener("mouseenter", handleMouseEnterWindow);
      }

      /* ── Global Magnetic Buttons Event Delegation ── */
      const handleMagneticMouseMove = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const magneticEl = target.closest(".magnetic") as HTMLElement;
        if (magneticEl) {
          const r = magneticEl.getBoundingClientRect();
          const dx = (e.clientX - r.left - r.width / 2) * 0.35;
          const dy = (e.clientY - r.top - r.height / 2) * 0.35;
          gsap.to(magneticEl, { x: dx, y: dy, duration: 0.4, ease: "expo.out" });
        }
      };

      const handleMagneticMouseOut = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const magneticEl = target.closest(".magnetic") as HTMLElement;
        if (magneticEl) {
          const relatedTarget = e.relatedTarget as HTMLElement;
          if (!relatedTarget || !magneticEl.contains(relatedTarget)) {
            gsap.to(magneticEl, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
          }
        }
      };

      document.addEventListener("mousemove", handleMagneticMouseMove);
      document.addEventListener("mouseout", handleMagneticMouseOut);

      /* ── Preloader ── */
      const preloader = document.getElementById("preloader");
      const countEl = preloader?.querySelector(".pre-count") as HTMLElement;
      const barEl = preloader?.querySelector(".pre-bar") as HTMLElement;
      const preLines = preloader?.querySelectorAll(".pre-line");
      
      if (preloader && countEl && barEl) {
        gsap.timeline({
          onComplete: () => {
            const tl = gsap.timeline();
            if (preLines) {
              tl.to(Array.from(preLines), {
                scaleY: 0,
                transformOrigin: "bottom center",
                duration: 0.9,
                ease: "expo.inOut",
                stagger: { each: 0.04, from: "center" },
              });
            }
            tl.to(preloader, { autoAlpha: 0, duration: 0.4 }, "-=0.2");
            tl.call(() => {
              (preloader as HTMLElement).style.display = "none";
            });
            tl.call(() => revealHero());
          }
        }).to({ v: 0 }, {
          v: 100,
          duration: 1.8,
          ease: "power3.inOut",
          onUpdate: function () {
            const val = Math.round(this.targets()[0].v);
            countEl.textContent = String(val).padStart(3, "0");
            barEl.style.width = val + "%";
          },
        });
      } else {
        revealHero();
      }

      /* ── Hero Entrance Reveal Animations ── */
      function revealHero() {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to("#navbar", { opacity: 1, y: 0, duration: 1.0 }, 0.0)
          .to("#side-dots", { opacity: 1, x: 0, duration: 0.8 }, 0.3)
          .to("#scroll-progress", { opacity: 1, duration: 0.5 }, 0.4)
          .to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.8 }, 0.2)
          .to(".hero-badge", { opacity: 1, y: 0, duration: 0.7 }, 0.25)
          .to(".hero-title .word", { y: "0%", duration: 1.1, stagger: 0.07 }, 0.35)
          .to(".hero-desc", { opacity: 1, y: 0, duration: 0.9 }, 0.75)
          .to(".hero-stats", { opacity: 1, y: 0, duration: 0.8 }, 0.85)
          .to(".hero-scroll", { opacity: 1, y: 0, duration: 0.9 }, 0.9);
      }

      /* ── Scroll Reveals ── */
      document.querySelectorAll(".reveal-title").forEach((title) => {
        const words = title.querySelectorAll(".word");
        gsap.fromTo(words,
          { y: "110%" },
          {
            y: "0%",
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: title,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });
      gsap.utils.toArray<Element>(".section-label").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          x: -24,
          duration: 0.8,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 92%" },
        });
      });
      gsap.from(".about-bio", {
        opacity: 0,
        y: 28,
        duration: 1.0,
        ease: "expo.out",
        scrollTrigger: { trigger: ".about-bio", start: "top 82%" },
      });
      gsap.from(".about-extra-text", {
        opacity: 0,
        y: 20,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: ".about-extra-text", start: "top 85%" },
      });
      gsap.from(".achievement-card", {
        opacity: 0,
        y: 30,
        x: -20,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: ".achievement-card", start: "top 85%" },
      });

      /* Stats Counter Animation */
      gsap.utils.toArray<Element>(".stat-item").forEach((item, i) => {
        const numEl = item.querySelector(".stat-num") as HTMLElement;
        const end = parseInt(numEl?.dataset.val ?? "0");
        const suf = numEl?.dataset.suf ?? "";
        gsap.from(item, {
          opacity: 0,
          y: 40,
          duration: 0.7,
          ease: "expo.out",
          delay: i * 0.1,
          scrollTrigger: { trigger: ".stat-grid", start: "top 80%" },
        });
        gsap.fromTo({ v: 0 }, { v: 0 }, {
          v: end,
          duration: 1.5,
          ease: "power3.out",
          onUpdate: function () {
            if (numEl) numEl.innerHTML = Math.round(this.targets()[0].v) + `<span>${suf}</span>`;
          },
          scrollTrigger: { trigger: ".stat-grid", start: "top 80%" },
        });
      });

      /* Technical Arsenal columns */
      gsap.from(".skill-col", {
        opacity: 0,
        y: 50,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".skills-grid", start: "top 80%" },
      });

      /* Proficiency track bars */
      gsap.utils.toArray<Element>(".prof-fill").forEach((bar) => {
        const w = (bar as HTMLElement).dataset.w ?? "0";
        gsap.fromTo(bar, { scaleX: 0 }, {
          scaleX: 1,
          duration: 1.4,
          ease: "expo.out",
          transformOrigin: "left center",
          scrollTrigger: { trigger: bar, start: "top 90%" },
        });
        (bar as HTMLElement).style.width = w;
      });

      /* Horizontal project scroll track pinning */
      const track = document.querySelector(".projects-track") as HTMLElement;
      if (track) {
        const totalScroll = track.scrollWidth - window.innerWidth + 96;
        gsap.to(track, {
          x: -totalScroll,
          ease: "none",
          scrollTrigger: {
            trigger: ".projects-scroll-wrap",
            start: "top top",
            end: () => "+=" + (totalScroll + 300),
            scrub: 1.0,
            pin: true,
            anticipatePin: 1,
          },
        });
        track.querySelectorAll(".project-card").forEach((card, i) => {
          gsap.from(card, {
            opacity: 0,
            y: 30,
            scale: 0.96,
            duration: 0.8,
            ease: "expo.out",
            scrollTrigger: {
              trigger: ".projects-scroll-wrap",
              start: `top+=${i * 60} top`,
              toggleActions: "play none none none",
            },
          });
        });
      }

      /* Career Experience Journey */
      gsap.from(".exp-item", {
        opacity: 0,
        x: -32,
        duration: 0.85,
        ease: "expo.out",
        stagger: 0.10,
        scrollTrigger: { trigger: ".exp-list", start: "top 78%" },
      });

      /* Contact Form big text reveals */
      const contactBig = document.querySelector(".contact-big");
      if (contactBig) {
        const words = contactBig.querySelectorAll(".word");
        gsap.fromTo(words,
          { y: "110%" },
          {
            y: "0%",
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.06,
            scrollTrigger: {
              trigger: contactBig,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          }
        );
      }
      gsap.from(".contact-form-wrap", {
        opacity: 0,
        y: 40,
        duration: 1.0,
        ease: "expo.out",
        scrollTrigger: { trigger: ".contact-form-wrap", start: "top 82%" },
      });
      gsap.from(".contact-links", {
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: ".contact-links", start: "top 88%" },
      });

      /* Divider reveals */
      gsap.utils.toArray<Element>(".animate-line").forEach((line) => {
        gsap.from(line, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: line, start: "top 92%" },
        });
      });

      /* Parallax glowing blobs */
      document.querySelectorAll<HTMLElement>(".parallax-blob").forEach((blob) => {
        const speed = parseFloat(blob.dataset.speed ?? "0.15");
        gsap.to(blob, { yPercent: -80 * speed, ease: "none", scrollTrigger: { trigger: blob.parentElement!, scrub: true } });
      });

      gsap.from("footer", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "expo.out",
        scrollTrigger: { trigger: "footer", start: "top 95%" },
      });

      /* Back to top button action */
      const backTop = document.getElementById("back-top");
      if (backTop) {
        ScrollTrigger.create({
          start: "top+=400 top",
          onEnter: () => gsap.to(backTop, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }),
          onLeaveBack: () => gsap.to(backTop, { opacity: 0, y: 20, duration: 0.4 }),
        });
        backTop.addEventListener("click", () => lenis.scrollTo(0));
      }

    }).catch((err) => console.error("Init error:", err));
  }, []);

  return (
    <>
      {/* Film grain noise texture overlay */}
      <div className="grain-overlay" />

      {/* Global Interactive Cursor elements */}
      <div id="cursor-dot" aria-hidden />
      <div id="cursor-ring" aria-hidden />

      {/* Scroll indicator bar */}
      <div id="scroll-progress" className="init-hidden-progress" style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(to right, var(--c-ember), var(--c-gold))",
        transformOrigin: "left center", transform: "scaleX(0)", zIndex: 999,
        boxShadow: "0 0 14px var(--c-ember)",
      }} />

      {/* Side tracker navigation dots */}
      <div id="side-dots" className="init-hidden-dots" style={{
        position: "fixed", right: 24, top: "50%", transform: "translateY(-50%)",
        zIndex: 400, display: "flex", flexDirection: "column", gap: 12,
      }}>
        {[...NAV.map(n => ({ id: n.href.slice(1), label: n.label })), { id: "hero", label: "Top" }]
          .reverse()
          .map((s) => (
            <button
              key={s.id}
              data-nav-id={s.id}
              className={`nav-dot ${activeSection === s.id ? "active" : ""}`}
              onClick={() => document.querySelector(`#${s.id}`)?.scrollIntoView({ behavior: "smooth" })}
              title={s.label}
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: activeSection === s.id ? "var(--c-ember)" : "rgba(255,255,255,0.18)",
                border: "none", cursor: "none", padding: 0,
                transition: "background 0.3s ease, transform 0.3s ease",
              }}
            />
          ))}
      </div>

      {/* Screen Entrance Preloader */}
      <div id="preloader">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="pre-line" style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${i * 12.5}%`, width: "12.5%",
            background: "var(--c-bg)", transformOrigin: "bottom center",
          }} />
        ))}
        <div className="pre-count" style={{ position: "relative", zIndex: 2 }}>000</div>
        <div className="pre-bar" />
        <div className="pre-label">Initializing Portfolio</div>
        <div style={{
          position: "absolute", bottom: 32, left: 48,
          fontFamily: "var(--f-mono)", fontSize: 11,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.18)",
        }}>Muhammad Abrar Ahmad</div>
      </div>

      {/* Primary Navigation */}
      <Navbar />

      {/* ════════════ HERO ════════════ */}
      <section id="hero">
        <HeroCanvas />

        {/* Backdrop visual glow spots */}
        <div className="parallax-blob" data-speed="0.18" style={{ position: "absolute", top: "12%", right: "6%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,42,95,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div className="parallax-blob" data-speed="0.10" style={{ position: "absolute", bottom: "15%", left: "2%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "40%", left: "40%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(138,43,226,0.03) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div className="hero-content">
          {/* Availability Status */}
          <div className="hero-badge init-hidden-badge">
            <div className="hero-badge-dot" />
            <span className="hero-badge-text">Open to Opportunities</span>
          </div>

          <div className="hero-eyebrow init-hidden-eyebrow">
            Full Stack Developer &amp; Cyber Security Enthusiast
          </div>
          
          <h1 className="hero-title">
            <span className="line"><span className="word">Muhammad</span></span>
            <span className="line">
              <span className="word" style={{ color: "var(--c-ember)" }}>Abrar</span>
              &thinsp;
              <span className="word">Ahmad</span>
            </span>
          </h1>

          <div className="hero-bottom">
            <div style={{ maxWidth: 500 }}>
              <p className="hero-desc init-hidden-desc">{PERSONAL.tagline}</p>
              
              {/* Stat details ribbon */}
              <div className="hero-stats init-hidden-stats">
                {STATS.map((s) => (
                  <div key={s.label} className="hero-stat">
                    <div className="hero-stat-num">{s.num}<span>{s.suffix}</span></div>
                    <div className="hero-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hero-scroll init-hidden-scroll">
              <span>Scroll</span>
              <div className="hero-scroll-line" />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ TECHNICAL TEXT MARQUEE 1 ════════════ */}
      <div style={{ overflow: "hidden", borderTop: "1px solid var(--c-border)", borderBottom: "1px solid var(--c-border)", padding: "20px 0" }}>
        <div className="marquee-track">
          {[...Array(2)].flatMap((_, outerIdx) =>
            ["Full Stack Developer", "Django", "NestJS", "Next.js", "React", "TypeScript", "MERN Stack", "PostgreSQL", "Docker", "WebGL", "GSAP"].flatMap((t, i) => [
              <span key={`${outerIdx}-${t}-${i}-a`} className="marquee-item">{t}</span>,
              <span key={`${outerIdx}-${t}-${i}-s`} className="marquee-item" style={{ color: "var(--c-ember)", WebkitTextStroke: 0 }}>✦</span>,
            ])
          )}
        </div>
      </div>

      {/* ════════════ ABOUT SECTION ════════════ */}
      <section id="about" className="section">
        <div className="parallax-blob" data-speed="0.12" style={{ position: "absolute", top: "-10%", right: "-8%", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,42,95,0.035) 0%, transparent 60%)", pointerEvents: "none" }} />

        <div className="section-label">Who I Am</div>
        <h2 className="section-title reveal-title">
          <span className="line"><span className="word">Building</span></span>
          <span className="line">
            <span className="word" style={{ color: "var(--c-ember)" }}>Tomorrow&apos;s</span>
            &nbsp;<span className="word">Tech</span>
          </span>
          <span className="line"><span className="word">Solutions</span></span>
        </h2>

        <div className="about-grid">
          {/* Left bio & education */}
          <div>
            <p className="about-bio" dangerouslySetInnerHTML={{ __html: PERSONAL.bio }} />
            <p className="about-extra-text" style={{ marginTop: 24, fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.32)", fontWeight: 300 }}>
              Based at NUST — Military College of Signals, Rawalpindi. Beyond tech, I explore new paradigms, tackle challenging problems, and collaborate on innovative projects.
            </p>

            {/* Coding Quest Achievement card */}
            <div className="achievement-card">
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--c-ember)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span>🏆</span><span>Achievement — Nov 2025</span>
              </div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 22, fontWeight: 800, color: "white", marginBottom: 10, letterSpacing: "-0.01em" }}>CodeQuest 2025 — 2nd Place</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "rgba(255,255,255,0.38)" }}>
                Built a fully functional <strong style={{ color: "white" }}>AI Resume Analyzer</strong> in a strict 4-hour deadline. Team: <em style={{ color: "rgba(255,255,255,0.55)" }}>Konoha Coders</em>. Organized by Software Society, MCS NUST.
              </p>
            </div>

            {/* University details chip */}
            <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 14, padding: "20px 24px", border: "1px solid var(--c-border)", background: "var(--c-dim)" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--c-gold)", flexShrink: 0, boxShadow: "0 0 10px rgba(255,215,0,0.6)" }} />
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--c-gold)", marginBottom: 4 }}>Education</div>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "-0.01em" }}>NUST — Military College of Signals</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>BE Software Engineering · Oct 2023 – Present</div>
              </div>
            </div>
          </div>

          {/* Right stats grid & terminal console */}
          <div>
            <div className="stat-grid">
              {STATS.map((s) => (
                <div key={s.label} className="stat-item" data-hover>
                  <div className="stat-num" data-val={s.num} data-suf={s.suffix}>
                    {s.num}<span>{s.suffix}</span>
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Interactive retro security console */}
            <CyberTerminal />
          </div>
        </div>
      </section>

      {/* ════════════ SKILLS SECTION ════════════ */}
      <section id="skills" className="section" style={{ paddingTop: 0 }}>
        <div className="h-line animate-line" />
        <div style={{ height: 80 }} />
        
        <div className="section-label" style={{ color: "var(--c-frost)" }}>Technical Arsenal</div>
        <h2 className="section-title reveal-title" style={{ marginBottom: 0 }}>
          <span className="line"><span className="word">Technologies</span></span>
          <span className="line"><span className="word">I</span>&nbsp;<span className="word" style={{ color: "var(--c-ember)" }}>Master</span></span>
        </h2>

        <div className="skills-grid">
          {Object.entries(SKILLS).map(([cat, list]) => (
            <div key={cat} className="skill-col" data-hover>
              <div className="skill-col-head">{cat}</div>
              {list.map((s) => (
                <div key={s} className="skill-tag" data-hover>{s}</div>
              ))}
            </div>
          ))}
        </div>

        {/* Graphical proficiency tracks */}
        <div style={{ marginTop: 72, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px 80px" }} className="contact-grid-responsive">
          {[
            { label: "React / Next.js", pct: 90 },
            { label: "Django / Flask", pct: 85 },
            { label: "Node.js / Express / NestJS", pct: 80 },
            { label: "TypeScript", pct: 78 },
            { label: "PostgreSQL / MongoDB", pct: 82 },
            { label: "Docker / DevOps", pct: 65 },
          ].map((p) => (
            <div key={p.label} className="prof-bar-row">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>{p.label}</span>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--c-ember)" }}>{p.pct}%</span>
              </div>
              <div className="prof-bar-track">
                <div className="prof-fill" data-w={`${p.pct}%`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════ SELECTED PORTFOLIO PROJECTS ════════════ */}
      <section id="projects" style={{ paddingTop: 0, overflow: "hidden" }}>
        <div className="section" style={{ paddingBottom: 60 }}>
          <div className="h-line animate-line" />
          <div style={{ height: 80 }} />
          
          <div className="section-label" style={{ color: "var(--c-gold)" }}>Selected Work</div>
          <h2 className="section-title reveal-title">
            <span className="line"><span className="word">Things</span>&nbsp;<span className="word">I&apos;ve</span></span>
            <span className="line"><span className="word" style={{ color: "var(--c-ember)" }}>Built</span></span>
          </h2>
        </div>

        <div className="projects-scroll-wrap">
          <div className="projects-track">
            {PROJECTS.map((p) => (
              <ProjectCard key={p.id} project={p} totalProjects={PROJECTS.length} />
            ))}
          </div>
          
          <div className="section" style={{ paddingTop: 24, paddingBottom: 32, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.15)" }}>← SCROLL OR DRAG TO VIEW MORE →</span>
          </div>
        </div>
      </section>

      {/* ════════════ WORK EXPERIENCE JOURNEY ════════════ */}
      <section id="experience" className="section" style={{ paddingTop: 0 }}>
        <div className="h-line animate-line" />
        <div style={{ height: 80 }} />
        
        <div className="section-label">Career Journey</div>
        <h2 className="section-title reveal-title">
          <span className="line"><span className="word">Where</span>&nbsp;<span className="word">I&apos;ve</span></span>
          <span className="line">
            <span className="word" style={{ color: "var(--c-ember)" }}>Forged</span>&nbsp;
            <span className="word">My</span>&nbsp;
            <span className="word">Skills</span>
          </span>
        </h2>

        <div className="exp-list">
          {EXPERIENCE.map((e) => (
            <div key={e.company} className="exp-item" data-hover>
              {/* Left Column: company name and date range */}
              <div>
                <div className="exp-company">
                  <div className="exp-color-dot" style={{ background: e.color, color: e.color }} />
                  {e.company}
                  {e.current && (
                    <span style={{ marginLeft: 10, fontFamily: "var(--f-mono)", fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#10b981", border: "1px solid rgba(16,185,129,0.35)", padding: "3px 8px" }}>Live</span>
                  )}
                </div>
                <div className="exp-period">{e.period} · {e.location}</div>
                <div className="exp-type">Full-Time · Remote</div>
              </div>

              {/* Center Column: job role & bullets */}
              <div>
                <div className="exp-role">{e.role}</div>
                <ul className="exp-points">
                  {e.points.map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
              </div>

              {/* Right Column: technology tags */}
              <div className="exp-tags">
                {e.tags.map((t) => <span key={t} className="exp-tag">{t}</span>)}
              </div>
            </div>
          ))}
          <div className="h-line" />
        </div>
      </section>

      {/* ════════════ CAREER TEXT MARQUEE 2 ════════════ */}
      <div style={{ overflow: "hidden", borderTop: "1px solid var(--c-border)", borderBottom: "1px solid var(--c-border)", padding: "18px 0" }}>
        <div className="marquee-track reverse">
          {[...Array(2)].flatMap((_, outerIdx) =>
            ["NUST MCS", "Rawalpindi", "CodeQuest Runner Up", "Dr Coderz", "Wimbel", "Four Minds", "Tech Horizon", "Disruptive AI", "AI Resume Analyzer", "Clean Architecture", "Agile / Scrum"].flatMap((t, i) => [
              <span key={`${outerIdx}-${t}-${i}-b`} className="marquee-item">{t}</span>,
              <span key={`${outerIdx}-${t}-${i}-s`} className="marquee-item" style={{ color: "var(--c-ember)", WebkitTextStroke: 0 }}>◆</span>,
            ])
          )}
        </div>
      </div>

      {/* ════════════ CONTACT & FOOTER ════════════ */}
      <section id="contact" style={{ position: "relative", padding: "160px 48px 0", overflow: "hidden" }}>
        <div className="parallax-blob" data-speed="0.18" style={{ position: "absolute", bottom: "5%", left: "20%", width: 900, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,42,95,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "10%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div className="section-label">Get In Touch</div>
        <h2 className="contact-big">
          <span className="line"><span className="word">Let&apos;s</span>&nbsp;<span className="word">Build</span></span>
          <span className="line"><span className="word" style={{ color: "var(--c-ember)" }}>Something</span></span>
          <span className="line"><span className="word">Remarkable</span></span>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, marginTop: 80 }} className="contact-grid-responsive">
          {/* Left half: message inputs (isolated re-renders) */}
          <ContactForm />

          {/* Right half: operational direct contacts */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 8 }}>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 14 }}>Direct Email</div>
              <a href={`mailto:${PERSONAL.email}`} className="magnetic" data-hover style={{ fontFamily: "var(--f-display)", fontSize: "clamp(16px,2.2vw,26px)", fontWeight: 800, color: "white", textDecoration: "none", letterSpacing: "-0.01em", display: "inline-flex", alignItems: "center", gap: 12 }}>
                {PERSONAL.email}
                <span style={{ color: "var(--c-ember)", fontSize: "0.8em" }}>↗</span>
              </a>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid var(--c-border)" }}>
              {[
                { label: "LinkedIn", val: "Muhammad Abrar Ahmad", href: "https://linkedin.com/in/muhammad-abrar-ahmad" },
                { label: "GitHub", val: "github.com/abrar898", href: "https://github.com/abrar898" },
                { label: "Location", val: "Rawalpindi, Pakistan", href: "#" },
              ].map((l) => (
                <a key={l.label} href={l.href} className="contact-link" data-hover style={{ borderRight: "none" }}>
                  <span className="contact-link-label">{l.label}</span>
                  <span className="contact-link-val">{l.val}</span>
                  <span className="arrow">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Global Footer */}
        <footer style={{ marginTop: 120 }}>
          <p>© 2026 MUHAMMAD ABRAR AHMAD. ALL RIGHTS RESERVED.</p>
          <span className="footer-badge">NEXT.JS · GSAP · THREE.JS · WEBGL</span>
        </footer>
      </section>

      {/* Floating scroll up button */}
      <button
        id="back-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        data-hover
        style={{
          position: "fixed", bottom: 32, right: 32, zIndex: 300,
          width: 48, height: 48,
          background: "var(--c-ember)", border: "none", cursor: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, color: "white",
          opacity: 0, transform: "translateY(20px)",
          transition: "transform 0.3s ease",
          boxShadow: "0 0 28px rgba(255,42,95,0.45)",
        }}
        title="Back to top"
      >
        ↑
      </button>

      {/* Focus line helpers and dynamic active dot override rules */}
      <style>{`
        input:focus ~ .input-line,
        textarea:focus ~ .input-line { transform: scaleX(1) !important; }
        .nav-dot.active { background: var(--c-ember) !important; transform: scale(1.8); box-shadow: 0 0 8px rgba(255,42,95,0.7); }
        @media (max-width: 768px) {
          .contact-grid-responsive { grid-template-columns: 1fr !important; gap: 48px !important; }
          .hero-stats { display: none; }
        }
      `}</style>
    </>
  );
}
