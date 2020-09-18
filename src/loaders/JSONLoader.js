import {BufferAttribute} from 'three';
import {BufferGeometry} from 'three';
import {Color} from 'three';
import {FileLoader} from 'three';
import {Loader} from 'three';
import {LoaderUtils} from 'three';
import {Mesh} from 'three';
import {MeshPhongMaterial} from 'three';
import {Object3D} from 'three';

import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';

/**
 * Imports from assimp2json format.
 * @constructor
 * @param {LoadingManager} manager
 */
function JSONLoader( manager ) {
  Loader.call( this, manager );
  this.type = 'JSONLoader';
};

JSONLoader.prototype = Object.assign( Object.create( Loader.prototype ), {
  constructor: JSONLoader,

  isJSONLoader: true,

  load: function( url, onLoad, onProgress, onError ) {
    const scope = this;

    const path = ( scope.path === '' ) ?
              LoaderUtils.extractUrlBase( url ) : scope.path;

    const loader = new FileLoader( scope.manager );
    loader.setPath( scope.path );
    loader.setRequestHeader( scope.requestHeader );

    loader.load( url, function( buffer ) {
      try {
        const data = JSON.parse(buffer);
        onLoad( scope.parse( data, path ) );
      } catch ( e ) {
        if ( onError ) {
          onError( e );
        } else {
          console.error( e );
        }
        scope.manager.itemError( url );
      }
    }, onProgress, onError );
  },

  parse: function( data, path ) {
    const meta = data.__metadata__;

    if (meta.format !== 'assimp2json' || meta.version !== 100) {
      console.warn(meta.format, meta.version, 'is not supported.');
    }

    /**
     * Create a THREE.MeshPhongMaterial from an assimp Material description
     * @param {JSON} material
     * @return {MeshPhongMaterial}
     */
    function parseMaterial( material ) {
      const m = new MeshPhongMaterial();

      material.properties.forEach((prop) => {
        if (prop.key === '?clr.diffuse') {
          m.color = new Color(prop.value[0], prop.value[1], prop.value[2]);
        } else if (prop.key === '?clr.specular') {
          m.specular = new Color(prop.value[0], prop.value[1], prop.value[2]);
        } else if (prop.key === '$mat.shininess') {
          m.shininess = prop.value;
        }
      });

      return m;
    }

    /**
     * Create a THREE.Mesh from an assimp mesh description
     * @param {JSON} data
     * @param {Array} materials
     * @return {Mesh}
     */
    function parseMesh( data, materials ) {
      const geometry = new BufferGeometry();
      geometry.setAttribute( 'position',
          new BufferAttribute( data.vertices, 3 ) );
      return new Mesh(geometry, materials[data.materialindex]);
    }

    /**
     * Create a THREE.Mesh from a mesh reference
     * @param {JSON} data
     * @param {Array} materials
     * @return {Mesh}
     */
    function parseMeshRef( data, materials ) {
      const loader = new STLLoader();
      return new Promise((resolve, reject) => {
        loader.load(data.url, function(geometry) {
          const mesh = new Mesh( geometry, materials[data.materialindex] );
          mesh.translation = geometry.center();
          mesh.sourceUrl = data.url;
          resolve(mesh);
        }, undefined, reject);
      });
    }

    /**
     * Create a THREE.Object3D from an assimp Scene description
     * @param {JSON} scene
     * @param {Array} meshes
     * @param {Array} materials
     * @return {Object3D}
     */
    function parseNode( scene, meshes ) {
      const o = new Object3D();

      o.name = scene.name;
      o.matrix.elements = scene.transformation;

      if ( scene.children ) {
        for ( let i = 0; i < scene.children.length; i ++ ) {
          o.add( parseNode( scene.children[i], meshes ) );
        }
      }

      if ( scene.meshrefs ) {
        for ( let i = 0; i < scene.meshrefs.length; i ++ ) {
          meshes[scene.meshrefs[i]].then((m) => {
            o.add( m );
          });
        }
      }

      // o.matrix.decompose( o.position, o.quaternion, o.scale );

      return o;
    }

    const materials = [];
    if (data.materials) {
      for ( let i = 0; i < data.materials.length; i ++ ) {
        materials.push( parseMaterial( data.materials[i] ) );
      }
    }
    const meshes = [];
    if (data.meshrefs) {
      for ( let i = 0; i < data.meshrefs.length; i ++ ) {
        meshes.push( parseMeshRef( data.meshrefs[i], materials ) );
      }
    }

    if (data.meshes) {
      for ( let i = 0; i < data.meshes.length; i ++ ) {
        meshes.push( parseMesh( data.meshes[i], materials ) );
      }
    }

    return parseNode( data.rootnode, meshes );
  },

});

export {JSONLoader};
