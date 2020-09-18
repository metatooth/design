import {BufferAttribute} from 'three';
import {BufferGeometry} from 'three';
import {Mesh} from 'three';
import {MeshStandardMaterial} from 'three';

import {Component} from '../src/component.js';
import {JSONExporter} from '../src/exporters/JSONExporter.js';
import {JSONLoader} from '../src/loaders/JSONLoader.js';

describe('JSONLoader', () => {
  test('constructor', () => {
    expect(new JSONLoader()).toEqual(expect.anything());
  });


  test('parse - basic', () => {
    const comp = new Component();

    const geometry = new BufferGeometry();
    const array = new Float32Array( [-1, -1, -1, 1, 1, 1, 4, 4, 4] );
    geometry.setAttribute( 'position', new BufferAttribute( array, 3 ) );

    const meshIn = new Mesh( geometry,
        new MeshStandardMaterial( {color: 0x00bbee} ) );
    meshIn.name = 'test_mesh';
    comp.add(meshIn);

    const exporter = new JSONExporter();
    const loader = new JSONLoader();

    exporter.parse( comp, function( data ) {
      loader.parse( data, './', function( json ) {
        const meshOut = json.meshes[0];
        const attrsIn = meshIn.geometry.attributes;
        const attrsOut = meshIn.geometry.attributes;

        expect(meshOut.name).toEqual(meshIn.name);
        expect(meshOut.material.color.getHex()).toEqual(
            meshIn.material.color.getHex());
        expect(attrsOut.position.array).toStrictlyEqual(attrsIn.position.array);
      });
    });
  });
});
