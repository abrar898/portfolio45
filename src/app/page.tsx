"use client";

import { useEffect, useRef, useState } from "react";
import { PERSONAL, STATS, SKILLS, PROJECTS, EXPERIENCE, NAV } from "@/lib/data";

export default function Home() {
  const mountedRef = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formSent, setFormSent] = useState(false);
  const [sending, setSending] = useState(false);

  /* ── Mobile nav scroll handler ── */
  const navTo = (href: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }, menuOpen ? 400 : 0);
  };

  /* ── Fake form submit ── */
  const handleSend = async () => {
    if (!formData.name || !formData.email || !formData.message) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSending(false);
    setFormSent(true);
  };

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    Promise.all([
      import("gsap").then((m) => m.gsap),
      import("gsap/ScrollTrigger"),
      import("lenis"),
      import("three"),
    ]).then(([gsap, stMod, LenisModule, THREE]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ScrollTrigger = (stMod as any).ScrollTrigger ?? stMod.default;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Lenis = (LenisModule as any).default ?? LenisModule;

      gsap.registerPlugin(ScrollTrigger);

      /* ──────────────────────────────────────────────────────
         LENIS SMOOTH SCROLL
      ────────────────────────────────────────────────────── */
      const lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time: number) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      /* ──────────────────────────────────────────────────────
         SCROLL PROGRESS BAR
      ────────────────────────────────────────────────────── */
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

      /* ──────────────────────────────────────────────────────
         ACTIVE NAV INDICATOR
      ────────────────────────────────────────────────────── */
      const sections = ["hero","about","skills","projects","experience","contact"];
      sections.forEach((id) => {
        ScrollTrigger.create({
          trigger: `#${id}`,
          start: "top 50%",
          end: "bottom 50%",
          onEnter: () => updateActiveNav(id),
          onEnterBack: () => updateActiveNav(id),
        });
      });
      function updateActiveNav(id: string) {
        document.querySelectorAll(".nav-dot").forEach((d) => d.classList.remove("active"));
        const dot = document.querySelector(`[data-nav-id="${id}"]`);
        if (dot) dot.classList.add("active");
      }

      /* ──────────────────────────────────────────────────────
         WEBGL HERO — Shader Particle Field
      ────────────────────────────────────────────────────── */
      const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement;
      if (canvas) {
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
        camera.position.z = 5;

        /* ── Main particle cloud ── */
        const COUNT = 4000;
        const pos = new Float32Array(COUNT * 3);
        const rnd = new Float32Array(COUNT);
        const vel = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i++) {
          pos[i*3]   = (Math.random() - 0.5) * 16;
          pos[i*3+1] = (Math.random() - 0.5) * 12;
          pos[i*3+2] = (Math.random() - 0.5) * 8;
          rnd[i] = Math.random();
          vel[i*3]   = (Math.random() - 0.5) * 0.002;
          vel[i*3+1] = (Math.random() - 0.5) * 0.002;
          vel[i*3+2] = 0;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("aRandom",  new THREE.BufferAttribute(rnd, 1));

        const mat = new THREE.ShaderMaterial({
          transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
          uniforms: {
            uTime:   { value: 0 },
            uMouse:  { value: new THREE.Vector2(0.5, 0.5) },
            uScroll: { value: 0 },
          },
          vertexShader: `
            attribute float aRandom;
            uniform float uTime;
            uniform vec2  uMouse;
            uniform float uScroll;
            varying float vAlpha;
            varying float vRandom;

            void main() {
              vRandom = aRandom;
              vec3 p = position;

              // Organic drift
              float t = uTime * 0.35;
              p.x += sin(t * 0.7 + aRandom * 6.28) * 0.18;
              p.y += cos(t * 0.5 + aRandom * 6.28) * 0.12;
              p.z += sin(t * 0.3 + aRandom * 3.14) * 0.06;

              // Scroll parallax
              p.y -= uScroll * 0.003;

              vec4 mv = modelViewMatrix * vec4(p, 1.0);
              vec4 pp = projectionMatrix * mv;

              // Mouse magnetic repulsion
              vec2 ndc = pp.xy / pp.w;
              vec2 toMouse = ndc - (uMouse * 2.0 - 1.0);
              float dist = length(toMouse);
              float force = smoothstep(0.8, 0.0, dist) * 0.5;
              pp.xy += normalize(toMouse) * force * pp.w * 0.06;

              gl_Position = pp;
              gl_PointSize = (1.8 + aRandom * 2.5) * (5.0 / -mv.z);

              vAlpha = smoothstep(6.0, 0.0, abs(p.z)) * (0.4 + aRandom * 0.5);
            }
          `,
          fragmentShader: `
            varying float vAlpha;
            varying float vRandom;

            void main() {
              vec2 uv = gl_PointCoord - 0.5;
              float r = length(uv);
              if (r > 0.5) discard;

              // Soft disc
              float alpha = (0.5 - r) * 2.0;
              alpha = pow(alpha, 1.5) * vAlpha;

              // Color: ember → white → frost by vRandom
              vec3 ember = vec3(1.0, 0.24, 0.0);
              vec3 white = vec3(0.9, 0.9, 0.95);
              vec3 frost = vec3(0.0, 0.83, 1.0);
              vec3 col;
              if (vRandom < 0.4)      col = mix(ember, white, vRandom / 0.4);
              else if (vRandom < 0.7) col = white;
              else                    col = mix(white, frost, (vRandom - 0.7) / 0.3);

              gl_FragColor = vec4(col, alpha);
            }
          `,
        });

        const pts = new THREE.Points(geo, mat);
        scene.add(pts);

        /* ── Ring geometry for depth ── */
        const makeRing = (r: number, color: number, opacity: number) => {
          const rGeo = new THREE.TorusGeometry(r, 0.005, 8, 160);
          const rMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
          return new THREE.Mesh(rGeo, rMat);
        };
        const ring1 = makeRing(2.2, 0xff3d00, 0.18);
        const ring2 = makeRing(3.2, 0x00d4ff, 0.10);
        const ring3 = makeRing(4.0, 0xffffff, 0.06);
        ring1.rotation.x = 0.4;
        ring2.rotation.x = -0.6; ring2.rotation.y = 0.3;
        ring3.rotation.x = 0.8;  ring3.rotation.z = 0.2;
        scene.add(ring1, ring2, ring3);

        /* Mouse & scroll tracking for shader */
        let mx = 0.5, my = 0.5, scrollY = 0;
        window.addEventListener("mousemove", (e) => {
          mx = e.clientX / window.innerWidth;
          my = e.clientY / window.innerHeight;
        });
        window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

        /* Resize */
        const onResize = () => {
          renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
          camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
          camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", onResize);

        /* Render loop */
        const clock = new THREE.Clock();
        let rafId: number;
        const tick = () => {
          rafId = requestAnimationFrame(tick);
          const t = clock.getElapsedTime();
          mat.uniforms.uTime.value   = t;
          mat.uniforms.uMouse.value.set(mx, 1 - my);
          mat.uniforms.uScroll.value += (scrollY - mat.uniforms.uScroll.value) * 0.05;

          // Gentle auto-rotate + mouse parallax
          pts.rotation.y  = t * 0.03 + (mx - 0.5) * 0.15;
          pts.rotation.x  = (my - 0.5) * 0.08;
          ring1.rotation.z = t * 0.12;
          ring2.rotation.z = -t * 0.08;
          ring3.rotation.z = t * 0.05;
          renderer.render(scene, camera);
        };
        tick();
      }

      /* ──────────────────────────────────────────────────────
         CUSTOM CURSOR
      ────────────────────────────────────────────────────── */
      const dot  = document.getElementById("cursor-dot");
      const ring = document.getElementById("cursor-ring");
      if (dot && ring) {
        window.addEventListener("mousemove", (e) => {
          gsap.set(dot,  { x: e.clientX - 4,  y: e.clientY - 4 });
          gsap.to(ring,  { x: e.clientX - 20, y: e.clientY - 20, duration: 0.45, ease: "expo.out" });
        });
        // Text mode on big headings
        document.querySelectorAll("h1, h2").forEach((el) => {
          el.addEventListener("mouseenter", () => { ring.classList.add("is-text"); ring.classList.remove("is-hovered"); });
          el.addEventListener("mouseleave", () => ring.classList.remove("is-text"));
        });
        // Hover mode on buttons/links
        document.querySelectorAll("a, button, [data-hover]").forEach((el) => {
          el.addEventListener("mouseenter", () => { if (!ring.classList.contains("is-text")) ring.classList.add("is-hovered"); });
          el.addEventListener("mouseleave", () => ring.classList.remove("is-hovered"));
        });
        // Hide on leave
        document.addEventListener("mouseleave", () => gsap.to([dot, ring], { opacity: 0 }));
        document.addEventListener("mouseenter", () => gsap.to([dot, ring], { opacity: 1 }));
      }

      /* ──────────────────────────────────────────────────────
         PRELOADER
      ────────────────────────────────────────────────────── */
      const preloader = document.getElementById("preloader");
      const countEl   = preloader?.querySelector(".pre-count") as HTMLElement;
      const barEl     = preloader?.querySelector(".pre-bar")   as HTMLElement;
      const preLines  = preloader?.querySelectorAll(".pre-line");

      if (preloader && countEl && barEl) {
        // Animate count 0 → 100
        gsap.timeline({
          onComplete: () => {
            const tl = gsap.timeline();
            // Lines split open (Trionn-style: curtains open)
            if (preLines) tl.to(Array.from(preLines), {
              scaleY: 0,
              transformOrigin: "bottom center",
              duration: 0.9,
              ease: "expo.inOut",
              stagger: { each: 0.04, from: "center" },
            });
            tl.to(preloader, { autoAlpha: 0, duration: 0.4 }, "-=0.2");
            tl.call(() => { (preloader as HTMLElement).style.display = "none"; });
            tl.call(() => revealHero());
          }
        }).to({ v: 0 }, {
          v: 100, duration: 1.8, ease: "power3.inOut",
          onUpdate: function () {
            const val = Math.round(this.targets()[0].v);
            countEl.textContent = String(val).padStart(3, "0");
            barEl.style.width   = val + "%";
          },
        });
      } else {
        revealHero();
      }

      /* ──────────────────────────────────────────────────────
         HERO REVEAL
      ────────────────────────────────────────────────────── */
      function revealHero() {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to("#navbar",       { opacity: 1, y: 0, duration: 1.0 }, 0.0)
          .to("#side-dots",    { opacity: 1, x: 0, duration: 0.8 }, 0.3)
          .to("#scroll-progress", { opacity: 1, duration: 0.5 }, 0.4)
          .to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.8 }, 0.2)
          .to(".hero-title .word", { y: "0%", duration: 1.1, stagger: 0.07 }, 0.3)
          .to(".hero-desc",    { opacity: 1, y: 0, duration: 0.9 }, 0.7)
          .to(".hero-scroll",  { opacity: 1, y: 0, duration: 0.9 }, 0.8)
          .to("#back-top",     { opacity: 1, duration: 0.5 }, 1.0);
      }

      /* ──────────────────────────────────────────────────────
         SCROLL ANIMATIONS — All sections
      ────────────────────────────────────────────────────── */

      /* Section title word reveals */
      document.querySelectorAll(".reveal-title .word").forEach((word) => {
        gsap.from(word, {
          y: "110%", duration: 1.0, ease: "expo.out",
          scrollTrigger: { trigger: word.parentElement!, start: "top 85%" },
        });
      });

      /* Section labels */
      gsap.utils.toArray<Element>(".section-label").forEach((el) => {
        gsap.from(el, {
          opacity: 0, x: -24, duration: 0.8, ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 92%" },
        });
      });

      /* About bio */
      gsap.from(".about-bio", {
        opacity: 0, y: 28, duration: 1.0, ease: "expo.out",
        scrollTrigger: { trigger: ".about-bio", start: "top 82%" },
      });
      gsap.from(".about-extra-text", {
        opacity: 0, y: 20, duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: ".about-extra-text", start: "top 85%" },
      });
      gsap.from(".achievement-card", {
        opacity: 0, y: 30, scale: 0.97, duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: ".achievement-card", start: "top 85%" },
      });

      /* Stats — counter animation */
      gsap.utils.toArray<Element>(".stat-item").forEach((item, i) => {
        const numEl = item.querySelector(".stat-num") as HTMLElement;
        const end   = parseInt(numEl?.dataset.val ?? "0");
        const suf   = numEl?.dataset.suf ?? "";
        gsap.from(item, {
          opacity: 0, y: 40, duration: 0.7, ease: "expo.out", delay: i * 0.1,
          scrollTrigger: { trigger: ".stat-grid", start: "top 80%" },
        });
        gsap.fromTo({ v: 0 }, { v: 0 }, {
          v: end, duration: 1.5, ease: "power3.out",
          onUpdate: function () {
            if (numEl) numEl.innerHTML = Math.round(this.targets()[0].v) + `<span>${suf}</span>`;
          },
          scrollTrigger: { trigger: ".stat-grid", start: "top 80%" },
        });
      });

      /* Skills — stagger in */
      gsap.from(".skill-col", {
        opacity: 0, y: 50, duration: 0.9, ease: "expo.out", stagger: 0.12,
        scrollTrigger: { trigger: ".skills-grid", start: "top 80%" },
      });

      /* Skill proficiency bars */
      gsap.utils.toArray<Element>(".prof-fill").forEach((bar) => {
        const w = (bar as HTMLElement).dataset.w ?? "0";
        gsap.fromTo(bar, { scaleX: 0 }, {
          scaleX: 1, duration: 1.4, ease: "expo.out",
          transformOrigin: "left center",
          scrollTrigger: { trigger: bar, start: "top 90%" },
        });
        (bar as HTMLElement).style.width = w;
      });

      /* ── Horizontal project scroll (pinned) ── */
      const track = document.querySelector(".projects-track") as HTMLElement;
      if (track) {
        const totalScroll = track.scrollWidth - window.innerWidth + 96;
        gsap.to(track, {
          x: -totalScroll, ease: "none",
          scrollTrigger: {
            trigger: ".projects-scroll-wrap",
            start: "top top",
            end: () => "+=" + (totalScroll + 300),
            scrub: 1.0, pin: true, anticipatePin: 1,
          },
        });
        track.querySelectorAll(".project-card").forEach((card, i) => {
          gsap.from(card, {
            opacity: 0, y: 30, scale: 0.95, duration: 0.8, ease: "expo.out",
            scrollTrigger: {
              trigger: ".projects-scroll-wrap",
              start: `top+=${i * 60} top`,
              toggleActions: "play none none none",
            },
          });
        });
      }

      /* Experience rows */
      gsap.from(".exp-item", {
        opacity: 0, x: -32, duration: 0.85, ease: "expo.out", stagger: 0.10,
        scrollTrigger: { trigger: ".exp-list", start: "top 78%" },
      });

      /* Contact heading */
      gsap.from(".contact-big .word", {
        y: "110%", duration: 1.1, ease: "expo.out", stagger: 0.06,
        scrollTrigger: { trigger: ".contact-big", start: "top 82%" },
      });
      gsap.from(".contact-form-wrap", {
        opacity: 0, y: 40, duration: 1.0, ease: "expo.out",
        scrollTrigger: { trigger: ".contact-form-wrap", start: "top 82%" },
      });
      gsap.from(".contact-links", {
        opacity: 0, y: 30, duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: ".contact-links", start: "top 88%" },
      });

      /* H-line reveals */
      gsap.utils.toArray<Element>(".animate-line").forEach((line) => {
        gsap.from(line, {
          scaleX: 0, transformOrigin: "left center",
          duration: 1.2, ease: "expo.out",
          scrollTrigger: { trigger: line, start: "top 92%" },
        });
      });

      /* Parallax blobs */
      document.querySelectorAll<HTMLElement>(".parallax-blob").forEach((blob) => {
        const speed = parseFloat(blob.dataset.speed ?? "0.15");
        gsap.to(blob, {
          yPercent: -80 * speed, ease: "none",
          scrollTrigger: { trigger: blob.parentElement!, scrub: true },
        });
      });

      /* Footer reveal */
      gsap.from("footer", {
        opacity: 0, y: 20, duration: 0.8, ease: "expo.out",
        scrollTrigger: { trigger: "footer", start: "top 95%" },
      });

      /* ── Magnetic buttons ── */
      document.querySelectorAll<HTMLElement>(".magnetic").forEach((el) => {
        el.addEventListener("mousemove", (e) => {
          const r = el.getBoundingClientRect();
          const dx = (e.clientX - r.left - r.width  / 2) * 0.35;
          const dy = (e.clientY - r.top  - r.height / 2) * 0.35;
          gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: "expo.out" });
        });
        el.addEventListener("mouseleave", () =>
          gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" })
        );
      });

      /* Back to top */
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

  /* ══════════════════════════════════════════════════════════
     JSX RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <>
      {/* Cursor */}
      <div id="cursor-dot"  aria-hidden />
      <div id="cursor-ring" aria-hidden />

      {/* Scroll progress bar */}
      <div id="scroll-progress" style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 2,
        background: "var(--c-ember)", transformOrigin: "left center",
        transform: "scaleX(0)", zIndex: 999, opacity: 0,
        boxShadow: "0 0 12px var(--c-ember)",
      }} />

      {/* Side navigation dots */}
      <div id="side-dots" style={{
        position: "fixed", right: 24, top: "50%", transform: "translateX(20px)",
        zIndex: 400, display: "flex", flexDirection: "column", gap: 10,
        opacity: 0,
      }}>
        {[...NAV.map(n => ({ id: n.href.slice(1), label: n.label })), { id: "hero", label: "Top" }]
          .reverse()
          .map((s) => (
            <button
              key={s.id}
              data-nav-id={s.id}
              className="nav-dot"
              onClick={() => document.querySelector(`#${s.id}`)?.scrollIntoView({ behavior: "smooth" })}
              title={s.label}
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                border: "none", cursor: "none", padding: 0,
                transition: "background 0.3s ease, transform 0.3s ease",
              }}
            />
          ))}
      </div>

      {/* Preloader — curtain strips (Trionn style) */}
      <div id="preloader">
        {/* 8 vertical strips */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="pre-line" style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${i * 12.5}%`, width: "12.5%",
            background: "var(--c-bg)",
            transformOrigin: "bottom center",
          }} />
        ))}
        <div className="pre-count" style={{ position: "relative", zIndex: 2 }}>000</div>
        <div className="pre-bar" />
        <div className="pre-label">Initializing Portfolio</div>
        <div style={{
          position: "absolute", bottom: 32, left: 48,
          fontFamily: "var(--f-mono)", fontSize: 11,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.2)",
        }}>
          Muhammad Abrar Ahmad
        </div>
      </div>

      {/* Navbar */}
      <nav id="navbar">
        <button className="nav-logo magnetic" onClick={() => navTo("#hero")} style={{ fontFamily: "var(--f-display)", background: "none", border: "none" }}>
          MAA<span style={{ color: "var(--c-ember)" }}>.</span>
        </button>

        <div className="nav-links hidden md:flex">
          {NAV.map((n) => (
            <button key={n.href} className="nav-link" onClick={() => navTo(n.href)}>
              {n.label}
            </button>
          ))}
        </div>

        {/* Desktop CTA */}
        <button className="nav-cta magnetic hidden md:block" onClick={() => navTo("#contact")} data-hover>
          Hire Me ↗
        </button>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", cursor: "none", display: "flex", flexDirection: "column", gap: 5, padding: 4 }}
        >
          <span style={{ display: "block", width: 24, height: 1, background: "white", transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translateY(6px)" : "none" }} />
          <span style={{ display: "block", width: 24, height: 1, background: "rgba(255,255,255,0.4)", opacity: menuOpen ? 0 : 1, transition: "all 0.3s" }} />
          <span style={{ display: "block", width: 24, height: 1, background: "white", transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translateY(-6px)" : "none" }} />
        </button>
      </nav>

      {/* Mobile full-screen menu */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 450,
        background: "var(--c-bg)",
        transform: menuOpen ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 8, borderBottom: menuOpen ? "1px solid var(--c-border)" : "none",
      }}>
        {NAV.map((n, i) => (
          <button
            key={n.href}
            onClick={() => navTo(n.href)}
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(36px,10vw,64px)",
              fontWeight: 800, color: "white",
              background: "none", border: "none", cursor: "none",
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
        <a href={`mailto:${PERSONAL.email}`} style={{ marginTop: 24, fontFamily: "var(--f-mono)", fontSize: 13, color: "var(--c-ember)", letterSpacing: "0.1em" }}>
          {PERSONAL.email}
        </a>
      </div>

      {/* ════════════ HERO ════════════ */}
      <section id="hero">
        <canvas id="hero-canvas" className="webgl-bg" />

        {/* Radial glow blobs */}
        <div className="parallax-blob" data-speed="0.18" style={{ position:"absolute", top:"15%", right:"8%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,61,0,0.10) 0%, transparent 68%)", pointerEvents:"none" }} />
        <div className="parallax-blob" data-speed="0.10" style={{ position:"absolute", bottom:"10%", left:"3%",  width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 65%)", pointerEvents:"none" }} />

        <div className="hero-content">
          <div className="hero-eyebrow">
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
            <p className="hero-desc">{PERSONAL.tagline}</p>
            <div className="hero-scroll">
              <span>Scroll</span>
              <div className="hero-scroll-line" />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ MARQUEE 1 ════════════ */}
      <div style={{ overflow:"hidden", borderTop:"1px solid var(--c-border)", borderBottom:"1px solid var(--c-border)", padding:"22px 0" }}>
        <div className="marquee-track">
          {[...Array(2)].flatMap((_, outerIdx) =>
            ["Full Stack Developer","Django","NestJS","Next.js","React","TypeScript","MERN Stack","PostgreSQL","Docker","WebGL","GSAP"].flatMap((t, i) => [
              <span key={`${outerIdx}-${t}-${i}-a`} className="marquee-item">{t}</span>,
              <span key={`${outerIdx}-${t}-${i}-s`} className="marquee-item" style={{ color:"var(--c-ember)", WebkitTextStroke:0 }}>✦</span>,
            ])
          )}
        </div>
      </div>

      {/* ════════════ ABOUT ════════════ */}
      <section id="about" className="section">
        <div className="parallax-blob" data-speed="0.15" style={{ position:"absolute", top:"-5%", right:"-5%", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,61,0,0.055) 0%, transparent 65%)", pointerEvents:"none" }} />

        <div className="section-label">Who I Am</div>
        <h2 className="section-title reveal-title">
          <span className="line"><span className="word">Building</span></span>
          <span className="line">
            <span className="word" style={{ color:"var(--c-ember)" }}>Tomorrow&apos;s</span>
            &nbsp;<span className="word">Tech</span>
          </span>
          <span className="line"><span className="word">Solutions</span></span>
        </h2>

        <div className="about-grid">
          <div>
            <p className="about-bio" dangerouslySetInnerHTML={{ __html: PERSONAL.bio }} />
            <p className="about-extra-text" style={{ marginTop:24, fontSize:15, lineHeight:1.75, color:"rgba(255,255,255,0.35)", fontWeight:300 }}>
              Based at NUST — Military College of Signals, Rawalpindi. Beyond tech, I explore new programming paradigms, tackle challenging problems, and collaborate on innovative projects.
            </p>
            {/* Achievement */}
            <div className="achievement-card" style={{ marginTop:48, padding:"32px 36px", background:"rgba(255,61,0,0.04)", border:"1px solid rgba(255,61,0,0.16)" }}>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"var(--c-ember)", marginBottom:12 }}>🏆 Achievement — Nov 2025</div>
              <div style={{ fontFamily:"var(--f-display)", fontSize:24, fontWeight:800, color:"white", marginBottom:10, letterSpacing:"-0.01em" }}>CodeQuest 2025 — 2nd Place</div>
              <p style={{ fontSize:14, lineHeight:1.65, color:"rgba(255,255,255,0.4)" }}>
                Built a fully functional <strong style={{ color:"white" }}>AI Resume Analyzer</strong> in a strict 4-hour deadline. Team: <em style={{ color:"rgba(255,255,255,0.6)" }}>Konoha Coders</em>. Organized by Software Society, MCS NUST.
              </p>
            </div>
          </div>

          {/* Stats */}
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
        </div>
      </section>

      {/* ════════════ SKILLS ════════════ */}
      <section id="skills" className="section" style={{ paddingTop:0 }}>
        <div className="h-line animate-line" />
        <div style={{ height:80 }} />
        <div className="section-label" style={{ color:"var(--c-frost)" }}>Technical Arsenal</div>
        <h2 className="section-title reveal-title" style={{ marginBottom:0 }}>
          <span className="line"><span className="word">Technologies</span></span>
          <span className="line"><span className="word">I</span>&nbsp;<span className="word" style={{ color:"var(--c-ember)" }}>Master</span></span>
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

        {/* Proficiency bars */}
        <div style={{ marginTop:60, display:"grid", gridTemplateColumns:"1fr 1fr", gap:"32px 80px" }}>
          {[
            { label:"React / Next.js",           pct:90 },
            { label:"Django / Flask",             pct:85 },
            { label:"Node.js / Express / NestJS", pct:80 },
            { label:"TypeScript",                 pct:78 },
            { label:"PostgreSQL / MongoDB",        pct:82 },
            { label:"Docker / DevOps",            pct:65 },
          ].map((p) => (
            <div key={p.label}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontFamily:"var(--f-mono)", fontSize:11, letterSpacing:"0.1em", color:"rgba(255,255,255,0.45)" }}>{p.label}</span>
                <span style={{ fontFamily:"var(--f-mono)", fontSize:11, color:"var(--c-ember)" }}>{p.pct}%</span>
              </div>
              <div style={{ height:1, background:"rgba(255,255,255,0.06)", position:"relative", overflow:"hidden" }}>
                <div
                  className="prof-fill"
                  data-w={`${p.pct}%`}
                  style={{ position:"absolute", inset:0, background:`linear-gradient(to right, var(--c-ember), rgba(255,61,0,0.4))`, transformOrigin:"left center", transform:"scaleX(0)", boxShadow:"0 0 8px rgba(255,61,0,0.5)" }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════ PROJECTS — Horizontal pin ════════════ */}
      <section id="projects" style={{ paddingTop:0, overflow:"hidden" }}>
        <div className="section" style={{ paddingBottom:60 }}>
          <div className="h-line animate-line" />
          <div style={{ height:80 }} />
          <div className="section-label" style={{ color:"var(--c-gold)" }}>Selected Work</div>
          <h2 className="section-title reveal-title">
            <span className="line"><span className="word">Things</span>&nbsp;<span className="word">I&apos;ve</span></span>
            <span className="line"><span className="word" style={{ color:"var(--c-ember)" }}>Built</span></span>
          </h2>
        </div>

        <div className="projects-scroll-wrap">
          <div className="projects-track">
            {PROJECTS.map((p) => (
              <div key={p.id} className="project-card" data-hover>
                <div className="project-arrow">↗</div>
                <div className="project-num">{p.id} / 0{PROJECTS.length}</div>
                <h3 className="project-name">{p.name}</h3>
                <p className="project-desc">{p.desc}</p>
                <div className="project-tags">
                  {p.tags.map((t) => <span key={t} className="project-tag">{t}</span>)}
                </div>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:p.color, opacity:0.35 }} />
              </div>
            ))}
          </div>
          <div className="section" style={{ paddingTop:28, paddingBottom:36, display:"flex", justifyContent:"flex-end" }}>
            <span style={{ fontFamily:"var(--f-mono)", fontSize:11, letterSpacing:"0.15em", color:"rgba(255,255,255,0.18)" }}>← Scroll to explore projects →</span>
          </div>
        </div>
      </section>

      {/* ════════════ EXPERIENCE ════════════ */}
      <section id="experience" className="section" style={{ paddingTop:0 }}>
        <div className="h-line animate-line" />
        <div style={{ height:80 }} />
        <div className="section-label">Career Journey</div>
        <h2 className="section-title reveal-title">
          <span className="line"><span className="word">Where</span>&nbsp;<span className="word">I&apos;ve</span></span>
          <span className="line">
            <span className="word" style={{ color:"var(--c-ember)" }}>Forged</span>&nbsp;
            <span className="word">My</span>&nbsp;
            <span className="word">Skills</span>
          </span>
        </h2>

        <div className="exp-list">
          {EXPERIENCE.map((e) => (
            <div key={e.company} className="exp-item" data-hover>
              <div>
                <div className="exp-company">
                  {e.company}
                  {e.current && (
                    <span style={{ display:"inline-block", marginLeft:10, fontFamily:"var(--f-mono)", fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--c-ember)", border:"1px solid rgba(255,61,0,0.4)", padding:"3px 8px", verticalAlign:"middle" }}>Now</span>
                  )}
                </div>
                <div className="exp-period">{e.period} · {e.location}</div>
              </div>
              <div>
                <div className="exp-role">{e.role}</div>
                <ul className="exp-points">
                  {e.points.map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
              </div>
              <div className="exp-tags">
                {e.tags.map((t) => <span key={t} className="exp-tag">{t}</span>)}
              </div>
            </div>
          ))}
          <div className="h-line" />
        </div>
      </section>

      {/* ════════════ MARQUEE 2 — Reverse ════════════ */}
      <div style={{ overflow:"hidden", borderTop:"1px solid var(--c-border)", borderBottom:"1px solid var(--c-border)", padding:"20px 0" }}>
        <div className="marquee-track reverse">
          {[...Array(2)].flatMap((_, outerIdx) =>
            ["NUST MCS","Rawalpindi","CodeQuest Runner Up","Drcoders","Four Minds","Tech Horizon","Disruptive AI","AI Resume Analyzer","Clean Architecture","Agile / Scrum"].flatMap((t, i) => [
              <span key={`${outerIdx}-${t}-${i}-b`} className="marquee-item">{t}</span>,
              <span key={`${outerIdx}-${t}-${i}-s`} className="marquee-item" style={{ color:"var(--c-ember)", WebkitTextStroke:0 }}>◆</span>,
            ])
          )}
        </div>
      </div>

      {/* ════════════ CONTACT ════════════ */}
      <section id="contact" style={{ position:"relative", padding:"160px 48px 0", overflow:"hidden" }}>
        <div className="parallax-blob" data-speed="0.18" style={{ position:"absolute", bottom:"5%", left:"20%", width:800, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,61,0,0.07) 0%, transparent 60%)", pointerEvents:"none" }} />

        <div className="section-label">Get In Touch</div>
        <h2 className="contact-big">
          <span className="line"><span className="word">Let&apos;s</span>&nbsp;<span className="word">Build</span></span>
          <span className="line"><span className="word" style={{ color:"var(--c-ember)" }}>Something</span></span>
          <span className="line"><span className="word">Remarkable</span></span>
        </h2>

        {/* Two-column layout */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, marginTop:80 }} className="contact-grid-responsive">

          {/* Left — form */}
          <div className="contact-form-wrap">
            <p style={{ fontSize:15, fontWeight:300, lineHeight:1.7, color:"rgba(255,255,255,0.4)", marginBottom:48 }}>
              Open to internships, freelance projects, and full-time opportunities. Drop me a message and I&apos;ll get back to you.
            </p>

            {formSent ? (
              <div style={{ padding:"48px 0" }}>
                <div style={{ fontFamily:"var(--f-display)", fontSize:40, color:"var(--c-ember)", marginBottom:12 }}>Message Sent ✓</div>
                <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14 }}>Thanks for reaching out. I&apos;ll reply shortly.</p>
                <button onClick={() => setFormSent(false)} style={{ marginTop:24, fontFamily:"var(--f-mono)", fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--c-ember)", background:"none", border:"1px solid rgba(255,61,0,0.3)", padding:"10px 24px", cursor:"none" }}>Send Another ↗</button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {[
                  { field:"name",    label:"Your Name",      type:"text",  value:formData.name },
                  { field:"email",   label:"Email Address",  type:"email", value:formData.email },
                ].map(({ field, label, type, value }) => (
                  <div key={field} style={{ position:"relative", marginBottom:32 }}>
                    <input
                      type={type}
                      value={value}
                      placeholder=" "
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      style={{ width:"100%", background:"none", border:"none", borderBottom:"1px solid var(--c-border)", padding:"14px 0", fontSize:15, color:"white", outline:"none", fontFamily:"var(--f-body)", cursor:"none" }}
                    />
                    <label style={{ position:"absolute", bottom:16, left:0, fontFamily:"var(--f-mono)", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", transition:"all 0.3s", pointerEvents:"none" }}>{label}</label>
                    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:"var(--c-ember)", transform:"scaleX(0)", transformOrigin:"left", transition:"transform 0.4s var(--ease-expo)" }} className="input-line" />
                  </div>
                ))}
                <div style={{ position:"relative", marginBottom:40 }}>
                  <textarea
                    value={formData.message}
                    placeholder="Your message..."
                    rows={4}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ width:"100%", background:"none", border:"none", borderBottom:"1px solid var(--c-border)", padding:"14px 0", fontSize:15, color:"white", outline:"none", resize:"none", fontFamily:"var(--f-body)", cursor:"none" }}
                  />
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:"var(--c-ember)", transform:"scaleX(0)", transformOrigin:"left", transition:"transform 0.4s var(--ease-expo)" }} className="input-line" />
                </div>
                <button
                  className="magnetic"
                  onClick={handleSend}
                  disabled={sending}
                  data-hover
                  style={{ alignSelf:"flex-start", fontFamily:"var(--f-mono)", fontSize:12, letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--c-bg)", background:"var(--c-ember)", border:"none", padding:"16px 40px", cursor:"none", opacity:sending ? 0.7 : 1, transition:"opacity 0.3s" }}
                >
                  {sending ? "Sending..." : "Send Message ↗"}
                </button>
              </div>
            )}
          </div>

          {/* Right — links */}
          <div style={{ display:"flex", flexDirection:"column", justifyContent:"flex-end", paddingBottom:8 }}>
            <div style={{ marginBottom:32 }}>
              <div style={{ fontFamily:"var(--f-mono)", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", marginBottom:12 }}>Direct Email</div>
              <a href={`mailto:${PERSONAL.email}`} className="magnetic" data-hover style={{ fontFamily:"var(--f-display)", fontSize:"clamp(16px,2.2vw,26px)", fontWeight:800, color:"white", textDecoration:"none", letterSpacing:"-0.01em", display:"inline-flex", alignItems:"center", gap:12 }}>
                {PERSONAL.email}
                <span style={{ color:"var(--c-ember)", fontSize:"0.8em" }}>↗</span>
              </a>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:0, borderTop:"1px solid var(--c-border)" }}>
              {[
                { label:"LinkedIn", val:"Muhammad Abrar Ahmad",  href:"https://linkedin.com" },
                { label:"GitHub",   val:"github.com/abrar",       href:"https://github.com" },
                { label:"Location", val:"Rawalpindi, Pakistan",   href:"#" },
              ].map((l) => (
                <a key={l.label} href={l.href} className="contact-link" data-hover style={{ borderRight:"none" }}>
                  <span className="contact-link-label">{l.label}</span>
                  <span className="contact-link-val">{l.val}</span>
                  <span className="arrow">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ marginTop:120 }}>
          <p>© 2026 MUHAMMAD ABRAR AHMAD. ALL RIGHTS RESERVED.</p>
          <span className="footer-badge">NEXT.JS · GSAP · THREE.JS · WEBGL</span>
        </footer>
      </section>

      {/* Back to top */}
      <button
        id="back-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        data-hover
        style={{
          position:"fixed", bottom:32, right:32, zIndex:300,
          width:48, height:48,
          background:"var(--c-ember)", border:"none", cursor:"none",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18, color:"white",
          opacity:0, transform:"translateY(20px)",
          transition:"transform 0.3s ease",
          boxShadow:"0 0 24px rgba(255,61,0,0.4)",
        }}
        title="Back to top"
      >
        ↑
      </button>

      {/* Input focus line animation via style tag */}
      <style>{`
        input:focus ~ .input-line,
        textarea:focus ~ .input-line { transform: scaleX(1) !important; }
        .nav-dot.active { background: var(--c-ember) !important; transform: scale(1.6); }
        @media (max-width: 768px) {
          .contact-grid-responsive { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </>
  );
}
