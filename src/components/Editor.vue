<template>
  <Viewer v-bind:component='component' v-bind:tool='tool'/>
</template>

<script>
import Viewer from './Viewer.vue';
import {DrawTool} from '../tools/draw-tool.js';
import AssetsService from '../api-services/assets.js';
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';
import {Group} from 'three';
import {Mesh} from 'three';
import {MeshPhongMaterial} from 'three';

export default {
  name: 'editor',
  components: {
    Viewer,
  },
  data: function() {
    return {
      component: new Group,
      tool: new DrawTool,
    };
  },
  mounted() {
    const query = window.location.search;
    const params = new URLSearchParams( query );
    const asset = params.get( 'asset' );
    const loader = new STLLoader();
    const scope = this;

    if (asset) {
      console.log('asset -> ', asset);

      AssetsService.get( asset )
          .then(( response ) => {
            console.log( response.data.data.url );

            loader.load( response.data.data.url, function( geometry ) {
              console.log('START');
              const material = new MeshPhongMaterial( {color: 0x00bbee,
                specular: 0x111111,
                shininess: 10} );
              const mesh = new Mesh( geometry, material );
              mesh.translation = geometry.center();
              console.log('New mesh! ', mesh);
              scope.component.add(mesh);
            });
          }).catch((error) => {
            console.log( error );
          });
    }
  },

};
</script>

<style>
</style>
