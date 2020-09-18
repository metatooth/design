/**
 * Exports to assimp2json format.
 * @constructor
 */
function JSONExporter() {
  this.type = 'JSONExporter';
};

JSONExporter.prototype = {
  constructor: JSONExporter,

  isJSONExporter: true,

  /**
   * Parse an object and generate assimp2json output
   * @param {Object3D} object Root component to parse
   * @param {Function} onDone Callback on completed
   * @param {Object} options options
   */
  parse: function( object, onDone, options ) {
    const outputJSON = {
      __metadata__: {
        format: 'assimp2json',
        version: 100,
      },
      rootnode: {
        name: '<MetatoothRoot>',
        transformation: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      },
    };

    const pending = [];
    const nodeMap = new Map();

    const cachedData = {
      materials: new Map(),
      meshes: new Map(),
      meshrefs: new Map(),
    };

    /**
     * Process material
     *
     * @param {THREE.Material} material Material to process
     * @return {Integer} Index of the process material in the "materials" array
     */
    function processMaterial( material ) {
      if ( cachedData.materials.has( material ) ) {
        return cachedData.materials.get( material );
      }

      const jsonMaterial = {
        properties: [
          {
            key: '?mat.name',
            semantic: 0,
            index: 0,
            type: 3,
            value: 'DefaultMaterial',
          },
        ],
      };

      if ( material.color ) {
        jsonMaterial.properties.push({
          key: '?clr.diffuse',
          semantic: 0,
          index: 0,
          type: 1,
          value: material.color.toArray(),
        });
      }

      if ( material.specular ) {
        jsonMaterial.properties.push({
          key: '?clr.specular',
          semantic: 0,
          index: 0,
          type: 1,
          value: material.specular.toArray(),
        });
      }

      if ( material.shininess ) {
        jsonMaterial.properties.push({
          key: '?mat.shininess',
          semantic: 0,
          index: 0,
          type: 1,
          value: material.shininess,
        });
      }

      if ( ! outputJSON.materials ) {
        outputJSON.materials = [];
      }

      outputJSON.materials.push( jsonMaterial );

      const index = outputJSON.materials.length - 1;
      cachedData.materials.set( material, index );

      return index;
    };

    /**
     * Process mesh as an external reference.
     *
     * @param {THREE.Mesh} mesh Mesh to process
     * @return {Integer} Index of the mesh in the "meshRefs" array
     */
    function processMeshRef( mesh ) {
      const meshCacheKey = [mesh.geometry.uuid, mesh.material.uuid].join( ':' );

      if ( cachedData.meshes.has( meshCacheKey ) ) {
        return cachedData.meshes.get( meshCacheKey );
      }

      const matIndex = processMaterial( mesh.material );

      const jsonMeshRef = {
        name: mesh.name,
        materialindex: matIndex,
        url: mesh.sourceUrl,
      };

      if ( ! outputJSON.meshrefs ) {
        outputJSON.meshrefs = [];
      }

      outputJSON.meshrefs.push( jsonMeshRef );

      const index = outputJSON.meshrefs.length - 1;
      cachedData.meshes.set( meshCacheKey, index );

      return index;
    };

    /**
     * Process mesh
     *
     * @param {THREE.Mesh} mesh Mesh to process
     * @return {Integer} Index of the processed mesh in the "meshes" array
     */
    function processMesh( mesh ) {
      const meshCacheKey = [mesh.geometry.uuid, mesh.material.uuid].join( ':' );

      if ( cachedData.meshes.has( meshCacheKey ) ) {
        return cachedData.meshes.get( meshCacheKey );
      }

      const matIndex = processMaterial( mesh.material );

      let type;
      if ( mesh.isPoints ) {
        type = 1;
      } else if ( mesh.isLine ) {
        type = 2;
      } else if ( mesh.isMesh ) {
        type = 4;
      }

      const jsonMesh = {
        name: mesh.name,
        materialindex: matIndex,
        primitivetypes: type,
        vertices: mesh.geometry.getAttribute('position').array,
      };

      if ( ! outputJSON.meshes ) {
        outputJSON.meshes = [];
      }

      outputJSON.meshes.push( jsonMesh );

      const index = outputJSON.meshes.length - 1;
      cachedData.meshes.set( meshCacheKey, index );

      return index;
    };

    /**
     * @param {THREE.Object3D} object Object3D to processNode
     * @return {Integer} Index of the node in the nodes list
     */
    function processNode( object ) {
      if ( ! outputJSON.rootnode.children ) {
        outputJSON.rootnode.children = [];
      }

      const jsonNode = {};

      if ( object.matrixAutoUpdate ) {
        object.updateMatrix();
      }

      jsonNode.transformation = object.matrix.elements;

      if ( object.name !== '' ) {
        jsonNode.name = String( object.name );
      }
      if ( object.isLine || object.isPoints ) {
        const meshIndex = processMesh( object );
        if ( meshIndex !== null ) {
          jsonNode.meshes = [meshIndex];
        }
      } else if ( object.isMesh ) {
        if ( object.sourceUrl ) {
          const meshRefIndex = processMeshRef( object );
          if ( meshRefIndex !== null ) {
            jsonNode.meshrefs = [meshRefIndex];
          }
        } else {
          const meshIndex = processMesh( object );
          if ( meshIndex !== null ) {
            jsonNode.meshes = [meshIndex];
          }
        }
      }

      if ( object.children.length > 0 ) {
        const children = [];

        for (let i = 0, l = object.children.length; i < l; i ++ ) {
          const node = processNode( object.children[i] );
          if ( node !== null ) {
            children.push( node );
          }
        }

        if ( children.length > 0 ) {
          jsonNode.children = children;
        }
      }

      outputJSON.rootnode.children.push( jsonNode );

      const nodeIndex = outputJSON.rootnode.children.length - 1;
      nodeMap.set( object, nodeIndex );

      return nodeIndex;
    };

    /**
     * Process the root node of the tree
     * @param {Object3D} object
     */
    function processRootNode( object ) {
      for ( let i = 0, il = object.children.length; i < il; i ++ ) {
        processNode( object.children[i] );
      }
    };

    processRootNode( object );

    Promise.all( pending ).then( function() {
      onDone( outputJSON );
    });
  },

};

export {JSONExporter};
