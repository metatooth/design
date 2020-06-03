import {AmbientLight} from 'three';
import {BufferAttribute} from 'three';
import {BufferGeometry} from 'three';
import {CameraHelper} from 'three';
import {DirectionalLight} from 'three';
import {Group} from 'three';
import {Line} from 'three';
import {LineBasicMaterial} from 'three';
import {OrthographicCamera} from 'three';
import {Raycaster} from 'three';
import {Scene} from 'three';
import {Vector2} from 'three';
import {WebGLRenderer} from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

/**
 * Description: displays a hierarchy of objects
 * @constructor
 * @param {Editor} editor - the viewer's parent editor
 * @param {Object3D} object - the object to view
 */
function Viewer( editor, object ) {
  this.type = 'Viewer';

  this.editor = editor;
  this.object = object;

  this.aspect = 0.0;
  this.black = 0x2d2d2d;
  this.camera = null;
  this.controls = null;
  this.count = 0;
  this.frustum = 1000;
  this.highlighted = null;
  this.line = null;
  this.max = 500;
  this.mouse = new Vector2;
  this.primary = 0x00bbee;
  this.picks = new Group;
  this.radius = 0.3;
  this.raycaster = new Raycaster;
  this.renderer = new WebGLRenderer;
  this.scene = new Scene;
  this.secondary = 0xff33bb;
  this.selected = null;
  this.shift = false;
  this.start = new Vector2;
  this.threshold = 5;
  this.white = 0xffffff;
}

Object.assign( Viewer.prototype, {
  constructor: Viewer,

  isViewer: true,

  init: function() {
    const container = document.getElementById( 'container' );

    this.aspect = window.innerWidth / window.innerHeight;

    this.camera = new OrthographicCamera( this.frustum * this.aspect / -2,
        this.frustum * this.aspect / 2,
        this.frustum / 2,
        this.frustum / -2, 1, 1000 );
    this.camera.lookAt( 0, 0, 0 );
    this.camera.zoom = 10;
    this.camera.position.set( 0, 0, 10 );
    this.camera.updateProjectionMatrix();

    this.scene.add( new CameraHelper( this.camera ) );

    const ambient = new AmbientLight( this.white, 0.25 );
    this.scene.add( ambient );

    const keyLight = new DirectionalLight( this.primary, 1.0 );
    keyLight.position.set( -100, 0, 100 );

    const fillLight = new DirectionalLight( this.secondary, 0.75 );
    fillLight.position.set( 100, 0, 100 );

    const backLight = new DirectionalLight( this.white, 1.0 );
    backLight.position.set( 100, 0, -100 ).normalize();

    this.scene.add( keyLight );
    this.scene.add( fillLight );
    this.scene.add( backLight );

    this.renderer = new WebGLRenderer();
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setClearColor( this.black );

    container.appendChild( this.renderer.domElement );

    this.controls = new OrbitControls( this.camera,
        this.renderer.domElement );

    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 100;
    this.controls.maxDistance = 500;
    this.controls.maxPolarAngle = 2 * Math.PI;

    this.scene.add( this.object );

    this.scene.add( this.picks );

    const positions = new Float32Array( this.max * 3);
    const geometry = new BufferGeometry;
    geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
    geometry.setDrawRange( 0, 0 );

    const material = new LineBasicMaterial(
        {color: this.primary, linewidth: 5} );
    this.line = new Line( geometry, material );
    this.scene.add( this.line );

    window.addEventListener( 'resize', this.resize, false );

    window.addEventListener( 'mousedown', this.handle, false );
    window.addEventListener( 'mouseup', this.handle, false );
    window.addEventListener( 'mousemove', this.handle, false );
  },

  handle: function( event ) {
    console.log(this.editor);
    const tool = null;
    if ( tool && event.type == 'mousedown' ) {
      console.log( event );
    }
  },

  resize: function() {
    console.log( 'resize' );

    this.aspect = window.innerWidth / window.innerHeight;

    this.camera.left = - this.frustum * this.aspect / 2;
    this.camera.right = this.frustum * this.aspect / 2;
    this.camera.top = this.frustum / 2;
    this.camera.bottom = this.frustum / -2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );
  },

  update: function() {
    this.controls.update();
    this.renderer.render( this.scene, this.camera );
  },

  use: function( tool, event ) {
    const manipulator = tool.create( this, event );
    if (manipulator) {
      manipulator.grasp( event );

      let b = false;
      do {
        b = manipulator.manipulating( event );
      } while ( b );

      manipulator.effect( event );

      const command = this.tool.interpret( manipulator );
      command.execute();
      command.log();
    }
  },
});

export {Viewer};
