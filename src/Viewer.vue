<template>
<canvas ref="canvas"
        @mousemove="handle($event)"
        @mousedown="handle($event)"
        @mouseup="handle($event)">
</canvas>
</template>

<script>
/*
 * Copyright (c) 1990, 1991 Stanford University
 *
 * Permission to use, copy, modify, distribute, and sell this software and its
 * documentation for any purpose is hereby granted without fee, provided
 * that the above copyright notice appear in all copies and that both that
 * copyright notice and this permission notice appear in supporting
 * documentation, and that the name of Stanford not be used in advertising or
 * publicity pertaining to distribution of the software without specific,
 * written prior permission.  Stanford makes no representations about
 * the suitability of this software for any purpose.  It is provided "as is"
 * without express or implied warranty.
 *
 * STANFORD DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE,
 * INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
 * IN NO EVENT SHALL STANFORD BE LIABLE FOR ANY SPECIAL, INDIRECT OR
 * CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE,
 * DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION
 * WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

import {AmbientLight} from 'three';
import {DirectionalLight} from 'three';
import {Object3D} from 'three';
import {OrthographicCamera} from 'three';
import {Scene} from 'three';
import {WebGLRenderer} from 'three';
import {Vector2} from 'three';
import {Vector3} from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import {Tool} from './tools/Tool.js';

export default {
  name: 'viewer',
  props: {
    component: {
      type: Object3D,
      default: function() {
        return null;
      },
    },
    tool: {
      type: Tool,
      default: function() {
        return null;
      },
    },
  },
  watch: {
    component: function( newVal, oldVal ) {
      if (this.scene) {
        this.scene.remove( oldVal );
        this.scene.add( newVal );
      }
    },
  },
  data: function() {
    return {
      black: 0x2d2d2d,
      camera: null,
      controls: null,
      cyan: 0x00bbee,
      frustum: 1000,
      highlighted: null,
      index: null,
      jet: 0x2d2d2d,
      line: null,
      linewidth: 7,
      malachite: 0x00dd77,
      manipulator: null,
      max: 500,
      orange: 0xff7700,
      pink: 0xff33bb,
      primary: 0x00bbee,
      renderer: new WebGLRenderer,
      resized: true,
      scene: new Scene,
      secondary: '#ff33bb',
      temp: null,
      threshold: 5,
      white: 0xffffff,
    };
  },
  computed: {
    editor: function() {
      return this.$parent;
    },
  },
  mounted() {
    this.init();
    this.animate();
  },
  methods: {
    animate: function() {
      if (this.resized) this.resize();
      this.update();
      this.render();
      requestAnimationFrame( this.animate );
    },
    handle: function( event ) {
      if (this.tool && this.manipulator) {
        if (this.manipulator.manipulating( event )) {
          // no op
        } else {
          this.manipulator.effect( event );

          const command = this.tool.interpret(this.manipulator);
          if (command) {
            command.execute();

            if (command.reversible()) {
              command.log();
            }
          }

          this.manipulator = null;
        }
      } else if (this.tool) {
        this.manipulator = this.tool.create( this, event );
        if (this.manipulator) {
          this.manipulator.grasp( event );
        }
      }
    },
    init: function() {
      // initialization order is important

      this.initCamera();

      this.initLights();

      this.initRenderer();

      this.initControls();

      window.addEventListener( 'resize', this.isResized, false );
    },
    initCamera: function() {
      const width = this.$refs.canvas.clientWidth;
      const height = this.$refs.canvas.clientHeight;

      this.camera = new OrthographicCamera( width / -2,
          width / 2,
          height / 2,
          height / -2, 1, 1000 );
      this.camera.lookAt( 0, 0, 0 );
      this.camera.zoom = 10;
      this.camera.position.set( 0, 0, 10 );
      this.camera.updateProjectionMatrix();
    },
    initControls: function() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);

      this.controls.enablePan = false;
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.1;
      this.controls.screenSpacePanning = false;
      this.controls.minDistance = 100;
      this.controls.maxDistance = 500;
      this.controls.maxPolarAngle = 2 * Math.PI;
    },
    initLights: function() {
      const ambient = new AmbientLight( this.white, 0.25 );

      const key = new DirectionalLight( this.primary, 1.0 );
      key.position.set( -100, 0, 100 );

      const fill = new DirectionalLight( this.secondary, 0.75 );
      fill.position.set( 100, 0, 100 );

      const back = new DirectionalLight( this.white, 1.0 );
      back.position.set( 100, 0, -100 ).normalize();

      this.scene.add( ambient );
      this.scene.add( key );
      this.scene.add( fill );
      this.scene.add( back );
    },
    initRenderer: function() {
      this.renderer = new WebGLRenderer({canvas: this.$refs.canvas});
      this.renderer.setPixelRatio( window.devicePixelRatio );
      this.renderer.setClearColor( this.black );
    },
    isResized: function() {
      this.resized = true;
    },
    luminance: function(hex, lum) {
      hex = String(hex).replace(/[^0-9a-f]/gi, '');
      if (hex.length < 6) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      }
      lum = lum || 0;

      let rgb = '#';
      let c;
      for (let i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i*2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c+(c*lum)), 255)).toString(16);
        rgb += ('00'+c).substr(c.length);
      }

      return rgb;
    },
    mesh: function() {
      if (this.index == null) {
        this.index = 0;
        while (this.component.children[this.index]) {
          if (this.component.children[this.index].name === 'maxillary') {
            break;
          }
          this.index++;
        }
      }
      return this.component.children[this.index];
    },
    /**
     * Convert mouse position to normalized device coordinates
     * (-1 to +1) for both components
     * @param {Float32} x
     * @param {Float32} y
     * @return {Vector2}
     */
    ndc: function( x, y ) {
      const mouse = new Vector2;
      mouse.x = ( x / window.innerWidth ) * 2 - 1;
      mouse.y = - ( y / window.innerHeight ) * 2 + 1;
      return mouse;
    },
    render: function() {
      this.renderer.render( this.scene, this.camera );
    },
    resize: function() {
      this.resized = false;

      const canvas = this.renderer.domElement;

      const width = this.$refs.canvas.clientWidth;
      const height = this.$refs.canvas.clientHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;

        this.renderer.setSize(width, height, false);

        this.camera.left = width / -2;
        this.camera.right = width / 2;
        this.camera.top = height / 2;
        this.camera.bottom = height / -2;
        this.camera.updateProjectionMatrix();
      }
    },
    temporary: function( obj ) {
      this.scene.remove( this.temp );
      this.temp = obj;
      this.scene.add( obj );
    },
    topleft: function( point ) {
      point.project( this.camera );

      const height = this.$refs.canvas.clientHeight;
      const width = this.$refs.canvas.clientWidth;

      const top = height*((-point.y+1)/2);
      const left = width*((point.x+1)/2);

      return new Vector2(top, left);
    },
    unproject: function( x, y ) {
      const ndc = this.ndc( x, y );
      const mouse = new Vector3(ndc.x, ndc.y, -1);

      mouse.unproject( this.camera );

      return mouse;
    },
    update: function() {
      this.controls.update();
    },
  },
};
</script>

<style>
canvas {
display: block;
height: 100vh;
width: 100vw;
}
</style>
