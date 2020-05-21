import * as THREE from '../build/three.module.js';

import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { STLLoader } from './jsm/loaders/STLLoader.js';
import { WEBGL } from './jsm/WebGL.js';

let container;

let camera, controls, scene, raycaster, renderer;
let ambient, key_light, fill_light, back_light;

const frustumSize = 1000;
let aspect = window.innerWidth / window.innerHeight;

let ASSET;
let DRAG_IS_ON;
let HIGHLIGHTED;
let SELECTED;
let SHIFT_IS_DOWN;

const MOUSE = new THREE.Vector2();
const START = new THREE.Vector2();
const THRESHOLD = 5;

const PICKED_POINTS = new THREE.Group();


if ( WEBGL.isWebGLAvailable() ) {

    init();
    animate();

} else {

    const warning = WEBGL.getWebGLErrorMessage();
    document.getElementById( 'container' ).appendChild( warning );

}

function init() {

    container = document.getElementById( 'container' );

    // Camera

    camera = new THREE.OrthographicCamera( frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 1000 );
    camera.lookAt( 0, 0, 0 );
    camera.zoom = 10;
    camera.position.set( 0, 0, 10 );
    camera.updateProjectionMatrix();

    // Scene

    scene = new THREE.Scene();
    scene.add( PICKED_POINTS );

    // Lights

    ambient = new THREE.AmbientLight( 0xffffff, 0.25 );
    scene.add( ambient );

    key_light = new THREE.DirectionalLight( 0x00bbee, 1.0 );
    key_light.position.set( -100, 0, 100 );

    fill_light = new THREE.DirectionalLight( 0xff33bb, 0.75 );
    fill_light.position.set( 100, 0, 100 );

    back_light = new THREE.DirectionalLight( 0xffffff, 1.0 );
    back_light.position.set( 100, 0, -100 ).normalize();

    scene.add( key_light );
    scene.add( fill_light );
    scene.add( back_light );

    // Model

    const query_string = window.location.search;
    const url_params = new URLSearchParams( query_string );

    const asset = url_params.get( 'asset' );

    const xhttp = new XMLHttpRequest();

    xhttp.open( 'GET', 'http://localhost:9393/assets/' + asset );
    xhttp.setRequestHeader( 'Content-Type', 'application/json' );
    xhttp.setRequestHeader( 'Authorization', 'Metaspace-Token api_key=136:619746b7f0441005bfa7e945c05988fc' );

    const loader = new STLLoader();

    xhttp.onreadystatechange = function() {

	if ( this.readyState == 4 && this.status == 200 ) {

            const asset = JSON.parse( this.response ).data;

            loader.load( asset.url, function ( geometry ) {

		const material = new THREE.MeshPhongMaterial( { color: 0x00bbee, specular: 0x111111, shininess: 100 } );
		ASSET = new THREE.Mesh( geometry, material );

		ASSET.translation = geometry.center();

		scene.add( ASSET );

		const plane = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), 10 );
		//const helper = new THREE.PlaneHelper( plane, 100, 0xff33bb);
		//scene.add(helper);

		const positions = geometry.getAttribute( 'position' );
		const point = new THREE.Vector3();
		const projected = new THREE.Vector3();

		const vertices = new Float32Array( 3 * positions.array.length );

		for ( let i = 0; i < positions.array.length; i += 3 ) {

		    point.x = positions.array[ i ];
		    point.y = positions.array[ i + 1 ];
		    point.z = positions.array[ i + 2 ];

		    plane.projectPoint( point, projected );

		    vertices[ i ] = projected.x;
		    vertices[ i + 1 ] = projected.y;
		    vertices[ i + 2 ] = projected.z;
		}

		const flat = new THREE.BufferGeometry();
		flat.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		scene.add( new THREE.Mesh( flat, new THREE.MeshBasicMaterial( 0xff33bb ) ) );

		document.body.style.cursor = 'default';
		render();

            } );

	}

    };

    xhttp.send();

    scene.add( new THREE.AxesHelper( 100 ) );

    //const grid = new THREE.GridHelper(100, 25, 0xff33bb, 0x00bbee);
    //grid.position.y = -10;
    //scene.add(grid);

    // Renderer

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x2d2d2d );

    container.appendChild( renderer.domElement );

    // Controls

    controls = new OrbitControls( camera, renderer.domElement );
    controls.enablePan = false;
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.1;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxDistance = 500;
    controls.maxPolarAngle = 2 * Math.PI;

    // Raycaster

    raycaster = new THREE.Raycaster();

    // Events

    window.addEventListener( 'dblclick', dbl, false );
    window.addEventListener( 'keydown', kyb, false );
    window.addEventListener( 'keyup', kyb, false );
    window.addEventListener( 'mousedown', mdn, false );
    window.addEventListener( 'mousemove', mmv, false );
    window.addEventListener( 'mouseup', mup, false );
    window.addEventListener( 'resize', wdr, false );

}

function highlight() {

    raycaster.setFromCamera( MOUSE, camera );

    const intersects = raycaster.intersectObjects( PICKED_POINTS.children );

    if ( intersects.length > 0 ) {

	if ( intersects[ 0 ].object != HIGHLIGHTED ) {

            if ( HIGHLIGHTED ) {

		HIGHLIGHTED.material.color.setHex( HIGHLIGHTED.currentHex );

            }

            HIGHLIGHTED = intersects[ 0 ].object;
            HIGHLIGHTED.currentHex = HIGHLIGHTED.material.color.getHex();
            HIGHLIGHTED.material.color.setHex( 0xffff00 );

	}

    } else {

	if ( HIGHLIGHTED ) {

            HIGHLIGHTED.material.color.setHex( HIGHLIGHTED.currentHex );

	}

	HIGHLIGHTED = null;

    }

}

function update_selected() {

    raycaster.setFromCamera( MOUSE, camera );

    const intersects = raycaster.intersectObject( ASSET );

    if ( intersects.length > 0 ) {

	SELECTED.position.x = intersects[ 0 ].point.x;
	SELECTED.position.y = intersects[ 0 ].point.y;
	SELECTED.position.z = intersects[ 0 ].point.z;
	render();

    }

}

function pick() {

    raycaster.setFromCamera( MOUSE, camera );

    const intersects = raycaster.intersectObject( ASSET );

    if ( intersects.length > 0 ) {

	const geometry = new THREE.SphereGeometry( 0.5, 32, 32 );
	const material = new THREE.MeshPhongMaterial( { color: 0xff33bb, specular: 0x111111, shininess: 100 } );
	const sphere = new THREE.Mesh( geometry, material );
	sphere.position.x = intersects[ 0 ].point.x;
	sphere.position.y = intersects[ 0 ].point.y;
	sphere.position.z = intersects[ 0 ].point.z;
	PICKED_POINTS.add( sphere );
	render();

    }

}

function dbl( e ) {

    console.log( 'dbl' );

}

function kyb( e ) {

    console.log( 'kyb' );

    SHIFT_IS_DOWN = e.shiftKey;

    if ( e.keyCode == 46 && HIGHLIGHTED ) {

	PICKED_POINTS.remove( HIGHLIGHTED );
	HIGHLIGHTED = null;
	render();

    } else if ( SHIFT_IS_DOWN ) {

	document.body.style.cursor = 'crosshair';

    } else {

	document.body.style.cursor = 'default';

    }

}

function mdn( e ) {

    console.log( 'mdn' );

    START.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    START.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

    if ( HIGHLIGHTED ) {

	DRAG_IS_ON = true;
	SELECTED = HIGHLIGHTED;
	controls.enabled = false;

    }

}

function mmv( e ) {

    console.log( 'mmv' );

    MOUSE.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    MOUSE.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

    if ( DRAG_IS_ON ) {

	update_selected();
	controls.saveState();
	controls.enabled = false;

    } else if ( !SHIFT_IS_DOWN ) {

	highlight();

    }

}

function mup() {

    console.log( 'mup' );

    const dx = Math.abs( MOUSE.x - START.x );
    const dy = Math.abs( MOUSE.y - START.y );

    if ( dx < THRESHOLD && dy < THRESHOLD ) {

	if ( DRAG_IS_ON ) {

            // drop it
            SELECTED = null;
            HIGHLIGHTED.material.color.setHex( HIGHLIGHTED.currentHex );
            HIGHLIGHTED = null;
            controls.reset();
            controls.enabled = true;
            DRAG_IS_ON = false;

	} else if ( SHIFT_IS_DOWN ) {

            pick();

	}

    }

}

function wdr() {

    console.log( 'wdr' );

    aspect = window.innerWidth / window.innerHeight;

    camera.left = -frustumSize * aspect / 2;
    camera.rigt = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}


function animate() {

    requestAnimationFrame( animate );
    update();
    render();

}

function update() {

    controls.update();

}

function render() {

    renderer.render( scene, camera );

}