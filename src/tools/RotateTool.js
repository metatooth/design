import {Tool} from './Tool.js';

/**
 * This tool is active when rotating the view.
 * @constructor
 */
function RotateTool() {
  Tool.call( this );

  this.type = 'RotateTool';
}

RotateTool.prototype = Object.assign( Object.create( Tool.prototype ), {
  constructor: RotateTool,

  isRotateTool: true,

});

export {RotateTool};
