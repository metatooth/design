<template>
  <Viewer v-bind:mesh='mesh'/>
</template>

<script>
import Viewer from './Viewer.vue';
import AssetsService from '../api-services/assets';
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';
import {Mesh} from 'three';
import {MeshPhongMaterial} from 'three';

export default {

  name: 'editor',
  components: {
    Viewer,
  },
  data: function() {
    return {
      mesh: null,
    };
  },
  mounted() {
    const query = window.location.search;
    const params = new URLSearchParams( query );
    const asset = params.get( 'asset' );
    const loader = new STLLoader();
    const scope = this;

    if (asset) {
      AssetsService.get( asset )
          .then(( response ) => {
            console.log( response.data.data.url );

            loader.load( response.data.data.url, function( geometry ) {
              console.log('START');
              const material = new MeshPhongMaterial( {color: 0x00bbee,
                specular: 0x111111,
                shininess: 100} );
              scope.mesh = new Mesh( geometry, material );
              console.log('DUO');
              scope.mesh.translation = geometry.center();
              console.log('New mesh! ', scope.mesh);
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
