import Comber from './cb';
import Model from './modules/model';
import Collection from './modules/collection';
import Storage from './modules/storage';
import _extend from 'lodash/extend';
import _create from 'lodash/create';
import _has from 'lodash/has';

//********************************
//********************************
// Helper function to correctly set up the prototype chain for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
Model.extend = Collection.extend = function(protoProps, staticProps) {
  const parent = this;
  let child;

  // The constructor function for the new subclass is either defined by you
  // (the "constructor" property in your `extend` definition), or defaulted
  // by us to simply call the parent constructor.
  if (protoProps && _has(protoProps, 'constructor')) {
    child = protoProps.constructor;
  } else {
    child = function(){ return parent.apply(this, arguments); };
  }

  // Add static properties to the constructor function, if supplied.
  _extend(child, parent, staticProps);

  // Set the prototype chain to inherit from `parent`, without calling
  // `parent`'s constructor function and add the prototype properties.
  child.prototype = _create(parent.prototype, protoProps);
  child.prototype.constructor = child;

  // Set a convenience property in case the parent's prototype is needed
  // later.
  child.__super__ = parent.prototype;

  return child;
};

Comber.Model = Model;
Comber.Collection = Collection;
Comber.Storage = Storage;
export default Comber;
