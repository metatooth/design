<template>
<div id="app">
  <div id="logo">
    <img width="200" alt="Metatooth Logo" src="./assets/logo.png">
  </div>
  <Editor/>
</div>
</template>

<script>
import Editor from './components/Editor.vue';

export default {
  name: 'app',
  components: {
    Editor,
  },
  created() {
  },
};
</script>

<style>
#app {
    background-color: #2d2d2d;
}
#logo {
    background-color: #2d2d2d;
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
