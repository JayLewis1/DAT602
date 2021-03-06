var socket;
var incomingData;
var n = 800;
socket = io();
socket.on("ServerToClient", socketEvents);
//socket = io.connect('https://iot-network.herokuapp.com:3000');
socket = io.connect("http://localhost:3000");
socket.on("ServerToClient", socketEvents);

function socketEvents(message) {
  incomingData = message;
}

var container, stats;

var camera, scene, renderer;

var mesh;

var geometry = new THREE.BufferGeometry();

var triangles = 160000;
if (WEBGL.isWebGLAvailable() === false) {
  document.body.appendChild(WEBGL.getWebGLErrorMessage());
}

init();

animate();

function init() {
  container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    1,
    3500
  );

  camera.position.z = 2750;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000);
  scene.fog = new THREE.Fog(0x050505, 2000, 3500);

  scene.add(new THREE.AmbientLight(0x444444));

  var light1 = new THREE.DirectionalLight(0xffffff, 0.5);
  light1.position.set(1, 1, 1);
  scene.add(light1);

  var light2 = new THREE.DirectionalLight(0xffffff, 1.5);
  light2.position.set(0, -1, 0);
  scene.add(light2);

  var positions = [];
  var normals = [];
  var colors = [];

  var color = new THREE.Color();

  var n = 800,
    n2 = n / 2; // triangles spread in the cube
  var d = 12,
    d2 = d / 2; // individual triangle size

  var pA = new THREE.Vector3();
  var pB = new THREE.Vector3();
  var pC = new THREE.Vector3();

  var cb = new THREE.Vector3();
  var ab = new THREE.Vector3();

  for (var i = 0; i < triangles; i++) {
    // positions

    var x = Math.random() * n - n2;
    var y = Math.random() * n - n2;
    var z = Math.random() * n - n2;

    var ax = x + Math.random() * d - d2;
    var ay = y + Math.random() * d - d2;
    var az = z + Math.random() * d - d2;

    var bx = x + Math.random() * d - d2;
    var by = y + Math.random() * d - d2;
    var bz = z + Math.random() * d - d2;

    var cx = x + Math.random() * d - d2;
    var cy = y + Math.random() * d - d2;
    var cz = z + Math.random() * d - d2;

    positions.push(ax, ay, az);
    positions.push(bx, by, bz);
    positions.push(cx, cy, cz);

    // flat face normals

    pA.set(ax, ay, az);
    pB.set(bx, by, bz);
    pC.set(cx, cy, cz);

    cb.subVectors(pC, pB);
    ab.subVectors(pA, pB);
    cb.cross(ab);

    cb.normalize();

    var nx = cb.x;
    var ny = cb.y;
    var nz = cb.z;

    normals.push(nx, ny, nz);
    normals.push(nx, ny, nz);
    normals.push(nx, ny, nz);

    // colors

    var vx = x / n + 0.5;
    var vy = y / n + 0.5;
    var vz = z / n + 0.5;

    color.setRGB(vx, vy, vz);

    colors.push(color.r, color.g, color.b);
    colors.push(color.r, color.g, color.b);
    colors.push(color.r, color.g, color.b);
  }

  function disposeArray() {
    this.array = null;
  }

  geometry.addAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3).onUpload(disposeArray)
  );
  geometry.addAttribute(
    "normal",
    new THREE.Float32BufferAttribute(normals, 3).onUpload(disposeArray)
  );
  geometry.addAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3).onUpload(disposeArray)
  );

  geometry.computeBoundingSphere();

  var material = new THREE.MeshPhongMaterial({
    color: 0xaaaaaa,
    specular: 0xffffff,
    shininess: 250,
    side: THREE.DoubleSide,
    vertexColors: THREE.VertexColors
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize($(container).width(), $(container).height());

  renderer.gammaInput = true;
  renderer.gammaOutput = true;

  container.appendChild(renderer.domElement);

  // FPS counter
  // stats = new Stats();
  // container.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize($(container).width(), $(container).height());
}

setInterval(function counter() {
  console.log(incomingData);

  var colors = [];

  var color = new THREE.Color();

  var n = 800,
    n2 = n / 2; // triangles spread in the cube

  for (var i = 0; i < triangles; i++) {
    // positions

    var x = Math.random() * n - n2;
    var y = Math.random() * n - n2;
    var z = Math.random() * n - n2;

    // colors

    var vx = x / n + 0.5;
    var vy = y / n + 0.5;
    var vz = z / n + 0.5;

    color.setRGB(vx, vy, vz);

    if (incomingData <= 20) {
      colors.push(color.r, color.g, 255);
      colors.push(color.r, color.g, 100);
      colors.push(0, color.g, 255);
    } else if (incomingData > 20 && incomingData <= 22) {
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
      colors.push(200, 100, color.b);
    } else {
      colors.push(100, color.g, color.b);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
    }
  }

  function disposeArray() {
    this.array = null;
  }
  geometry.addAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3).onUpload(disposeArray)
  );
  render();
}, 5000);

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  var time = Date.now() * 0.001;

  mesh.rotation.x = time * 0.25;
  mesh.rotation.y = time * 0.5;

  renderer.render(scene, camera);
}
