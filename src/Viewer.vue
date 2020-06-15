<template>
<div id="container"
     @mousemove="handle($event)"
     @mousedown="handle($event)"
     @mouseup="handle($event)" />
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
import {AxesHelper} from 'three';
import {CameraHelper} from 'three';
import {DirectionalLight} from 'three';
import {OrthographicCamera} from 'three';
import {Scene} from 'three';
import {WebGLRenderer} from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import {Component} from './components/component.js';
import {Tool} from './tools/tool.js';

export default {
  name: 'viewer',
  props: {
    component: {
      type: Component,
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
      aspect: 0.0,
      black: 0x2d2d2d,
      camera: null,
      controls: null,
      frustum: 1000,
      highlighted: null,
      line: null,
      linewidth: 7,
      manipulator: null,
      max: 500,
      primary: 0x00bbee,
      renderer: new WebGLRenderer,
      scene: new Scene,
      secondary: '#ff33bb',
      threshold: 5,
      pink: 0xff33bb,
      cyan: 0x00bbee,
      malachite: 0x00dd77,
      orange: 0xff7700,
      white: 0xffffff,
      jet: 0x2d2d2d,
    };
  },
  mounted() {
    this.init();
    this.animate();
  },
  methods: {
    animate: function() {
      requestAnimationFrame( this.animate );
      this.update();
      this.render();
    },
    editor: function() {
      return this.$parent;
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
      // initialize order is important

      this.aspect = window.innerWidth / window.innerHeight;

      this.initCamera();

      this.initLights();

      this.initRenderer();

      this.initControls();

      window.addEventListener( 'resize', this.resize, false );
    },
    initCamera: function() {
      this.camera = new OrthographicCamera( this.frustum * this.aspect / -2,
          this.frustum * this.aspect / 2,
          this.frustum / 2,
          this.frustum / -2, 1, 1000 );
      this.camera.lookAt( 0, 0, 0 );
      this.camera.zoom = 10;
      this.camera.position.set( 0, 0, 10 );
      this.camera.updateProjectionMatrix();

      this.scene.add( new CameraHelper( this.camera ) );

      this.scene.add( new AxesHelper( 10 ) );
    },
    initControls: function() {
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
      this.renderer = new WebGLRenderer();
      this.renderer.setPixelRatio( window.devicePixelRatio );
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.renderer.setClearColor( this.black );

      container.appendChild( this.renderer.domElement );
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
      return this.component.children[0];
    },
    render: function() {
      this.renderer.render( this.scene, this.camera );
    },
    resize: function() {
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
