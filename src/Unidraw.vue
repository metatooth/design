<template>
<div id="unidraw">
  <div id="logo">
    <img width="200" alt="Metatooth Logo" src="./assets/logo.png">
  </div>
  <Editor v-bind:asset='asset' />
</div>
</template>

<script>
import Editor from './Editor.vue';

export default {
  name: 'unidraw',
  components: {
    Editor,
  },
  data: function() {
    return {
      asset: '',
    };
  },
  mounted() {
    const query = window.location.search;
    const params = new URLSearchParams( query );
    this.asset = params.get( 'asset' );
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
