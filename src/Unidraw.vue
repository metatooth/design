<template>
<div id="unidraw">
  <div id="logo">
    <img width="200" alt="Metatooth Logo" src="./assets/logo.png">
    <br/>
    <span id="copyright">&copy; Metatooth 2020</span>
    --
    <span id="version">Version {{version}}</span>
    --
    <span id="commit">Commit {{commit}}</span>
  </div>
  <Editor v-bind:asset='asset' />
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

import Editor from './Editor.vue';

export default {
  name: 'unidraw',
  components: {
    Editor,
  },
  data: function() {
    return {
      asset: '',
      version: '',
      commit: '',
    };
  },
  mounted() {
    this.version = process.env.VUE_APP_VERSION;
    this.commit = process.env.VUE_APP_COMMIT;

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
    bottom: -50px;
    width: 100%;
    padding: 10px;
    text-align: center;
    user-select: none;
    pointer-events: none;
    z-index: 1;
}
</style>
