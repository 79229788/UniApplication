export default {
  /**
   * 设置cookie
   * @param key
   * @param value
   * @param time
   * @param option
   */
  set: function(key, value, time, option) {
    const opt = {
      useInterval: true,    //使用间隔时间来设置过期日期
      generateExpires: '',  //生成过期日期并指定储存的key
    };
    for(let k in (option || {})) {
      opt[k] = option[k];
    }
    let expires = '';
    if(time) {
      let dateString = '';
      if(opt.useInterval) {
        const date = new Date();
        let interval = time;
        if(time === 'long') interval = 1000 * 60 * 60 * 24 * 365 * 10;
        date.setTime(date.getTime() + interval);
        dateString = date.toGMTString();
      }else {
        dateString = time;
      }
      if(opt.generateExpires) {
        this.set(opt.generateExpires, dateString, dateString, { useInterval: false });
      }
      expires = '; expires=' + dateString;
    }
    document.cookie = key + '=' + encodeURIComponent(value) + expires + '; path=/';
  },
  /**
   * 获取cookie
   * @param key
   * @return {*}
   */
  get: function(key) {
    const keyX = key + '=';
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i ++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(keyX) === 0) return decodeURIComponent(c.substring(keyX.length, c.length));
    }
    return null;
  },
  /**
   * 删除cookie
   * @param key
   */
  del: function(key) {
    this.set(key, '', -1);
  }
}
