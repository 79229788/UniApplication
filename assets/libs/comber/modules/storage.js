import Comber from '../cb';
import _extend from 'lodash/extend';
import _isObject from 'lodash/isObject';

//********************************定义缓存类
//********************************
//********************************
const Storage = function() {};

_extend(Storage.prototype, {
  /**
   * 获取原始storage相关信息
   * @return {Promise<*>}
   */
  getOriginStorageInfo: function () {
    return new Promise((ok, no) => {
      Comber.getConfig().engine.getStorageInfo({
        success: res => ok(res),
        fail: res => no(res),
      });
    });
  },
  /**
   * 获取原始存储数据
   * @param key
   * @return {Promise<*>}
   */
  getOriginStorage: function (key) {
    return new Promise((ok, no) => {
      Comber.getConfig().engine.getStorage({
        key,
        success: res => ok(res.data),
        fail: res => no(res),
      });
    });
  },
  /**
   * 移除原始存储数据
   * @param key
   * @return {Promise<*>}
   */
  removeOriginStorage: function (key) {
    return new Promise((ok, no) => {
      Comber.getConfig().engine.removeStorage({
        key,
        success: res => ok(res),
        fail: res => no(res),
      });
    });
  },
  /**
   * 自动清理缓存数据(清理浏览时间最早的数据)
   * @return {Promise<*>}
   */
  autoClearStorage: async function () {
    const info = await this.getOriginStorageInfo();
    const currSize = info.currentSize;
    const clearSize = Math.min(
      info.limitSize * 0.9,
      Comber.getConfig().storage.clearSize
    );
    console.log(
      '当前缓存空间---' + Math.round(currSize) + 'KB',
      clearSize + 'KB时将要自动清理!'
    );
    if(currSize > clearSize) {
      console.log('开始清理缓存');
      let objects = [];
      for(let key of info.keys) {
        if(key.indexOf('@CB_') < 0) continue;
        const storageData = await this.getOriginStorage(key);
        const valueArr = storageData.split(Comber.getConfig().storage.separator);
        if(valueArr.length <= 1) continue;
        objects.push({
          key: key,
          value: valueArr[1],
          time: valueArr[0],
        });
      }
      //时间从早到晚排列
      objects = objects.sort((a, b) => b.time - a.time);
      //删除溢出的数据
      while ((await this.getOriginStorageInfo()).currentSize > clearSize) {
        const delObj = objects.pop();
        const delKey = delObj.key;
        console.log('清理缓存---' + delKey);
        await this.removeOriginStorage(delKey);
      }
    }
  },
  /**
   * 获取本地数据
   * @param key
   * @return {Promise<*>}
   */
  getStorage: function (key) {
    return new Promise((ok, no) => {
      Comber.getConfig().engine.getStorage({
        key: `@CB_${key}`,
        fail: res => no(res),
        success: res => {
          if(res.data) {
            const valueArr = res.data.split(Comber.getConfig().storage.separator);
            return ok(valueArr[valueArr.length > 1 ? 1 : 0]);
          }
          return ok(null);
        },
      });
    });
  },
  /**
   * 获取本地数据（对象）
   * @param key
   * @return {Promise<*>}
   */
  getObjectStorage: function (key) {
    return new Promise((ok, no) => {
      this.getStorage(`@CB_${key}`).then(data => {
        try {
          ok(JSON.parse(data) || null)
        }catch (error) {
          ok(null);
        }
      }).catch(error => {
        no(error)
      })
    });
  },
  /**
   * 设置本地数据
   * @param key
   * @param value
   * @return {Promise<*>}
   */
  setStorage: function (key, value) {
    return new Promise((ok, no) => {
      value = _isObject(value) ? JSON.stringify(value) : value;
      value = (new Date()).getTime() + Comber.getConfig().storage.separator + value;
      Comber.getConfig().engine.setStorage({
        key: `@CB_${key}`,
        data: value,
        fail: res => no(res),
        success: () => {
          //自动清理，忽略结果
          this.autoClearStorage().catch(() => {});
          ok();
        },
      });

    });
  },
  /**
   * 设置安全本地数据(不会被自动删除)
   * @param key
   * @param value
   * @return {Promise<*>}
   */
  setSafeStorage: function (key, value) {
    return new Promise((ok, no) => {
      Comber.getConfig().engine.setStorage({
        key: `@CB_${key}`,
        data: value,
        fail: res => no(res),
        success: () => {
          //自动清理，忽略结果
          this.autoClearStorage().catch(() => {});
          ok();
        },
      });
    });
  },
  /**
   * 删除本地数据
   * @param key
   * @return {Promise<*>}
   */
  deleteStorage: function (key) {
    return new Promise((ok, no) => {
      Comber.getConfig().engine.removeStorage({
        key: `@CB_${key}`,
        fail: res => no(res),
        success: () => {
          ok();
        },
      });
    });
  },
  /**
   * 删除本地数据(通过前缀进行批量删除)
   * @param keyPrefix
   * @return {Promise<[]>}
   */
  deleteStorageWithPrefix: function (keyPrefix) {
    const data = Comber.getConfig().engine.getStorageInfoSync();
    const tasks = [];
    for(let key of data.keys) {
      if(key.indexOf(keyPrefix) < 0) continue;
      tasks.push((() => {
        return new Promise((ok) => {
          Comber.getConfig().engine.removeStorage({
            key, success: () => ok()
          });
        })
      })());
    }
    return Promise.all(tasks);
  },
  /**
   * 删除本地数据(排除指定前缀进行批量删除)
   * @param keyPrefix
   * @return {Promise<[]>}
   */
  deleteStorageExceptPrefix: function (keyPrefix) {
    const data = Comber.getConfig().engine.getStorageInfoSync();
    const tasks = [];
    for(let key of data.keys) {
      if(key.indexOf(keyPrefix) > -1) continue;
      tasks.push((() => {
        return new Promise((ok) => {
          Comber.getConfig().engine.removeStorage({
            key, success: () => ok()
          });
        })
      })());
    }
    return Promise.all(tasks);
  },
  /**
   * 清除所有缓存[仅仅删除通过本库创建的缓存]
   * @param type
   * @param type
   * @return {Promise<*[]>}
   */
  clearStorage: function (type) {
    return this.deleteStorageWithPrefix('@CB_', type);
  },

});

export default Storage;
