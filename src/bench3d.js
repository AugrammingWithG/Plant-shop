// The hero bench: a black nursery pot on a turntable, a procedurally grown plant,
// and a stake tag whose front and back are painted from the real product data.
import * as THREE from "three";
import { imageUrl, money, firstAvailable, sizeChip, botanical, excerpt, barcodeBars } from "./format.js";

const GREEN = "#0d6b38";
const INK = "#10130f";
const FLASH = "#ffd400";

const SOIL_Y = 0.82;
// Tag outline in metres-ish scene units: body W x H on a stake S tall.
const TAG = { W: 0.62, H: 0.86, S: 0.5, SW: 0.22, R: 0.07 };
const CANVAS_W = 560;
const CANVAS_H = Math.round((CANVAS_W * (TAG.H + TAG.S)) / TAG.W);
const PX = CANVAS_W / TAG.W;
const BODY_PX = TAG.H * PX;

export function createBench(canvas, stage, { onReady } = {}) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 60);
  const target = new THREE.Vector3(0, 1.06, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x2f7a4b, 1.15));
  const key = new THREE.DirectionalLight(0xfff1dc, 2.4);
  key.position.set(2.6, 5.2, 3.4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2.6, bottom: -1, near: 1, far: 12 });
  key.shadow.radius = 5;
  key.shadow.bias = -0.0006;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xe8fff0, 1.3);
  rim.position.set(-3, 3, -3.5);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xdfeaff, 0.45);
  fill.position.set(-3, 1.2, 2.5);
  scene.add(fill);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.32 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const turntable = new THREE.Group();
  scene.add(turntable);
  turntable.add(makePot());

  const plantSlot = new THREE.Group();
  plantSlot.position.y = SOIL_Y;
  turntable.add(plantSlot);

  const tag = makeTag();
  turntable.add(tag.group);

  /* ----- sizing ----- */
  function resize() {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const fitH = 2.75 / 2 / Math.tan(halfFov);
    const fitW = 1.75 / 2 / (Math.tan(halfFov) * camera.aspect);
    const d = Math.max(fitH, fitW);
    camera.position.set(0, target.y + d * 0.17, d);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    dirty = true;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(stage);

  /* ----- drag to turn ----- */
  let rot = 0;
  let vel = 0;
  let dragging = false;
  let lastX = 0;
  let lastInteract = -1e9;
  canvas.style.touchAction = "pan-y";
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    vel = 0;
    canvas.setPointerCapture(e.pointerId);
    stage.classList.add("is-dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    vel = dx * 0.011;
    rot += vel;
    lastInteract = performance.now();
    stage.classList.add("has-turned");
    wake();
  });
  const release = () => {
    dragging = false;
    stage.classList.remove("is-dragging");
    lastInteract = performance.now();
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  /* ----- plant + tag swapping ----- */
  let current = null; // { product, form }
  let variantId = null;
  let plant = null;
  let swap = null; // { start, dir, phase, next }

  function show(product, form, dir = 1, vId) {
    variantId = vId || firstAvailable(product).id;
    const next = { product, form };
    if (!current || reduce) {
      current = next;
      plantSlot.clear();
      disposeTree(plant);
      plant = growPlant(form, hash(product.slug));
      plantSlot.add(plant);
      paintTag(product, variantId, true);
      if (!reduce) swap = { start: performance.now(), dir, phase: "in" };
      wake();
      return;
    }
    swap = { start: performance.now(), dir, phase: "out", next };
    wake();
  }

  function setVariant(id) {
    variantId = id;
    if (current) paintTag(current.product, id, false);
  }

  let paintToken = 0;
  async function paintTag(product, vId, withBack) {
    const token = ++paintToken;
    await fontsReady;
    const img = product.images[0] ? await loadImage(imageUrl(product.images[0], 640, 460, "jpg")) : null;
    if (token !== paintToken) return;
    drawFront(tag.frontCtx, product, vId, img);
    tag.frontTex.needsUpdate = true;
    if (withBack) {
      drawBack(tag.backCtx, product);
      tag.backTex.needsUpdate = true;
    }
    dirty = true;
    wake();
  }

  /* ----- loop ----- */
  let raf = 0;
  let visible = true;
  let dirty = true;
  let readyFired = false;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
  });
  io.observe(stage);
  document.addEventListener("visibilitychange", () => !document.hidden && wake());

  function wake() {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }

  function frame(now) {
    raf = 0;
    let moving = dragging || Math.abs(vel) > 0.0004 || !!swap;

    if (!dragging) {
      vel *= 0.92;
      rot += vel;
      // Settle to whichever face of the tag is nearest, with a slow idle sway.
      if (now - lastInteract > 2600 && !reduce) {
        const face = Math.round(rot / Math.PI) * Math.PI;
        const sway = Math.sin(now / 2600) * 0.22;
        rot += (face + sway - rot) * 0.035;
        moving = true;
      }
    }
    turntable.rotation.y = rot;

    if (swap) {
      const t = (now - swap.start) / 1000;
      if (swap.phase === "out") {
        const k = Math.min(1, t / 0.36);
        const e = k * k * k;
        tag.group.position.y = tag.restY + e * 1.1;
        tag.group.rotation.z = tag.restRZ + e * 0.28 * swap.dir;
        plant.scale.setScalar(Math.max(0.001, 1 - e));
        if (k >= 1) {
          current = swap.next;
          plantSlot.clear();
          disposeTree(plant);
          plant = growPlant(current.form, hash(current.product.slug));
          plant.scale.setScalar(0.001);
          plantSlot.add(plant);
          paintTag(current.product, variantId, true);
          rot = Math.round(rot / (Math.PI * 2)) * Math.PI * 2;
          swap = { start: now, dir: swap.dir, phase: "in" };
        }
      } else {
        const kt = Math.min(1, t / 0.7);
        const kp = Math.min(1, Math.max(0, (t - 0.12) / 0.8));
        tag.group.position.y = tag.restY + (1 - easeOutBack(kt)) * 1.1;
        tag.group.rotation.z = tag.restRZ + (1 - easeOutCubic(kt)) * -0.22 * swap.dir;
        plant.scale.setScalar(Math.max(0.001, easeOutCubic(kp)));
        if (kt >= 1 && kp >= 1) swap = null;
      }
    }

    renderer.render(scene, camera);
    if (!readyFired) {
      readyFired = true;
      onReady?.();
    }
    dirty = false;
    if (moving || dirty) wake();
  }

  resize();
  wake();

  return { show, setVariant };
}

/* ================= pot ================= */

function makePot() {
  const g = new THREE.Group();
  const profile = [
    [0.0, 0.0], [0.35, 0.0], [0.375, 0.03], [0.465, 0.84], [0.5, 0.855], [0.508, 0.93],
    [0.482, 0.94], [0.468, 0.9], [0.455, SOIL_Y - 0.04],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const potMat = new THREE.MeshStandardMaterial({ color: 0x1b1c19, roughness: 0.58, metalness: 0.0 });
  const pot = new THREE.Mesh(new THREE.LatheGeometry(profile, 72), potMat);
  pot.castShadow = true;
  pot.receiveShadow = true;
  g.add(pot);

  // Moulded stacking ring below the rim, as on a real poly nursery pot.
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.012, 8, 72), potMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.78;
  g.add(ring);

  const soil = new THREE.Mesh(
    new THREE.CircleGeometry(0.462, 64),
    new THREE.MeshStandardMaterial({ color: 0x2e2118, roughness: 1 }),
  );
  soil.rotation.x = -Math.PI / 2;
  soil.position.y = SOIL_Y;
  soil.receiveShadow = true;
  g.add(soil);

  // Bark mulch chips on the soil.
  const rand = rng(7);
  const chip = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.05, 0.008, 0.026),
    new THREE.MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.95 }),
    140,
  );
  const d = new THREE.Object3D();
  const c = new THREE.Color();
  for (let i = 0; i < chip.count; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 0.43;
    d.position.set(Math.sin(a) * r, SOIL_Y + 0.004, Math.cos(a) * r);
    d.rotation.set((rand() - 0.5) * 0.4, rand() * Math.PI, (rand() - 0.5) * 0.4);
    d.scale.setScalar(0.6 + rand() * 0.8);
    d.updateMatrix();
    chip.setMatrixAt(i, d.matrix);
    chip.setColorAt(i, c.setHSL(0.07 + rand() * 0.03, 0.38, 0.22 + rand() * 0.16));
  }
  chip.receiveShadow = true;
  g.add(chip);
  return g;
}

/* ================= tag ================= */

function tagShape() {
  const { W, H, S, SW, R } = TAG;
  const s = new THREE.Shape();
  const hw = W / 2;
  const sw = SW / 2;
  s.moveTo(0, 0);
  s.lineTo(sw, 0.13);
  s.lineTo(sw, S);
  s.lineTo(hw, S + 0.06);
  s.lineTo(hw, S + H - R);
  s.quadraticCurveTo(hw, S + H, hw - R, S + H);
  s.lineTo(-hw + R, S + H);
  s.quadraticCurveTo(-hw, S + H, -hw, S + H - R);
  s.lineTo(-hw, S + 0.06);
  s.lineTo(-sw, S);
  s.lineTo(-sw, 0.13);
  s.lineTo(0, 0);
  const hole = new THREE.Path();
  hole.absarc(0, S + H - 0.075, 0.026, 0, Math.PI * 2, true);
  s.holes.push(hole);
  return s;
}

function makeTag() {
  const shape = tagShape();
  const depth = 0.01;
  const bevel = 0.004;
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 10 }),
    new THREE.MeshStandardMaterial({ color: 0xf4f6f2, roughness: 0.42 }),
  );
  body.castShadow = true;

  const faceGeo = new THREE.ShapeGeometry(shape, 10);
  const uv = faceGeo.attributes.uv;
  const pos = faceGeo.attributes.position;
  const totalH = TAG.H + TAG.S;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + TAG.W / 2) / TAG.W, pos.getY(i) / totalH);

  const mk = () => {
    const c = document.createElement("canvas");
    c.width = CANVAS_W;
    c.height = CANVAS_H;
    const ctx = c.getContext("2d");
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return { ctx, tex };
  };
  const front = mk();
  const back = mk();
  const frontMesh = new THREE.Mesh(faceGeo, new THREE.MeshStandardMaterial({ map: front.tex, roughness: 0.4 }));
  frontMesh.position.z = depth + bevel + 0.0012;
  const backMesh = new THREE.Mesh(faceGeo, new THREE.MeshStandardMaterial({ map: back.tex, roughness: 0.4 }));
  backMesh.rotation.y = Math.PI;
  backMesh.position.z = -bevel - 0.0012;

  const group = new THREE.Group();
  group.add(body, frontMesh, backMesh);
  // Pushed into the soil near the front rim, leaning back, big enough to read.
  group.scale.setScalar(1.22);
  const restY = SOIL_Y - 0.24;
  const restRZ = 0.035;
  group.position.set(0.15, restY, 0.27);
  group.rotation.set(-0.09, -0.14, restRZ);
  return { group, frontCtx: front.ctx, frontTex: front.tex, backCtx: back.ctx, backTex: back.tex, restY, restRZ };
}

const fontsReady = (async () => {
  try {
    await Promise.all([
      document.fonts.load("900 60px 'Archivo Variable'"),
      document.fonts.load("italic 400 30px 'Archivo Variable'"),
      document.fonts.load("500 26px 'Archivo Variable'"),
    ]);
  } catch {
    /* system fallback is fine for the texture */
  }
})();

// The stretch keyword rides in the font shorthand; Archivo's wdth axis bottoms out at 62%.
function setFont(ctx, spec, stretch = "normal") {
  const kw = stretch === "ultra-condensed" ? "extra-condensed" : stretch;
  ctx.font = `${kw === "normal" ? "" : `${kw} `}${spec} 'Archivo Variable', 'Arial Narrow', sans-serif`;
}

function wrap(ctx, text, maxW) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function brandLine(ctx) {
  setFont(ctx, "800 21px", "condensed");
  ctx.fillStyle = GREEN;
  ctx.textAlign = "center";
  ctx.letterSpacing = "3px";
  ctx.fillText("POT PLANT HEAVEN · PERTH", CANVAS_W / 2, 122);
  ctx.letterSpacing = "0px";
  ctx.textAlign = "left";
}

function stake(ctx, slug) {
  const x0 = CANVAS_W / 2 - (TAG.SW * PX) / 2 + 26;
  const w = TAG.SW * PX - 52;
  const bars = barcodeBars(slug, 22);
  const unit = w / bars.reduce((s, b) => s + b + 1, 0);
  let x = x0;
  ctx.fillStyle = INK;
  for (const b of bars) {
    ctx.fillRect(x, BODY_PX + 70, b * unit, 92);
    x += (b + 1) * unit;
  }
  setFont(ctx, "600 17px", "condensed");
  ctx.textAlign = "center";
  ctx.fillText(slug.slice(0, 14).toUpperCase(), CANVAS_W / 2, BODY_PX + 188);
  ctx.textAlign = "left";
}

function drawFront(ctx, p, vId, img) {
  const v = p.variants.find((x) => x.id === vId) || firstAvailable(p);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  brandLine(ctx);

  const px = 34;
  const pw = CANVAS_W - px * 2;
  const py = 146;
  const ph = 300;
  ctx.save();
  roundRect(ctx, px, py, pw, ph, 18);
  ctx.clip();
  ctx.fillStyle = "#e9eee6";
  ctx.fillRect(px, py, pw, ph);
  if (img) {
    const s = Math.max(pw / img.width, ph / img.height);
    const w = img.width * s;
    const h = img.height * s;
    ctx.drawImage(img, px + (pw - w) / 2, py + (ph - h) / 2, w, h);
  }
  ctx.restore();

  // Common name: condensed caps, shrunk to fit two lines.
  ctx.fillStyle = INK;
  let size = 92;
  let lines;
  do {
    setFont(ctx, `900 ${size}px`, "ultra-condensed");
    lines = wrap(ctx, p.name.toUpperCase(), pw);
    size -= 3;
  } while ((lines.length > 2 || lines.some((l) => ctx.measureText(l).width > pw)) && size > 30);
  let y = py + ph + 22 + size;
  for (const l of lines.slice(0, 2)) {
    ctx.fillText(l, px, y);
    y += size * 0.96;
  }
  const bot = botanical(p);
  if (bot) {
    setFont(ctx, "italic 400 27px");
    ctx.fillStyle = "#3d453b";
    ctx.fillText(wrap(ctx, bot, pw)[0], px, y + 6);
  }

  // Price flash.
  const fy = BODY_PX - 112;
  ctx.fillStyle = FLASH;
  ctx.fillRect(0, fy, CANVAS_W, 112);
  ctx.fillStyle = INK;
  setFont(ctx, "800 26px", "condensed");
  ctx.fillText((v.label ? sizeChip(v.label) : "EACH").toUpperCase(), px, fy + 48);
  setFont(ctx, "500 19px", "condensed");
  ctx.fillText(p.variants.length > 1 ? `${p.variants.length} SIZES AVAILABLE` : "ONE SIZE", px, fy + 78);
  setFont(ctx, "900 64px", "ultra-condensed");
  ctx.textAlign = "right";
  ctx.fillText(money(v.price), CANVAS_W - px, fy + 80);
  ctx.textAlign = "left";

  stake(ctx, p.slug);
}

function drawBack(ctx, p) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  brandLine(ctx);
  const px = 34;
  const pw = CANVAS_W - px * 2;
  ctx.fillStyle = INK;
  setFont(ctx, "900 50px", "ultra-condensed");
  ctx.fillText("ABOUT THIS PLANT", px, 196);

  ctx.fillStyle = "#2a3028";
  setFont(ctx, "400 24px");
  let y = 240;
  for (const line of wrap(ctx, excerpt(p.description, 300), pw).slice(0, 9)) {
    ctx.fillText(line, px, y);
    y += 33;
  }

  y += 18;
  ctx.fillStyle = GREEN;
  ctx.fillRect(px, y, pw, 3);
  y += 40;
  ctx.fillStyle = INK;
  for (const v of p.variants.slice(0, 4)) {
    setFont(ctx, "700 26px", "condensed");
    ctx.fillText((v.label || "Each").toUpperCase(), px, y);
    setFont(ctx, "800 26px", "condensed");
    ctx.textAlign = "right";
    ctx.fillText(v.inStock ? money(v.price) : "SOLD OUT", CANVAS_W - px, y);
    ctx.textAlign = "left";
    y += 38;
  }
  stake(ctx, p.slug);
}

const imageCache = new Map();
function loadImage(src) {
  if (!imageCache.has(src)) {
    imageCache.set(
      src,
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      }),
    );
  }
  return imageCache.get(src);
}

/* ================= plants ================= */

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

// A leaf along +Y that folds along its midrib and curls toward +Z.
function leafGeometry({ length = 1, width = 0.2, segs = 8, fold = 0.25, curl = 0.15, profile = "lance" }) {
  const pos = [];
  const idx = [];
  const half = (t) => {
    if (profile === "strap") return t < 0.82 ? 1 : Math.max(0, (1 - t) / 0.18);
    if (profile === "egg") return Math.pow(Math.sin(Math.PI * Math.min(1, Math.pow(t, 0.7))), 0.6);
    return Math.pow(Math.sin(Math.PI * t), 0.75);
  };
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const y = t * length * (1 - 0.35 * curl * t);
    const z = curl * t * t * length;
    const w = (width / 2) * half(t);
    pos.push(-w, y, z + fold * w, 0, y, z, w, y, z + fold * w);
    if (i < segs) {
      const a = i * 3;
      const b = a + 3;
      idx.push(a, b, a + 1, a + 1, b, b + 1, a + 1, b + 1, a + 2, a + 2, b + 1, b + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function leafMaterial(roughness = 0.55) {
  return new THREE.MeshStandardMaterial({ roughness, side: THREE.DoubleSide, vertexColors: false });
}

// Collects leaf placements, then commits them as one InstancedMesh per geometry.
function leafBatch(geo, mat) {
  const items = [];
  return {
    add(position, yaw, pitch, roll, scale, color) {
      items.push({ position: position.clone(), yaw, pitch, roll, scale, color });
    },
    build() {
      const mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, items.length));
      const d = new THREE.Object3D();
      d.rotation.order = "YXZ";
      items.forEach((it, i) => {
        d.position.copy(it.position);
        d.rotation.set(it.pitch, it.yaw, it.roll);
        d.scale.setScalar(it.scale);
        d.updateMatrix();
        mesh.setMatrixAt(i, d.matrix);
        mesh.setColorAt(i, it.color);
      });
      mesh.count = items.length;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    },
  };
}

const col = (hex, rand, jitter = 0.06) => {
  const c = new THREE.Color(hex);
  const hsl = {};
  c.getHSL(hsl);
  return c.setHSL(hsl.h + (rand() - 0.5) * jitter * 0.4, hsl.s, Math.min(0.9, Math.max(0.05, hsl.l + (rand() - 0.5) * jitter * 2)));
};

const pick = (arr, rand) => arr[Math.floor(rand() * arr.length)];

// Keeps foliage out of the wedge where the tag stands, so the tag reads.
const inTagZone = (p) => p.z > 0.1 && p.x > -0.28 && p.x < 0.6 && p.y < 1.45;

function stem(points, radius, color) {
  const curve = new THREE.CatmullRomCurve3(points);
  const m = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 16, radius, 6, false),
    new THREE.MeshStandardMaterial({ color, roughness: 0.75 }),
  );
  m.castShadow = true;
  return m;
}

function growPlant(form, seed) {
  const rand = rng(seed);
  const g = new THREE.Group();
  const v = new THREE.Vector3();

  if (form === "palm") {
    const batch = leafBatch(leafGeometry({ length: 1, width: 0.13, fold: 0.35, curl: 0.25, profile: "lance" }), leafMaterial(0.5));
    const canes = 7;
    for (let c = 0; c < canes; c++) {
      const a = (c / canes) * Math.PI * 2 + rand() * 0.5;
      const lean = 0.06 + rand() * 0.16;
      const h = 0.55 + rand() * 0.55;
      const base = new THREE.Vector3(Math.sin(a) * 0.06, 0, Math.cos(a) * 0.06);
      const top = new THREE.Vector3(Math.sin(a) * h * lean * 1.4, h, Math.cos(a) * h * lean * 1.4);
      g.add(stem([base, base.clone().lerp(top, 0.5).add(new THREE.Vector3(0, 0, 0)), top], 0.017, 0xb9a54a));
      const fronds = 3 + Math.floor(rand() * 2);
      for (let f = 0; f < fronds; f++) {
        const fy = a + (f / fronds) * Math.PI * 2 + rand() * 0.6;
        const L = 0.5 + rand() * 0.25;
        const dir = new THREE.Vector3(Math.sin(fy), 0, Math.cos(fy));
        for (let k = 1; k <= 16; k++) {
          const s = k / 16;
          v.copy(top).addScaledVector(dir, L * s * 0.95);
          v.y += L * (0.6 * s - 0.85 * s * s);
          if (inTagZone(v)) continue;
          const len = 0.22 * (1 - 0.6 * Math.abs(s - 0.35));
          for (const side of [-1, 1]) {
            batch.add(v, fy + side * (Math.PI / 2 - 0.55), Math.PI / 2 - 0.25 + s * 0.5, 0, len, col(pick(["#7aa63c", "#6c9a35", "#8bb446"], rand), rand));
          }
        }
      }
    }
    g.add(batch.build());
  }

  if (form === "shrub") {
    const batch = leafBatch(leafGeometry({ length: 1, width: 0.46, fold: 0.22, curl: 0.12 }), leafMaterial(0.38));
    for (let i = 0; i < 1100; i++) {
      const a = rand() * Math.PI * 2;
      const u = rand() * 2 - 1;
      const r = Math.pow(rand(), 0.35);
      const s = Math.sqrt(1 - u * u);
      v.set(Math.sin(a) * s * r * 0.5, 0.62 + u * r * 0.5, Math.cos(a) * s * r * 0.5 - 0.04);
      if (v.y < 0.1 || inTagZone(v)) continue;
      const young = v.y > 0.8 && rand() < 0.35;
      batch.add(v, Math.atan2(v.x, v.z) + (rand() - 0.5) * 1.2, 0.5 + rand() * 1.1, (rand() - 0.5) * 0.8, 0.09 + rand() * 0.05,
        col(young ? pick(["#b4472e", "#c4663b", "#9e3a2a"], rand) : pick(["#2f6a2b", "#3a7a33", "#285f27"], rand), rand));
    }
    for (let i = 0; i < 5; i++) {
      const a = rand() * Math.PI * 2;
      g.add(stem([new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.sin(a) * 0.08, 0.25, Math.cos(a) * 0.08), new THREE.Vector3(Math.sin(a) * 0.2, 0.55, Math.cos(a) * 0.2)], 0.012, 0x5a4330));
    }
    g.add(batch.build());
  }

  if (form === "strappy") {
    const geos = [0.22, 0.38, 0.55].map((curl) => leafGeometry({ length: 1, width: 0.075, fold: 0.4, curl, profile: "strap", segs: 12 }));
    const batches = geos.map((geo) => leafBatch(geo, leafMaterial(0.5)));
    for (let i = 0; i < 46; i++) {
      const a = rand() * Math.PI * 2;
      const t = rand();
      v.set(Math.sin(a) * 0.04, 0, Math.cos(a) * 0.04);
      const yaw = a + (rand() - 0.5) * 0.3;
      const pitch = 0.08 + t * 0.55;
      const dir = new THREE.Vector3(Math.sin(yaw) * Math.sin(pitch), Math.cos(pitch), Math.cos(yaw) * Math.sin(pitch));
      if (inTagZone(dir.clone().multiplyScalar(0.6))) continue;
      batches[Math.min(2, Math.floor(t * 3))].add(v, yaw, pitch, (rand() - 0.5) * 0.4, 0.75 + rand() * 0.45,
        col(pick(["#8e2b2f", "#a33a35", "#6f2432", "#7c4a2c"], rand), rand, 0.08));
    }
    batches.forEach((b) => g.add(b.build()));
  }

  if (form === "paddle") {
    const batch = leafBatch(leafGeometry({ length: 1, width: 0.36, fold: 0.12, curl: 0.18, profile: "lance", segs: 10 }), leafMaterial(0.45));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + rand() * 0.6;
      const pitch = 0.12 + rand() * 0.38;
      const len = 0.45 + rand() * 0.35;
      const dir = new THREE.Vector3(Math.sin(a) * Math.sin(pitch), Math.cos(pitch), Math.cos(a) * Math.sin(pitch));
      const top = dir.clone().multiplyScalar(len);
      if (inTagZone(top)) continue;
      g.add(stem([new THREE.Vector3(0, 0, 0), dir.clone().multiplyScalar(len * 0.5), top], 0.012, 0x6f8f48));
      batch.add(top, a, pitch + 0.15, (rand() - 0.5) * 0.5, 0.55 + rand() * 0.2, col(pick(["#3e7a3a", "#4a8743", "#376f35"], rand), rand));
    }
    g.add(batch.build());
  }

  if (form === "rosette") {
    const batch = leafBatch(leafGeometry({ length: 1, width: 0.62, fold: 0.6, curl: -0.25, profile: "egg" }), leafMaterial(0.62));
    const rosette = (cx, cz, scale, n) => {
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const yaw = i * 2.39996;
        const p = new THREE.Vector3(cx + Math.sin(yaw) * 0.01, 0.01 + t * 0.05 * scale, cz + Math.cos(yaw) * 0.01);
        batch.add(p, yaw, 1.32 - (1 - t) * 0 - t * 1.05, 0, (0.26 - t * 0.14) * scale,
          col(t < 0.35 && rand() < 0.4 ? "#b39aa7" : pick(["#86aeb0", "#93b8b6", "#a3c4bf"], rand), rand, 0.05));
      }
    };
    rosette(-0.08, -0.05, 1.5, 54);
    rosette(-0.3, 0.12, 0.7, 30);
    rosette(0.22, -0.22, 0.8, 32);
    g.add(batch.build());
  }

  if (form === "fern") {
    const batch = leafBatch(leafGeometry({ length: 1, width: 0.5, fold: 0.3, curl: 0.1 }), leafMaterial(0.6));
    for (let f = 0; f < 44; f++) {
      const a = rand() * Math.PI * 2;
      const L = 0.45 + rand() * 0.3;
      const rise = 0.5 + rand() * 0.6;
      const dir = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      for (let k = 1; k <= 20; k++) {
        const s = k / 20;
        v.set(0, 0.02, 0).addScaledVector(dir, L * s * 0.9);
        v.y += L * (rise * s - 1.15 * s * s);
        if (inTagZone(v)) continue;
        const len = 0.07 * (1 - 0.7 * s) + 0.015;
        for (const side of [-1, 1]) {
          batch.add(v, a + side * (Math.PI / 2 - 0.35), Math.PI / 2 - 0.1, side * 0.3, len, col(pick(["#5e9a35", "#6aa63c", "#77b046"], rand), rand));
        }
      }
    }
    g.add(batch.build());
  }

  if (form === "tree") {
    const batch = leafBatch(leafGeometry({ length: 1, width: 0.16, fold: 0.2, curl: 0.08 }), leafMaterial(0.55));
    const trunkTop = new THREE.Vector3(0.04, 1.12, -0.02);
    g.add(stem([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.03, 0.5, 0.01), trunkTop], 0.03, 0x5b4636));
    for (let b = 0; b < 11; b++) {
      const a = (b / 11) * Math.PI * 2 + rand() * 0.4;
      const startY = 0.72 + rand() * 0.38;
      const start = new THREE.Vector3(trunkTop.x * (startY / 1.12), startY, trunkTop.z);
      const out = 0.3 + rand() * 0.25;
      const peak = start.clone().add(new THREE.Vector3(Math.sin(a) * out * 0.6, 0.18 + rand() * 0.12, Math.cos(a) * out * 0.6));
      const end = start.clone().add(new THREE.Vector3(Math.sin(a) * out, -0.12 - rand() * 0.2, Math.cos(a) * out));
      const curve = new THREE.CatmullRomCurve3([start, peak, end]);
      g.add(stem([start, peak, end], 0.008, 0x6a523e));
      for (let k = 0; k < 14; k++) {
        const s = 0.25 + (k / 14) * 0.75;
        curve.getPoint(s, v);
        // Weeping branchlets hang from each branch.
        const hang = 0.12 + rand() * 0.22;
        for (let j = 0; j < 6; j++) {
          const q = v.clone();
          q.y -= (j / 6) * hang;
          q.x += (rand() - 0.5) * 0.03;
          q.z += (rand() - 0.5) * 0.03;
          if (inTagZone(q)) continue;
          batch.add(q, rand() * Math.PI * 2, Math.PI - 0.35 - rand() * 0.3, 0, 0.09 + rand() * 0.04, col(pick(["#5c7d3a", "#6b8a45", "#526f34"], rand), rand));
        }
      }
    }
    g.add(batch.build());
  }

  return g;
}

function disposeTree(obj) {
  obj?.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
}

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
function easeOutBack(t) {
  const c1 = 1.25;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
