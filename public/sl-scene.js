// <sl-scene variant="hero|orb|ribbon" intensity="1-10">
// Framework-free Web Component. Loads three.js lazily from esm.sh so pages
// without a scene pay zero extra bundle cost. One shared module promise so
// multiple instances on the same page only fetch three.js once.
(() => {
  if (customElements.get("sl-scene")) return;

  const THREE_URL = "https://esm.sh/three@0.166.0";
  let threePromise = null;
  function loadThree() {
    if (!threePromise) threePromise = import(THREE_URL);
    return threePromise;
  }

  const PALETTE = {
    accent: 0x0ea98b,
    accent2: 0x5eead4,
    violet: 0x8b7cf6,
    coral: 0xff6f55,
    ink: 0x12332d,
  };

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function buildEnvTexture(THREE, renderer) {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size / 2;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#5EEAD4");
    grad.addColorStop(0.5, "#F2F6F3");
    grad.addColorStop(1, "#12332D");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const blobs = [
      { x: 0.18, y: 0.3, r: 0.28, c: "rgba(94,234,212,.85)" },
      { x: 0.78, y: 0.22, r: 0.24, c: "rgba(255,111,85,.7)" },
      { x: 0.55, y: 0.72, r: 0.3, c: "rgba(139,124,246,.7)" },
      { x: 0.08, y: 0.78, r: 0.22, c: "rgba(94,234,212,.6)" },
    ];
    for (const b of blobs) {
      const rad = ctx.createRadialGradient(
        b.x * canvas.width, b.y * canvas.height, 0,
        b.x * canvas.width, b.y * canvas.height, b.r * canvas.width
      );
      rad.addColorStop(0, b.c);
      rad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

  function glassMaterial(THREE, color) {
    return new THREE.MeshPhysicalMaterial({
      color,
      transmission: 0.92,
      ior: 1.55,
      thickness: 1.6,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      roughness: 0.06,
      metalness: 0,
      attenuationColor: color,
      attenuationDistance: 1.2,
    });
  }

  function buildObjects(THREE, variant) {
    const colors = [PALETTE.accent, PALETTE.accent2, PALETTE.violet, PALETTE.coral];
    const group = new THREE.Group();
    const movers = [];
    let cage = null;
    let cameraZ = 9;

    const addMover = (geometry, color, x, y, z, scale, spinX, spinY, floatAmp, floatSpeed, seed) => {
      const mesh = new THREE.Mesh(geometry, glassMaterial(THREE, color));
      mesh.position.set(x, y, z);
      mesh.scale.setScalar(scale);
      group.add(mesh);
      movers.push({ mesh, spinX, spinY, floatAmp, floatSpeed, seed, baseY: y, baseX: x });
    };

    if (variant === "hero") {
      cameraZ = 11.5;
      const specs = [
        { geo: new THREE.TorusKnotGeometry(0.62, 0.2, 120, 16), x: -5.6, y: 1.6, z: -1.2, scale: 1 },
        { geo: new THREE.IcosahedronGeometry(0.9, 0), x: -3.8, y: -1.7, z: 0.4, scale: 1, flat: true },
        { geo: new THREE.CapsuleGeometry(0.42, 1.1, 4, 12), x: -2.6, y: 1.1, z: -0.6, scale: 1 },
        { geo: new THREE.TorusGeometry(0.68, 0.24, 20, 60), x: 2.6, y: -1.2, z: 0.2, scale: 1 },
        { geo: new THREE.OctahedronGeometry(0.95, 0), x: 3.8, y: 1.8, z: -0.8, scale: 1, flat: true },
        { geo: new THREE.SphereGeometry(0.72, 32, 32), x: 5.6, y: -0.5, z: 0.6, scale: 1 },
      ];
      specs.forEach((s, i) => {
        if (s.flat && "computeVertexNormals" in s.geo) s.geo.computeVertexNormals();
        addMover(
          s.geo,
          colors[i % colors.length],
          s.x, s.y, s.z, s.scale,
          0.08 + i * 0.015, 0.11 + i * 0.012,
          0.35 + (i % 3) * 0.12, 0.4 + (i % 4) * 0.08,
          i * 1.7
        );
      });
      const cageGeo = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(6.2, 1));
      const cageMat = new THREE.LineBasicMaterial({ color: PALETTE.accent2, transparent: true, opacity: 0.16 });
      cage = new THREE.LineSegments(cageGeo, cageMat);
      group.add(cage);
    } else if (variant === "orb") {
      cameraZ = 6.2;
      const geo = new THREE.IcosahedronGeometry(1.5, 1);
      geo.computeVertexNormals();
      addMover(geo, colors[1], 0, 0, 0, 1, 0.06, 0.09, 0.18, 0.35, 0);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.15, 0.035, 16, 100),
        glassMaterial(THREE, colors[0])
      );
      ring.rotation.x = Math.PI / 2.4;
      group.add(ring);
      movers.push({ mesh: ring, spinX: 0, spinY: 0.05, floatAmp: 0, floatSpeed: 0, seed: 0, baseY: 0, baseX: 0 });
    } else {
      cameraZ = 8.5;
      const knot = new THREE.TorusKnotGeometry(1.05, 0.32, 140, 18, 2, 5);
      addMover(knot, colors[2], 0, 0, 0, 1, 0.07, 0.1, 0.22, 0.32, 0);
      const ico = new THREE.IcosahedronGeometry(0.5, 0);
      ico.computeVertexNormals();
      addMover(ico, colors[3], 2.4, -1.1, 0.6, 1, 0.12, 0.15, 0.3, 0.5, 2.1);
    }

    return { group, movers, cage, cameraZ };
  }

  class SlScene extends HTMLElement {
    connectedCallback() {
      if (this._initialized) return;
      this._initialized = true;

      // Render into a shadow root, never into light-DOM children: this element
      // can be hydrated by React (SSR'd as an empty tag), and mutating our own
      // light DOM here would race React's hydration diff and corrupt the tree
      // it expects to find. Shadow DOM content is invisible to that diff.
      const root = this.attachShadow({ mode: "open" });
      const container = document.createElement("div");
      container.style.cssText = "width:100%;height:100%;overflow:hidden;";
      const canvas = document.createElement("canvas");
      canvas.style.cssText = "width:100%;height:100%;display:block;";
      container.appendChild(canvas);
      root.appendChild(container);
      this._canvas = canvas;
      this._container = container;

      this._reduced = prefersReducedMotion();
      this._variant = this.getAttribute("variant") || "hero";
      this._intensity = Math.max(1, Math.min(10, Number(this.getAttribute("intensity")) || 6)) / 6;

      loadThree().then((THREE) => this._setup(THREE)).catch(() => {});
    }

    _setup(THREE) {
      if (!this.isConnected) return;
      const canvas = this._canvas;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this._renderer = renderer;

      const scene = new THREE.Scene();
      scene.environment = buildEnvTexture(THREE, renderer);

      const { group, movers, cage, cameraZ } = buildObjects(THREE, this._variant);
      scene.add(group);

      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.set(0, 0, cameraZ);
      this._camera = camera;
      this._baseCameraZ = cameraZ;

      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const dir = new THREE.DirectionalLight(0xffffff, 2.1);
      dir.position.set(4, 6, 5);
      scene.add(dir);
      const rim = new THREE.PointLight(PALETTE.accent2, 12, 30);
      rim.position.set(-5, 3, 4);
      scene.add(rim);
      const warm = new THREE.PointLight(PALETTE.coral, 8, 30);
      warm.position.set(5, -3, 3);
      scene.add(warm);

      this._scene = scene;
      this._group = group;
      this._movers = movers;
      this._cage = cage;

      this._pointer = { x: 0, y: 0 };
      this._pointerTarget = { x: 0, y: 0 };
      this._scrollFactor = 0;
      this._clock = new THREE.Clock();

      this._resizeObserver = new ResizeObserver(() => this._onResize());
      this._resizeObserver.observe(this);
      this._onResize();

      if (!this._reduced) {
        this._onPointerMove = (e) => {
          const nx = (e.clientX / window.innerWidth) * 2 - 1;
          const ny = (e.clientY / window.innerHeight) * 2 - 1;
          this._pointerTarget.x = nx;
          this._pointerTarget.y = ny;
        };
        window.addEventListener("pointermove", this._onPointerMove, { passive: true });

        this._onScroll = () => {
          const rect = this.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const vh = window.innerHeight || 1;
          this._scrollFactor = Math.max(-1, Math.min(1, (center - vh / 2) / (vh / 2)));
        };
        window.addEventListener("scroll", this._onScroll, { passive: true });
        this._onScroll();

        this._intersectionObserver = new IntersectionObserver(
          (entries) => {
            this._visible = entries[0]?.isIntersecting ?? true;
            if (this._visible && !this._rafId) this._loop();
          },
          { threshold: 0.01 }
        );
        this._intersectionObserver.observe(this);
        this._visible = true;
        this._loop();
      } else {
        this._renderOnce();
      }
    }

    _onResize() {
      if (!this._renderer) return;
      const w = this.clientWidth || 1;
      const h = this.clientHeight || 1;
      this._renderer.setSize(w, h, false);
      this._camera.aspect = w / h;
      this._camera.updateProjectionMatrix();
      if (this._reduced) this._renderOnce();
    }

    _renderOnce() {
      if (this._camera) this._camera.lookAt(0, 0, 0);
      this._renderer.render(this._scene, this._camera);
    }

    _loop() {
      if (!this._visible) {
        this._rafId = null;
        return;
      }
      this._rafId = requestAnimationFrame(() => this._loop());
      const t = this._clock.getElapsedTime();
      const amp = this._intensity;

      for (const m of this._movers) {
        m.mesh.rotation.x += m.spinX * 0.01;
        m.mesh.rotation.y += m.spinY * 0.01;
        if (m.floatAmp) {
          m.mesh.position.y = m.baseY + Math.sin(t * m.floatSpeed + m.seed) * m.floatAmp * amp * 0.4;
        }
      }
      if (this._cage) this._cage.rotation.y += 0.0009;

      this._pointer.x += (this._pointerTarget.x - this._pointer.x) * 0.055;
      this._pointer.y += (this._pointerTarget.y - this._pointer.y) * 0.055;
      this._group.rotation.y = this._pointer.x * 0.25 + this._scrollFactor * 0.18;
      this._group.rotation.x = -this._pointer.y * 0.12;

      this._camera.position.z = this._baseCameraZ + this._scrollFactor * 1.4;
      this._camera.position.y = this._scrollFactor * -0.6;
      this._camera.lookAt(0, 0, 0);

      this._renderer.render(this._scene, this._camera);
    }

    disconnectedCallback() {
      if (this._rafId) cancelAnimationFrame(this._rafId);
      this._rafId = null;
      if (this._resizeObserver) this._resizeObserver.disconnect();
      if (this._intersectionObserver) this._intersectionObserver.disconnect();
      if (this._onPointerMove) window.removeEventListener("pointermove", this._onPointerMove);
      if (this._onScroll) window.removeEventListener("scroll", this._onScroll);
      if (this._renderer) {
        this._renderer.dispose();
      }
      if (this._scene) {
        this._scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
      }
      this._initialized = false;
    }
  }

  customElements.define("sl-scene", SlScene);
})();
