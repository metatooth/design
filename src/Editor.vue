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
      <div class="navbar-menu" v-if=assetUrl>
        <div class="navbar-start">
          <user-control
            v-for="control in controls"
            v-bind:key="control.id"
            v-bind:keyLabel="control.id"
            v-bind:keyCode="control.id"
            v-bind:label="control.label"
            v-bind:icon="control.icon"
            v-bind:active="control.active">
          </user-control>
        </div>
        <div class="navbar-end">
          <div class="navbar-item">
            <a class="button" v-bind:href=assetUrl download>
              <span class="icon">
                <font-awesome-icon icon="download"/>
              </span>
            </a>
          </div>
        </div>
      </div>
    </nav>
    <Viewer v-bind:component='component' v-bind:tool='tool' ref="viewer"/>
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
import {DijkstraCmd} from './commands/dijkstra-cmd.js';
import {MeasureTool} from './tools/measure-tool.js';
import {ModifiedStatusVar} from './modified-status-var.js';
import {RedoCmd} from './commands/redo-cmd.js';
import {SaveCmd} from './commands/save-cmd.js';
import {UndoCmd} from './commands/undo-cmd.js';

import UserControl from './UserControl.vue';
import Viewer from './Viewer.vue';

export default {
  name: 'editor',
  components: {
    UserControl,
    Viewer,
  },
  props: {
    uri: String,
  },
  data: function() {
    return {
      assetUrl: null,
      component: null,
      modified: null,
      name: null,
      tool: null,
      controls: [
        {id: 'v', tool: null,
          label: 'view', icon: 'glasses', cursor: 'default',
          active: true},
        {id: 'm', tool: new MeasureTool,
          label: 'measure', icon: 'ruler', cursor: 'crosshair',
          active: false},
      ],
    };
  },
  watch: {
    uri: function( newVal, oldVal ) {
      this.$parent.catalog.retrieve(newVal)
          .then((response) => {
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
      document.body.style.cursor = 'default';
    },
  },
  methods: {
    activate: function(key) {
      this.tool = null;
      for (let i = 0, l = this.controls.length; i < l; i++) {
        this.controls[i].active = false;
        if (key === this.controls[i].id) {
          document.body.style.cursor = this.controls[i].cursor;
          this.tool = this.controls[i].tool;
          this.controls[i].active = true;
        }
      }
    },
    key: function( event ) {
      if (event.type == 'keydown') {
        for (let i = 0, l = this.controls.length; i < l; i++) {
          if (event.key === this.controls[i].id) {
            this.activate(event.key);
            return;
          }
        }

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
        }
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

