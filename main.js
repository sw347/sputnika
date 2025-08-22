// planet.js 불러오기
import { PLANETS } from "./planets.js";

// matter-attractors.js 불러오기
Matter.use("matter-attractors");

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

// 엔진 중력 설정
engine.gravity.scale = 0;

// 렌더 선언
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 1000,
    height: 600,
    wireframes: false,
    background:
      'url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQK9oWQK62T5-1TJLFLmOWMSAjLY2d2yS0V0g&s")',
  },
});

// 실행
Render.run(render);
Runner.run(engine);

// 중심점 만들기
const centerGravity = Bodies.circle(700, 300, 30, {
  // 고정
  isStatic: true,
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
  // 플러그린 적용
  plugin: {
    attractors: [
      function (bodyA, bodyB) {
        return {
          x: (bodyA.position.x - bodyB.position.x) * 0.000005,
          y: (bodyA.position.y - bodyB.position.y) * 0.000005,
        };
      },
    ],
  },
});

const deadCircle = Bodies.circle(700, 300, 300, {
  name: "deadCircle",
  isStatic: true,
  isSensor: true,
  render: {
    fillStyle: "transparent",
    strokeStyle: "red",
    lineWidth: 1,
  },
});

// 중심점 배치
World.add(world, [centerGravity, deadCircle]);

// 행성만들기
let shootingPlanet;

// 행성
const createPlanet = () => {
  // Math.random은 0~1까지의 무작위 숫자 생성
  const index = Math.floor(Math.random() * 2);

  // 불러온 Planet 값 적용하기
  const planet = PLANETS[index];

  shootingPlanet = Bodies.circle(200, 300, planet.radius, {
    name: "planet",
    isStatic: true,
    // 이미지 적용
    render: {
      sprite: {
        texture: `./img/${planet.name}.png`,
      },
    },
    index: index,
  });

  World.add(world, shootingPlanet);
};

// 행성 당기기
// 행성을 당길수 있는 상태가 맞는지 확인하는 변수
let isDragging = false;

// 슈팅이 가능한 상태가 맞는지 확인하는 변수
let isShooting = false;

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
    isShooting = true;
  } else return;

  // 놓는 위치를 저장하는 변수
  const releasePosition = { x: mouse.position.x, y: mouse.position.y };

  // 힘이 적용되는 방향을 구하는 변수
  const forceDirection = {
    x: 200 - releasePosition.x,
    y: 300 - releasePosition.y,
  };

  // 힘이 적용되는 함수
  Body.applyForce(shootingPlanet, shootingPlanet.position, {
    x: forceDirection.x * 0.0005,
    y: forceDirection.y * 0.0005,
  });

  // 발사되도록 고정 풀기
  Body.setStatic(shootingPlanet, false);

  // 발사한 행성 드래그 금지
  isDragging = false;

  // 슈팅가능 끄기
  isShooting = false;

  // 행성 발사 후 새로운 행성 생성
  setTimeout(() => {
    createPlanet();
  }, 1000);
});

// 이벤트 사용
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index == collision.bodyB.index) {
      const index = collision.bodyA.index;

      if (index === PLANETS.length - 1) {
        return;
      }

      World.remove(world, [collision.bodyA, collision.bodyB]);

      // 저장한 index값에 1을 더해 새로 제작
      const newPlanet = PLANETS[index + 1];

      console.log(newPlanet);
      const newBody = Bodies.circle(
        // 부딪힌 지점의 x,y값
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newPlanet.radius,
        {
          // 행성이 합쳐졌으므로 index값 1 증가
          index: index + 1,
          // 렌더 새로 해주기
          render: { sprite: { texture: `./img/${newPlanet.name}.png` } },
        }
      );

      // 월드에 더해줌
      World.add(world, newBody);
    }

    if (
      !(
        collision.bodyA.name === "deadLine" ||
        collision.bodyA.name === "skyBlue"
      )
    ) {
      collision.bodyB.deadCheck = true;
      console.log("bodyA check = " + collision.bodyA.deadCheck);
      console.log("bodyB check = " + collision.bodyB.deadCheck);
    }

    const dx = collision.bodyA.position.x - collision.bodyB.position.x;
    const dy = collision.bodyA.position.y - collision.bodyB.position.y;

    const d = Math.sqrt(dx ** 2 + dy ** 2);
    if (collision.bodyA.deadCheck && d >= 200) alert("Game Over");
  });
});

// 행성 생성 함수 실행
createPlanet();
