<template>
  <div id="editor" @keydown="key($event)" @keyup="key($event)">
    <nav class="navbar is-fixed-top is-transparent"
         role="navigation"
         aria-label="main navigation">
      <div class="navbar-brand">
        <a class="navbar-item" href="https://metatooth.com" target="_blank">
          <img src="./assets/logo.png" alt="Metatooth">
        </a>
      </div>
      <div class="navbar-menu">
        <div class="navbar-start">
        </div>
        <div class="navbar-end">
          <div class="navbar-item" v-if=assetUrl>
            <a class="button"  v-bind:href=assetUrl>
              <font-awesome-icon icon="download" />
            </a>
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

import {Vector3} from 'three';

import {ComponentNameVar} from './component-name-var.js';
import {DrawTool} from './tools/draw-tool.js';
import {DijkstraCmd} from './commands/dijkstra-cmd.js';
import {MarkTool} from './tools/mark-tool.js';
import {ModifiedStatusVar} from './modified-status-var.js';
import {RedoCmd} from './commands/redo-cmd.js';
import {SaveCmd} from './commands/save-cmd.js';
import {SelectTool} from './tools/select-tool.js';
import {UndoCmd} from './commands/undo-cmd.js';

import Viewer from './Viewer.vue';

export default {
  name: 'editor',
  components: {
    Viewer,
  },
  props: {
    uri: String,
  },
  data: function() {
    return {
      assetUrl: null,
      component: null,
      modes: ['view', 'mark', 'draw', 'select'],
      mode: 'view',
      modified: null,
      name: null,
      tool: null,
    };
  },
  watch: {
    uri: function( newVal, oldVal ) {
      this.unidraw().catalog.retrieve(newVal)
          .then((response) => {
            console.log(response);
            this.component = response;
            this.name = new ComponentNameVar(this.component,
                this.$parent.catalog);
            this.modified = new ModifiedStatusVar(this.component);
            if (this.component.children[0].type === 'Mesh') {
              this.assetUrl = this.component.children[0].sourceUrl;
            }
          });
    },
    component: function( newVal, oldVal ) {
      if (newVal) {
        document.body.style.cursor = 'default';
      }
    },
    mode: function( newVal, oldVal ) {
      if ( this.mode == this.modes[0] ) {
        this.tool = null;
        document.body.style.cursor = 'default';
      } else if ( this.mode == this.modes[1] ) {
        this.tool = new MarkTool;
        document.body.style.cursor = 'crosshair';
      } else if ( this.mode == this.modes[2] ) {
        this.tool = new DrawTool;
        document.body.style.cursor = 'crosshair';
      } else if ( this.mode == this.modes[3] ) {
        this.tool = new SelectTool;
        document.body.style.cursor = 'crosshair';
      }
    },
  },
  methods: {
    key: function( event ) {
      console.log( event.key, event.keyCode );
      if (event.type == 'keydown') {
        if ( event.keyCode == 32 ) {
          // SPACE
          console.log(this.component);
          let geometry = null;
          for (let i = 0, l = this.component.children.length; i < l; i++) {
            if (this.component.children[i].type === 'Mesh') {
              continue;
            }

            geometry = this.component.children[i].children[0].geometry;
            const positions = geometry.getAttribute('position');
            const last = (positions.count - 1) * 3;
            console.log(last);
            for (let j = 0, l = (positions.count - 1) * 3; j < l; j++) {
              const source = new Vector3(positions.array[j],
                  positions.array[j+1],
                  positions.array[j+2]);
              const target = new Vector3(positions.array[j+3],
                  positions.array[j+4],
                  positions.array[j+5]);
              const dijkstra = new DijkstraCmd(this, source, target);
              dijkstra.execute();
            }
          }
        } else if ( event.ctrlKey && event.keyCode == 83 ) {
          // Ctrl+S
          event.preventDefault();
          const save = new SaveCmd(this);
          save.execute();
        } else if ( event.ctrlKey && event.keyCode == 90 ) {
          // Ctrl+Z
          const undo = new UndoCmd(this);
          undo.execute();
        } else if ( ( event.ctrlKey && event.keyCode == 89 ) ||
            event.keyCode == 115 ) {
          // Ctrl+Y or F4
          const redo = new RedoCmd(this);
          redo.execute();
        } else if ( event.keyCode == 86 ) {
          // V - View
          this.mode = this.modes[0];
        } else if ( event.keyCode == 77 ) {
          // M - Mark
          this.mode = this.modes[1];
        } else if ( event.keyCode == 68 ) {
          // D - Draw
          this.mode = this.modes[2];
        } else if ( event.keyCode == 83 ) {
          // S - Select
          this.mode = this.modes[3];
        }
      } else if ( event.type == 'keyup' ) {
        this.mode = this.modes[0];
      }
    },
    unidraw: function() {
      return this.$parent;
    },
  },
};
</script>

<style>
</style>

