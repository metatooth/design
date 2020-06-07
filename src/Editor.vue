<template>
  <div id="editor" @keydown="key($event)" @keyup="key($event)">
    <div id="info">
      <span v-bind:class="{ active: isViz }">visualize</span>
      |
      <span v-bind:class="{ active: isMark }">(m)ark</span>
      |
      <span v-bind:class="{ active: isDraw }">(d)raw</span>
    </div>
    <Viewer v-bind:object='object' v-bind:tool='tool' />
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

import {Group} from 'three';
import {Mesh} from 'three';
import {MeshPhongMaterial} from 'three';

import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';

import AssetsService from './api-services/assets.js';
import {DrawTool} from './tools/draw-tool.js';
import {MarkTool} from './tools/mark-tool.js';

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
      color: 0x00bbee,
      isDraw: false,
      isMark: false,
      isViz: true,
      object: new Group,
      specular: 0x222222,
      shininess: 50,
      tool: null,
    };
  },
  watch: {
    asset: function( newVal, oldVal ) {
      const loader = new STLLoader;
      const scope = this;
      AssetsService.get( newVal ).then(( response ) => {
        loader.load( response.data.data.url, function( geometry ) {
          const material = new MeshPhongMaterial( {color: scope.color,
            specular: scope.specular,
            shininess: scope.shininess} );
          const mesh = new Mesh( geometry, material );
          mesh.translation = geometry.center();
          scope.object.add(mesh);
          document.body.style.cursor = 'default';
        });
      }).catch(( error ) => {
        console.log( error );
      });
    },
  },
  methods: {
    key: function( event ) {
      if ( event.keyCode == 68 && event.type == 'keydown' ) {
        this.isDraw = true;
        this.isMark = false;
        this.isViz = false;
        this.tool = new DrawTool;
        document.body.style.cursor = 'crosshair';
      } else if ( event.keyCode == 77 && event.type == 'keydown' ) {
        this.isDraw = false;
        this.isMark = true;
        this.isViz = false;
        this.tool = new MarkTool;
        document.body.style.cursor = 'crosshair';
      } else if ( event.type == 'keyup' ) {
        console.log( 'keyup: ', event.keyCode, event );
        this.isDraw = false;
        this.isMark = false;
        this.isViz = true;
        this.tool = null;
        document.body.style.cursor = 'default';
      }
    },
  },
};
</script>

<style>
#info {
  position: absolute;
  color: #ff33bb;
  font-family: sans;
  font-size: larger;
  margin: 20px;

}
.active {
  font-weight: 800;
}
</style>

