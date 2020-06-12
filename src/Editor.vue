<template>
  <div id="editor" @keydown="key($event)" @keyup="key($event)">
    <nav class="navbar is-fixed-top is-transparent"
         role="navigation"
         aria-label="main navigation">
      <div class="navbar-brand">
        <a class="navbar-item" href="https://metatooth.com" target="_blank">
          <img src="./assets/logo.png" alt="Metatooth">
        </a>
        <div class="navbar-item">
          <a class="button"
             v-bind:href=assetUrl>
            <font-awesome-icon icon="download" />
          </a>
        </div>
        <div class="navbar-item">
          <div class="control">
            <label class="radio">
              <input type="radio" name="mode"
                     value="visualization" v-model="mode">
              Visualization
            </label>
            <label class="radio">
              <input type="radio" name="mode"
                     value="mark" v-model="mode">
              <u>M</u>ark
            </label>
            <label class="radio">
              <input type="radio" name="mode"
                     value="draw" v-model="mode">
              <u>D</u>raw
            </label>
          </div>
        </div>
      </div>
    </nav>
    <Viewer v-bind:component='component' v-bind:tool='tool' />
  </div>
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

import {Mesh} from 'three';
import {MeshPhongMaterial} from 'three';

import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';

import AssetsService from './api-services/assets.js';

import {Component} from './components/component.js';
import {MarkTool} from './tools/mark-tool.js';
import {DrawTool} from './tools/draw-tool.js';

import Viewer from './Viewer.vue';

export default {
  name: 'editor',
  components: {
    Viewer,
  },
  props: {
    asset: String,
  },
  data: function() {
    return {
      assetName: '',
      assetUrl: '',
      color: 0x00bbee,
      component: new Component,
      isLoaded: false,
      isDraw: false,
      isMark: false,
      isViz: true,
      mode: 'visualization',
      specular: 0x222222,
      shininess: 40,
      tool: null,
    };
  },
  watch: {
    asset: function( newVal, oldVal ) {
      const loader = new STLLoader;
      const scope = this;
      scope.assetName = 'metatooth-asset-' + newVal + '.stl';
      AssetsService.get( newVal ).then(( response ) => {
        loader.load( response.data.data.url, function( geometry ) {
          scope.assetUrl = response.data.data.url;
          const material = new MeshPhongMaterial( {color: scope.color,
            specular: scope.specular,
            shininess: scope.shininess} );
          const mesh = new Mesh( geometry, material );
          mesh.translation = geometry.center();
          scope.component = new Component(mesh);
          scope.isLoaded = true;
          document.body.style.cursor = 'default';
        });
      }).catch(( error ) => {
        console.log( error );
      });
    },
    mode: function( newVal, oldVal ) {
      this.mode = newVal;

      if ( this.mode == 'visualization' ) {
        this.tool = null;
        document.body.style.cursor = 'default';
      } else if ( this.mode == 'mark' ) {
        this.tool = new MarkTool;
        document.body.style.cursor = 'crosshair';
      } else if ( this.mode == 'draw' ) {
        this.tool = new DrawTool;
        document.body.style.cursor = 'crosshair';
      }
    },
  },
  methods: {
    key: function( event ) {
      console.log( event.keyCode, event.type );
      if ( event.keyCode == 68 && event.type == 'keydown' ) {
        this.mode = 'draw';
      } else if ( event.keyCode == 77 && event.type == 'keydown' ) {
        this.mode = 'mark';
        document.body.style.cursor = 'crosshair';
      } else if ( event.type == 'keyup' ) {
        this.mode = 'visualization';
      }
    },
  },
};
</script>

<style>
</style>

