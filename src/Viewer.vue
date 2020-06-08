<template>
<div id="container"
     @dblclick="dbl($event)"
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

import {Tool} from './tools/tool.js';

export default {
  name: 'viewer',
  props: {
    object: {
      type: Group,
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
    object: function( newVal, oldVal ) {
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
      linewidth: 5,
      manipulator: null,
      max: 500,
      primary: 0x00bbee,
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
    animate: function() {
      requestAnimationFrame( this.animate );
      this.update();
      this.render();
    },
    dbl: function( event ) {
      console.log('dbl');
    },
    drag: function() {
      this.raycaster.setFromCamera( this.mouse, this.camera );
      const intersects = this.raycaster.intersectObject( this.mesh() );

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

        const intersects = this.raycaster.intersectObject( this.mesh() );

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
          this.controls.reset();
          this.controls.enabled = true;
        }
      } else if (this.tool) {
        this.manipulator = this.tool.create( this, event );
        if (this.manipulator) {
          this.controls.saveState();
          this.controls.enabled = false;
          this.manipulator.grasp( event );
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
    init: function() {
      // initialize order is important

      this.aspect = window.innerWidth / window.innerHeight;

      this.initCamera();

      this.initLights();

      this.initRenderer();

      this.initControls();

      this.scene.add( this.object );

      const positions = new Float32Array( this.max * 3);
      const geometry = new BufferGeometry;
      geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
      geometry.setDrawRange( 0, 0 );

      const material = new LineBasicMaterial(
          {color: this.primary, linewidth: this.linewidth} );
      this.line = new Line( geometry, material );
      this.scene.add( this.line );

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
    mesh: function() {
      return this.object.children[0];
    },
    mmove: function( event ) {
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

        }
      }
    },
    render: function() {
      this.renderer.render( this.scene, this.camera );
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
