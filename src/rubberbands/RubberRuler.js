import {CanvasTexture} from 'three';
import {Sprite} from 'three';
import {SpriteMaterial} from 'three';

import {RubberLine} from './RubberLine.js';

/**
 * Rubber Ruler displays distance between origin & tracked.
 * @constructor
 * @param {Viewer} viewer: use the viewer's camera to unproject points
 * @param {Vector3} fixed: the initial x, y, z coordinates
 * @param {Vector3} moving: the x, y, z coordinates from the mouse
 * @param {Vector3} off: offset x, y, z coordinates
 */
function RubberRuler( viewer, fixed, moving, off ) {
  RubberLine.call(this, fixed, moving, off);
  this.type = 'RubberRuler';

  this.viewer = viewer;

  this.canvas = document.createElement('canvas');

  const texture = new CanvasTexture( this.canvas );
  const material = new SpriteMaterial( {map: texture, toneMapped: false} );
  this.sprite = new Sprite( material );

  this.add(this.sprite);
}

RubberRuler.prototype = Object.assign( Object.create( RubberLine.prototype ), {

  constructor: RubberRuler,

  isRubberRuler: true,

  update: function() {
    RubberLine.prototype.update.call(this);

    const curr = this.current();

    const size = 128;
    const half = size / 2;

    this.canvas.width = size;
    this.canvas.height = size;

    const context = this.canvas.getContext( '2d' );

    context.beginPath();
    context.arc( half, half, half, 0, 2 * Math.PI );
    context.closePath();
    context.fillStyle = '#ff7700';
    context.fill();

    context.font = 'bolder ' + (0.7*half) + 'px serif';
    context.textAlign = 'center';
    context.fillStyle = '#fdfdfd';
    context.fillText( curr[0].distanceTo(curr[1]).toFixed(1), half, 1.2*half );

    const texture = new CanvasTexture( this.canvas );
    const material = new SpriteMaterial( {map: texture} );

    this.sprite.material = material;

    const mid = this.midpoint(curr[0], curr[1]);
    this.sprite.position.set( mid.x, mid.y, mid.z );

    const scale = half / 2 / this.viewer.controls.zoom0;
    this.sprite.scale.set(scale, scale, 1);
  },

});

export {RubberRuler};
