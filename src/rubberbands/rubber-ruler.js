import {RubberLine} from './rubber-line.js';

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
  this.label = null;
}

RubberRuler.prototype = Object.assign( Object.create( RubberLine.prototype ), {

  constructor: RubberRuler,

  isRubberRuler: true,

  update: function() {
    RubberLine.prototype.update.call(this);

    if (!this.label) {
      this.label = document.createElement('div');
      this.label.style.pointerEvents = 'none';
      this.label.style.position = 'absolute';
      this.label.style.margin = '0px';
      this.label.style.backgroundColor = '#fdfdfd';
      this.label.style.padding = '0px 5px 0px';
      this.label.style.borderStyle = 'dotted';
      this.label.style.borderWidth = '3px';
      this.label.style.borderColor = '#ff7700';

      document.body.appendChild(this.label);
    }

    const curr = this.current();

    this.label.innerHTML = curr[0].distanceTo(curr[1]).toFixed(1);

    const mid = this.midpoint(curr[0], curr[1]);

    mid.project( this.viewer.camera );

    const height = this.viewer.$refs.canvas.clientHeight;
    const width = this.viewer.$refs.canvas.clientWidth;

    const top = height*((-mid.y+1)/2) - (this.label.offsetHeight/2.);
    const left = width*((mid.x+1)/2) - (this.label.offsetWidth/2.);

    this.label.style.top = top + 'px';
    this.label.style.left = left + 'px';
  },

});

export {RubberRuler};
