const sections = [...document.querySelectorAll(".snap-section")];
const rail = document.getElementById("section-rail");
const currentSectionLabel = document.getElementById("current-section-label");
const visualStageTitle = document.getElementById("visual-stage-title");
const visualStageShell = document.getElementById("visual-stage-shell");

const TAU = Math.PI * 2;
const POINT_SOURCE_SIZE = 720;

const createPointSource = () => {
  const canvas = document.createElement("canvas");
  canvas.width = POINT_SOURCE_SIZE;
  canvas.height = POINT_SOURCE_SIZE;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  return { canvas, context };
};

const clearPointSource = ({ canvas, context }) => {
  if (!context) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.strokeStyle = "#ffffff";
  context.lineCap = "round";
  context.lineJoin = "round";
};

const roundRectPath = (context, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
};

const fitPointCount = (points, desired) => {
  if (points.length === 0) {
    return [];
  }

  if (points.length > desired) {
    const stride = points.length / desired;
    return Array.from({ length: desired }, (_, index) => points[Math.floor(index * stride)]);
  }

  const fitted = [...points];
  while (fitted.length < desired) {
    const base = points[Math.floor(Math.random() * points.length)];
    fitted.push({
      x: base.x + (Math.random() - 0.5) * 0.016,
      y: base.y + (Math.random() - 0.5) * 0.016,
      z: base.z + (Math.random() - 0.5) * 0.04,
      size: Math.max(0.5, base.size * (0.9 + Math.random() * 0.25)),
    });
  }

  return fitted;
};

const samplePointSource = (source, options = {}) => {
  const { canvas, context } = source;
  if (!context) {
    return [];
  }

  const step = options.step ?? 4;
  const desired = options.desired ?? 2200;
  const threshold = options.threshold ?? 18;
  const scaleX = options.scaleX ?? 1.42;
  const scaleY = options.scaleY ?? 1.42;
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const points = [];

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const alpha = imageData[(y * canvas.width + x) * 4 + 3];
      if (alpha < threshold) {
        continue;
      }

      const nx = ((x - canvas.width / 2) / (canvas.width / 2)) * scaleX;
      const ny = ((y - canvas.height / 2) / (canvas.height / 2)) * scaleY;
      const radius = Math.sqrt(nx * nx + ny * ny);
      const z =
        Math.sin(nx * 4.3) * 0.15 +
        Math.cos(ny * 5.1) * 0.15 -
        radius * 0.12 +
        (Math.random() - 0.5) * 0.08;

      points.push({
        x: nx,
        y: ny,
        z,
        size: 0.7 + (1 - Math.min(1, radius)) * 0.8 + Math.random() * 0.3,
      });
    }
  }

  return fitPointCount(points, desired);
};

const buildTextShape = (lines, options = {}) => {
  const source = createPointSource();
  const { canvas, context } = source;
  if (!context) {
    return [];
  }

  clearPointSource(source);

  const fontSize = options.fontSize ?? 102;
  const lineHeight = options.lineHeight ?? 0.92;
  const fontFamily = options.fontFamily ?? '"Oswald", sans-serif';
  const top = canvas.height / 2 - ((lines.length - 1) * fontSize * lineHeight) / 2;

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#ffffff";
  context.font = `700 ${fontSize}px ${fontFamily}`;

  lines.forEach((line, index) => {
    const y = top + index * fontSize * lineHeight;
    context.fillText(line, canvas.width / 2, y);
  });

  return samplePointSource(source, options);
};

const buildAutomationShape = () => {
  const source = createPointSource();
  const { canvas, context } = source;
  if (!context) {
    return [];
  }

  clearPointSource(source);
  context.lineWidth = 22;

  const outerModules = [
    { x: 102, y: 144, width: 170, height: 98 },
    { x: 448, y: 144, width: 170, height: 98 },
    { x: 102, y: 474, width: 170, height: 98 },
    { x: 448, y: 474, width: 170, height: 98 },
  ];
  const hub = { x: 222, y: 272, width: 276, height: 174 };
  const hubCenterX = hub.x + hub.width / 2;
  const hubCenterY = hub.y + hub.height / 2;

  outerModules.forEach((module) => {
    roundRectPath(context, module.x, module.y, module.width, module.height, 26);
    context.stroke();

    const dotX = module.x + 32;
    const dotY = module.y + 32;
    context.beginPath();
    context.arc(dotX, dotY, 10, 0, TAU);
    context.fill();

    context.beginPath();
    context.moveTo(dotX + 22, dotY);
    context.lineTo(module.x + module.width - 24, dotY);
    context.stroke();

    const connectorStartX = module.x < hub.x ? module.x + module.width : module.x;
    const connectorStartY = module.y + module.height / 2;
    const connectorMidX = module.x < hub.x ? hub.x - 28 : hub.x + hub.width + 28;
    const connectorEndX = module.x < hub.x ? hub.x : hub.x + hub.width;

    context.beginPath();
    context.moveTo(connectorStartX, connectorStartY);
    context.lineTo(connectorMidX, connectorStartY);
    context.lineTo(connectorMidX, hubCenterY);
    context.lineTo(connectorEndX, hubCenterY);
    context.stroke();
  });

  roundRectPath(context, hub.x, hub.y, hub.width, hub.height, 38);
  context.stroke();

  [hubCenterY - 36, hubCenterY, hubCenterY + 36].forEach((y) => {
    context.beginPath();
    context.arc(hubCenterX - 68, y, 10, 0, TAU);
    context.fill();

    context.beginPath();
    context.moveTo(hubCenterX - 40, y);
    context.lineTo(hubCenterX + 74, y);
    context.stroke();
  });

  context.beginPath();
  context.arc(hubCenterX, hubCenterY, 118, 0, TAU);
  context.stroke();

  return samplePointSource(source, {
    desired: 2600,
    step: 4,
    scaleX: 1.34,
    scaleY: 1.28,
  });
};

const buildLauncherShape = () => {
  const source = createPointSource();
  const { canvas, context } = source;
  if (!context) {
    return [];
  }

  clearPointSource(source);
  context.lineWidth = 28;

  roundRectPath(context, 150, 145, 420, 420, 76);
  context.stroke();

  roundRectPath(context, 206, 204, 128, 128, 32);
  context.stroke();
  roundRectPath(context, 386, 204, 128, 128, 32);
  context.stroke();
  roundRectPath(context, 206, 386, 128, 128, 32);
  context.stroke();
  roundRectPath(context, 386, 386, 128, 128, 32);
  context.stroke();

  context.beginPath();
  context.moveTo(320, 250);
  context.lineTo(320, 468);
  context.stroke();

  context.beginPath();
  context.moveTo(252, 360);
  context.lineTo(468, 360);
  context.stroke();

  context.beginPath();
  context.moveTo(355, 286);
  context.lineTo(445, 360);
  context.lineTo(355, 434);
  context.closePath();
  context.fill();

  return samplePointSource(source, {
    desired: 2400,
    step: 4,
    scaleX: 1.26,
    scaleY: 1.26,
  });
};

const SVGS = {
  python: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <path d="M256,50 C150,50 150,150 150,150 L150,220 L260,220 L260,260 L100,260 C80,260 50,280 50,350 C50,450 150,450 150,450 L256,450 L256,400 L180,400 C150,400 150,350 150,350 L150,300 L260,300 C350,300 350,200 350,200 L350,150 L256,150 Z" fill="none" stroke="white" stroke-width="45" stroke-linejoin="round"/>
    <path d="M256,462 C362,462 362,362 362,362 L362,292 L252,292 L252,252 L412,252 C432,252 462,232 462,162 C462,62 362,62 362,62 L256,62 L256,112 L332,112 C362,112 362,162 362,162 L362,212 L252,212 C162,212 162,312 162,312 L162,362 L256,362 Z" fill="none" stroke="white" stroke-width="45" stroke-linejoin="round"/>
  </svg>`,
  selenium: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <rect x="50" y="50" width="412" height="412" rx="80" fill="none" stroke="white" stroke-width="50"/>
    <path d="M120 280 L220 380 L390 150" fill="none" stroke="white" stroke-width="60" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  openai: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <path d="M256,120 A100,100 0 0,1 356,220 L256,256 L156,220 A100,100 0 0,1 256,120 Z M356,220 A100,100 0 0,1 356,380 L256,256 Z M356,380 A100,100 0 0,1 156,380 L256,256 Z M156,380 A100,100 0 0,1 156,220 L256,256 Z" fill="none" stroke="white" stroke-width="45" stroke-linejoin="round"/>
    <circle cx="256" cy="256" r="50" fill="none" stroke="white" stroke-width="40"/>
  </svg>`,
  playwright: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <path d="M150,150 C250,50 350,150 400,250 C380,350 250,450 150,350 C50,250 50,200 150,150 Z" fill="none" stroke="white" stroke-width="40"/>
    <path d="M250,250 C350,150 450,250 500,350 C480,450 350,550 250,450 C150,350 150,300 250,250 Z" fill="none" stroke="white" stroke-width="40"/>
    <circle cx="200" cy="230" r="30" fill="white"/>
    <circle cx="340" cy="340" r="30" fill="white"/>
  </svg>`,
  sheets: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <path d="M100,50 L300,50 L412,162 L412,462 A20,20 0 0,1 392,482 L100,482 A20,20 0 0,1 80,462 L80,70 A20,20 0 0,1 100,50 Z" fill="none" stroke="white" stroke-width="40" stroke-linejoin="round"/>
    <line x1="300" y1="50" x2="300" y2="162" stroke="white" stroke-width="40" stroke-linecap="round"/>
    <line x1="300" y1="162" x2="412" y2="162" stroke="white" stroke-width="40" stroke-linecap="round"/>
    <rect x="150" y="200" width="190" height="200" fill="none" stroke="white" stroke-width="40"/>
    <line x1="150" y1="266" x2="340" y2="266" stroke="white" stroke-width="40"/>
    <line x1="150" y1="333" x2="340" y2="333" stroke="white" stroke-width="40"/>
    <line x1="245" y1="200" x2="245" y2="400" stroke="white" stroke-width="40"/>
  </svg>`
};

const getSvgDataUrl = (key) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(SVGS[key]);

const buildSeleniumShape = async () => {
  const source = createPointSource();
  const { canvas, context } = source;
  if (!context) return [];

  try {
    const src = getSvgDataUrl("selenium");
    const image = await loadImage(src);
    clearPointSource(source);
    context.drawImage(image, 60, 60, 600, 600);
    return samplePointSource(source, { desired: 3500, step: 2, scaleX: 1.15, scaleY: 1.15 });
  } catch (e) {
    return buildTextShape(["SELENIUM"], { desired: 3500, step: 4, fontSize: 110 });
  }
};

const buildAiShape = async () => {
  const source = createPointSource();
  const { canvas, context } = source;
  if (!context) return [];

  try {
    const src = getSvgDataUrl("openai");
    const image = await loadImage(src);
    clearPointSource(source);
    context.drawImage(image, 60, 60, 600, 600);
    return samplePointSource(source, { desired: 3500, step: 2, scaleX: 1.15, scaleY: 1.15 });
  } catch (e) {
    return buildTextShape(["OPEN AI"], { desired: 3500, step: 4, fontSize: 130 });
  }
};

const buildTrackingShape = async () => {
  const source = createPointSource();
  const { canvas, context } = source;
  if (!context) return [];

  try {
    const src = getSvgDataUrl("playwright");
    const image = await loadImage(src);
    clearPointSource(source);
    context.drawImage(image, 60, 60, 600, 600);
    return samplePointSource(source, { desired: 3500, step: 2, scaleX: 1.15, scaleY: 1.15 });
  } catch (e) {
    return buildTextShape(["PLAYWRIGHT"], { desired: 3500, step: 4, fontSize: 90 });
  }
};

const buildOpsShape = async () => {
  const source = createPointSource();
  const { canvas, context } = source;
  if (!context) return [];

  try {
    const src = getSvgDataUrl("sheets");
    const image = await loadImage(src);
    clearPointSource(source);
    context.drawImage(image, 60, 60, 600, 600);
    return samplePointSource(source, { desired: 3500, step: 2, scaleX: 1.15, scaleY: 1.15 });
  } catch (e) {
    return buildTextShape(["SHEETS"], { desired: 3500, step: 4, fontSize: 130 });
  }
};

const buildProfileShape = async () => {
  const source = createPointSource();
  const { canvas, context } = source;
  if (!context) return [];

  try {
    const src = "./face.svg";
    const image = await loadImage(src);
    clearPointSource(source);
    
    // Fill the canvas mostly, keeping it centered
    const padding = 80;
    const size = Math.min(canvas.width, canvas.height) - padding;
    const x = (canvas.width - size) / 2;
    const y = (canvas.height - size) / 2;
    
    context.drawImage(image, x, y, size, size);

    // SVGs often draw black or transparent. Find bright enough lines.
    // If the SVG has black lines, we might need to invert them or sample alpha.
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i];
      const g = imageData[i+1];
      const b = imageData[i+2];
      const a = imageData[i+3];
      // If it's pure black on transparent, or white on transparent, just trust the alpha.
      // But if it's solid black background, wipe it out:
      if (a > 50 && r < 50 && g < 50 && b < 50) {
        // If it drew solid black background, make it transparent
        // wait, if it's black vector lines, we DO want to keep them! 
        // We'll set them to white so samplePointSource picks them up well.
        imageData[i] = 255;
        imageData[i+1] = 255;
        imageData[i+2] = 255;
      }
    }
    context.putImageData(new ImageData(imageData, canvas.width, canvas.height), 0, 0);

    return samplePointSource(source, { desired: 4800, step: 2, scaleX: 1.4, scaleY: 1.4 });
  } catch (e) {
    return buildTextShape(["FACE"], { desired: 3500, step: 4, fontSize: 130 });
  }
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const hydrateHeroSection = () => {
  const hero = document.getElementById("hero");
  if (!hero) {
    return;
  }

  const summaryTable = hero.querySelector(".hero-summary-table");
  if (summaryTable) {
    summaryTable.innerHTML = `
      <div class="summary-row">
        <span>POSITION</span>
        <strong>마케팅 자동화 / 내부툴 개발</strong>
      </div>
      <div class="summary-row">
        <span>FOCUS</span>
        <strong>런처 통합 관리, 노출 추적, AI 원고 생성, 운영 프로세스 자동화</strong>
      </div>
      <div class="summary-row">
        <span>CORE STACK</span>
        <strong>Python, PySide6, Selenium, Playwright, OpenAI, Gemini, Claude</strong>
      </div>
      <div class="summary-row">
        <span>DELIVERY</span>
        <strong>비개발자도 바로 쓰는 GUI, 배포 구조, 결과 기록 체계까지 함께 설계</strong>
      </div>
      <div class="summary-row">
        <span>PROJECT SCALE</span>
        <strong>24+ 직접 제작 프로젝트 / 13개 런처 통합 관리</strong>
      </div>
      <div class="summary-row">
        <span>SUPPORT WORK</span>
        <strong>wp-cms에서 SEO, 글 자동 작성, Django 세팅, AI 이미지 제작 기여</strong>
      </div>
    `;
  }

  const summaryGrid = hero.querySelector(".hero-summary-grid");
  if (summaryGrid) {
    summaryGrid.innerHTML = `
      <article class="summary-card">
        <span>01</span>
        <strong>중앙 런처</strong>
        <small>설치, 실행, 업데이트를 한 흐름으로 관리</small>
      </article>
      <article class="summary-card">
        <span>02</span>
        <strong>노출 / 추적 자동화</strong>
        <small>URL 확인, 키워드 추적, 통합 영역 기록</small>
      </article>
      <article class="summary-card">
        <span>03</span>
        <strong>AI 콘텐츠 생성</strong>
        <small>원고 생성, 자동 작성, 품질 보정 흐름 연결</small>
      </article>
      <article class="summary-card">
        <span>04</span>
        <strong>운영 프로세스 엔진</strong>
        <small>시트 이동, 로그 적재, 판정 단계를 구조화</small>
      </article>
    `;
  }

  const content = hero.querySelector(".section-content");
  if (!content) {
    return;
  }

  content.innerHTML = `
    <p class="section-kicker">Marketing Ops / Automation / AI</p>
    <h1 class="section-title hero-title">
      <span class="title-line">반복 업무를</span>
      <span class="title-line">실행 가능한 자동화 시스템으로</span>
      <span class="title-line">전환합니다</span>
    </h1>
    <p class="section-summary hero-summary-copy">
      <span class="summary-line">검색 확인, URL 노출 체크, 키워드 추적, 원고 생성, 상태 판정 업무를 직접 프로그램으로 만들었습니다.</span>
      <span class="summary-line">단순 스크립트가 아니라 중앙 런처, GUI, 배포 구조, 결과 기록 체계까지 함께 설계했습니다.</span>
      <span class="summary-line">비개발자도 바로 사용할 수 있는 실무형 자동화 포트폴리오입니다.</span>
    </p>
    <ul class="hero-stats">
      <li>
        <strong>24+</strong>
        <span>직접 제작 프로젝트</span>
      </li>
      <li>
        <strong>13</strong>
        <span>런처 통합 관리 프로그램</span>
      </li>
      <li>
        <strong>AI + Ops</strong>
        <span>개발 속도와 기능 구현을 동시에 연결</span>
      </li>
    </ul>
    <div class="hero-intent">
      <article class="intent-card">
        <span>WHAT I BUILT</span>
        <strong>노출 확인, 키워드 추적, 원고 생성, 운영 판정 도구</strong>
      </article>
      <article class="intent-card">
        <span>HOW I BUILT</span>
        <strong>Python GUI + 브라우저 자동화 + AI 모델 연결 + 중앙 런처</strong>
      </article>
    </div>
    <div class="action-row">
      <a class="slanted-button button-dark" href="#launcher">대표 프로젝트 보기</a>
      <a class="slanted-button button-light" href="#notes">부가 설명 보기</a>
    </div>
  `;
};

const hydrateOverviewSection = () => {
  const section = document.getElementById("positioning");
  if (!section) {
    return;
  }

  section.dataset.visualTitle = "System";

  const content = section.querySelector(".section-content");
  if (!content) {
    return;
  }

  content.innerHTML = `
    <p class="section-kicker">What I Built</p>
    <h2 class="section-title overview-title">
      <span class="title-line">개별 도구 제작을 넘어</span>
      <span class="title-line">하나의 운영 시스템으로</span>
      <span class="title-line">연결했습니다</span>
    </h2>
    <p class="section-summary overview-summary">
      <span class="summary-line">Python, Selenium, GPT, Claude, Gemini를 각각 따로 쓰는 데서 끝내지 않았습니다.</span>
      <span class="summary-line">검색 확인 도구, 원고 생성 프로그램, 중앙 런처, 운영 프로세스 엔진으로 연결했습니다.</span>
      <span class="summary-line">그 결과 실제 마케팅 실무에서 바로 쓰는 자동화 흐름을 만들었습니다.</span>
    </p>
    <ul class="detail-list overview-list">
      <li>사내 마케팅 업무에 맞춘 자동화 프로그램을 직접 설계하고 구현</li>
      <li>비개발자가 바로 쓸 수 있는 GUI와 결과 기록 구조를 함께 제공</li>
      <li>AI를 기능 구현과 개발 가속 모두에 활용해 제작 속도와 결과 품질을 동시에 개선</li>
    </ul>
  `;
};

const buildPythonShape = async () => {
  const source = createPointSource();
  const { canvas, context } = source;
  if (!context) {
    return buildTextShape(["PYTHON"], {
      desired: 2200,
      step: 4,
      fontSize: 138,
      scaleX: 1.26,
      scaleY: 1.08,
    });
  }

  try {
    const src = getSvgDataUrl("python");
    const image = await loadImage(src);

    clearPointSource(source);
    context.drawImage(image, 50, 50, 620, 620);

    return samplePointSource(source, {
      desired: 3800,
      step: 2,
      scaleX: 1.15,
      scaleY: 1.15,
    });
  } catch (error) {
    return buildTextShape(["PYTHON"], {
      desired: 2200,
      step: 4,
      fontSize: 138,
      scaleX: 1.26,
      scaleY: 1.08,
    });
  }
};

const initVisualStage = () => {
  const canvas = document.getElementById("visual-stage-canvas");
  if (!canvas) {
    return null;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const shapes = {
    automation: buildAutomationShape(),
    launcher: buildLauncherShape(),
    selenium: buildTextShape(["SELENIUM"], { desired: 3500, step: 4, fontSize: 110 }),
    gpt: buildTextShape(["OPEN AI"], { desired: 3500, step: 4, fontSize: 120 }),
    track: buildTextShape(["PLAYWRIGHT"], { desired: 3500, step: 4, fontSize: 90 }),
    ops: buildTextShape(["SHEETS"], { desired: 3500, step: 4, fontSize: 130 }),
    python: buildTextShape(["PYTHON"], {
      desired: 3800,
      step: 4,
      fontSize: 138,
      scaleX: 1.26,
      scaleY: 1.08,
    }),
  };

  let width = 0;
  let height = 0;
  let lastTime = 0;
  let animationFrame = 0;
  let activeShapeKey = "python";
  let stars = [];
  let particles = [];
  let targetPoints = shapes.python;

  const createStars = (count) =>
    Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      depth: Math.random() * 1.2 + 0.3,
      radius: Math.random() * 1.4 + 0.2,
      alpha: Math.random() * 0.34 + 0.08,
      speed: Math.random() * 0.4 + 0.15,
      phase: Math.random() * TAU,
    }));

  const createParticle = () => ({
    x: (Math.random() - 0.5) * 3.6,
    y: (Math.random() - 0.5) * 3.6,
    z: (Math.random() - 0.5) * 1.6,
    vx: 0,
    vy: 0,
    vz: 0,
    size: Math.random() * 0.85 + 0.55,
    alpha: Math.random() * 0.4 + 0.48,
    drift: Math.random() * TAU,
  });

  const getCenter = () => ({
    x: width < 1100 ? width * 0.5 : width * 0.33,
    y: height * 0.49,
  });

  const syncParticles = (count) => {
    while (particles.length < count) {
      particles.push(createParticle());
    }

    if (particles.length > count) {
      particles.length = count;
    }
  };

  const setTargetShape = (key) => {
    activeShapeKey = key && shapes[key] ? key : "automation";
    targetPoints = shapes[activeShapeKey] ?? shapes.automation;
    syncParticles(targetPoints.length);
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const starCount = width < 900 ? 160 : 260;
    stars = createStars(starCount);
    syncParticles(targetPoints.length);
  };

  const drawBackdrop = (time) => {
    const center = getCenter();
    const radius = Math.min(width, height) * 0.58;

    context.clearRect(0, 0, width, height);

    const glow = context.createRadialGradient(center.x - radius * 0.12, center.y - radius * 0.08, 0, center.x, center.y, radius);
    glow.addColorStop(0, "rgba(55, 255, 174, 0.16)");
    glow.addColorStop(0.3, "rgba(26, 124, 78, 0.12)");
    glow.addColorStop(0.6, "rgba(7, 48, 28, 0.1)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    const hazeAlpha = 0.09 + Math.sin(time * 0.00018) * 0.02;
    context.fillStyle = `rgba(8, 46, 24, ${Math.max(0.04, hazeAlpha)})`;
    context.beginPath();
    context.ellipse(center.x - width * 0.12, center.y - height * 0.08, width * 0.26, height * 0.22, 0.35, 0, TAU);
    context.fill();

    context.beginPath();
    context.ellipse(center.x + width * 0.09, center.y + height * 0.1, width * 0.24, height * 0.21, -0.45, 0, TAU);
    context.fill();
  };

  const drawStars = (time) => {
    for (const star of stars) {
      const twinkle = star.alpha + Math.sin(time * 0.001 * star.speed + star.phase) * 0.12;
      const x = star.x * width;
      const y = star.y * height;
      const radius = star.radius * star.depth;

      context.fillStyle = `rgba(122, 255, 210, ${Math.max(0.04, twinkle)})`;
      context.beginPath();
      context.arc(x, y, radius, 0, TAU);
      context.fill();
    }
  };

  const render = (time) => {
    const reducedTime = prefersReducedMotion ? 0 : time;
    const delta = Math.min(32, reducedTime - lastTime || 16);
    lastTime = reducedTime;

    drawBackdrop(reducedTime);
    drawStars(reducedTime);

    const center = getCenter();
    const objectScale = Math.min(width, height) * (width < 900 ? 0.16 : 0.205);
    const spin = prefersReducedMotion ? 0.12 : reducedTime * 0.00022;
    const tiltX = prefersReducedMotion ? -0.38 : -0.44 + Math.sin(reducedTime * 0.00018) * 0.1;
    const pulse = 1 + Math.sin(reducedTime * 0.0014) * 0.035;
    const cosSpin = Math.cos(spin);
    const sinSpin = Math.sin(spin);
    const cosTilt = Math.cos(tiltX);
    const sinTilt = Math.sin(tiltX);
    const rendered = [];

    for (let index = 0; index < particles.length; index += 1) {
      const particle = particles[index];
      const target = targetPoints[index % targetPoints.length];
      const driftX = Math.sin(reducedTime * 0.0011 + particle.drift) * 0.012;
      const driftY = Math.cos(reducedTime * 0.0009 + particle.drift) * 0.012;
      const driftZ = Math.sin(reducedTime * 0.0012 + particle.drift) * 0.06;

      particle.vx += (target.x + driftX - particle.x) * 0.064;
      particle.vy += (target.y + driftY - particle.y) * 0.064;
      particle.vz += (target.z + driftZ - particle.z) * 0.056;

      particle.vx *= 0.84;
      particle.vy *= 0.84;
      particle.vz *= 0.82;

      particle.x += particle.vx * (delta / 16);
      particle.y += particle.vy * (delta / 16);
      particle.z += particle.vz * (delta / 16);

      const x1 = particle.x * cosSpin - particle.z * sinSpin;
      const z1 = particle.x * sinSpin + particle.z * cosSpin;
      const y1 = particle.y * cosTilt - z1 * sinTilt;
      const z2 = particle.y * sinTilt + z1 * cosTilt;
      const perspective = 3.6 / (4.6 - z2);

      const screenX = center.x + x1 * objectScale * perspective * pulse;
      const screenY = center.y + y1 * objectScale * perspective * pulse;
      if (screenX < -40 || screenX > width + 40 || screenY < -40 || screenY > height + 40) {
        continue;
      }

      rendered.push({
        x: screenX,
        y: screenY,
        radius: Math.max(0.45, (particle.size + target.size * 0.4) * perspective * 1.22),
        alpha: Math.min(0.96, particle.alpha * (0.68 + perspective * 0.52)),
        depth: z2,
      });
    }

    rendered.sort((left, right) => left.depth - right.depth);

    for (const point of rendered) {
      context.fillStyle = `rgba(84, 255, 180, ${point.alpha})`;
      context.beginPath();
      context.arc(point.x, point.y, point.radius, 0, TAU);
      context.fill();

      if (point.radius > 1.45) {
        context.fillStyle = `rgba(190, 255, 234, ${point.alpha * 0.3})`;
        context.beginPath();
        context.arc(point.x, point.y, point.radius * 2.2, 0, TAU);
        context.fill();
      }
    }

    if (!prefersReducedMotion) {
      animationFrame = window.requestAnimationFrame(render);
    }
  };

  window.addEventListener("resize", resize);
  resize();
  setTargetShape("profile");

  const loadShapeAsync = (key, builderFunc, title) => {
    builderFunc().then((points) => {
      shapes[key] = points;
      if (activeShapeKey === key) {
        setTargetShape(key);
      }
      if (visualStageTitle && (!visualStageTitle.textContent || visualStageTitle.textContent === title)) {
        visualStageTitle.textContent = title;
      }
    });
  };

  loadShapeAsync("profile", buildProfileShape, "Chang Joon CHOI");
  loadShapeAsync("python", buildPythonShape, "Python Automation");
  loadShapeAsync("selenium", buildSeleniumShape, "Selenium");
  loadShapeAsync("gpt", buildAiShape, "AI");
  loadShapeAsync("track", buildTrackingShape, "Tracking");
  loadShapeAsync("ops", buildOpsShape, "Ops");

  if (prefersReducedMotion) {
    render(0);
  } else {
    animationFrame = window.requestAnimationFrame(render);
  }

  return {
    setVisual(key, title) {
      setTargetShape(key);
      if (visualStageTitle) {
        visualStageTitle.textContent = title || "Visual";
      }
    },
    destroy() {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    },
  };
};

const setTheme = (section) => {
  if (!section) {
    return;
  }

  const accentRgb = section.dataset.accentRgb ?? "231 124 71";
  const accentAltRgb = section.dataset.accentAltRgb ?? "103 201 255";

  document.documentElement.style.setProperty("--accent-rgb", accentRgb);
  document.documentElement.style.setProperty("--accent-alt-rgb", accentAltRgb);
};

const railButtons = sections.map((section) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "rail-dot";
  button.dataset.label = section.dataset.label ?? section.id;
  button.setAttribute("aria-label", section.dataset.label ?? section.id);
  button.addEventListener("click", () => {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  rail.appendChild(button);
  return button;
});

const activateSection = (section) => {
  const index = sections.indexOf(section);
  if (index < 0) {
    return;
  }

  sections.forEach((node, nodeIndex) => {
    node.classList.toggle("is-visible", nodeIndex === index);
    railButtons[nodeIndex]?.classList.toggle("is-active", nodeIndex === index);
  });

  if (currentSectionLabel) {
    currentSectionLabel.textContent = section.dataset.label ?? "Intro";
  }

  setTheme(section);
  if (visualStageShell) {
    visualStageShell.classList.toggle("is-hidden", !section.dataset.visualKey);
  }

  if (visualStageController && section.dataset.visualKey) {
    visualStageController.setVisual(
      section.dataset.visualKey,
      section.dataset.visualTitle ?? section.dataset.label ?? "Visual"
    );
  }
};

const observer = new IntersectionObserver(
  (entries) => {
    const visibleEntries = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (visibleEntries.length > 0) {
      activateSection(visibleEntries[0].target);
    }
  },
  {
    threshold: [0.35, 0.5, 0.7],
    rootMargin: "-10% 0px -10% 0px",
  }
);

sections.forEach((section) => observer.observe(section));

hydrateHeroSection();
hydrateOverviewSection();
const visualStageController = initVisualStage();
activateSection(sections[0]);

const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}
