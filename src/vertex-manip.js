import {Group} from 'three';
import {Raycaster} from 'three';
import {Vector2} from 'three';

import {DragManip} from './drag-manip.js';

/**
 * Description: Mousedown. Drag... Mouseup.
 * @param {Viewer} viewer - visualization
 * @param {Rubberband} rubberband - used to track mouse movement
 */
function VertexManip( viewer, rubberband ) {
  DragManip.call( this );

  this.type = 'VertexManip';

  this.picks = null;

  this.raycaster = new Raycaster;

  this.radius = 0.3;
  this.div = 32;
  this.color = 0xff33bb;
  this.specular = 0x111111;
  this.shininess = 100;
}

VertexManip.prototype = Object.assign( Object.create( DragManip.prototype ), {
  constructor: VertexManip,

  isVertexManip: true,

  /**
   * @param {Event} event - is dragging
   * @return {boolean}
   */
  manipulating: function( event ) {
    console.log('vertex manip --> ', event.type);

    if ( !this.picks ) {
      this.picks = new Group;
      this.viewer.scene.add( this.picks );
    }

    const x = ( event.clientX / window.innerWidth ) * 2 - 1;
    const y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    if ( event.ctrlKey && event.type == 'mousemove' ) {
      this.rubberband.track( x, y );
    } else if ( event.ctrlKey && event.type == 'mousedown' ) {
      console.log(event.button);

      this.raycaster.setFromCamera( new Vector2( x, y ), this.viewer.camera );

      const intersects = this.raycaster.intersectObject( this.viewer.mesh() );

      if ( intersects.length > 0 ) {
        const geometry = new SphereGeometry( this.radius, this.div, this.div );
        const material = new MeshPhongMaterial( {color: this.color,
          specular: this.specular, shininess: this.shininess} );
        const sphere = new Mesh( geometry, material );
        sphere.position.x = intersects[0].point.x;
        sphere.position.y = intersects[0].point.y;
        sphere.position.z = intersects[0].point.z;

        this.picks.add( sphere );

        this.viewer.render();
      }
    } else if ( !event.ctrlKey || event.type == 'mouseup' ) {
      this.viewer.scene.remove( this.picks );
      return false;
    }
    return true;
  },
});

export {VertexManip};
