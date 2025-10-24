import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base setup
 */
const gui = new GUI();
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();

/**
 * Parameters
 */
const parameters = {
  count: 120000,
  size: 0.01,
  radius: 6,
  branches: 4,
  spin: 1.5,
  randomness: 0.25,
  randomnessPower: 3,
  insideColor: new THREE.Color(`hsl(${Math.random() * 360}, 100%, 70%)`),
  outsideColor: new THREE.Color(`hsl(${Math.random() * 360}, 100%, 40%)`),
};

let Geometry = null;
let Material = null;
let Points = null;

/**
 * Galaxy generator (disk)
 */
const generateGalaxy = () => {
  if (Points !== null) {
    Geometry.dispose();
    Material.dispose();
    scene.remove(Points);
  }

  Geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const colorInside = parameters.insideColor;
  const colorOutside = parameters.outsideColor;

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;
    const randomY =
      (Math.pow(Math.random(), parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        parameters.randomness *
        0.3) /
      2; // Keep flatter
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  Geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  Geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  Material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  Points = new THREE.Points(Geometry, Material);
  scene.add(Points);
};
generateGalaxy();

/**
 * Central vertical golden jet (core beam)
 */
const beamCount = 8000;
const beamGeometry = new THREE.BufferGeometry();
const beamPositions = new Float32Array(beamCount * 3);
const beamColors = new Float32Array(beamCount * 3);
const gold = new THREE.Color(0xffa500);

for (let i = 0; i < beamCount; i++) {
  const i3 = i * 3;
  beamPositions[i3] = (Math.random() - 0.5) * 0.1;
  beamPositions[i3 + 1] = (Math.random() - 0.5) * 10; // vertical beam
  beamPositions[i3 + 2] = (Math.random() - 0.5) * 0.1;

  beamColors[i3] = gold.r;
  beamColors[i3 + 1] = gold.g;
  beamColors[i3 + 2] = gold.b;
}

beamGeometry.setAttribute("position", new THREE.BufferAttribute(beamPositions, 3));
beamGeometry.setAttribute("color", new THREE.BufferAttribute(beamColors, 3));

const beamMaterial = new THREE.PointsMaterial({
  size: 0.03,
  color: gold,
  blending: THREE.AdditiveBlending,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  vertexColors: true,
});

const coreBeam = new THREE.Points(beamGeometry, beamMaterial);
scene.add(coreBeam);

/**
 * Golden glowing center (dense core)
 */
const coreGeometry = new THREE.BufferGeometry();
const coreCount = 1500;
const corePositions = new Float32Array(coreCount * 3);

for (let i = 0; i < coreCount; i++) {
  const i3 = i * 3;
  corePositions[i3] = (Math.random() - 0.5) * 0.3;
  corePositions[i3 + 1] = (Math.random() - 0.5) * 0.3;
  corePositions[i3 + 2] = (Math.random() - 0.5) * 0.3;
}

coreGeometry.setAttribute("position", new THREE.BufferAttribute(corePositions, 3));
const coreMaterial = new THREE.PointsMaterial({
  size: 0.04,
  color: 0xffd700,
  blending: THREE.AdditiveBlending,
  transparent: true,
  opacity: 1,
  depthWrite: false,
});
const goldCore = new THREE.Points(coreGeometry, coreMaterial);
scene.add(goldCore);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(5, 4, 6);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000010);

/**
 * Animation
 */
const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Galaxy rotation
  if (Points) Points.rotation.y = elapsedTime * 0.06;

  // Core pulsation and rotation
  goldCore.rotation.y = -elapsedTime * 0.1;
  beamMaterial.size = 0.03 * (1 + Math.sin(elapsedTime * 3) * 0.4);
  coreMaterial.size = 0.04 * (1 + Math.sin(elapsedTime * 4) * 0.5);

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
tick();

/**
 * GUI
 */
gui.add(parameters, "count").min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters, "size").min(0.001).max(0.05).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "radius").min(1).max(20).step(0.1).onFinishChange(generateGalaxy);
gui.add(parameters, "branches").min(2).max(10).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, "spin").min(-5).max(5).step(0.1).onFinishChange(generateGalaxy);
gui.add(parameters, "randomness").min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "randomnessPower").min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
