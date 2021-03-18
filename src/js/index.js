// Code JavaScript utilisant Three.js
import * as THREE from 'three/build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { WEBGL } from 'three/examples/jsm/WebGL.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

if (!WEBGL.isWebGLAvailable()) {
	let warning = WEBGL.getWebGLErrorMessage();
	document.body.appendChild(warning);
}


//----------- FONCTIONS -----------//
function CSVToArray(strData, strDelimiter){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
            (
                // Delimiters.
                    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                        // Quoted fields.
                            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                        // Standard fields.
                            "([^\"\\" + strDelimiter + "\\r\\n]*))"
                    ),
            "gi"
    );

    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;

    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
                strMatchedDelimiter.length &&
                        (strMatchedDelimiter != strDelimiter)
                ){

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);

        }

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]){

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[2].replace(
                    new RegExp("\"\"", "g"),
                    "\""
            );

        } else {

            // We found a non-quoted value.
            var strMatchedValue = arrMatches[3];

        }

        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return arrData;
}

// Converts the positions from (lat, lon) to a position (x, y, z)
// on a sphere of a given radius.
function latLonToVector3(lat, lon, radius) {
	var phi = lat*Math.PI/180;
    var theta = (lon-180)*Math.PI/180;
    var x = -radius * Math.cos(phi) * Math.cos(theta);
    var y =  radius * Math.sin(phi);
    var z =  radius * Math.cos(phi) * Math.sin(theta);
	return new THREE.Vector3(x,y,z);
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


//---- MOUSEMOVE
let mouseNDC = new THREE.Vector2();
let mouse = new THREE.Vector2();

document.addEventListener('mousemove', (e) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;

	// Position du pointeur de la souris en NDC (entre -1 et 1)
	mouseNDC.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	mouseNDC.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
}, false);

let raycaster = new THREE.Raycaster();
let intersectedObject = null;

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
// Création d'un objet Stats
let stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// Ajout de l'interface au DOM
document.body.appendChild(stats.domElement);

let capitalGeo = new THREE.SphereBufferGeometry(0.1, 16, 16);

let floader = new THREE.FileLoader();
// URL du fichier à charger, fonction à exécuter une fois le fichier chargé
floader.load('./assets/UN_Capital_Cities_2014.csv', (data) => {
	// Ecriture des données dans un tableau
	let capitals = CSVToArray(data,";");

	// Traitement de chaque ligne du tableau
	capitals.forEach((capital) => {
		let lat = parseFloat(capital[2]);
		let lon = parseFloat(capital[3]);
        let pos = latLonToVector3(lat, lon, 15);

        let capitalMat = new THREE.MeshBasicMaterial({
            color: 0xff0000,
        })
        // Objet mesh correspondant à la capitale
        let capObj = new THREE.Mesh(capitalGeo, capitalMat);

        capObj.position.copy(pos);
        earth.add(capObj);

        capObj.infoData = {
            country: capital[0],
            capcity: capital[1],
            population: capital[4],
        }
	});
});

//----------- RENDU -----------//
function render() {
    //earth.rotation.y += 0.0025;
    //athmosphere.rotation.y += 0.0005;
    if (controlObject.animation) {
        earth.rotateY(controlObject.rotationSpeed);
        athmosphere.rotateY(.0005);
    }

    // Affichage des capitale ou non suivant la distance de la caméra
    let dist = camera.position.length();
    if (dist > 50) {
        for (let i = 0; i < earth.children.length; i++) {
            earth.children[i].visible = false;
        }
    } else {
        for (let i = 0; i < earth.children.length; i++) {
            earth.children[i].visible = true;
        }
    }

    // Calcule du rayon entre la caméra et le point survolé par la souris
    
	raycaster.setFromCamera( mouseNDC, camera );
	let intersects = raycaster.intersectObject(earth, true);

    if ((intersects.length > 1) && (intersects[1].object != earth) && (intersects[1].object != athmosphere))
	{
		if (intersects[1].object != intersectedObject)
		{
			if (intersectedObject != null)
			{
				intersectedObject.material.color.set(0xff0000);
				let element = document.getElementById("info");
				document.body.removeChild(element);
			}

			intersectedObject = intersects[1].object;
			intersectedObject.material.color.set(0x00ff00);
			
			let div = document.createElement("div");
			div.id = 'info';
			div.className = 'label';
			let country = 'Pays : ' + intersectedObject.infoData.country;
			let city = 'Capitale : ' + intersectedObject.infoData.city;
			let population = 'Population (en milliers) : ' + intersectedObject.infoData.population;
			div.innerHTML = country + '<br>' +
							city + '<br>' +
							population;
            div.style.position = "absolute";
            div.style.backgroundColor = "#f1f1f1";
			div.style.top = mouse.y + 'px';
			div.style.left = mouse.x + 'px';
			div.style.padding = '5px';
			document.body.appendChild(div);
		}
	}
	else
	{
		if (intersectedObject != null) {
			intersectedObject.material.color.set(0xff0000);
			intersectedObject = null;
			let element = document.getElementById("info");
			document.body.removeChild(element);
		}
	}
    
    // Mise à jour des paramètres de contrôle de la caméra
    controls.update();
    
	// Rendu de la scène
	renderer.render(scene, camera);
    
    // Rafraîchissement de l'affichage
	requestAnimationFrame(render);
}

render();