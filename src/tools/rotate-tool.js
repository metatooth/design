import {Tool} from './tool.js';

/**
 * Description: A tool for drawing.
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
