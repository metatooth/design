/**
 * @author alteredq / http://alteredqualia.com/
 * @author Mugen87 / https://github.com/Mugen87
 *
 *  - shows frustum, line of sight and up of the camera
 *  - suitable for fast updates
 *  - based on frustum visualization in lightgl.js shadowmap example
 *      http://evanw.github.com/lightgl.js/tests/shadowmap.html
 */

import {Camera} from 'three';
import {Vector3} from 'three';
import {LineSegments} from 'three';
import {Color} from 'three';
import {LineBasicMaterial} from 'three';
import {BufferGeometry} from 'three';
import {Float32BufferAttribute} from 'three';

const _vector = new Vector3();
const _camera = new Camera();

/**
 * Description: help visualize the camera space
 * @constructor
 * @param {Camera} camera
 */
function CameraHelper( camera ) {
  const geometry = new BufferGeometry();
  const material = new LineBasicMaterial( {color: 0xffffff,
    vertexColors: true, toneMapped: false} );

  const vertices = [];
  const colors = [];

  const pointMap = {};

  // colors

  const colorFrustum = new Color( 0xff7700 );
  const colorCone = new Color( 0xff33bb );
  const colorUp = new Color( 0x00bbee );
  const colorTarget = new Color( 0x00dd77 );
  const colorCross = new Color( 0xfdfdfd );

  // near

  addLine( 'n1', 'n2', colorFrustum );
  addLine( 'n2', 'n4', colorFrustum );
  addLine( 'n4', 'n3', colorFrustum );
  addLine( 'n3', 'n1', colorFrustum );

  // far

  addLine( 'f1', 'f2', colorFrustum );
  addLine( 'f2', 'f4', colorFrustum );
  addLine( 'f4', 'f3', colorFrustum );
  addLine( 'f3', 'f1', colorFrustum );

  // sides

  addLine( 'n1', 'f1', colorFrustum );
  addLine( 'n2', 'f2', colorFrustum );
  addLine( 'n3', 'f3', colorFrustum );
  addLine( 'n4', 'f4', colorFrustum );

  // cone

  addLine( 'p', 'n1', colorCone );
  addLine( 'p', 'n2', colorCone );
  addLine( 'p', 'n3', colorCone );
  addLine( 'p', 'n4', colorCone );

  // up

  addLine( 'u1', 'u2', colorUp );
  addLine( 'u2', 'u3', colorUp );
  addLine( 'u3', 'u1', colorUp );

  // target

  addLine( 'c', 't', colorTarget );
  addLine( 'p', 'c', colorCross );

  // cross

  addLine( 'cn1', 'cn2', colorCross );
  addLine( 'cn3', 'cn4', colorCross );

  addLine( 'cf1', 'cf2', colorCross );
  addLine( 'cf3', 'cf4', colorCross );

  /**
   * Description: add a line
   * @param {Vector3} a
   * @param {Vector3} b
   * @param {Vector3} color
  */
  function addLine( a, b, color ) {
    addPoint( a, color );
    addPoint( b, color );
  }

  /**
   * Description: add a point
   * @param {String} id
   * @param {Vector3} color
  */
  function addPoint( id, color ) {
    vertices.push( 0, 0, 0 );
    colors.push( color.r, color.g, color.b );

    if ( pointMap[id] === undefined ) {
      pointMap[id] = [];
    }

    pointMap[id].push( ( vertices.length / 3 ) - 1 );
  }

  geometry.setAttribute( 'position',
      new Float32BufferAttribute( vertices, 3 ) );
  geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

  LineSegments.call( this, geometry, material );

  this.type = 'CameraHelper';

  this.camera = camera;
  if ( this.camera.updateProjectionMatrix ) {
    this.camera.updateProjectionMatrix();
  }

  this.matrix = camera.matrixWorld;
  this.matrixAutoUpdate = false;

  this.pointMap = pointMap;

  this.update();
}

CameraHelper.prototype = Object.create( LineSegments.prototype );
CameraHelper.prototype.constructor = CameraHelper;

CameraHelper.prototype.update = function() {
  const geometry = this.geometry;
  const pointMap = this.pointMap;

  const w = 1; const h = 1;

  // we need just camera projection matrix inverse
  // world matrix must be identity

  _camera.projectionMatrixInverse.copy( this.camera.projectionMatrixInverse );

  // center / target

  setPoint( 'c', pointMap, geometry, _camera, 0, 0, - 1 );
  setPoint( 't', pointMap, geometry, _camera, 0, 0, 1 );

  // near

  setPoint( 'n1', pointMap, geometry, _camera, - w, - h, - 1 );
  setPoint( 'n2', pointMap, geometry, _camera, w, - h, - 1 );
  setPoint( 'n3', pointMap, geometry, _camera, - w, h, - 1 );
  setPoint( 'n4', pointMap, geometry, _camera, w, h, - 1 );

  // far

  setPoint( 'f1', pointMap, geometry, _camera, - w, - h, 1 );
  setPoint( 'f2', pointMap, geometry, _camera, w, - h, 1 );
  setPoint( 'f3', pointMap, geometry, _camera, - w, h, 1 );
  setPoint( 'f4', pointMap, geometry, _camera, w, h, 1 );

  // up

  setPoint( 'u1', pointMap, geometry, _camera, w * 0.7, h * 1.1, - 1 );
  setPoint( 'u2', pointMap, geometry, _camera, - w * 0.7, h * 1.1, - 1 );
  setPoint( 'u3', pointMap, geometry, _camera, 0, h * 2, - 1 );

  // cross

  setPoint( 'cf1', pointMap, geometry, _camera, - w, 0, 1 );
  setPoint( 'cf2', pointMap, geometry, _camera, w, 0, 1 );
  setPoint( 'cf3', pointMap, geometry, _camera, 0, - h, 1 );
  setPoint( 'cf4', pointMap, geometry, _camera, 0, h, 1 );

  setPoint( 'cn1', pointMap, geometry, _camera, - w, 0, - 1 );
  setPoint( 'cn2', pointMap, geometry, _camera, w, 0, - 1 );
  setPoint( 'cn3', pointMap, geometry, _camera, 0, - h, - 1 );
  setPoint( 'cn4', pointMap, geometry, _camera, 0, h, - 1 );

  geometry.getAttribute( 'position' ).needsUpdate = true;
};

/**
 * Description: set point
 * @param {Vector3} point
 * @param {Map} pointMap
 * @param {BufferGeometry} geometry
 * @param {Camera} camera
 * @param {Float} x
 * @param {Float} y
 * @param {Float} z
 */
function setPoint( point, pointMap, geometry, camera, x, y, z ) {
  _vector.set( x, y, z ).unproject( camera );

  const points = pointMap[point];

  if ( points !== undefined ) {
    const position = geometry.getAttribute( 'position' );

    for ( let i = 0, l = points.length; i < l; i ++ ) {
      position.setXYZ( points[i], _vector.x, _vector.y, _vector.z );
    }
  }
}

export {CameraHelper};
