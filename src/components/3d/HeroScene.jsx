import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Creates an ultra-crisp, high-fidelity monochromatic examination paper texture.
 * 1024x1448 resolution for razor-sharp rendering on Retina and 4K displays.
 */
function createDocumentTexture(title, code, exam, slot = "A1+TA1") {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1448; // A4 aspect ratio @ 2x
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 1. Rich tactile graphite paper base
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, 1024, 1448);

  // Subtle paper grain/fiber effect
  ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 1448;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // 2. Technical Blueprint Borders & Crosshair Registration Marks
  ctx.strokeStyle = "#2A2A2A";
  ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, 952, 1376);

  // Precision corner crosshairs
  const drawCross = (x, y) => {
    ctx.strokeStyle = "#555555";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x + 12, y);
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x, y + 12);
    ctx.stroke();
  };
  drawCross(56, 56);
  drawCross(968, 56);
  drawCross(56, 1392);
  drawCross(968, 1392);

  // Subtle interior grid
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 1;
  for (let x = 76; x < 950; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 36);
    ctx.lineTo(x, 1412);
    ctx.stroke();
  }
  for (let y = 76; y < 1400; y += 64) {
    ctx.beginPath();
    ctx.moveTo(36, y);
    ctx.lineTo(988, y);
    ctx.stroke();
  }

  // 3. Official University / Archive Header
  ctx.fillStyle = "#161616";
  ctx.fillRect(50, 50, 924, 150);
  ctx.strokeStyle = "#333333";
  ctx.strokeRect(50, 50, 924, 150);

  // Archive Title & Monospace tags
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 26px 'Space Grotesk', sans-serif";
  ctx.fillText("VIT-AP UNIVERSITY // PAPERVAULT ARCHIVE", 80, 102);

  ctx.fillStyle = "#888888";
  ctx.font = "bold 18px 'JetBrains Mono', monospace";
  ctx.fillText(`EXAM: ${exam.toUpperCase()} · SLOT: ${slot}`, 80, 140);
  ctx.fillText(`COURSE CODE: ${code}`, 80, 172);

  // Simulated Barcode in header right
  const barcodeX = 740;
  ctx.fillStyle = "#CCCCCC";
  for (let b = 0; b < 48; b++) {
    const w = (b % 3 === 0 ? 4 : 2);
    ctx.fillRect(barcodeX + b * 4, 82, w, 70);
  }
  ctx.fillStyle = "#666666";
  ctx.font = "12px monospace";
  ctx.fillText("DOC-AUTH-VERIFIED", 740, 170);

  // 4. Course Title Display
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 38px 'Space Grotesk', sans-serif";
  ctx.fillText(title, 80, 260);

  // Meta strip below title
  ctx.fillStyle = "#777777";
  ctx.font = "16px 'JetBrains Mono', monospace";
  ctx.fillText("PROGRAM: B.TECH · DURATION: 180 MINS · MAX MARKS: 100", 80, 298);

  // 5. Simulated Examination Question Sections
  let curY = 340;
  for (let s = 1; s <= 3; s++) {
    // Section Header Box
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(80, curY, 864, 38);
    ctx.strokeStyle = "#383838";
    ctx.strokeRect(80, curY, 864, 38);

    ctx.fillStyle = "#E8E8E8";
    ctx.font = "bold 16px 'JetBrains Mono', monospace";
    ctx.fillText(`PART - 0${s} (ANSWER ALL QUESTIONS) [30 MARKS]`, 96, curY + 25);
    curY += 60;

    // Simulated Questions
    for (let q = 1; q <= 2; q++) {
      ctx.fillStyle = "#CCCCCC";
      ctx.font = "bold 16px 'JetBrains Mono', monospace";
      ctx.fillText(`Q${(s - 1) * 2 + q}.`, 80, curY + 14);

      // Question body lines
      ctx.fillStyle = "#262626";
      ctx.fillRect(120, curY + 4, 730, 12);
      ctx.fillRect(120, curY + 24, 640, 12);
      ctx.fillRect(120, curY + 44, 480, 12);

      // Marks tag
      ctx.fillStyle = "#888888";
      ctx.font = "bold 14px 'JetBrains Mono', monospace";
      ctx.fillText("[15M]", 880, curY + 24);

      curY += 80;
    }
    curY += 20;
  }

  // 6. Security Watermark & Official Archive Stamp
  ctx.save();
  ctx.translate(810, 1240);
  ctx.rotate(-0.16);

  ctx.strokeStyle = "#444444";
  ctx.lineWidth = 3;
  ctx.strokeRect(-90, -45, 180, 90);

  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 1;
  ctx.strokeRect(-82, -37, 164, 74);

  ctx.fillStyle = "#888888";
  ctx.font = "bold 16px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("VIT-AP", 0, -10);
  ctx.fillText("ARCHIVE", 0, 12);
  ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.fillText("MODERATED // 2026", 0, 28);
  ctx.restore();

  // Footer microtext
  ctx.fillStyle = "#555555";
  ctx.font = "12px 'JetBrains Mono', monospace";
  ctx.fillText("CONFIDENTIAL // FOR ACADEMIC PREPARATION ONLY", 80, 1380);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function checkWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

export default function HeroScene() {
  const mountRef = useRef(null);
  const [webglSupported] = useState(checkWebGL);

  useEffect(() => {
    if (!webglSupported) return;
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // --- THREE.JS SETUP ---
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.038);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.8);

    const isMobile = window.innerWidth < 768;
    const dpr = isMobile
      ? Math.min(window.devicePixelRatio || 1, 1.25)
      : Math.min(window.devicePixelRatio || 1, 1.75);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- CINEMATIC LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(6, 9, 7);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x737373, 1.4);
    rimLight.position.set(-7, -4, -3);
    scene.add(rimLight);

    const pointerLight = new THREE.PointLight(0xffffff, 2.0, 14);
    pointerLight.position.set(0, 0, 5);
    scene.add(pointerLight);

    // --- 3D DOCUMENT STACK ROOT ---
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Physical paper aspect ratio A4: 2.3 x 3.25
    const paperGeom = new THREE.PlaneGeometry(2.35, 3.32, 1, 1);

    const papersData = [
      {
        title: "Artificial Intelligence",
        code: "CSE3002",
        exam: "CAT-2 2026",
        slot: "C1+TC1",
        x: 0.15,
        y: 0.05,
        z: 0.25,
        ry: -0.14,
        rz: 0.03,
        rx: 0.08,
      },
      {
        title: "Network Security",
        code: "CSE4001",
        exam: "FAT 2025",
        slot: "A2+TA2",
        x: -0.35,
        y: -0.12,
        z: 0.0,
        ry: 0.1,
        rz: -0.06,
        rx: 0.05,
      },
      {
        title: "Operating Systems",
        code: "CSE2005",
        exam: "CAT-1 2025",
        slot: "B1+TB1",
        x: 0.45,
        y: 0.28,
        z: -0.25,
        ry: -0.22,
        rz: 0.08,
        rx: 0.12,
      },
    ];

    const paperMeshes = [];
    const texturesToDispose = [];

    papersData.forEach((item) => {
      const tex = createDocumentTexture(item.title, item.code, item.exam, item.slot);
      if (tex) texturesToDispose.push(tex);

      const paperMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.52,
        metalness: 0.12,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(paperGeom, paperMat);
      mesh.position.set(item.x, item.y, item.z);
      mesh.rotation.x = item.rx;
      mesh.rotation.y = item.ry;
      mesh.rotation.z = item.rz;
      rootGroup.add(mesh);
      paperMeshes.push({ mesh, initial: { ...item } });
    });

    // Outer Architectural Titanium Orbital Ring
    const orbitalRingGeom = new THREE.TorusGeometry(3.6, 0.012, 16, 120);
    const orbitalRingMat = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.95,
      roughness: 0.15,
    });
    const orbitalRing = new THREE.Mesh(orbitalRingGeom, orbitalRingMat);
    orbitalRing.rotation.x = Math.PI / 2.8;
    orbitalRing.rotation.y = Math.PI / 8;
    rootGroup.add(orbitalRing);

    // Inner Delicate Dashed Ring
    const innerRingGeom = new THREE.TorusGeometry(2.8, 0.008, 16, 80);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true,
    });
    const innerRing = new THREE.Mesh(innerRingGeom, innerRingMat);
    innerRing.rotation.x = Math.PI / 2.2;
    innerRing.rotation.z = Math.PI / 4;
    rootGroup.add(innerRing);

    // Ambient Stardust Particles
    const particleCount = isMobile ? 60 : 180;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.038,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // --- INTERACTION & 120Hz HIGH-REFRESH RATE LOOP ---
    const pointer = { targetX: 0, targetY: 0, curX: 0, curY: 0 };
    const scroll = { target: 0, current: 0 };
    let isVisible = true;
    let animId = null;
    let lastTime = performance.now();

    const handlePointerMove = (e) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      pointer.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const handleScroll = () => {
      scroll.target = window.scrollY || window.pageYOffset;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // IntersectionObserver pauses rendering when hero scrolls out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animId) {
            lastTime = performance.now();
            animId = requestAnimationFrame(renderLoop);
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const renderLoop = (timestamp) => {
      if (!isVisible) {
        animId = null;
        return;
      }

      const now = timestamp || performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!prefersReducedMotion) {
        // Delta-based spring physics (smooth 60/90/120/144Hz)
        const lerpFactor = 1 - Math.exp(-5.5 * delta);

        pointer.curX += (pointer.targetX - pointer.curX) * lerpFactor;
        pointer.curY += (pointer.targetY - pointer.curY) * lerpFactor;
        scroll.current += (scroll.target - scroll.current) * lerpFactor;

        // Group subtle tilt responding to pointer
        rootGroup.rotation.y = pointer.curX * 0.24;
        rootGroup.rotation.x = -pointer.curY * 0.18;

        // Dynamic light follows pointer coordinates
        pointerLight.position.x = pointer.curX * 4.5;
        pointerLight.position.y = pointer.curY * 3.5;

        // Dimensional scroll separation: papers physically spread along Z-axis
        const scrollFactor = Math.min(scroll.current / 450, 1.8);
        paperMeshes.forEach(({ mesh, initial }, i) => {
          mesh.position.z = initial.z + scrollFactor * (i === 0 ? 0.45 : i === 1 ? 0.12 : -0.35);
          mesh.position.x = initial.x + scrollFactor * (i === 0 ? 0.15 : i === 1 ? -0.1 : 0.05);
          mesh.rotation.z = initial.rz + scrollFactor * 0.06 * (i % 2 === 0 ? 1 : -1);
        });

        // Orbital slow drift
        orbitalRing.rotation.z += 0.1 * delta;
        innerRing.rotation.y += 0.15 * delta;
        particles.rotation.y += 0.03 * delta;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);

      texturesToDispose.forEach((t) => t.dispose());
      paperGeom.dispose();
      orbitalRingGeom.dispose();
      orbitalRingMat.dispose();
      innerRingGeom.dispose();
      innerRingMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [webglSupported]);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {!webglSupported && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.06),transparent)]" />
      )}
    </div>
  );
}
