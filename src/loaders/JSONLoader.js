/**
 * @author Alexander Gessler / http://www.greentoken.de/
 * https://github.com/acgessler
 *
 * Loader for models imported with Open Asset Import Library
 * (http://assimp.sf.net) through assimp2json
 * (https://github.com/acgessler/assimp2json).
 *
 * Supports any input format that assimp supports, including 3ds, obj,
 * dae, blend, fbx, x, ms3d, lwo (and many more).
 *
 * See webgl_loader_assimp2json example.
 */

import {Color} from 'three';
import {Face3} from 'three';
import {FileLoader} from 'three';
import {Geometry} from 'three';
import {Loader} from 'three';
import {Matrix4} from 'three';
import {Mesh} from 'three';
import {MeshPhongMaterial} from 'three';
import {Object3D} from 'three';
import {Vector3} from 'three';

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

    const loader = new FileLoader( scope.manager );
    loader.setPath( scope.path );
    loader.setRequestHeader( scope.requestHeader );

    loader.load( url, function( text ) {
      const json = JSON.parse(text);
      const metadata = json.__metadata__;
      if ( typeof metadata !== 'undefined' ) {
        if ( metadata.format !== 'assimp2json' ) {
          onError('Not an assimp2json scene');
          return;
        } else if ( metadata.version < 100 || metadata.version >= 200 ) {
          onError('Unsupported assimp2json file format version');
          return;
        }
      }

      scope.parse( json ).then(( scene ) => {
        onLoad( scene );
      });
    }, onProgress, onError );
  },

  parse: function( json ) {
    const meshes = this.parseList( json.meshes, this.parseMesh );
    const meshrefs = this.parseList( json.meshrefs, this.parseMeshRef );
    const materials = this.parseList( json.materials, this.parseMaterial );
    return this.parseObject( json,
        json.rootnode,
        meshes,
        meshrefs,
        materials );
  },

  parseList: function(json, handler) {
    const items = new Array(json.length);
    for (let i = 0; i < json.length; i++) {
      items[i] = handler.call(this, json[i]);
    }
    return items;
  },

  /**
   * Create a THREE.MeshPhongMaterial from an assimp Material description
   * @param {JSON} json
   * @return {MeshPhongMaterial}
   */
  parseMaterial: function( json ) {
    /**
     * Convert array to THREE.Color
     * @param {Array} arr
     * @return {Color}
     */
    function toColor(arr) {
      const col = new Color();
      col.setRGB( arr[0], arr[1], arr[2] );
      return col;
    }

    const props = {
      flatShading: false,
    };

    json.properties.forEach( ( prop ) => {
      if ( prop.key === '?mat.name' ) {
        props.name = prop.value;
      } else if ( prop.key === '?clr.diffuse' ) {
        props.color = toColor( prop.value );
      } else if ( prop.key === '?clr.specular' ) {
        props.specular = toColor( prop.value );
      } else if ( prop.key === '?clr.ambient' ) {
        props.ambient = toColor( prop.value );
      } else if ( prop.key === '?clr.emissive' ) {
        props.emissive = toColor( prop.value );
      } else if ( prop.key === '?mat.shadingm' ) {
        if ( prop.value === 1 ) {
          props.flatShading = true;
        }
      } else if ( prop.key === '$mat.shininess' ) {
        props.shininess = prop.value;
      }
    });

    return new MeshPhongMaterial( props );
  },

  /**
   * Create a THREE.Mesh from an assimp mesh description
   * @param {JSON} json
   * @return {Geometry}
   */
  parseMesh: function( json ) {
    return new Promise((resolve) => {
      const geometry = new Geometry();

      for (let data = json.vertices, i = 0, e = data.length; i < e;) {
        const vec = new Vector3(data[i++], data[i++], data[i++]);
        geometry.vertices.push( vec );
      }

      for (let data = json.faces, i = 0, e = data.length; i < e;) {
        const face = new Face3(data[i++], data[i++], data[i++]);
        geometry.faces.push( face );
      }

      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

      resolve(geometry);
    });
  },


  /**
   * Create a THREE.Mesh from a mesh reference
   * @param {JSON} data
   * @return {Geometry}
   */
  parseMeshRef: function( data ) {
    const loader = new STLLoader();
    return new Promise((resolve) => {
      loader.load(data.url, function(geometry) {
        geometry.sourceUrl = data.url;
        resolve(geometry);
      });
    });
  },

  /**
   * Create a THREE.Object3D from an assimp Scene description
   * @param {JSON} json
   * @param {JSON} node
   * @param {Array} meshes
   * @param {Array} meshrefs
   * @param {Array} materials
   * @return {Object3D}
   */
  parseObject: function( json, node, meshes, meshrefs, materials ) {
    const o = new Object3D();

    o.name = node.name || '';
    o.matrix = new Matrix4().fromArray(node.transformation);
    o.matrix.decompose( o.position, o.quaternion, o.scale );

    const pending = [];

    for ( let i = 0; node.meshes && i < node.meshes.length; i ++ ) {
      const index = node.meshes[i];
      const geomPromise = meshes[index];
      pending.push(geomPromise);

      geomPromise.then((geometry) => {
        console.log(index,
            json.meshes[index].name,
            json.meshes[index].materialindex,
            materials[json.meshes[index].materialindex]);

        o.add(
            new Mesh( geometry, materials[json.meshes[index].materialindex] )
        );
      });
    }

    for ( let i = 0; node.meshrefs && i < node.meshrefs.length; i ++ ) {
      const index = node.meshrefs[i];
      const geomPromise = meshrefs[index];
      pending.push(geomPromise);

      geomPromise.then((geometry) => {
        o.add(
            new Mesh( geometry, materials[json.meshrefs[index].materialindex] )
        );
      });
    }

    for ( let i = 0; node.children && i < node.children.length; i ++ ) {
      const childPromise = this.parseObject( json,
          node.children[i],
          meshes,
          meshrefs,
          materials );
      pending.push(childPromise);

      childPromise.then((child) => {
        o.add( child );
      });
    }

    return Promise.all(pending).then(() => {
      return o;
    });
  },


});

export {JSONLoader};
