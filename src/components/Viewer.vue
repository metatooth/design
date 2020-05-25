<template>
  <div id="container"/>
</template>

<script>
import {AxesHelper} from 'three';
import {AmbientLight} from 'three';
import {DirectionalLight} from 'three';
import {Mesh} from 'three';
import {OrthographicCamera} from 'three';
import {Scene} from 'three';
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
      console.log('Prop changed: ', newVal, ' | was: ', oldVal);
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
    };
  },
  mounted() {
    this.init();
    this.animate();
  },
  methods: {
    init: function() {
      console.log( 'Mesh is: ', this.mesh );
      const container = document.getElementById( 'container' );
      console.log(window.innerWidth);
      console.log(window.innerHeight);
      const frustumSize = 1000;
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

      this.scene.add( new AxesHelper( 100 ) );

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
    },
    animate: function() {
      requestAnimationFrame( this.animate );
      this.controls.update();
      this.renderer.render( this.scene, this.camera );
    },
  },
};
</script>

<style>
  canvas {
    width: 95%;
    height: 95%;
  }
</style>
