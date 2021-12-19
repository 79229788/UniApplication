import Comber from '@/assets/libs/comber';
import _extend from 'lodash/extend';

const MDObject = Comber.Model.extend({
  idAttribute: 'objectId',

});

const MCObject = Comber.Collection.extend({
  model: MDObject,
});

/**
 * 获取OSS数据
 * @param path
 * @param option
 * @return {Promise<*>}
 */
MDObject.getOSSData = function (path, option) {
  const opts = _extend({
    rootUrl: uni.app.macros.KDATAURL + '/' + uni.app.macros.ENV,
    latest: true,             //保证一定取出最新的数据[若为false则利用浏览器静态资源缓存]
    handler: (data) => data,  //处理原始数据
  }, option);
  return new Promise((ok, no) => {
    if(!path) return ok(null);
    path = path.indexOf('http') === 0 ? path : (opts.rootUrl + path);
    let version = '';
    if(opts.latest) version = `?v=${Date.parse(new Date()) / 1000}`;
    let retry = 0;
    (function request() {
      uni.app.request({
        url: path + version,
        method: 'GET',
      }).then(data => {
        ok(opts.handler(data));
      }).catch(error => {
        if(error.message.indexOf('not found') >= 0) {
          return ok(opts.handler(null));
        }else {
          retry ++;
          if(retry < 6) return request();
        }
        no(error);
      });
    })();
  });
};

export { MDObject, MCObject };
