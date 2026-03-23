import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

gsap.registerPlugin(ScrollTrigger);

const sections = [...document.querySelectorAll(".snap-section")];
const rail = document.getElementById("section-rail");
const currentSectionLabel = document.getElementById("current-section-label");
const visualStageTitle = document.getElementById("visual-stage-title");

// === 1. Hydrate DOM Content ===
const hydrateHeroSection = () => {
  const hero = document.getElementById("hero");
  if (!hero) return;
  const summaryTable = hero.querySelector(".hero-summary-table");
  if (summaryTable) {
    summaryTable.innerHTML = `
      <div class="summary-row">
        <span>POSITION</span><strong>마케팅 자동화 / 내부툴 개발</strong>
      </div>
      <div class="summary-row">
        <span>FOCUS</span><strong>런처 통합 관리, 노출 추적, AI 원고 생성, 운영 프로세스 자동화</strong>
      </div>
      <div class="summary-row">
        <span>CORE STACK</span><strong>Python, PySide6, Selenium, Playwright, OpenAI, Gemini, Claude</strong>
      </div>
      <div class="summary-row">
        <span>DELIVERY</span><strong>비개발자도 바로 쓰는 GUI, 배포 구조, 결과 기록 체계까지 함께 설계</strong>
      </div>
      <div class="summary-row">
        <span>PROJECT SCALE</span><strong>24+ 직접 제작 프로젝트 / 13개 런처 통합 관리</strong>
      </div>
    `;
  }
  const summaryGrid = hero.querySelector(".hero-summary-grid");
  if (summaryGrid) {
    summaryGrid.innerHTML = `
      <article class="summary-card"><span>01</span><strong>중앙 런처</strong><small>설치, 실행, 관리</small></article>
      <article class="summary-card"><span>02</span><strong>노출 / 추적 자동화</strong><small>키워드 추적</small></article>
      <article class="summary-card"><span>03</span><strong>AI 콘텐츠 생성</strong><small>자동 작성 흐름</small></article>
      <article class="summary-card"><span>04</span><strong>운영 시스템</strong><small>단계별 구조화</small></article>
    `;
  }
  const content = hero.querySelector(".section-content");
  if (content) {
    content.innerHTML = `
      <p class="section-kicker">Marketing Ops / Automation / AI</p>
      <h1 class="section-title hero-title">
        <span class="title-line">반복 업무를</span>
        <span class="title-line">실행 가능한 자동화 시스템으로</span>
        <span class="title-line">전환합니다</span>
      </h1>
      <p class="section-summary hero-summary-copy">
        <span class="summary-line">단순 스크립트가 아니라 중앙 런처, GUI, 배포 구조, 결과 기록 체계까지 설계했습니다.</span>
        <span class="summary-line">비개발자도 바로 사용할 수 있는 실무형 자동화 포트폴리오입니다.</span>
      </p>
      <div class="action-row">
        <a class="slanted-button button-dark" href="#launcher">대표 프로젝트 보기</a>
      </div>
    `;
  }
};

const hydrateOverviewSection = () => {
  const section = document.getElementById("positioning");
  if (!section) return;
  section.dataset.visualTitle = "System";
  const content = section.querySelector(".section-content");
  if (content) {
    content.innerHTML = `
      <p class="section-kicker">What I Built</p>
      <h2 class="section-title overview-title">
        <span class="title-line">개별 도구 제작을 넘어</span>
        <span class="title-line">하나의 운영 시스템으로</span>
        <span class="title-line">연결했습니다</span>
      </h2>
      <p class="section-summary overview-summary">
        <span class="summary-line">Python, Selenium, GPT, Claude, Gemini를 각각 따로 쓰는 데서 끝내지 않았습니다.</span>
        <span class="summary-line">그 결과 실제 마케팅 실무에서 바로 쓰는 자동화 흐름을 만들었습니다.</span>
      </p>
    `;
  }
};

hydrateHeroSection();
hydrateOverviewSection();

// === 2. SVG Strings for 3D Conversion ===
const SVGS = {
  python: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path d="M256,50 C150,50 150,150 150,150 L150,220 L260,220 L260,260 L100,260 C80,260 50,280 50,350 C50,450 150,450 150,450 L256,450 L256,400 L180,400 C150,400 150,350 150,350 L150,300 L260,300 C350,300 350,200 350,200 L350,150 L256,150 Z" stroke="white" stroke-width="25"/>
    <path d="M256,462 C362,462 362,362 362,362 L362,292 L252,292 L252,252 L412,252 C432,252 462,232 462,162 C462,62 362,62 362,62 L256,62 L256,112 L332,112 C362,112 362,162 362,162 L362,212 L252,212 C162,212 162,312 162,312 L162,362 L256,362 Z" stroke="white" stroke-width="25"/>
  </svg>`,
  selenium: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect x="50" y="50" width="412" height="412" rx="60" stroke="white" stroke-width="40"/>
    <path d="M120 280 L220 380 L390 150" stroke="white" stroke-width="50"/>
  </svg>`,
  gpt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path d="M256,120 A100,100 0 0,1 356,220 L256,256 L156,220 A100,100 0 0,1 256,120 Z M356,220 A100,100 0 0,1 356,380 L256,256 Z M356,380 A100,100 0 0,1 156,380 L256,256 Z M156,380 A100,100 0 0,1 156,220 L256,256 Z" stroke="white" stroke-width="40"/>
  </svg>`,
  track: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path d="M150,150 C250,50 350,150 400,250 C380,350 250,450 150,350 C50,250 50,200 150,150 Z" stroke="white" stroke-width="30"/>
    <path d="M250,250 C350,150 450,250 500,350 C480,450 350,550 250,450 C150,350 150,300 250,250 Z" stroke="white" stroke-width="30"/>
  </svg>`,
  ops: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect x="150" y="200" width="190" height="200" stroke="white" stroke-width="30"/>
    <path d="M100,50 L300,50 L412,162 L412,462 A20,20 0 0,1 392,482 L100,482 A20,20 0 0,1 80,462 L80,70 A20,20 0 0,1 100,50 Z" stroke="white" stroke-width="30"/>
    <line x1="300" y1="50" x2="300" y2="162" stroke="white" stroke-width="30"/>
    <line x1="300" y1="162" x2="412" y2="162" stroke="white" stroke-width="30"/>
    <line x1="150" y1="266" x2="340" y2="266" stroke="white" stroke-width="30"/>
    <line x1="150" y1="333" x2="340" y2="333" stroke="white" stroke-width="30"/>
    <line x1="245" y1="200" x2="245" y2="400" stroke="white" stroke-width="30"/>
  </svg>`,
  launcher: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect x="56" y="56" width="400" height="400" rx="30" stroke="white" stroke-width="30"/>
    <rect x="120" y="120" width="100" height="100" rx="10" stroke="white" stroke-width="20"/>
    <rect x="292" y="120" width="100" height="100" rx="10" stroke="white" stroke-width="20"/>
    <rect x="120" y="292" width="100" height="100" rx="10" stroke="white" stroke-width="20"/>
    <rect x="292" y="292" width="100" height="100" rx="10" stroke="white" stroke-width="20"/>
    <circle cx="256" cy="256" r="20" stroke="white" stroke-width="15"/>
  </svg>`,
  automation: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <circle cx="256" cy="256" r="80" stroke="white" stroke-width="25"/>
    <rect x="50" y="50" width="120" height="80" rx="10" stroke="white" stroke-width="25"/>
    <rect x="342" y="50" width="120" height="80" rx="10" stroke="white" stroke-width="25"/>
    <rect x="50" y="382" width="120" height="80" rx="10" stroke="white" stroke-width="25"/>
    <rect x="342" y="382" width="120" height="80" rx="10" stroke="white" stroke-width="25"/>
    <line x1="170" y1="90" x2="256" y2="176" stroke="white" stroke-width="25"/>
    <line x1="342" y1="90" x2="256" y2="176" stroke="white" stroke-width="25"/>
    <line x1="170" y1="422" x2="256" y2="336" stroke="white" stroke-width="25"/>
    <line x1="342" y1="422" x2="256" y2="336" stroke="white" stroke-width="25"/>
  </svg>`
};

// === 3. Three.js Particle Engine ===
let scene, camera, renderer, morphPoints;
const POINT_COUNT = 150000;
const shapePositions = {};
let currentShapeKey = 'python';

const morphUniforms = { morphRatio: { value: 0.0 } };
const blobParams = { time: 0, noiseAmount: 0.2, noiseScale: 1.5, rotationSpeed: 0.001 };

function samplePointsFromSvg(svgString) {
  const loader = new SVGLoader();
  const svgData = loader.parse(svgString);
  const geometries = [];

  for (const path of svgData.paths) {
    const shapes = SVGLoader.createShapes(path);
    for (const shape of shapes) {
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 25,
        bevelEnabled: true,
        bevelThickness: 4,
        bevelSize: 2,
        bevelSegments: 3,
        curveSegments: 16
      });
      geometries.push(geometry);
    }
  }

  if (geometries.length === 0) return null;
  const mergedGeom = BufferGeometryUtils.mergeGeometries(geometries, false);
  mergedGeom.computeBoundingBox();
  const center = new THREE.Vector3();
  mergedGeom.boundingBox.getCenter(center);
  mergedGeom.translate(-center.x, -center.y, -center.z);
  
  mergedGeom.computeBoundingSphere();
  const radius = mergedGeom.boundingSphere.radius;
  if (radius > 0) {
    const scale = 2.4 / radius; 
    mergedGeom.scale(scale, -scale, scale); // Invert Y for correct SVG orientation
  }

  const sampler = new MeshSurfaceSampler(new THREE.Mesh(mergedGeom.toNonIndexed(), new THREE.MeshBasicMaterial())).build();
  const positions = new Float32Array(POINT_COUNT * 3);
  const tempPosition = new THREE.Vector3();
  for (let i = 0; i < POINT_COUNT; i++) {
    sampler.sample(tempPosition);
    positions[i*3] = tempPosition.x;
    positions[i*3+1] = tempPosition.y;
    positions[i*3+2] = tempPosition.z;
  }
  return new THREE.BufferAttribute(positions, 3);
}

function initThree() {
  const canvasContainer = document.getElementById("visual-stage-shell");
  const core = document.querySelector(".visual-stage-core");
  if(core) core.innerHTML = ""; // Clear old canvas

  scene = new THREE.Scene();
  
  const aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
  camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
  camera.position.set(0, 0, 4);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  if(core) core.appendChild(renderer.domElement);

  // Prepare shapes
  for (const key in SVGS) {
    const attr = samplePointsFromSvg(SVGS[key]);
    if (attr) shapePositions[key] = attr;
  }
  // Sphere fallback
  const baseSphere = new THREE.SphereGeometry(1, 64, 64);
  const sphereSampler = new MeshSurfaceSampler(new THREE.Mesh(baseSphere.toNonIndexed(), new THREE.MeshBasicMaterial())).build();
  const sphereAttr = new Float32Array(POINT_COUNT * 3);
  const tPos = new THREE.Vector3();
  for(let i=0; i<POINT_COUNT; i++) {
    sphereSampler.sample(tPos);
    sphereAttr[i*3] = tPos.x; sphereAttr[i*3+1] = tPos.y; sphereAttr[i*3+2] = tPos.z;
  }
  shapePositions['sphere'] = new THREE.BufferAttribute(sphereAttr, 3);

  const morphGeometry = new THREE.BufferGeometry();
  morphGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(POINT_COUNT * 3), 3));
  morphGeometry.setAttribute('positionStart', shapePositions['python'] || shapePositions['sphere']);
  morphGeometry.setAttribute('positionEnd', shapePositions['python'] || shapePositions['sphere']);

  const pointsMaterial = new THREE.PointsMaterial({
    color: 0x54ffb4,
    size: 0.015,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  pointsMaterial.onBeforeCompile = shader => {
    shader.uniforms.morphRatio = morphUniforms.morphRatio;
    shader.uniforms.time = blobParams;
    shader.uniforms.noiseAmount = blobParams;
    shader.uniforms.noiseScale = blobParams;

    shader.vertexShader = `
      uniform float morphRatio;
      uniform float time;
      uniform float noiseAmount;
      uniform float noiseScale;
      attribute vec3 positionStart;
      attribute vec3 positionEnd;

      float simple3DNoise_glsl(float x, float y, float z, float timeVal) {
          float val = 0.0;
          val += sin(x + timeVal * 1.0) * cos(y * 0.8 + timeVal * 0.5);
          val += sin(y * 1.2 + timeVal * 1.1) * cos(z * 1.1 + timeVal * 0.6);
          val += sin(z * 1.4 + timeVal * 1.2) * cos(x * 0.9 + timeVal * 0.7);
          val += sin((x + y) * 0.7 + timeVal * 0.8) * cos((y + z) * 0.6 + timeVal * 0.4);
          return val / 4.0;
      }
    ` + shader.vertexShader;
    
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      vec3 interpolatedPosition = mix(positionStart, positionEnd, morphRatio);
      vec3 pN = interpolatedPosition;
      float noise = simple3DNoise_glsl( pN.x * noiseScale, pN.y * noiseScale, pN.z * noiseScale, time );
      vec3 normalForNoise = normalize(pN);
      if (length(pN) < 0.0001) { normalForNoise = vec3(0.0, 1.0, 0.0); }
      vec3 displacedPosition = pN + normalForNoise * noise * noiseAmount;
      vec3 transformed = displacedPosition;
      `
    );
  };

  morphPoints = new THREE.Points(morphGeometry, pointsMaterial);
  scene.add(morphPoints);

  // Background stars for depth
  const starsGeo = new THREE.BufferGeometry();
  const starsAttr = new Float32Array(500 * 3);
  for(let i=0; i<1500; i++) {
    starsAttr[i] = (Math.random() - 0.5) * 15;
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(starsAttr, 3));
  const starsMat = new THREE.PointsMaterial({color: 0x37ffae, size: 0.015, transparent: true, opacity: 0.4});
  scene.add(new THREE.Points(starsGeo, starsMat));

  window.addEventListener("resize", () => {
    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

function triggerMorph(targetKey) {
  if (!shapePositions[targetKey]) targetKey = 'sphere';
  
  morphPoints.geometry.setAttribute('positionStart', shapePositions[currentShapeKey] || shapePositions['sphere']);
  morphPoints.geometry.setAttribute('positionEnd', shapePositions[targetKey]);

  gsap.killTweensOf(morphUniforms.morphRatio);
  gsap.to(morphUniforms.morphRatio, {
    value: 1.0,
    duration: 1.2,
    ease: "power2.inOut",
    onStart: () => { morphUniforms.morphRatio.value = 0.0; },
    onComplete: () => {
      currentShapeKey = targetKey;
      morphPoints.geometry.setAttribute('positionStart', shapePositions[currentShapeKey]);
      morphUniforms.morphRatio.value = 0.0;
    }
  });

  gsap.fromTo(blobParams, 
    { noiseAmount: 0.8 }, 
    { noiseAmount: 0.2, duration: 1.2, ease: "power2.out" }
  );
}

// === 4. Animation Loop ===
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  blobParams.time += dt * 2.0;

  if (morphPoints) {
    morphPoints.rotation.y += 0.002;
    morphPoints.rotation.x += 0.001;
  }

  // Slight parallax
  camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
  camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}

let mouseX = 0, mouseY = 0;
document.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = (e.clientY / window.innerHeight) * 2 - 1;
});

// === 5. App Initialization ===
initThree();
animate();

// Section Rail and Scroll Handling
sections.forEach((section, index) => {
  const btn = document.createElement("button");
  btn.className = "rail-dot";
  btn.dataset.label = section.dataset.label ?? section.id;
  btn.addEventListener("click", () => section.scrollIntoView({ behavior: "smooth" }));
  if(rail) rail.appendChild(btn);

  // Set up ScrollTrigger for Morphing
  ScrollTrigger.create({
    trigger: section,
    start: "top center",
    end: "bottom center",
    onEnter: () => {
      const railButtons = document.querySelectorAll(".rail-dot");
      railButtons.forEach(b => b.classList.remove("is-active"));
      if(railButtons[index]) railButtons[index].classList.add("is-active");
      
      if(currentSectionLabel) currentSectionLabel.textContent = section.dataset.label || "Intro";
      if(visualStageTitle) visualStageTitle.textContent = section.dataset.visualTitle || section.dataset.label || "Visual";

      if (section.dataset.visualKey) triggerMorph(section.dataset.visualKey);
    },
    onEnterBack: () => {
      const railButtons = document.querySelectorAll(".rail-dot");
      railButtons.forEach(b => b.classList.remove("is-active"));
      if(railButtons[index]) railButtons[index].classList.add("is-active");
      
      if(currentSectionLabel) currentSectionLabel.textContent = section.dataset.label || "Intro";
      if(visualStageTitle) visualStageTitle.textContent = section.dataset.visualTitle || section.dataset.label || "Visual";

      if (section.dataset.visualKey) triggerMorph(section.dataset.visualKey);
    }
  });
});

const yearNode = document.getElementById("year");
if (yearNode) yearNode.textContent = new Date().getFullYear();
