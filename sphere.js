import * as THREE from './node_modules/three/build/three.module'
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls'

const incr = 0.02;
const range = 32;

class RiemannSphere {
  constructor(w, h, r) {
    this.width = w;
    this.height = h;
    this.ratio = r;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.camera = new THREE.PerspectiveCamera(70, w / h, 1, 1000);
    this.scene = new THREE.Scene();
    this.ball = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true }));
    this.setup(true);
    this.drawaxis();
  }

  init() {
    this.scene = new THREE.Scene();
    this.ball = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true }));
    this.setup(false);
    this.drawaxis();
    this.update();
  }

  setup(first) {
    this.ball.translateZ(1);
    this.ball.rotateX(Math.PI / 2); // poles to canvas

    this.scene.add(this.ball);
    this.scene.background = new THREE.Color(0x888888);
    if (first) {
      this.camera.translateZ(8);
      this.camera.translateY(2);
      this.camera.translateX(-8);
    }
    this.renderer.setPixelRatio(this.ratio);
    this.renderer.setSize(this.width, this.height);

    new OrbitControls(this.camera, this.renderer.domElement);
  }

  update() {
    this.renderer.render(this.scene, this.camera);
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  addObject(o) {
    this.scene.add(o);
  }

  drawaxis() {
    let path = new THREE.Path();
    path.moveTo(-range, 0);
    path.lineTo(range, 0);
    let lineGeometry = new THREE.BufferGeometry().setFromPoints(path.getPoints());
    let lineMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });
    this.addObject(new THREE.Line(lineGeometry, lineMaterial));

    path = new THREE.Path();
    path.moveTo(0, -range);
    path.lineTo(0, range);
    lineGeometry = new THREE.BufferGeometry().setFromPoints(path.getPoints());
    this.addObject(new THREE.Line(lineGeometry, lineMaterial));
  }

  draw(points, c) {
    let lineMaterial = new THREE.LineBasicMaterial({ color: c });
    let path = new THREE.Path();
    path.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      if (points[i][0] <= 0.001 && points[i][0] >= -0.001) {
        path = new THREE.Path();
        path.moveTo(points[i + 1][0], points[i + 1][1]);
        continue;
      }
      path.lineTo(points[i][0], points[i][1]);
      let lineGeometry = new THREE.BufferGeometry().setFromPoints(path.getPoints());
      this.addObject(new THREE.Line(lineGeometry, lineMaterial));
    }

    for (let i = 0; i < points.length; i++) {
      const p = [];
      p.push(new THREE.Vector3(points[i][0], points[i][1], 0.1));
      p.push(new THREE.Vector3(0, 0, 2));
      const geom = new THREE.BufferGeometry().setFromPoints(p);
      this.addObject(new THREE.Line(geom, lineMaterial));
    }
  }
}

//=====================================================================================//

const container = document.getElementById("show");
container.innerWidth = window.innerWidth - 20;
container.innerHeight = window.innerHeight - 60;

const butn = document.getElementById("btn");
const ftext = document.getElementById("fname");
ftext.value = "1 / x";
const riemannSphere = new RiemannSphere(container.innerWidth, container.innerHeight, window.devicePixelRatio);

initialize();


function initialize() {

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('dblclick', clear);

  butn.onclick = function () {
    riemannSphere.init();
    riemannSphere.draw(graph(ftext.value), 0xff0000);
  }

  butn.click();
  container.appendChild(riemannSphere.renderer.domElement);
  animate();
}


function clear() {
  riemannSphere.init();
}


function animate() {
  requestAnimationFrame(animate);
  riemannSphere.update();
}


function onWindowResize() {
  container.innerWidth = window.innerWidth - 20;
  container.innerHeight = window.innerHeight - 60;
  riemannSphere.resize(container.innerWidth, container.innerHeight);
}


//=====================================================================================//
// FUNCTIONS


function graph(usrfnc) {
  let points = [];
  for (let x = -range; x <= range; x += incr) {
    if (x == 0) continue;
    let tmp = [x, eval(usrfnc)];
    points.push(tmp);
  }
  return points;
}
