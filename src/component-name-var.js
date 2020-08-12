/*
 * Copyright (c) 1990, 1991 Stanford University
 *
 * Permission to use, copy, modify, distribute, and sell this software and its
 * documentation for any purpose is hereby granted without fee, provided
 * that the above copyright notice appear in all copies and that both that
 * copyright notice and this permission notice appear in supporting
 * documentation, and that the name of Stanford not be used in advertising or
 * publicity pertaining to distribution of the software without specific,
 * written prior permission.  Stanford makes no representations about
 * the suitability of this software for any purpose.  It is provided "as is"
 * without express or implied warranty.
 *
 * STANFORD DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE,
 * INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
 * IN NO EVENT SHALL STANFORD BE LIABLE FOR ANY SPECIAL, INDIRECT OR
 * CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE,
 * DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION
 * WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

import {NameVar} from './name-var.js';

/**
 * Description: state variables allow for dataflow and
 * component-component commuinication
 * @constructor
 * @param {Component} component
 * @param {Catalog} catalog
 */
function ComponentNameVar(component, catalog) {
  NameVar.call(this, catalog.name(component));
  this.type = 'ComponentNameVar';
  this.component = component;
  this.catalog = catalog;

  if (this.component) {
    const name = this.catalog.name(this.component);
    this.name = name;
  }
}

ComponentNameVar.prototpye =
    Object.assign( Object.create( NameVar.prototype ), {
      constructor: ComponentNameVar,

      isComponentNameVar: true,

      updateName: function() {
        if (!this.component) {
          this.name = null;
        } else {
          const name = this.catalog.name(this.component);
          this.name = name;
        }
      },
    });

export {ComponentNameVar};
