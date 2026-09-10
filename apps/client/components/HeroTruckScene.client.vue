<script setup lang="ts">
import * as THREE from 'three';

/**
 * Анимированный фон hero-секции: фуры с логотипом AsDi
 * непрерывно курсируют по трассе-петле между двумя хабами —
 * Кыргызстаном и Россией. Реализовано на Three.js.
 *
 * Компонент client-only (суффикс .client.vue), поэтому SSR не трогает WebGL.
 */

const container = ref<HTMLDivElement | null>(null);

// Цвета логотипа/бренда (см. packages/theme/theme.css)
const BRAND = 0xc33a22; // brand-500
const BRAND_DARK = 0x862715; // brand-700 (снят с логотипа)

let cleanup: (() => void) | null = null;

onMounted(() => {
  const el = container.value;
  if (!el) return;
  const host: HTMLDivElement = el;

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.03);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0.5, 8.4, 11.5);
  camera.lookAt(0, 0, -0.5);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';

  // --- освещение ---
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(6, 12, 8);
  scene.add(key);
  const rim = new THREE.PointLight(BRAND, 1.4, 40);
  rim.position.set(-6, 4, -4);
  scene.add(rim);

  // --- геометрия трассы-петли (эллипс на плоскости XZ) ---
  const R = 4.2;
  const SCALE_X = 1.75;
  const a = R * SCALE_X; // большая полуось
  const b = R; // малая полуось
  const ROAD_Y = 0.02;

  const road = new THREE.Mesh(
    new THREE.TorusGeometry(R, 0.62, 20, 160),
    new THREE.MeshStandardMaterial({
      color: 0x2c2b2b,
      roughness: 0.95,
      metalness: 0.0,
    }),
  );
  road.rotation.x = -Math.PI / 2;
  road.scale.set(SCALE_X, 1, 0.14);
  road.position.y = ROAD_Y;
  scene.add(road);

  // Пунктирная осевая линия
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xe6b8a6, transparent: true, opacity: 0.5 });
  const dashGeo = new THREE.BoxGeometry(0.5, 0.02, 0.09);
  const DASHES = 48;
  for (let i = 0; i < DASHES; i++) {
    const th = (i / DASHES) * Math.PI * 2;
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.position.set(a * Math.cos(th), ROAD_Y + 0.05, b * Math.sin(th));
    const tx = -a * Math.sin(th);
    const tz = b * Math.cos(th);
    dash.rotation.y = Math.atan2(tx, tz);
    scene.add(dash);
  }

  // --- текстуры ---
  function makeCanvasTexture(
    draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
    w: number,
    h: number,
  ): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    draw(ctx, w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // Ливрея борта: "AsDi" на светлом фоне
  const liveryTex = makeCanvasTexture(
    (ctx, w, h) => {
      ctx.fillStyle = '#f4f2f0';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#c33a22';
      ctx.fillRect(0, 0, w, h * 0.12);
      ctx.fillRect(0, h * 0.88, w, h * 0.12);
      // мини-«коробка» слева
      ctx.strokeStyle = '#c33a22';
      ctx.lineWidth = h * 0.05;
      const bx = w * 0.12;
      const by = h * 0.34;
      const bs = h * 0.32;
      ctx.strokeRect(bx, by, bs, bs);
      ctx.beginPath();
      ctx.moveTo(bx, by + bs * 0.5);
      ctx.lineTo(bx + bs * 0.5, by + bs * 0.72);
      ctx.lineTo(bx + bs, by + bs * 0.5);
      ctx.stroke();
      // надпись
      ctx.fillStyle = '#862715';
      ctx.font = `700 ${h * 0.46}px Arial, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText('AsDi', w * 0.34, h * 0.52);
    },
    512,
    256,
  );

  function makeLabelSprite(text: string): THREE.Sprite {
    const tex = makeCanvasTexture(
      (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#e79d8b';
        ctx.font = `700 ${h * 0.5}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = h * 0.12;
        ctx.fillText(text, w / 2, h / 2);
      },
      512,
      128,
    );
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(3.4, 0.85, 1);
    return sp;
  }

  // --- фура ---
  const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.18, 16);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.8 });
  const cabMat = new THREE.MeshStandardMaterial({
    color: BRAND,
    roughness: 0.35,
    metalness: 0.15,
    emissive: BRAND_DARK,
    emissiveIntensity: 0.25,
  });
  const trailerMat = new THREE.MeshStandardMaterial({ color: 0xf4f2f0, roughness: 0.6 });
  const liverySideMat = new THREE.MeshStandardMaterial({ map: liveryTex, roughness: 0.55 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x1a2a33,
    roughness: 0.1,
    metalness: 0.6,
  });

  function makeTruck(): THREE.Group {
    const g = new THREE.Group();

    // Кабина
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.85, 1.0), cabMat);
    cab.position.set(1.35, 0.62, 0);
    g.add(cab);
    // лобовое стекло
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.82), glassMat);
    glass.position.set(1.82, 0.72, 0);
    g.add(glass);

    // Прицеп (борта — с ливреей AsDi)
    const trailer = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.15, 1.05), [
      trailerMat, // +x (зад)
      trailerMat, // -x (сцепка)
      trailerMat, // +y (крыша)
      trailerMat, // -y (низ)
      liverySideMat, // +z (правый борт)
      liverySideMat, // -z (левый борт)
    ]);
    trailer.position.set(-0.35, 0.78, 0);
    g.add(trailer);

    // Колёса
    const wheelX = [1.35, -0.9, -1.45];
    for (const wx of wheelX) {
      for (const wz of [0.56, -0.56]) {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(wx, 0.26, wz);
        g.add(wheel);
      }
    }

    g.scale.setScalar(0.62);
    return g;
  }

  // Хабы (Кыргызстан / Россия)
  type Hub = { angle: number; label: string };
  const hubs: Hub[] = [
    { angle: Math.PI * 1.12, label: 'КЫРГЫЗСТАН' }, // ближний левый
    { angle: Math.PI * 0.08, label: 'РОССИЯ' }, // дальний правый
  ];

  const ringGeo = new THREE.TorusGeometry(0.7, 0.07, 12, 40);
  const ringMat = new THREE.MeshStandardMaterial({
    color: BRAND,
    emissive: BRAND,
    emissiveIntensity: 1.4,
  });
  for (const hub of hubs) {
    const hx = a * Math.cos(hub.angle);
    const hz = b * Math.sin(hub.angle);

    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(hx, 0.06, hz);
    scene.add(ring);

    const pillar = new THREE.PointLight(BRAND, 2.2, 8);
    pillar.position.set(hx, 1.2, hz);
    scene.add(pillar);

    const label = makeLabelSprite(hub.label);
    label.position.set(hx, 1.9, hz);
    scene.add(label);
  }

  // Флот
  const N_TRUCKS = 5;
  const trucks: { group: THREE.Group; t: number }[] = [];
  for (let i = 0; i < N_TRUCKS; i++) {
    const group = makeTruck();
    scene.add(group);
    trucks.push({ group, t: i / N_TRUCKS });
  }

  function placeTruck(group: THREE.Group, t: number) {
    const th = t * Math.PI * 2;
    const x = a * Math.cos(th);
    const z = b * Math.sin(th);
    group.position.set(x, 0.02, z);
    // касательная к эллипсу для ориентации
    const tx = -a * Math.sin(th);
    const tz = b * Math.cos(th);
    group.rotation.y = Math.atan2(tx, tz) + Math.PI / 2;
  }

  for (const tr of trucks) placeTruck(tr.group, tr.t);

  // --- размеры / ресайз ---
  function resize() {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  // --- цикл анимации ---
  const clock = new THREE.Clock();
  let raf = 0;
  let running = true;
  const SPEED = 0.035; // доля петли в секунду

  function frame() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    for (const tr of trucks) {
      tr.t = (tr.t + dt * SPEED) % 1;
      placeTruck(tr.group, tr.t);
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  if (prefersReduced) {
    renderer.render(scene, camera); // статичный кадр
  } else {
    raf = requestAnimationFrame(frame);
  }

  const onVisibility = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!prefersReduced && !running) {
      running = true;
      clock.getDelta();
      raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  // --- очистка ---
  cleanup = () => {
    running = false;
    cancelAnimationFrame(raf);
    ro.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = (mesh as THREE.Mesh).material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) (mat as THREE.Material).dispose();
    });
    liveryTex.dispose();
    renderer.dispose();
    if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
  };
});

onBeforeUnmount(() => {
  cleanup?.();
  cleanup = null;
});
</script>

<template>
  <div
    ref="container"
    class="pointer-events-none absolute inset-0 -z-10 h-full w-full"
    aria-hidden="true"
  />
</template>
