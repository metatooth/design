<template>
<div id="container" v-bind:class="{ 'target' : shift }"
     @keydown.shift="shift = true"
     @keyup="shift = false"
     @click.shift="pick($event)" />
</template>

<script>
import {AmbientLight} from 'three';
import {CameraHelper} from 'three';
import {DirectionalLight} from 'three';
import {Group} from 'three';
import {Mesh} from 'three';
import {MeshPhongMaterial} from 'three';
import {OrthographicCamera} from 'three';
import {Raycaster} from 'three';
import {Scene} from 'three';
import {SphereGeometry} from 'three';
import {Vector2} from 'three';
import {WebGLRenderer} from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

export default {
  props: {
    mesh: {
      type: Object,
      default: function() {
        return new Mesh;
      },
    }},
  watch: {
    mesh: function(newVal, oldVal) {
      if (this.scene) {
        this.scene.remove( oldVal );
        this.scene.add( newVal );
      }
    },
  },
  data: function() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      controls: null,
      raycaster: null,
      mouse: null,
      start: null,
      picks: null,
      shift: false,
    };
  },
  mounted() {
    this.init();
    this.animate();
  },
  methods: {
    init: function() {
      const container = document.getElementById( 'container' );
      const frustumSize = 1000;
      console.log(window.innerWidth);
      console.log(window.innerHeight);
      console.log(container.innerWidth);
      console.log(container.innerHeight);

      const aspect = window.innerWidth / window.innerHeight;

      this.camera = new OrthographicCamera( frustumSize * aspect / -2,
          frustumSize * aspect / 2,
          frustumSize / 2,
          frustumSize / -2, 1, 1000 );
      this.camera.lookAt( 0, 0, 0 );
      this.camera.zoom = 10;
      this.camera.position.set( 0, 0, 10 );
      this.camera.updateProjectionMatrix();

      this.scene = new Scene();
      this.scene.add( new CameraHelper( this.camera ) );

      const ambient = new AmbientLight( 0xffffff, 0.25 );
      this.scene.add( ambient );

      const keyLight = new DirectionalLight( 0x00bbee, 1.0 );
      keyLight.position.set( -100, 0, 100 );

      const fillLight = new DirectionalLight( 0xff33bb, 0.75 );
      fillLight.position.set( 100, 0, 100 );

      const backLight = new DirectionalLight( 0xffffff, 1.0 );
      backLight.position.set( 100, 0, -100 ).normalize();

      this.scene.add( keyLight );
      this.scene.add( fillLight );
      this.scene.add( backLight );

      this.renderer = new WebGLRenderer();
      this.renderer.setPixelRatio( window.devicePixelRatio );
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.renderer.setClearColor( 0x2d2d2d );

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

      this.raycaster = new Raycaster;

      this.mouse = new Vector2;
      this.start = new Vector2;

      this.picks = new Group;

      this.scene.add( this.picks );
    },
    animate: function() {
      requestAnimationFrame( this.animate );
      this.update();
      this.render();
    },
    update: function() {
      this.controls.update();
    },
    render: function() {
      this.renderer.render( this.scene, this.camera );
    },
    pick: function(event) {
      console.log('pick');

      this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      this.raycaster.setFromCamera( this.mouse, this.camera );

      const intersects = this.raycaster.intersectObject( this.mesh );
      console.log(intersects.length);
      if ( intersects.length > 0 ) {
        const geometry = new SphereGeometry( 0.5, 32, 32 );
        const material = new MeshPhongMaterial( {color: 0xff33bb,
          specular: 0x111111, shininess: 100} );
        const sphere = new Mesh( geometry, material );
        console.log(intersects[0].point);
        sphere.position.x = intersects[0].point.x;
        sphere.position.y = intersects[0].point.y;
        sphere.position.z = intersects[0].point.z;

        this.picks.add( sphere );

        this.render();
      }
    },
  },
};
</script>

<style>
  canvas {
    width: 95%;
    height: 95%;
  }
  .target {
      cursor: crosshair;
  }
  .arrow {
      cursor: default;
  }
</style>
