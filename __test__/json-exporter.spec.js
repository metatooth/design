import {BufferAttribute} from 'three';
import {BufferGeometry} from 'three';
import {Geometry} from 'three';
import {Line} from 'three';
import {LineBasicMaterial} from 'three';
import {Mesh} from 'three';
import {MeshPhongMaterial} from 'three';
import {MeshStandardMaterial} from 'three';
import {Object3D} from 'three';
import {Points} from 'three';
import {PointsMaterial} from 'three';
import {Vector3} from 'three';

import {JSONExporter} from '../src/exporters/JSONExporter.js';

describe('JSONExporter', () => {
  test('constructor', () => {
    expect(new JSONExporter()).toEqual(expect.anything());
  });

  test('parse - metadata', () => {
    const object = new Object3D();
    const exporter = new JSONExporter();
    exporter.parse( object, function( json ) {
      expect(json.__metadata__.version).toStrictEqual(100);
      expect(json.__metadata__.format).toStrictEqual('assimp2json');
    });
  });

  test('parse - meshref', () => {
    const comp = new Object3D();
    const mesh = new Mesh(new Geometry(),
        new MeshPhongMaterial({color: 0x00bbee,
          specular: 0x222222,
          shininess: 40}));
    mesh.sourceUrl = 'https://path/to/asset/stl';
    comp.add(mesh);

    const exporter = new JSONExporter();
    exporter.parse( comp, function( json ) {
      expect(json.rootnode.children.length).toBe(1);

      const child = json.rootnode.children[0];
      expect(child.meshrefs.length).toBe(1);
      expect(child.meshrefs[0]).toBe(0);

      const meshref = json.meshrefs[child.meshrefs[0]];
      expect(meshref.materialindex).toBe(0);
      expect(meshref.url).toBe(mesh.sourceUrl);

      const material = json.materials[meshref.materialindex];
      expect(material.properties.length).toEqual(4);
      material.properties.forEach((prop) => {
        if (prop.key === '?mat.name') {
          expect(prop.value).toBe('DefaultMaterial');
        } else if (prop.key === '?clr.diffuse') {
          expect(prop.value[0]).toBeCloseTo(0.000);
          expect(prop.value[1]).toBeCloseTo(0.733);
          expect(prop.value[2]).toBeCloseTo(0.933);
        } else if (prop.key === '?clr.specular') {
          expect(prop.value[0]).toBeCloseTo(0.133);
          expect(prop.value[1]).toBeCloseTo(0.133);
          expect(prop.value[2]).toBeCloseTo(0.133);
        } else if (prop.key === '?clr.shininess') {
          expect(prop.value).toEqual(40);
        }
      });
    });
  });

  test('parse - points', () => {
    const comp = new Object3D();

    const points = [];
    points.push( new Vector3( -10, 0, 0 ) );
    points.push( new Vector3( 0, 10, 0 ) );
    points.push( new Vector3( 10, 0, 0 ) );
    const geometry = new BufferGeometry().setFromPoints( points );

    comp.add(new Points(geometry, new PointsMaterial({color: 0x00bbee})));

    const exporter = new JSONExporter();
    exporter.parse( comp, function( json ) {
      expect(json.meshes.length).toEqual(1);

      const mesh = json.meshes[0];

      expect(mesh.materialindex).toEqual(0);
      expect(mesh.primitivetypes).toEqual(1);
      expect(mesh.vertices.length).toEqual(3*3);

      expect(mesh.vertices[0]).toBeCloseTo(-10);
      expect(mesh.vertices[1]).toBeCloseTo(0);
      expect(mesh.vertices[2]).toBeCloseTo(0);

      expect(mesh.vertices[3]).toBeCloseTo(0);
      expect(mesh.vertices[4]).toBeCloseTo(10);
      expect(mesh.vertices[5]).toBeCloseTo(0);

      expect(mesh.vertices[6]).toBeCloseTo(10);
      expect(mesh.vertices[7]).toBeCloseTo(0);
      expect(mesh.vertices[8]).toBeCloseTo(0);
    });
  });

  test('parse - line', () => {
    const comp = new Object3D();

    const points = [];
    points.push( new Vector3( -10, 0, 0 ) );
    points.push( new Vector3( 0, 10, 0 ) );
    points.push( new Vector3( 10, 0, 0 ) );
    const geometry = new BufferGeometry().setFromPoints( points );

    comp.add(new Line(geometry, new LineBasicMaterial({color: 0x00bbee})));

    const exporter = new JSONExporter();
    exporter.parse( comp, function( json ) {
      expect(json.meshes.length).toEqual(1);

      const mesh = json.meshes[0];

      expect(mesh.materialindex).toEqual(0);
      expect(mesh.primitivetypes).toEqual(2);
      expect(mesh.vertices.length).toEqual(3*3);

      expect(mesh.vertices[0]).toBeCloseTo(-10);
      expect(mesh.vertices[1]).toBeCloseTo(0);
      expect(mesh.vertices[2]).toBeCloseTo(0);

      expect(mesh.vertices[3]).toBeCloseTo(0);
      expect(mesh.vertices[4]).toBeCloseTo(10);
      expect(mesh.vertices[5]).toBeCloseTo(0);

      expect(mesh.vertices[6]).toBeCloseTo(10);
      expect(mesh.vertices[7]).toBeCloseTo(0);
      expect(mesh.vertices[8]).toBeCloseTo(0);
    });
  });

  test('parse - mesh', () => {
    const comp = new Object3D();

    const geometry = new BufferGeometry();
    const array = new Float32Array( [-1, -1, -1, 1, 1, 1, 4, 4, 4] );
    geometry.setAttribute( 'position', new BufferAttribute( array, 3 ) );

    const meshIn = new Mesh( geometry,
        new MeshStandardMaterial( {color: 0x00bbee} ) );
    meshIn.name = 'test_mesh';
    comp.add(meshIn);

    const exporter = new JSONExporter();
    exporter.parse( comp, function( json ) {
      expect(json.meshes.length).toEqual(1);

      const mesh = json.meshes[0];

      expect(mesh.materialindex).toEqual(0);
      expect(mesh.primitivetypes).toEqual(4);
      expect(mesh.vertices.length).toEqual(3*3);

      expect(mesh.vertices[0]).toBeCloseTo(-1);
      expect(mesh.vertices[1]).toBeCloseTo(-1);
      expect(mesh.vertices[2]).toBeCloseTo(-1);

      expect(mesh.vertices[3]).toBeCloseTo(1);
      expect(mesh.vertices[4]).toBeCloseTo(1);
      expect(mesh.vertices[5]).toBeCloseTo(1);

      expect(mesh.vertices[6]).toBeCloseTo(4);
      expect(mesh.vertices[7]).toBeCloseTo(4);
      expect(mesh.vertices[8]).toBeCloseTo(4);
    });
  });
});
