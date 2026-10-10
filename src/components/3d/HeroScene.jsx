import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Creates a procedural monochromatic academic paper texture
 */
function createDocumentTexture(title, code, exam) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 724; // standard A4 aspect
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Rich dark graphite background
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, 512, 724);

  // Outer blueprint border
  ctx.strokeStyle = "#262626";
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, 480, 692);

  // Subtle grid
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 1;
  for (let x = 32; x < 480; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 16);
    ctx.lineTo(x, 708);
    ctx.stroke();
  }
  for (let y = 32; y < 708; y += 32) {
    ctx.beginPath();
    ctx.moveTo(16, y);
    ctx.lineTo(496, y);
    ctx.stroke();
  }

  // Header band
  ctx.fillStyle = "#181818";
  ctx.fillRect(20, 20, 472, 70);
  ctx.strokeStyle = "#333333";
  ctx.strokeRect(20, 20, 472, 70);

  // Institution / Vault Tag
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 20px monospace";
  ctx.fillText("PAPERVAULT // VIT-AP ARCHIVE", 36, 52);

  ctx.fillStyle = "#888888";
  ctx.font = "14px monospace";
  ctx.fillText(`EXAM: ${exam} · ${code}`, 36, 74);

  // Subject title
  ctx.fillStyle = "#F0F0F0";
  ctx.font = "bold 24px 'Space Grotesk', sans-serif";
  ctx.fillText(title, 36, 130);

  // Simulated exam questions / lines
  ctx.fillStyle = "#333333";
  let curY = 160;
  for (let section = 1; section <= 3; section++) {
    ctx.fillStyle = "#444444";
    ctx.font = "bold 13px monospace";
    ctx.fillText(`PART - 0${section} [MAX MARKS: 20]`, 36, curY);
    curY += 20;

    for (let q = 1; q <= 3; q++) {
      ctx.fillStyle = "#222222";
      ctx.fillRect(36, curY, 440, 8);
      curY += 14;
      ctx.fillRect(36, curY, 360, 8);
      curY += 14;
      ctx.fillRect(36, curY, 280, 8);
      curY += 24;
    }
  }

  // Watermark stamp in corner
  ctx.save();
  ctx.translate(410, 630);
  ctx.rotate(-0.15);
  ctx.strokeStyle = "#383838";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-50, -25, 100, 50);
  ctx.fillStyle = "#777777";
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";
  ctx.fillText("VERIFIED", 0, -2);
  ctx.fillText("ARCHIVE", 0, 14);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
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

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // --- THREE.JS SETUP ---
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    // Subtle scene fog for depth
    scene.fog = new THREE.FogExp2(0x050505, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

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
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x888888, 1.2);
    rimLight.position.set(-6, -4, -2);
    scene.add(rimLight);

    const pointerLight = new THREE.PointLight(0xffffff, 1.5, 12);
    pointerLight.position.set(0, 0, 4);
    scene.add(pointerLight);

    // --- 3D DOCUMENT STACK ---
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const paperGeom = new THREE.PlaneGeometry(2.3, 3.25, 1, 1);

    const papersData = [
      { title: "Network Security", code: "CSE4001", exam: "FAT 2025", z: 0.15, ry: -0.12, rz: 0.04, y: 0.1 },
      { title: "Artificial Intelligence", code: "CSE3002", exam: "CAT-2 2026", z: 0.0, ry: 0.08, rz: -0.06, y: -0.1 },
      { title: "Operating Systems", code: "CSE2005", exam: "CAT-1 2025", z: -0.18, ry: -0.2, rz: 0.1, y: 0.25 },
    ];

    const paperMeshes = [];
    const texturesToDispose = [];

    papersData.forEach((item, idx) => {
      const tex = createDocumentTexture(item.title, item.code, item.exam);
      if (tex) texturesToDispose.push(tex);

      const paperMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.35,
        metalness: 0.25,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(paperGeom, paperMat);
      mesh.position.set(idx * 0.45 - 0.45, item.y, item.z);
      mesh.rotation.y = item.ry;
      mesh.rotation.z = item.rz;
      mesh.rotation.x = 0.1;
      rootGroup.add(mesh);
      paperMeshes.push({ mesh, initial: { ...item } });
    });

    // Metallic Wireframe Enclosure / Architectural Ring
    const ringGeom = new THREE.TorusGeometry(3.2, 0.015, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.9,
      roughness: 0.1,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 3;
    rootGroup.add(ring);

    // Subtle Monochromatic Ambient Particles
    const particleCount = isMobile ? 50 : 150;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 14;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x999999,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // --- INTERACTION & 120Hz HIGH-REFRESH ENGINE ---
    const pointer = { targetX: 0, targetY: 0, curX: 0, curY: 0 };
    const scroll = { target: 0, current: 0 };
    let isVisible = true;
    let animId = null;
    const clock = new THREE.Clock();

    const handlePointerMove = (e) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointer.targetX = nx;
      pointer.targetY = ny;
    };

    const handleScroll = () => {
      scroll.target = window.scrollY || window.pageYOffset;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // IntersectionObserver to pause rendering when offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animId) {
            clock.getDelta(); // reset clock delta
            animId = requestAnimationFrame(renderLoop);
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // High refresh rate render loop
    const renderLoop = () => {
      if (!isVisible) {
        animId = null;
        return;
      }

      const delta = Math.min(clock.getDelta(), 0.1); // cap max delta to avoid frame spikes

      if (!prefersReducedMotion) {
        // Delta-based spring damping (60Hz / 90Hz / 120Hz smooth)
        const lerpFactor = 1 - Math.exp(-6 * delta);

        pointer.curX += (pointer.targetX - pointer.curX) * lerpFactor;
        pointer.curY += (pointer.targetY - pointer.curY) * lerpFactor;
        scroll.current += (scroll.target - scroll.current) * lerpFactor;

        // Group rotation responding to pointer
        rootGroup.rotation.y = pointer.curX * 0.28;
        rootGroup.rotation.x = -pointer.curY * 0.2;

        // Dynamic light follows pointer in 3D space
        pointerLight.position.x = pointer.curX * 4;
        pointerLight.position.y = pointer.curY * 3;

        // Scroll responsiveness: papers separate along Z as user scrolls
        const scrollFactor = Math.min(scroll.current / 400, 1.5);
        paperMeshes.forEach(({ mesh, initial }, i) => {
          mesh.position.z = initial.z + scrollFactor * (i === 0 ? 0.35 : i === 1 ? 0.1 : -0.25);
          mesh.rotation.z = initial.rz + scrollFactor * 0.05 * (i % 2 === 0 ? 1 : -1);
        });

        // Slow ambient particle float
        particles.rotation.y += 0.04 * delta;
        ring.rotation.z += 0.12 * delta;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup resources
    return () => {
      if (animId) cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);

      // Dispose 3D assets to prevent memory leaks
      texturesToDispose.forEach((t) => t.dispose());
      paperGeom.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

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
