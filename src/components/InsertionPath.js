import {CircleGeometry} from 'three';
import {CylinderGeometry} from 'three';
import {Group} from 'three';
import {MeshPhongMaterial} from 'three';
import {Mesh} from 'three';
import {SphereGeometry} from 'three';
import {Vector3} from 'three';

/**
 * Visualizing an insertion path.
 * @constructor
 * @param {Vector3} vec a direction
 *
 */
function InsertionPath(vec) {
  Group.call(this);
  this.type = 'InsertionPath';

  this.vec = (vec !== undefined) ? vec.clone() : new Vector3(0, 1, 0);

  const overall = 15;
  const stemradius = 0.2;
  const coneradius = 0.4;
  const coneheight = 5;
  const sphere = 0.4;
  const circle = 40;
  const attr = {color: 0xff33bb};
  const h = 32;

  {
    const geometry = new CircleGeometry(circle, h);
    const material = new MeshPhongMaterial(attr);

    const mesh = new Mesh(geometry, material);

    const x = new Vector3(0, 0, -1);
    const t = x.angleTo(this.vec);
    const p = x.cross(this.vec);
    p.normalize();

    mesh.setRotationFromAxisAngle(p, t);

    this.add(mesh);
  }

  {
    const geometry =
      new CylinderGeometry(stemradius, stemradius, overall - coneheight, h, h);
    const material = new MeshPhongMaterial(attr);

    const mesh = new Mesh(geometry, material);
    mesh.position.set(0, -(overall - coneheight)/2 - coneheight, 0);

    this.add(mesh);
  }

  {
    const geometry = new CylinderGeometry(0, coneradius, coneheight, h, h);
    const material = new MeshPhongMaterial(attr);

    const mesh = new Mesh(geometry, material);
    mesh.position.set(0, -coneheight/2, 0);

    this.add(mesh);
  }

  {
    const geometry = new SphereGeometry(sphere, h, h);
    const material = new MeshPhongMaterial(attr);

    const mesh = new Mesh(geometry, material);
    mesh.position.set(0, -overall, 0);

    this.add(mesh);
  }
}

InsertionPath.prototype = Object.assign( Object.create( Group.prototype ), {
  constructor: InsertionPath,
  isInsertionPath: true,

});

export {InsertionPath};
