import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
let torus2;
let torus3;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x505050);
const camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 10000 );


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const ambient = new THREE.AmbientLight(0x404040); // luz ambiental suave
scene.add(ambient);


// instantiate a loader
const loader = new THREE.TextureLoader();

// load a resource
loader.load(
	// resource URL
	'./assets/images/wood.jpeg',

	// onLoad callback
	function ( texture ) {
		// in this example we create the material when the texture is loaded
    
		const material2 = new THREE.MeshBasicMaterial( {
			map: texture
		 } );
    torus3 = new THREE.Mesh( geometry, material2 ); scene.add( torus3 );
     torus3.position.x=30;
     
	},

	// onProgress callback currently not supported
	undefined,

	// onError callback
	function ( err ) {
		console.error( 'An error happened.' );
	}
);

//torus bumpmap
loader.load(
	// resource URL
	'./assets/images/grave.jpeg',

	// onLoad callback
	function ( texture ) {
		// in this example we create the material when the texture is loaded
    
		const material2 = new THREE.MeshStandardMaterial( {
       color: 0xaaaaaa,
			bumpMap: texture,
      bumpScale: 0.5
		 } );
    torus2 = new THREE.Mesh( geometry, material2 ); scene.add( torus2 );
     torus2.position.x=0;
	},

	// onProgress callback currently not supported
	undefined,

	// onError callback
	function ( err ) {
		console.error( 'An error happened.' );
	}
);

const geometry = new THREE.TorusGeometry( 10, 3, 16, 100
 ); 
const material1 = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
const torus1 = new THREE.Mesh( geometry, material1 ); scene.add( torus1 );

torus1.position.x=-30;


camera.position.set( 0, 20, 50 );



const controls = new OrbitControls( camera, renderer.domElement );
function animate() {

  requestAnimationFrame( animate );
  
  torus1.rotation.x += 0.01;
  torus1.rotation.y += 0.01;
  torus2.rotation.x += 0.01;
  torus2.rotation.y += 0.01;
  torus3.rotation.x += 0.01;
  torus3.rotation.y += 0.01;
controls.update();
  renderer.render( scene, camera );
}