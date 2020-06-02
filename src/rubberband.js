/**
 * Description: track normalized screen coordinates
 * @constructor
 * @param {Float} x - the initial x coordinate
 * @param {Float} y - the initial y coordinate
 */
function Rubberband( x, y ) {
  this.offx = x;
  this.offy = y;
}

Object.assign( Rubberband.prototype, {

  constructor: Rubberband,

  isRubberband: true,

  /**
   * @param {Float} x - the current x coordinate
   * @param {Float} y - the current y coordinate
   */
  track: function( x, y ) {
    this.trackx = x;
    this.tracky = y;
  },
});

export {Rubberband};
