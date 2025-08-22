// planet.js 불러오기
import { PLANETS } from "./planets.js";

// 모듈 불러오기
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body,
  Events = Matter.Events,
  Composite = Matter.Composite;

// 엔진 생성, 월드 선언
const engine = Engine.create();
const world = engine.world;

// 렌더 선언
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 1000,
    height: 600,
    wireframes: false,
  },
});

// 실행
Render.run(render);
Runner.run(engine);

// 중심점 만들기
const centerGravity = Bodies.circle(700, 300, 30, {
  // 고정
  isStatic: true,
  restitution: 0.5,
  // 렌더
  render: {
    // fillStyle: "transparent",
    // 선 색
    // strokeStyle: "white",
    // 선 굵기
    // lineWidth: 3,
    sprite: {
      texture: "./img/blackhole.png",
      xScale: 0.5,
      yScale: 0.5,
    },
  },
});

// 중심점 배치
World.add(world, centerGravity);

// 행성만들기
let shootingPlanet;

// 행성
const createPlanet = () => {
  // Math.random은 0~1까지의 무작위 숫자 생성
  const index = Math.floor(Math.random() * 2);

  // 불러온 Planet 값 적용하기
  const planet = PLANETS[index];

  shootingPlanet = Bodies.circle(200, 300, planet.radius, {
    isStatic: true,
    // 이미지 적용
    render: {
      sprite: {
        texture: `./img/${planet.name}.png`,
      },
    },
  });

  World.add(world, shootingPlanet);
};

// 행성 당기기
// 행성을 당길수 있는 상태가 맞는지 확인하는 변수
let isDragging = false;

// 마우스 사용을 위한 Matter.js 선언
var Mouse = Matter.Mouse;
let mouse = Mouse.create(render.canvas);

// 마우스 이벤트
window.addEventListener("mousedown", (event) => {
  const mousePosition = {
    // 마우스 x, y 좌표
    x: event.clientX,
    y: event.clientY,
  };

  // 두점 사이의 거리 공식을 이용해서 행성 밖을 선택했는지 확인
  const distanceToPlanet = Math.sqrt(
    (mousePosition.x - shootingPlanet.position.x) ** 2 +
      (mousePosition.y - shootingPlanet.position.y) ** 2
    // mouse.position.x === mousePosition.x
  );

  // 발사되는 행성의 지름보다 작으면 발사 가능
  if (distanceToPlanet <= shootingPlanet.circleRadius) {
    // 드래그 가능
    isDragging = true;
  }
});

window.addEventListener("mousemove", (event) => {
  // 클릭 후 드래그 했을때만 작동
  if (isDragging) {
    const newPosition = {
      x: mouse.position.x,
      y: mouse.position.y,
    };

    Body.setPosition(shootingPlanet, {
      x: newPosition.x,
      y: newPosition.y,
    });
  }
});

window.addEventListener("mouseup", (event) => {
  if (isDragging) {
    isDragging = false;
    Body.setStatic(shootingPlanet, false);
  }
});

// 행성 생성 함수 실행
createPlanet();
