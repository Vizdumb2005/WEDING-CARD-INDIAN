import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface ThreeFloralCanvasProps {
  /** Whether the book cover has been opened (activates heavenly Pushpa Varsha lotus rain across the scroll) */
  isOpened: boolean;
}

interface LotusRainState {
  group: THREE.Group;
  /** Ceremonial framing position when Stage 0 Book Cover is closed */
  coverX: number;
  coverY: number;
  coverZ: number;
  coverScale: number;
  /** True for the 4 framing lotuses visible on the closed book cover */
  visibleOnCover: boolean;
  /** True for delicate smaller blossoms that drift gracefully across the scroll card */
  isScrollBlossom: boolean;
  /** Active Pushpa Varsha rain physics state */
  x: number;
  y: number;
  z: number;
  laneX: number;
  fallSpeed: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  rainScale: number;
  rx: number;
  ry: number;
  rz: number;
  vrx: number;
  vry: number;
  vrz: number;
}

interface PetalState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  vrx: number;
  vry: number;
  vrz: number;
  phase: number;
  scale: number;
  burstLife: number;
}

interface DustState {
  x: number;
  y: number;
  z: number;
  vy: number;
  phase: number;
  scale: number;
}

/**
 * Helper to create a curved, organic sculpted rose/lotus petal BufferGeometry.
 */
function createCurvedPetalGeometry(width = 0.24, length = 0.36): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.65, length * 0.18, width * 0.72, length * 0.72, 0, length);
  shape.bezierCurveTo(-width * 0.72, length * 0.72, -width * 0.65, length * 0.18, 0, 0);

  const geo = new THREE.ShapeGeometry(shape, 7);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const u = py / length;
    const cupZ = Math.sin(u * Math.PI) * 0.055 - Math.abs(px) * 0.14;
    pos.setZ(i, cupZ);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a composite 3D Sacred Indian Lotus (THREE.Group with 20 sculpted parts:
 * sage calyx leaves, outer blush petals, inner ivory-rose petals, and hot-gold stamen crown).
 */
function createCompositeLotusGroup(
  outerMat: THREE.MeshStandardMaterial,
  innerMat: THREE.MeshStandardMaterial,
  goldMat: THREE.MeshStandardMaterial,
  leafMat: THREE.MeshStandardMaterial,
  outerPetalGeo: THREE.BufferGeometry,
  innerPetalGeo: THREE.BufferGeometry,
  leafGeo: THREE.BufferGeometry
): THREE.Group {
  const group = new THREE.Group();

  // 1. Calyx sage leaves (4 parts)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.rotation.order = 'YXZ';
    leaf.rotation.y = angle;
    leaf.rotation.x = 1.38;
    leaf.position.y = -0.05;
    group.add(leaf);
  }

  // 2. Outer blush-rose lotus petals (8 parts)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const petal = new THREE.Mesh(outerPetalGeo, outerMat);
    petal.rotation.order = 'YXZ';
    petal.rotation.y = angle;
    petal.rotation.x = 1.06;
    group.add(petal);
  }

  // 3. Inner cream-blush petals (6 parts)
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const petal = new THREE.Mesh(innerPetalGeo, innerMat);
    petal.rotation.order = 'YXZ';
    petal.rotation.y = angle;
    petal.rotation.x = 0.62;
    petal.position.y = 0.03;
    group.add(petal);
  }

  // 4. Sculpted antique gold receptacle & stamen crown
  const coreGeo = new THREE.SphereGeometry(0.11, 14, 10);
  coreGeo.scale(1, 0.55, 1);
  const core = new THREE.Mesh(coreGeo, goldMat);
  core.position.y = 0.06;
  group.add(core);

  const ringGeo = new THREE.TorusGeometry(0.135, 0.018, 8, 20);
  const ring = new THREE.Mesh(ringGeo, goldMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.085;
  group.add(ring);

  return group;
}

/**
 * Full-viewport Three.js WebGL interactive Indian Pushpa Varsha (Heavenly Flower Rain):
 * - Closed Book Cover (Stage 0): 4 royal sacred lotuses frame the velvet cover gracefully
 * - Opened Scroll (Stage 1+): Transitions smoothly into a balanced, heavenly downward
 *   flower rain of sculpted 3D sacred lotuses, blush/marigold petals & subtle gold motes
 *   gently carried by the guest's scroll across the invitation without obstructing readability.
 */
export function ThreeFloralCanvas({ isOpened }: ThreeFloralCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const isOpenedRef = useRef(isOpened);
  isOpenedRef.current = isOpened;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Software WebGL guard from GPU renderer string
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param) || '');
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = false;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / Math.max(1, window.innerHeight),
      0.1,
      80
    );
    camera.position.set(0, 0, 11.5);

    // Warm/cool 3-point heritage lighting rig
    const hemiLight = new THREE.HemisphereLight(0xfff6ea, 0x3b0d17, 1.08);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe6bd, 1.55);
    keyLight.position.set(5, 7, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf6c4ce, 0.88);
    rimLight.position.set(-6, -3, 4);
    scene.add(rimLight);

    // Shared geometries & calibrated PBR materials
    const outerLotusPetalGeo = createCurvedPetalGeometry(0.32, 0.58);
    const innerLotusPetalGeo = createCurvedPetalGeometry(0.24, 0.44);
    const calyxLeafGeo = createCurvedPetalGeometry(0.28, 0.56);
    const driftingPetalGeo = createCurvedPetalGeometry(0.14, 0.22);
    const dustGeo = new THREE.OctahedronGeometry(0.03, 0);

    const lotusOuterMat = new THREE.MeshStandardMaterial({
      color: 0xe8a8b5,
      roughness: 0.68,
      metalness: 0.04,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    });
    const lotusInnerMat = new THREE.MeshStandardMaterial({
      color: 0xfcf2ec,
      roughness: 0.62,
      metalness: 0.05,
      transparent: true,
      opacity: 0.94,
      side: THREE.DoubleSide,
    });
    const goldFoilMat = new THREE.MeshStandardMaterial({
      color: 0xd9af58,
      roughness: 0.24,
      metalness: 0.9,
      emissive: 0x3a2507,
      emissiveIntensity: 0.25,
    });
    const sageLeafMat = new THREE.MeshStandardMaterial({
      color: 0x5d7a5b,
      roughness: 0.76,
      metalness: 0.05,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });

    // Ethereal gossamer materials for the 5 celestial blossoms gliding gently across the scroll
    const scrollOuterMat = lotusOuterMat.clone();
    scrollOuterMat.opacity = 0.62;
    scrollOuterMat.depthWrite = false;
    const scrollInnerMat = lotusInnerMat.clone();
    scrollInnerMat.opacity = 0.66;
    scrollInnerMat.depthWrite = false;
    const scrollGoldMat = goldFoilMat.clone();
    scrollGoldMat.transparent = true;
    scrollGoldMat.opacity = 0.76;
    const scrollLeafMat = sageLeafMat.clone();
    scrollLeafMat.opacity = 0.58;
    scrollLeafMat.depthWrite = false;

    // =========================================================================
    // 9 Perfectly Balanced Sculpted 3D Sacred Lotuses (Pushpa Varsha Flower Rain)
    // - 4 royal margin lotuses (also frame Stage 0 closed book cover)
    // - 5 delicate celestial blossoms drifting gracefully across & beside the scroll
    // =========================================================================
    const lotusRainConfigs: Array<{
      coverX: number;
      coverY: number;
      coverZ: number;
      coverScale: number;
      visibleOnCover: boolean;
      isScrollBlossom: boolean;
      laneX: number;
      startY: number;
      z: number;
      fallSpeed: number;
      swayAmp: number;
      swayFreq: number;
      rainScale: number;
    }> = [
      // 4 Lush Royal Lotuses (outer margins & book cover frame)
      {
        coverX: -4.9,
        coverY: 2.3,
        coverZ: -0.8,
        coverScale: 1.05,
        visibleOnCover: true,
        isScrollBlossom: false,
        laneX: -4.85,
        startY: 5.4,
        z: -0.9,
        fallSpeed: 0.42,
        swayAmp: 0.42,
        swayFreq: 0.55,
        rainScale: 0.84,
      },
      {
        coverX: 5.0,
        coverY: 1.8,
        coverZ: -1.1,
        coverScale: 0.98,
        visibleOnCover: true,
        isScrollBlossom: false,
        laneX: 4.95,
        startY: 2.1,
        z: -1.1,
        fallSpeed: 0.38,
        swayAmp: 0.46,
        swayFreq: 0.48,
        rainScale: 0.82,
      },
      {
        coverX: -4.6,
        coverY: -2.4,
        coverZ: -1.5,
        coverScale: 0.92,
        visibleOnCover: true,
        isScrollBlossom: false,
        laneX: -3.55,
        startY: -1.8,
        z: -1.4,
        fallSpeed: 0.36,
        swayAmp: 0.38,
        swayFreq: 0.52,
        rainScale: 0.72,
      },
      {
        coverX: 4.8,
        coverY: -2.1,
        coverZ: -0.6,
        coverScale: 1.02,
        visibleOnCover: true,
        isScrollBlossom: false,
        laneX: 3.65,
        startY: -4.2,
        z: -0.7,
        fallSpeed: 0.45,
        swayAmp: 0.4,
        swayFreq: 0.58,
        rainScale: 0.76,
      },
      // 5 Delicate Heavenly Scroll Blossoms (balanced Pushpa Varsha gliding gracefully along & across the open card)
      {
        coverX: -2.2,
        coverY: 7.4,
        coverZ: 0.4,
        coverScale: 0.001,
        visibleOnCover: false,
        isScrollBlossom: true,
        laneX: -1.85,
        startY: 4.9,
        z: 0.7,
        fallSpeed: 0.48,
        swayAmp: 0.45,
        swayFreq: 0.62,
        rainScale: 0.42,
      },
      {
        coverX: 2.1,
        coverY: 7.6,
        coverZ: 0.6,
        coverScale: 0.001,
        visibleOnCover: false,
        isScrollBlossom: true,
        laneX: 1.85,
        startY: 1.4,
        z: 0.9,
        fallSpeed: 0.52,
        swayAmp: 0.44,
        swayFreq: 0.54,
        rainScale: 0.41,
      },
      {
        coverX: 0.0,
        coverY: 8.0,
        coverZ: 0.5,
        coverScale: 0.001,
        visibleOnCover: false,
        isScrollBlossom: true,
        laneX: -1.05,
        startY: -2.4,
        z: 0.5,
        fallSpeed: 0.44,
        swayAmp: 0.48,
        swayFreq: 0.49,
        rainScale: 0.36,
      },
      {
        coverX: -1.1,
        coverY: 8.4,
        coverZ: 0.3,
        coverScale: 0.001,
        visibleOnCover: false,
        isScrollBlossom: true,
        laneX: 1.18,
        startY: 6.4,
        z: 0.4,
        fallSpeed: 0.4,
        swayAmp: 0.42,
        swayFreq: 0.66,
        rainScale: 0.37,
      },
      {
        coverX: 1.4,
        coverY: 8.8,
        coverZ: 0.2,
        coverScale: 0.001,
        visibleOnCover: false,
        isScrollBlossom: true,
        laneX: -2.45,
        startY: -4.9,
        z: 0.2,
        fallSpeed: 0.46,
        swayAmp: 0.44,
        swayFreq: 0.57,
        rainScale: 0.43,
      },
    ];

    const lotuses: LotusRainState[] = lotusRainConfigs.map((cfg, idx) => {
      const grp = createCompositeLotusGroup(
        cfg.isScrollBlossom ? scrollOuterMat : lotusOuterMat,
        cfg.isScrollBlossom ? scrollInnerMat : lotusInnerMat,
        cfg.isScrollBlossom ? scrollGoldMat : goldFoilMat,
        cfg.isScrollBlossom ? scrollLeafMat : sageLeafMat,
        outerLotusPetalGeo,
        innerLotusPetalGeo,
        calyxLeafGeo
      );
      const initX = isOpenedRef.current ? cfg.laneX : cfg.coverX;
      const initY = isOpenedRef.current ? cfg.startY : cfg.coverY;
      const initZ = isOpenedRef.current ? cfg.z : cfg.coverZ;
      const initScale = isOpenedRef.current ? cfg.rainScale : cfg.coverScale;

      grp.position.set(initX, initY, initZ);
      grp.scale.setScalar(initScale);
      grp.rotation.set(0.55 + (idx % 3) * 0.14, idx * 0.9, (idx % 2 === 0 ? 1 : -1) * 0.2);
      scene.add(grp);

      return {
        group: grp,
        coverX: cfg.coverX,
        coverY: cfg.coverY,
        coverZ: cfg.coverZ,
        coverScale: cfg.coverScale,
        visibleOnCover: cfg.visibleOnCover,
        isScrollBlossom: cfg.isScrollBlossom,
        x: cfg.laneX,
        y: cfg.startY,
        z: cfg.z,
        laneX: cfg.laneX,
        fallSpeed: cfg.fallSpeed,
        swayAmp: cfg.swayAmp,
        swayFreq: cfg.swayFreq,
        phase: idx * 1.37 + 0.4,
        rainScale: cfg.rainScale,
        rx: 0.55 + (idx % 3) * 0.15,
        ry: idx * 0.85,
        rz: (idx % 2 === 0 ? 1 : -1) * 0.18,
        vrx: (idx % 2 === 0 ? 1 : -1) * (0.12 + (idx % 3) * 0.04),
        vry: (idx % 2 === 0 ? 1 : -1) * (0.24 + (idx % 4) * 0.05),
        vrz: (idx % 2 === 0 ? -1 : 1) * (0.09 + (idx % 3) * 0.03),
      };
    });

    // Balanced Instanced 3D Rose, Lotus & Marigold Petals (Heavenly Pushpa Varsha)
    const AMBIENT_PETALS = 36;
    const BURST_PETALS = 26;
    const TOTAL_PETALS = AMBIENT_PETALS + BURST_PETALS;

    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.64,
      metalness: 0.08,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
    });
    const petalMesh = new THREE.InstancedMesh(driftingPetalGeo, petalMat, TOTAL_PETALS);
    petalMesh.frustumCulled = false;

    const petalPalette = [
      new THREE.Color('#EDB4C0'), // Soft Lotus Blush
      new THREE.Color('#DF8F9E'), // Rose Petal
      new THREE.Color('#F9E7E2'), // Ivory Blossom
      new THREE.Color('#E8B858'), // Auspicious Marigold Gold
      new THREE.Color('#D46E82'), // Deep Rose
    ];

    const petals: PetalState[] = [];
    for (let i = 0; i < TOTAL_PETALS; i++) {
      const isBurst = i >= AMBIENT_PETALS;
      petals.push({
        x: (Math.random() - 0.5) * 13.5,
        y: isBurst ? -99 : (Math.random() - 0.5) * 11.5,
        z: -2.0 + Math.random() * 4.2,
        vx: (Math.random() - 0.5) * 0.14,
        vy: -(0.32 + Math.random() * 0.34),
        vz: (Math.random() - 0.5) * 0.06,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        vrx: (Math.random() - 0.5) * 0.95,
        vry: (Math.random() - 0.5) * 1.15,
        vrz: (Math.random() - 0.5) * 0.75,
        phase: Math.random() * Math.PI * 2,
        scale: 0.66 + Math.random() * 0.52,
        burstLife: isBurst ? 0 : -1,
      });
      petalMesh.setColorAt(i, petalPalette[i % petalPalette.length]);
    }
    if (petalMesh.instanceColor) petalMesh.instanceColor.needsUpdate = true;
    scene.add(petalMesh);

    // Subtle rising antique gold-leaf dust motes (balanced & airy)
    const DUST_COUNT = 26;
    const dustMat = new THREE.MeshStandardMaterial({
      color: 0xf1d58c,
      roughness: 0.22,
      metalness: 0.92,
      emissive: 0x6b4b12,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.68,
    });
    const dustMesh = new THREE.InstancedMesh(dustGeo, dustMat, DUST_COUNT);
    dustMesh.frustumCulled = false;

    const dustStates: DustState[] = [];
    for (let i = 0; i < DUST_COUNT; i++) {
      dustStates.push({
        x: (Math.random() - 0.5) * 13.5,
        y: (Math.random() - 0.5) * 10,
        z: -2 + Math.random() * 4,
        vy: 0.13 + Math.random() * 0.18,
        phase: Math.random() * Math.PI * 2,
        scale: 0.5 + Math.random() * 0.85,
      });
    }
    scene.add(dustMesh);

    const _dummy = new THREE.Object3D();
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let scrollNorm = 0;
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    let scrollBreeze = 0; // Gentle scroll-induced flower rain wind impulse
    let rainBlend = isOpenedRef.current ? 1 : 0;

    const onPointerMove = (e: PointerEvent) => {
      pointer.targetX = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      pointer.targetY = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
    };

    const onScroll = () => {
      const currentY = window.scrollY;
      const dy = currentY - lastScrollY;
      lastScrollY = currentY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollNorm = Math.min(1, Math.max(0, currentY / maxScroll));
      // Softly carry the flower rain along with scroll movement (clamped so never chaotic)
      scrollBreeze = Math.max(-1.4, Math.min(1.8, scrollBreeze + dy * 0.0045));
    };

    const onPetalBurst = () => {
      for (let i = AMBIENT_PETALS; i < TOTAL_PETALS; i++) {
        const p = petals[i];
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.15 + Math.random() * 2.1;
        p.x = (Math.random() - 0.5) * 1.6;
        p.y = (Math.random() - 0.2) * 0.9;
        p.z = 1.6 + Math.random() * 1.5;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.abs(Math.sin(angle)) * speed * 0.85 + 1.05;
        p.vz = (Math.random() - 0.5) * 1.1;
        p.burstLife = 3.2 + Math.random() * 1.3;
        p.scale = 0.8 + Math.random() * 0.6;
      }
    };

    const onResize = () => {
      const w = window.innerWidth;
      const h = Math.max(1, window.innerHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('wedding:petal-burst', onPetalBurst);
    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);

    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let elapsed = 0;

    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (status === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 6);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 130);
          }
        };
        frameId = window.setTimeout(poll, 8);
      } else {
        frameId = window.setTimeout(cb, 140);
      }
    }

    function updateScene(dt: number) {
      elapsed += dt;
      const dampFactor = 1 - Math.exp(-3.0 * dt);
      pointer.x += (pointer.targetX - pointer.x) * dampFactor;
      pointer.y += (pointer.targetY - pointer.y) * dampFactor;

      // Smoothly decay scroll wind breeze back to calm temple air
      scrollBreeze *= Math.exp(-3.4 * dt);

      const targetRain = isOpenedRef.current ? 1 : 0;
      rainBlend += (targetRain - rainBlend) * (1 - Math.exp(-2.2 * dt));

      const isWide = window.innerWidth > 760;
      const spreadX = isWide ? 1 : 0.42;
      const openedZ = isOpenedRef.current ? 11.9 : 10.6;

      camera.position.x += (pointer.x * 0.36 - camera.position.x) * dampFactor;
      camera.position.y += (pointer.y * 0.22 - camera.position.y) * dampFactor;
      camera.position.z += (openedZ - camera.position.z) * dampFactor;
      camera.lookAt(0, 0, 0);

      // Animate Sacred 3D Lotuses: Stage 0 Regal Frame -> Stage 1+ Heavenly Pushpa Varsha Rain
      for (let i = 0; i < lotuses.length; i++) {
        const l = lotuses[i];

        if (rainBlend > 0.04) {
          // Advance serene downward flower rain physics carried gently by scroll breeze
          const breezeBoost = Math.max(-0.22, scrollBreeze * (l.isScrollBlossom ? 0.55 : 0.38));
          l.y -= (l.fallSpeed + breezeBoost) * dt;
          l.rx += l.vrx * dt;
          l.ry += (l.vry + scrollBreeze * 0.18) * dt;
          l.rz += l.vrz * dt;

          // Seamless top respawn across balanced horizontal lanes
          if (l.y < -6.4) {
            l.y = 6.4 + Math.random() * 1.4;
            l.phase = Math.random() * Math.PI * 2;
          } else if (l.y > 7.8) {
            l.y = -6.0;
          }
        }

        const rainX =
          l.laneX * spreadX +
          Math.sin(elapsed * l.swayFreq + l.phase) * l.swayAmp * (isWide ? 1 : 0.65) +
          pointer.x * (l.isScrollBlossom ? 0.24 : 0.14);
        const rainY = l.y;
        const rainZ = l.z + Math.cos(elapsed * 0.4 + l.phase) * 0.18;

        const coverPosX = l.coverX * spreadX + Math.sin(elapsed * 0.45 + i) * 0.16;
        const coverPosY = l.coverY + Math.cos(elapsed * 0.52 + i * 1.4) * 0.2;

        // Smooth blend between Stage 0 book frame and Stage 1+ heavenly lotus rain
        l.group.position.x = coverPosX * (1 - rainBlend) + rainX * rainBlend;
        l.group.position.y = coverPosY * (1 - rainBlend) + rainY * rainBlend;
        l.group.position.z = l.coverZ * (1 - rainBlend) + rainZ * rainBlend;

        const targetScale =
          l.coverScale * (1 - rainBlend) +
          l.rainScale * (isWide ? 1 : l.isScrollBlossom ? 0.82 : 0.62) * rainBlend;
        l.group.scale.setScalar(Math.max(0.0001, targetScale));

        if (rainBlend > 0.5) {
          // Graceful floating blossom tilt as it descends through temple air
          l.group.rotation.x = 0.65 + Math.sin(elapsed * 0.65 + l.phase) * 0.34;
          l.group.rotation.y = l.ry + pointer.x * 0.22;
          l.group.rotation.z = Math.cos(elapsed * 0.55 + l.phase) * 0.28;
        } else {
          l.group.rotation.x = 0.56 + Math.sin(elapsed * 0.4 + i) * 0.08 + pointer.y * 0.1;
          l.group.rotation.y = elapsed * (i % 2 === 0 ? 0.25 : -0.22) + pointer.x * 0.24;
          l.group.rotation.z = (i % 2 === 0 ? -0.2 : 0.2);
        }
      }

      // Animate instanced 3D curved rose & marigold petals (synchronized with Pushpa Varsha)
      for (let i = 0; i < TOTAL_PETALS; i++) {
        const p = petals[i];
        if (i >= AMBIENT_PETALS) {
          if (p.burstLife <= 0) {
            _dummy.position.set(0, -99, -20);
            _dummy.scale.setScalar(0.0001);
            _dummy.updateMatrix();
            petalMesh.setMatrixAt(i, _dummy.matrix);
            continue;
          }
          p.burstLife -= dt;
          p.vy -= 1.55 * dt;
          p.vx *= 1 - 0.7 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;
          p.rx += p.vrx * 2.2 * dt;
          p.ry += p.vry * 2.2 * dt;
          p.rz += p.vrz * 2.2 * dt;

          const fadeScale = p.scale * Math.min(1, p.burstLife / 0.8);
          _dummy.position.set(p.x, p.y, p.z);
          _dummy.rotation.set(p.rx, p.ry, p.rz);
          _dummy.scale.setScalar(Math.max(0.001, fadeScale));
          _dummy.updateMatrix();
          petalMesh.setMatrixAt(i, _dummy.matrix);
          continue;
        }

        const petalBreeze = Math.max(-0.2, scrollBreeze * 0.5);
        p.x += (p.vx + Math.sin(elapsed * 0.78 + p.phase) * 0.26 + pointer.x * 0.09) * dt;
        p.y += (p.vy - petalBreeze) * dt;
        p.z += Math.cos(elapsed * 0.55 + p.phase) * 0.07 * dt;
        p.rx += p.vrx * dt;
        p.ry += p.vry * dt;
        p.rz += p.vrz * dt;

        if (p.y < -6.0) {
          p.y = 6.0;
          p.x = (Math.random() - 0.5) * (isWide ? 13.5 : 6.4);
        }
        if (p.x > 7.8) p.x = -7.8;
        if (p.x < -7.8) p.x = 7.8;

        _dummy.position.set(p.x, p.y, p.z);
        _dummy.rotation.set(p.rx, p.ry, p.rz);
        _dummy.scale.setScalar(p.scale * (isWide ? 1 : 0.86));
        _dummy.updateMatrix();
        petalMesh.setMatrixAt(i, _dummy.matrix);
      }
      petalMesh.instanceMatrix.needsUpdate = true;

      // Animate subtle rising gold-leaf motes
      for (let i = 0; i < DUST_COUNT; i++) {
        const d = dustStates[i];
        d.y += d.vy * dt;
        d.x += Math.sin(elapsed * 0.6 + d.phase) * 0.08 * dt;
        if (d.y > 5.8) {
          d.y = -5.8;
          d.x = (Math.random() - 0.5) * 13.5;
        }
        const shimmer = d.scale * (0.7 + 0.32 * Math.sin(elapsed * 2.1 + d.phase));
        _dummy.position.set(d.x, d.y, d.z);
        _dummy.rotation.set(elapsed * 0.55 + d.phase, elapsed * 0.75, 0);
        _dummy.scale.setScalar(shimmer);
        _dummy.updateMatrix();
        dustMesh.setMatrixAt(i, _dummy.matrix);
      }
      dustMesh.instanceMatrix.needsUpdate = true;
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Render crisp initial frame even under prefers-reduced-motion
    updateScene(0.016);
    renderer.render(scene, camera);

    function tick() {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.06, Math.max(0.008, (now - lastTime) / 1000));
      lastTime = now;

      updateScene(dt);
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    if (!prefersReducedMotion) {
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('wedding:petal-burst', onPetalBurst);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);

      outerLotusPetalGeo.dispose();
      innerLotusPetalGeo.dispose();
      calyxLeafGeo.dispose();
      driftingPetalGeo.dispose();
      dustGeo.dispose();
      lotusOuterMat.dispose();
      lotusInnerMat.dispose();
      goldFoilMat.dispose();
      sageLeafMat.dispose();
      scrollOuterMat.dispose();
      scrollInnerMat.dispose();
      scrollGoldMat.dispose();
      scrollLeafMat.dispose();
      petalMat.dispose();
      dustMat.dispose();
      envTarget.dispose();
      renderer.dispose();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      data-testid="three-floral-canvas"
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none ${isOpened ? 'z-30' : 'z-[45]'}`}
    />
  );
}
