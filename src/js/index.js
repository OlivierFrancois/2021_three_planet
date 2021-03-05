// Code JavaScript utilisant Three.js
import * as THREE from 'three/build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { WEBGL } from 'three/examples/jsm/WebGL.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
//  import { Stats } from 'three/examples/jsm/libs/stats.module.js';

if (!WEBGL.isWebGLAvailable()) {
	let warning = WEBGL.getWebGLErrorMessage();
	document.body.appendChild(warning);
}

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight); // largeur, hauteur du rendu

document.body.appendChild(renderer.domElement);

renderer.setClearColor(0x000000, 1.0); // ou '#aaaaaa'
renderer.clear();

let fov = 45; // Angle de vue vertical
let aspect = window.innerWidth / window.innerHeight; // Rapport largeur/hauteur
let near = 1; // Distance du plan proche
let far = 1000; // Distance du plan éloigné
let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);



//----------- CAMERA -----------//
camera.position.set(0, 2, 45);
    


//----------- SCENE -----------//
let scene = new THREE.Scene();



//----------- TERRE -----------//
// Textures
let earthMap = new THREE.TextureLoader().load('./assets/textures/earthmap4k.jpg', () => {
    renderer.render(scene, camera);
});
let earthspecMap = new THREE.TextureLoader().load('./assets/textures/earthspec4k.jpg', () => {
    renderer.render(scene, camera);
});
let earthnormalMap = new THREE.TextureLoader().load('./assets/textures/earth_normalmap_flat4k.jpg', () => {
    renderer.render(scene, camera);
});
let athmosphereText = new THREE.TextureLoader().load('./assets/textures/fair_clouds_4k.png', () => {
    renderer.render(scene, camera);
});

//---- Sphère principale (géométrie, material et objet)
let earthGeometry = new THREE.SphereGeometry(15, 60, 60);
let earthMaterial = new THREE.MeshPhongMaterial({
    specularMap: earthspecMap,
    shininess: 60,
    map: earthMap,
    normalMap: earthnormalMap
});
let earth = new THREE.Mesh(earthGeometry, earthMaterial);

// Position et ajout à la scène
earth.position.set(0, 0, 0);
scene.add(earth);


//---- Athmosphère de la terre
let athmosphereGeo = new THREE.SphereGeometry(16, 60, 60);
let materialAthmosphere = new THREE.MeshPhongMaterial({
    map: athmosphereText,
    transparent: true
});
let athmosphere = new THREE.Mesh(athmosphereGeo, materialAthmosphere);
athmosphere.position.set(0, 0, 0);
earth.add(athmosphere);



//----------- BACKGROUND -----------//
// Texture pour l'arrière plan de la scène
let backgroundTexture = new THREE.TextureLoader().load('./assets/textures/starry_background.jpg', () => {
    renderer.render(scene, camera);
});
scene.background = backgroundTexture;



//----------- LUMIERE -----------//
// Lumière ambiante
let lightAmbient = new THREE.AmbientLight(0x3f3f3f);
scene.add(lightAmbient);

// Lumière directionnelle
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(200, 10, -50);
scene.add( directionalLight );

window.addEventListener('resize', () => {
    // Calcul du nouveau rapport largeur / hauteur
    camera.aspect = window.innerWidth / window.innerHeight;
    // Mise à jour de la matrice de projection
    camera.updateProjectionMatrix();
    // Mise à jour du contexte de rendu
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Nouveau rendu
    renderer.render(scene, camera);
});




//----------- CONTROLS -----------//
// Création de contrôles de type "orbital"
let controls = new OrbitControls(camera, renderer.domElement);





//----------- INTERFACE DE CONTROLE -----------//
let controlObject = {
    rotationSpeed: 0.001,
	ambientLightColor: lightAmbient.color.getHex(),
	directionalLightX: 200,
	directionalLightY: 10,
	directionalLightZ: -50,
	animation: true
}

//---- Création d'un objet GUI
var gui = new GUI();

//---- Vitesse de rotation
gui.add(controlObject, 'rotationSpeed').name('Rotation speed').min(0.0).max(1);

//---- Source de lumière ambiante
gui.addColor(controlObject, 'ambientLightColor').name('Ambient color').onChange((value) => {
    lightAmbient.color = new THREE.Color(value);
}
)
//---- Composante x de la direction de la lumière directionnelle
gui.add(controlObject, 'directionalLightX', -200, 200).name('Light X').onChange( function(value) {
    directionalLight.position.x = value;
});

//---- Composante y de la direction de la lumière directionnelle
gui.add(controlObject, 'directionalLightY', -200, 200).name('Light Y').onChange( function(value) {
    directionalLight.position.y = value;
});
//---- Composante z de la direction de la lumière directionnelle
gui.add(controlObject, 'directionalLightZ', -200, 200).name('Light Z').onChange( function(value) {
    directionalLight.position.z = value;
});

//---- On/Off animation
gui.add(controlObject, 'animation').name('Animation'); 



//----------- STATS -----------//
// // Création d'un objet Stats
// let stats = new Stats();
// stats.showPanel(1); 
// // Ajout de l'interface au DOM
// document.body.appendChild(stats.dom);


//----------- RENDU -----------//
function render() {
    //earth.rotation.y += 0.0025;
    //athmosphere.rotation.y += 0.0005;
    if (controlObject.animation) {
        earth.rotateY(controlObject.rotationSpeed);
        athmosphere.rotateY(.0005);
    }
    
    // Mise à jour des paramètres de contrôle de la caméra
    controls.update();
    
	// Rendu de la scène
	renderer.render(scene, camera);
    
    // Rafraîchissement de l'affichage
	requestAnimationFrame(render);
}

render();