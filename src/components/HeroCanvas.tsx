"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Setup Renderer ──
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
    camera.position.z = 5.5;

    // ── Group ──
    const group = new THREE.Group();
    scene.add(group);

    // ── Torus Knots (red/orange on white) ──
    const geo1 = new THREE.TorusKnotGeometry(1.6, 0.35, 120, 12);
    const mat1 = new THREE.MeshBasicMaterial({
      color: 0xd63a00, // Red-orange
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const knot1 = new THREE.Mesh(geo1, mat1);
    group.add(knot1);

    const geo2 = new THREE.TorusKnotGeometry(1.62, 0.34, 120, 12);
    const mat2 = new THREE.MeshBasicMaterial({
      color: 0xff6b35, // Warm orange
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    const knot2 = new THREE.Mesh(geo2, mat2);
    knot2.rotation.y = Math.PI / 6;
    group.add(knot2);

    // ── Floating Particle System ──
    const PARTICLE_COUNT = 1800;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const randoms = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 2.5 + Math.random() * 5.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      randoms[i] = Math.random();
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

    // Custom shader — dark particles on light bg (no additive blending)
    const particleMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uScroll: { value: 0 },
      },
      vertexShader: `
        attribute float aRandom;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uScroll;
        varying float vAlpha;
        varying float vRandom;
        
        void main() {
          vRandom = aRandom;
          vec3 p = position;
          
          float t = uTime * 0.15;
          p.x += sin(t * 0.5 + aRandom * 6.28) * 0.3;
          p.y += cos(t * 0.4 + aRandom * 6.28) * 0.2;
          p.z += sin(t * 0.3 + aRandom * 3.14) * 0.15;
          
          p.y -= uScroll * 0.0025;
          
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vec4 pp = projectionMatrix * mv;
          
          vec2 ndc = pp.xy / pp.w;
          vec2 toMouse = ndc - (uMouse * 2.0 - 1.0);
          float dist = length(toMouse);
          float force = smoothstep(0.6, 0.0, dist) * 0.35;
          pp.xy += normalize(toMouse) * force * pp.w * 0.05;
          
          gl_Position = pp;
          gl_PointSize = (1.2 + aRandom * 2.2) * (5.5 / -mv.z);
          
          vAlpha = smoothstep(8.0, 0.0, abs(p.z)) * (0.15 + aRandom * 0.35);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying float vRandom;
        
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float r = length(uv);
          if (r > 0.5) discard;
          
          float alpha = pow((0.5 - r) * 2.0, 1.6) * vAlpha;
          
          // Red-orange palette on white bg
          vec3 ember = vec3(0.84, 0.23, 0.0);   // #d63a00
          vec3 orange = vec3(1.0, 0.42, 0.21);  // #ff6b35
          vec3 dark = vec3(0.10, 0.10, 0.10);   // near-black
          
          vec3 col;
          if (vRandom < 0.35) {
            col = mix(ember, orange, vRandom / 0.35);
          } else if (vRandom < 0.65) {
            col = mix(dark, ember, (vRandom - 0.35) / 0.3);
          } else {
            col = dark;
          }
          
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Interaction Listeners ──
    let mx = 0.5;
    let my = 0.5;
    let scrollY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth;
      my = e.clientY / window.innerHeight;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleResize = () => {
      if (!canvas) return;
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    // ── Animation Loop ──
    const clock = new THREE.Clock();
    let animFrameId: number;

    const tick = () => {
      const t = clock.getElapsedTime();

      particleMat.uniforms.uTime.value = t;
      particleMat.uniforms.uMouse.value.set(mx, 1 - my);
      particleMat.uniforms.uScroll.value += (scrollY - particleMat.uniforms.uScroll.value) * 0.05;

      group.rotation.y = t * 0.04 + (mx - 0.5) * 0.25;
      group.rotation.x = t * 0.02 + (my - 0.5) * 0.15;

      knot1.rotation.x = t * 0.08;
      knot1.rotation.y = t * 0.12;

      knot2.rotation.x = -t * 0.06;
      knot2.rotation.y = -t * 0.1;

      particles.rotation.y = -t * 0.015;

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(tick);
    };

    tick();

    // ── Cleanup ──
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrameId);
      renderer.dispose();
      geo1.dispose();
      mat1.dispose();
      geo2.dispose();
      mat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} id="hero-canvas" className="webgl-bg" />;
}
