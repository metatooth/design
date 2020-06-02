<template>
<div id="unidraw">
  <div id="logo">
    <img width="200" alt="Metatooth Logo" src="./assets/logo.png">
  </div>
  <div id="container"/>
</div>
</template>

<script>
import {Editor} from './editor.js';

export default {
  data: function() {
    return {
      alive: true,
      editors: [],
      updated: true,
    };
  },
  mounted() {
    const query = window.location.search;
    const params = new URLSearchParams( query );
    const asset = params.get( 'asset' );

    const editor = new Editor(asset);

    this.open(editor);
    this.run();
  },
  methods: {
    close: function() {
      editor = this.editors.pop();
      editor.close();
    },
    open: function( editor ) {
      this.editors.push( editor );
      editor.open();
    },
    run: function() {
      if ( this.alive ) {
        window.requestAnimationFrame( this.run );
        this.updated = true;

        // read & handle events ??

        if (this.updated) {
          this.update(true);
        }
      }
    },
    update: function( immediate = false ) {
      if (immediate) {
        for (let i = 0, l = this.editors.length; i < l; i++) {
          this.editors[i].update();
        }
      }
      this.updated = !immediate;
    },
    quit: function() {
      this.alive = false;
    },
  },
};
</script>

<style>
#app {
    background-color: #2d2d2d;
}
#logo {
    background-color: transparent;
    position: absolute;
    bottom: 10px;
    width: 100%;
    padding: 10px;
    text-align: center;
    user-select: none;
    pointer-events: none;
    z-index: 1;
}
</style>
