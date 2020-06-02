import {EventDispatcher} from 'three';
import {Group} from 'three';
import {Mesh} from 'three';
import {MeshPhongMaterial} from 'three';

import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';

import AssetsService from './api-services/assets.js';
import {DrawTool} from './tools/draw-tool.js';
import {Viewer} from './viewer.js';

/**
 * Description: associates tools and user-accessible commands with one
 * or more viewers
 * @constructor
 * @param {String} asset - locator of the asset to load
 */
function Editor( asset ) {
  this.type = 'Editor';

  this.object = new Group;
  this.tool = new DrawTool;
  this.viewers = [];

  const viewer = new Viewer(this, this.object);
  viewer.init();

  this.viewers.push(viewer);

  const loader = new STLLoader;
  const scope = this;
  AssetsService.get( asset ).then(( response ) => {
    loader.load( response.data.data.url, function( geometry ) {
      const material = new MeshPhongMaterial( {color: 0x00bbee,
        specular: 0x111111,
        shininess: 10} );
      const mesh = new Mesh( geometry, material );
      mesh.translation = geometry.center();
      scope.object.add(mesh);
    });
  }).catch(( error ) => {
    console.log( error );
  });
}

Editor.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {
  constructor: Editor,

  isEditor: true,

  handle: function( event ) {

  },

  open: function() {

  },

  update: function() {
    for (let i = 0, l = this.viewers.length; i < l; i++) {
      this.viewers[i].update();
    }
  },
});

export {Editor};
