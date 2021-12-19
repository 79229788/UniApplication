const Comber = {};

Comber.KComberStorageType = {
  localStorage: 'localStorage',
  sessionStorage: 'sessionStorage'
};

Comber.getConfig = function () {
  const defs = {
    apiUrl: '',
    debug: false,
    getTimeout: 10,
    postTimeout: 60,
    requestVersion: false,
    storage: null,
    engine: null,
    alert: () => {},
    headersHandler: (headers) => {},
    beforeGetHandler: (options, from) => {},
    beforePostHandler: (options, from) => {},
    dataHandler: (options, from) => {},
    onXHRError: (error) => {},
  };
  const storageDefs = {
    clearSize: 4500,
    separator: '@CACHE',
  };
  const storage = JSON.parse(JSON.stringify(Comber.config.storage));
  Object.assign(defs, Comber.config);
  Object.assign(defs.storage, storageDefs, storage);
  return defs;
};

/**
 * 网络请求
 * @param options
 * @return {Promise<*>}
 */
Comber.request = function (options) {
  return new Promise((ok, no) => {
    Comber.getConfig().engine.request(Object.assign({
      header: options.headers,
      success: (res) => {
        if(res.statusCode === 200) {
          ok(res);
        }else if(res.statusCode === 404) {
          no(new Error('url resource not found!'));
        }else {
          no(res);
        }
      },
      fail: (error) => {
        no(error);
      }
    }, options));
  });
};


export default Comber;
