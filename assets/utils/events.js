class Event {
  $on(event, fn, ctx, once = false) {
    if(typeof fn !== 'function') {
      console.error('listener must be a function')
      return;
    }
    this._stores = this._stores || {};
    this._stores[event] = this._stores[event] || [];
    this._stores[event].push({ cb: fn, ctx: ctx, once });
    return this;
  };
  $once(event, fn, ctx) {
    return this.$on(event, fn, ctx, true);
  };
  $emit(event) {
    this._stores = this._stores || {};
    let args, store = this._stores[event];
    if(store) {
      store = store.slice(0);
      args = [].slice.call(arguments, 1);
      for(let i = 0, len = store.length; i < len; i++) {
        store[i].cb.apply(store[i].ctx, args);
        if(store[i].once) this.$off(event, store[i].cb);
      }
    }
    return this;
  };
  $off(event, fn) {
    this._stores = this._stores || {};
    // all
    if(!arguments.length) {
      this._stores = {};
      return;
    }
    // specific event
    const store = this._stores[event]
    if(!store) return;
    // remove all handlers
    if(arguments.length === 1) {
      delete this._stores[event];
      return;
    }
    // remove specific handler
    let cb;
    for(let i = 0, len = store.length; i < len; i++) {
      cb = store[i].cb;
      if(cb === fn) {
        store.splice(i, 1);
        break;
      }
    }
    return this;
  };
}

module.exports = Event;
