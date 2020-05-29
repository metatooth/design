<template>
<div id="container"
     @dblclick="dbl"
     @keydown="key"
     @keyup="key"
     @mousemove="mmove($event)"
     @mousedown="mdown($event)"
     @mouseup="mup($event)" />
</template>

<script>
import {AmbientLight} from 'three';
import {BufferAttribute} from 'three';
import {BufferGeometry} from 'three';
import {CameraHelper} from 'three';
import {DirectionalLight} from 'three';
import {Group} from 'three';
import {Line} from 'three';
import {LineBasicMaterial} from 'three';
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
      aspect: 0.0,
      black: 0x2d2d2d,
      camera: null,
      controls: null,
      count: 0,
      frustum: 1000,
      highlighted: null,
      line: null,
      max: 500,
      mouse: new Vector2,
      primary: 0x00bbee,
      picks: new Group,
      radius: 0.3,
      raycaster: new Raycaster,
      renderer: new WebGLRenderer,
      scene: new Scene,
      secondary: 0xff33bb,
      selected: null,
      shift: false,
      start: new Vector2,
      threshold: 5,
      white: 0xffffff,
    };
  },
  mounted() {
    this.init();
    this.animate();
  },
  methods: {
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
    dbl: function( event ) {
      console.log('dbl');
    },
    drag: function() {
      this.raycaster.setFromCamera( this.mouse, this.camera );
      const intersects = this.raycaster.intersectObject( this.mesh );

      if ( intersects.length > 0 ) {
        this.selected.position.x = intersects[0].point.x;
        this.selected.position.y = intersects[0].point.y;
        this.selected.position.z = intersects[0].point.z;
        this.render();
      }
    },
    draw: function() {
      if (this.count < this.max * 3) {
        this.raycaster.setFromCamera( this.mouse, this.camera );

        const intersects = this.raycaster.intersectObject( this.mesh );
        if ( intersects.length > 0 ) {
          const positions = this.line.geometry.attributes.position.array;

          positions[this.count++] = intersects[0].point.x;
          positions[this.count++] = intersects[0].point.y;
          positions[this.count++] = intersects[0].point.z;

          this.line.geometry.setDrawRange( 0, this.count / 3 );
          this.line.geometry.attributes.position.needsUpdate = true;
        }
      }
    },
    highlight: function() {
      this.raycaster.setFromCamera( this.mouse, this.camera );

      const intersects = this.raycaster.intersectObjects( this.picks.children );

      if ( intersects.length > 0 ) {
        if ( intersects[0].object != this.highlighted ) {
          if ( this.highlighted ) {
            this.highlighted.material.color.setHex(
                this.highlighted.currentHex,
            );
          }

          this.highlighted = intersects[0].object;
          this.highlighted.currentHex =
            this.highlighted.material.color.getHex();
          this.highlighted.material.color.set( 0xffff00 );
        }
      } else {
        if ( this.highlighted ) {
          this.highlighted.material.color.setHex( this.highlighted.currentHex );
        }

        this.highlighted = null;
      }
    },
    key: function( event ) {
      console.log('key( event )');
      console.log('event.key -> ', event.key);
      console.log('event.shiftKey -> ', event.shiftKey);
      console.log('event.keyCode -> ', event.keyCode);

      this.shift = event.shiftKey;
      this.ctrl = event.ctrlKey;

      if ( event.keyCode == 46 && this.highlighted ) {
        this.picks.remove( this.highlighted );
        this.highlighted = null;
        this.render();
      } else if ( this.shift ) {
        document.body.style.cursor = 'crosshair';
      } else {
        document.body.style.cursor = 'default';
      }
    },
    mdown: function( event ) {
      console.log( 'mdown' );
      this.start.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.start.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      if ( this.highlighted ) {
        this.selected = this.highlighted;
        this.controls.enabled = false;
      }
    },
    mmove: function( event ) {
      console.log( 'mmove' );
      this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

      if ( this.selected ) {
        this.drag();
        this.controls.saveState();
        this.controls.enabled = false;
      } else if ( !this.shift ) {
        this.highlight();
      } else if ( this.shift ) {
        this.draw();
      }
    },
    mup: function( event ) {
      console.log( 'mup' );

      const dx = Math.abs( this.mouse.x - this.start.x );
      const dy = Math.abs( this.mouse.y - this.start.y );

      if ( dx < this.threshold && dy < this.threshold ) {
        if ( this.highlighted ) {
          // Drop
          this.highlighted.material.color.setHex( this.highlighted.currentHex );
          this.controls.reset();
          this.controls.enabled = true;
          this.selected = this.highlighted = null;
        } else if ( this.shift ) {
          // Shift+Click
          this.pick();
        }
      }
    },
    pick: function() {
      console.log( 'pick' );

      this.raycaster.setFromCamera( this.mouse, this.camera );

      const intersects = this.raycaster.intersectObject( this.mesh );

      if ( intersects.length > 0 ) {
        const geometry = new SphereGeometry( this.radius, 32, 32 );
        const material = new MeshPhongMaterial( {color: this.secondary,
          specular: 0x111111, shininess: 100} );
        const sphere = new Mesh( geometry, material );
        sphere.position.x = intersects[0].point.x;
        sphere.position.y = intersects[0].point.y;
        sphere.position.z = intersects[0].point.z;

        this.picks.add( sphere );

        this.render();
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
  },
};
</script>

<style>
  canvas {
    width: 95%;
    height: 95%;
  }
</style>
