import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Interactive 3D Vault Scene for the Upload & Community Contribution section.
 * Renders an architectural metallic portal with floating dimensional elements.
 */
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

export default function InteractiveVaultScene() {
  const mountRef = useRef(null);
  const [webglSupported] = useState(checkWebGL);

  useEffect(() => {
    if (!webglSupported) return;
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const isMobile = window.innerWidth < 768;
    const dpr = isMobile
      ? Math.min(window.devicePixelRatio || 1, 1.25)
      : Math.min(window.devicePixelRatio || 1, 1.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(dpr);
    container.appendChild(renderer.domElement);

    // Ambient + directional metallic lights
    const amb = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(amb);

    const dir1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dir1.position.set(4, 5, 4);
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0x737373, 1.2);
    dir2.position.set(-4, -3, -2);
    scene.add(dir2);

    const group = new THREE.Group();
    scene.add(group);

    // Three concentric metallic rings with varying tilts
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.95,
      roughness: 0.15,
      wireframe: false,
    });

    const r1Geom = new THREE.TorusGeometry(2.4, 0.02, 16, 80);
    const r1 = new THREE.Mesh(r1Geom, ringMat);
    group.add(r1);

    const r2Geom = new THREE.TorusGeometry(1.8, 0.015, 16, 80);
    const r2 = new THREE.Mesh(r2Geom, ringMat);
    r2.rotation.x = Math.PI / 4;
    group.add(r2);

    const r3Geom = new THREE.TorusGeometry(1.2, 0.012, 16, 80);
    const r3 = new THREE.Mesh(r3Geom, ringMat);
    r3.rotation.y = Math.PI / 3;
    group.add(r3);

    // Central obsidian node
    const nodeGeom = new THREE.IcosahedronGeometry(0.5, 0);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: true,
    });
    const node = new THREE.Mesh(nodeGeom, nodeMat);
    group.add(node);

    // Tiny orbiting metallic prisms
    const prismCount = isMobile ? 6 : 12;
    const prismGeom = new THREE.BoxGeometry(0.12, 0.16, 0.01);
    const prismMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.9,
      roughness: 0.2,
    });
    const prisms = [];
    for (let i = 0; i < prismCount; i++) {
      const p = new THREE.Mesh(prismGeom, prismMat);
      const angle = (i / prismCount) * Math.PI * 2;
      const radius = 2.0 + (i % 3) * 0.3;
      p.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, (Math.random() - 0.5) * 0.8);
      p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      group.add(p);
      prisms.push({ mesh: p, angle, radius, speed: 0.2 + (i % 3) * 0.1 });
    }

    let isVisible = true;
    let animId = null;
    const clock = new THREE.Clock();
    const pointer = { curX: 0, curY: 0, targetX: 0, targetY: 0 };

    const handlePointerMove = (e) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      pointer.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !animId) {
            clock.getDelta();
            animId = requestAnimationFrame(loop);
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const loop = () => {
      if (!isVisible) {
        animId = null;
        return;
      }
      const delta = Math.min(clock.getDelta(), 0.1);

      if (!prefersReducedMotion) {
        const factor = 1 - Math.exp(-5 * delta);
        pointer.curX += (pointer.targetX - pointer.curX) * factor;
        pointer.curY += (pointer.targetY - pointer.curY) * factor;

        group.rotation.y = pointer.curX * 0.4 + clock.getElapsedTime() * 0.08;
        group.rotation.x = -pointer.curY * 0.3;

        r1.rotation.z += 0.15 * delta;
        r2.rotation.x += 0.2 * delta;
        r3.rotation.y += 0.25 * delta;
        node.rotation.x += 0.3 * delta;
        node.rotation.y += 0.4 * delta;

        prisms.forEach((item) => {
          item.angle += item.speed * delta;
          item.mesh.position.x = Math.cos(item.angle) * item.radius;
          item.mesh.position.y = Math.sin(item.angle) * item.radius;
          item.mesh.rotation.x += 0.5 * delta;
          item.mesh.rotation.y += 0.5 * delta;
        });
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

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
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);

      r1Geom.dispose();
      r2Geom.dispose();
      r3Geom.dispose();
      ringMat.dispose();
      nodeGeom.dispose();
      nodeMat.dispose();
      prismGeom.dispose();
      prismMat.dispose();
      renderer.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-45"
      aria-hidden="true"
    >
      {!webglSupported && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent)]" />
      )}
    </div>
  );
}
