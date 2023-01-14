import * as THREE from './node_modules/three/build/three.module'
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls'

const incr = 0.01;
const range = 32;

/**
 * Class for Riemann sphere and its renderer
 * Usually linked to some container
 */
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

  /**
   * empties the scene from any drawn functions 
   */
  init() {
    this.scene = new THREE.Scene();
    this.ball = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true }));
    this.setup(false);
    this.drawaxis();
    this.update();
  }

  /**
   * Setting up the positions and visuals of the scene
   * @param {bool} first is a boolean parameter if the setup is initiated for the first time 
   * or is it part of clearing/emptying process   
   */
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

  /**
   * updating the renderer
   */
  update() {
    this.renderer.render(this.scene, this.camera);
  }


  /**
   * Resising the renderer to fit some width and height
   * @param w the width of the new renderer  
   * @param h the height of the new renderer 
   */
  resize(w, h) {
    this.width = w;
    this.height = h;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }


  /**
   * Adding an object to the scene 
   * @param {THREE.Mesh} o object to add  
   */
  addObject(o) {
    this.scene.add(o);
  }


  /**
   * Drawing axis to help visualize the plane under the sphere 
   */
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


  /**
   * 
   * @param  points list of (x,y) points that mark the function 
   * @param c color of the line in hex notation  
   */
  draw(points, c) {
    let lineMaterial = new THREE.LineBasicMaterial({ color: c });
    let path = new THREE.Path();
    path.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      if (points[i][0] <= 0.0001 && points[i][0] >= -0.0001) {
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
if (window.innerWidth <= 700) {
  container.innerHeight = window.innerHeight - 120;
}

const butn1 = document.getElementById("btn1");
const ftext1 = document.getElementById("fname1");
ftext1.value = "1 / x";
const butn2 = document.getElementById("btn2");
const ftext2 = document.getElementById("fname2");
const butn3 = document.getElementById("btn3");
const ftext3 = document.getElementById("fname3");
const riemannSphere = new RiemannSphere(container.innerWidth, container.innerHeight, window.devicePixelRatio);

initialize();


function initialize() {

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('dblclick', clear);

  butn1.onclick = function () {
    riemannSphere.init();
    riemannSphere.draw(graph(ftext1.value), 0xff0000);
  }
  butn2.onclick = function () {
    riemannSphere.draw(graph(ftext2.value), 0xff8800);
  }
  butn3.onclick = function () {
    riemannSphere.draw(graph(ftext3.value), 0xff0088);
  }

  butn1.click();
  container.appendChild(riemannSphere.renderer.domElement);
  animate();
}

/**
 * clearing the container from any function and the input fields 
 */
function clear() {
  ftext1.value = "";
  ftext2.value = "";
  ftext3.value = "";
  riemannSphere.init();
}

/**
 * "game loop"
 */
function animate() {
  requestAnimationFrame(animate);
  riemannSphere.update();
}


/**
 * resize 
 */
function onWindowResize() {
  container.innerWidth = window.innerWidth - 20;
  container.innerHeight = window.innerHeight - 60;
  if (window.innerWidth <= 700) {
    container.innerHeight = window.innerHeight - 120;
  }
  riemannSphere.resize(container.innerWidth, container.innerHeight);
}


//=====================================================================================//
// FUNCTIONS


/**
 * 
 * @param usrfnc a string containing some mathematical notation  
 * @returns points along given function
 */
function graph(usrfnc) {
  let points = [];
  for (let x = -range; x <= range; x += incr) {
    if (x == 0) continue;
    let tmp = [x, eval(usrfnc)];
    points.push(tmp);
  }
  return points;
}
