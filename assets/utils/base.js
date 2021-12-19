import _isDate from 'lodash/isDate';
import _isString from 'lodash/isString';
import _isObject from 'lodash/isObject';
import _isNumber from 'lodash/isNumber';
import _isNaN from 'lodash/isNaN';
import _has from 'lodash/has';
import _random from 'lodash/random';
import opacityMap from '@/configs/opacity';
import md5 from './md5';

module.exports = {
  /**
   * 拓展安全口令
   * @param obj
   * @return {string}
   */
  extendSafeString: function (obj) {
    const key = [
      String.fromCharCode(100 - 16),
      String.fromCharCode(100 + 11),
      String.fromCharCode(100 + 7),
      String.fromCharCode(100 + 1),
      String.fromCharCode(100 + 10),
    ];
    const idKey = [
      String.fromCharCode(100 - 25),
      String.fromCharCode(100 - 17),
      String.fromCharCode(100 + 1),
      String.fromCharCode(100 + 15),
      String.fromCharCode(100 + 15),
      String.fromCharCode(100 + 5),
      String.fromCharCode(100 + 11),
      String.fromCharCode(100 + 10),
      String.fromCharCode(100 - 27),
      String.fromCharCode(100),
    ];
    const name = 'y_u_t_u_o_b_a_n_g';
    const random = this.getRandomString(10, 'abcdef0123456789');
    const safe = uni.app.macros[idKey.join('').toUpperCase()] + '@' + random + '@' + name;
    obj[key.join('')] = this.btoa(md5(safe) + random);
    return obj;
  },
  /**
   * 获取格式化的日期
   * @param format
   * - yyyy 年
   * - MM   月
   * - dd   日
   * - hh   时
   * - mm   分
   * - ss   秒
   * - SS   毫秒
   * @param date 指定带格式化的日期
   * @return {*}
   */
  getDate: function(format, date = new Date()) {
    date = date || new Date();
    if(!_isDate(date)) {
      date = date.replace(/-/g, '/');
      const dateSplit = date.split('/');
      if(dateSplit.length === 2) date += this.getDate('/DD');
      if(dateSplit.length === 1) date += this.getDate('/MM/DD');
      if(dateSplit.length === 0) date = `${this.getDate('YYYY/MM/DD')} ` + date;
      date = new Date(date);
    }
    if(!format) return date;
    const o = {
      'M+': date.getMonth() + 1,
      'D+': date.getDate(),
      'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,
      'H+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds(),
      'q+': Math.floor((date.getMonth() + 3) / 3),
      'S': date.getMilliseconds()
    };
    const week = {
      '0': '\u65e5',
      '1': '\u4e00',
      '2': '\u4e8c',
      '3': '\u4e09',
      '4': '\u56db',
      '5': '\u4e94',
      '6': '\u516d'
    };
    if (/(Y+)/.test(format)) {
      format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    if (/(E+)/.test(format)) {
      format = format.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '\u661f\u671f' : '\u5468') : '') + week[date.getDay() + ''])
    }
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(format)) {
        format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
      }
    }
    return format;
  },
  /**
   * 获取随机字符串
   * @param length
   * @param str
   * @return {string}
   */
  getRandomString: function (length, str) {
    str = str || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let s = "";
    for(let i = 0; i < length; i++){
      const rand = Math.floor(Math.random() * str.length);
      s += str.charAt(rand);
    }
    return s;
  },
  /**
   * 获取数组中随机的元素
   * @param array
   * @param count
   * @return {[]}
   */
  getRandomArrayItems: function(array, count = 1) {
    if((array || []).length === 0) return [];
    if(count === 1) return [array[Math.floor(Math.random() * array.length)]];
    count = Math.min(array.length, count);
    let shuffled = array.slice(0), i = array.length, min = i - count, temp, index;
    while (i-- > min) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
    return shuffled.slice(min);
  },
  /**
   * 获取唯一时间编码（弱并发，用于特别简单场景）（18位）
   * @return {string}
   */
  getUniqueTimeCode: function() {
    const padding = (num, len) => (Array(len).join('0') + num + '').slice(-len);
    const date = new Date();
    return ''
      + (date.getFullYear() + '').slice(2)
      + padding(date.getMonth() + 1, 2)
      + padding(date.getDate(), 2)
      + padding(date.getHours(), 2)
      + padding(date.getMinutes(), 2)
      + padding(date.getSeconds(), 2)
      + padding(date.getMilliseconds(), 3)
      + _random(100, 999);
  },
  /**
   * 获取唯一时间编码[后缀随机数更长]（弱并发，用于特别简单场景）（21位）
   * @return {string}
   */
  getUniqueTimeLongCode: function() {
    const padding = (num, len) => (Array(len).join('0') + num + '').slice(-len);
    const date = new Date();
    return ''
      + (date.getFullYear() + '').slice(2)
      + padding(date.getMonth() + 1, 2)
      + padding(date.getDate(), 2)
      + padding(date.getHours(), 2)
      + padding(date.getMinutes(), 2)
      + padding(date.getSeconds(), 2)
      + padding(date.getMilliseconds(), 3)
      + _random(100000, 999999);
  },
  /**
   * 获取唯一时间编码[后缀随机数为字符串]（24位）
   * @return {string}
   */
  getUniqueTimeLongCode2: function () {
    const padding = (num, len) => (Array(len).join('0') + num + '').slice(-len);
    const date = new Date();
    return ''
      + (date.getFullYear() + '').slice(2)
      + padding(date.getMonth() + 1, 2)
      + padding(date.getDate(), 2)
      + padding(date.getHours(), 2)
      + padding(date.getMinutes(), 2)
      + padding(date.getSeconds(), 2)
      + padding(date.getMilliseconds(), 3)
      + this.getRandomString(9);
  },
  /**
   * 处理请求错误
   * @param {Object} error
   */
  handleRequestError: function (error) {
    const _error = {code: -1, message: '未知错误'};
    if(_isString(error)) {
      _error.message = error;
    }
    if(_isObject(error)) {
      //request成功，但服务器错误
      if(error.data) {
        if(_isString(error.data)) {
          _error.message = error.data;
        }
        if(_isObject(error.data)) {
          if(_has(error.data, 'code')) _error.code = error.data.code;
          if(_has(error.data, 'message')) _error.message = error.data.message;
        }
      }
      //request失败
      else {
        if(_has(error, 'errMsg')) _error.message = error.errMsg.replace('request:fail ', '') || '未知错误';
        if(_has(error, 'message')) _error.message = error.message;
      }
    }
    return _error;
  },
  /**
   * 十六进制颜色添加透明度
   * @param color
   * @param opacity
   */
  hexColorWithOpacity: function (color, opacity) {
    if(!color) return;
    opacity = Math.max(0, opacity);
    opacity = Math.min(1, opacity);
    color = color.replace('#', '');
    if(color.length === 3) color = color + color;
    return '#' + color.slice(0, 6) + (opacityMap[Math.floor(opacity * 100)] || '');
  },
  /**
   * 获取url参数对象
   * @param url
   * @return {*}
   */
  getUrlParams: function (url) {
    const param = {};
    const split = url.split('?');
    if(split.length === 2) {
      const paramArr = split[1].split('&');
      paramArr.forEach(item => {
        const arr = item.split('=');
        param[arr[0]] = arr[1];
      });
    }
    return param;
  },
  /**
   * 对比版本
   * @param v1
   * @param v2
   * @return {number}
   */
  compareVersion: function(v1, v2) {
    if(!v1 || !v2) return -1;
    v1 = v1.split('.');
    v2 = v2.split('.');
    const len = Math.max(v1.length, v2.length);
    while(v1.length < len) v1.push('0');
    while(v2.length < len) v2.push('0');
    for(let i = 0; i < len; i++) {
      const num1 = parseInt(v1[i])
      const num2 = parseInt(v2[i])
      if(num1 > num2) return 1;
      if(num1 < num2) return -1;
    }
    return 0;
  },
  /**
   * 添加URL的HASH中的参数
   * @param name
   * @param value
   * @return {undefined}
   */
  addUrlHashParam: function (name, value) {
    const paramReg = new RegExp(`[?|&]${name}=[^&]*`);
    if(location.hash.match(paramReg)) return this.replaceUrlHashParam(name, value);
    let hash = location.hash;
    hash += hash.indexOf('?') < 0 ? '?' : '&';
    hash += `${name}=${value}`;
    window.history.replaceState(null, '', hash);
  },
  /**
   * 替换URL的HASH中的参数
   * @param name
   * @param value
   */
  replaceUrlHashParam: function (name, value) {
    const paramReg = new RegExp(`([?|&]${name}=)[^&]*`);
    if(!location.hash.match(paramReg)) return this.addUrlHashParam(name, value);
    const hash = location.hash.replace(paramReg, `$1${value}`);
    window.history.replaceState(null, '', hash);
  },
  /**
   * 移除URL的HASH中的参数
   * @param name
   */
  removeUrlHashParam: function (name) {
    const paramReg = new RegExp(`[?|&]${name}=[^&]*`);
    if(!location.hash.match(paramReg)) return;
    const hash = location.hash.replace(paramReg, ``);
    window.history.replaceState(null, '', hash);
  },
  /**
   * 文本域转代码
   * @param text
   * @return {*}
   */
  textarea2code: function (text) {
    if(!text) return null;
    return text
      .replace(/[<|>]*/g, '')
      .replace(/\r\n|\n/g, '<br/>')
      .replace(/\s/g, '&nbsp;');
  },
  /**
   * 文本域转单行文本
   * @param text
   * @return {*}
   */
  textarea2text: function (text) {
    if(!text) return null;
    return text
      .replace(/\r\n|\n|\<br\/\>/g, '，')
      .replace(/(\s|&nbsp;)+/g, ' ')
      .replace(/[<>]*/g, '');
  },
  /**
   * 代码转文本域
   * @param text
   * @return {*}
   */
  code2textarea: function (text) {
    if(!text) return null;
    return text
      .replace(/\<br\/\>/g, '\n')
      .replace(/&nbsp;/g, ' ');
  },
  /**
   * 代码转单行文本
   * @param text
   * @return {*}
   */
  code2text: function (text) {
    if(!text) return null;
    return text
      .replace(/\<br\/\>/g, '，')
      .replace(/(&nbsp;)+/g, ' ');
  },
  /**
   * 字符串转base64
   * @param string
   * @return {string}
   */
  btoa: function(string) {
    string = String(string);
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
      b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
    var bitmap, a, b, c,
      result = "",
      i = 0,
      rest = string.length % 3; // To determine the final padding
    for (; i < string.length;) {
      if ((a = string.charCodeAt(i++)) > 255 ||
        (b = string.charCodeAt(i++)) > 255 ||
        (c = string.charCodeAt(i++)) > 255)
        throw new TypeError("Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.");

      bitmap = (a << 16) | (b << 8) | c;
      result += b64.charAt(bitmap >> 18 & 63) + b64.charAt(bitmap >> 12 & 63) +
        b64.charAt(bitmap >> 6 & 63) + b64.charAt(bitmap & 63);
    }
    // If there's need of padding, replace the last 'A's with equal signs
    return rest ? result.slice(0, rest - 3) + "===".substring(rest) : result;
  },
  /**
   * base64转字符串
   * @param string
   * @return {string}
   */
  atob: function(string) {
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
      b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
    // atob can work with strings with whitespaces, even inside the encoded part,
    // but only \t, \n, \f, \r and ' ', which can be stripped.
    string = String(string).replace(/[\t\n\f\r ]+/g, "");
    if (!b64re.test(string))
      throw new TypeError("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");

    // Adding the padding if missing, for semplicity
    string += "==".slice(2 - (string.length & 3));
    var bitmap, result = "",
      r1, r2, i = 0;
    for (; i < string.length;) {
      bitmap = b64.indexOf(string.charAt(i++)) << 18 | b64.indexOf(string.charAt(i++)) << 12 |
        (r1 = b64.indexOf(string.charAt(i++))) << 6 | (r2 = b64.indexOf(string.charAt(i++)));

      result += r1 === 64 ? String.fromCharCode(bitmap >> 16 & 255) :
        r2 === 64 ? String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255) :
          String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255, bitmap & 255);
    }
    return result;
  },
  /**
   * 检查身份证格式是否合法
   * @param idCard
   * @return {boolean}
   */
  checkIdCard: function(idCard) {
    // 15位和18位身份证号码的正则表达式
    const regIdCard = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
    // 如果通过该验证，说明身份证格式正确，但准确性还需计算
    if(regIdCard.test(idCard)) {
      if(idCard.length === 18) {
        // 将前17位加权因子保存在数组里
        const idCardWi = new Array(7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2);
        // 这是除以11后，可能产生的11位余数、验证码，也保存成数组
        const idCardY = new Array(1,0,10,9,8,7,6,5,4,3,2);
        // 用来保存前17位各自乖以加权因子后的总和
        let idCardWiSum = 0;
        for(let i = 0; i < 17; i++) {
          idCardWiSum += idCard.substring(i, i + 1) * idCardWi[i];
        }
        const idCardMod = idCardWiSum % 11;// 计算出校验码所在数组的位置
        const idCardLast = idCard.slice(-1);// 得到最后一位身份证号码
        // 如果等于2，则说明校验码是10，身份证号码最后一位应该是X
        if(idCardMod === 2) {
          return idCardLast === 'X' || idCardLast === 'x';
        }else {
          // 用计算出的验证码与最后一位身份证号码匹配，如果一致，说明通过，否则是无效的身份证号码
          return Number(idCardLast) === idCardY[idCardMod];
        }
      }
      return true;
    }
    return false;
  },
  /**
   * 数字转金额大写
   * @param number
   * @return {string}
   */
  toChineseNumber: function (number) {
    if(!_isNumber(number) || _isNaN(number)) return;
    const fraction = ['角', '分'];
    const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    const unit = [['元', '万', '亿'], ['', '拾', '佰', '仟']];
    const head = number < 0 ? '欠' : '';
    number = Math.abs(number);
    let s = '';
    for (let i = 0; i < fraction.length; i++) {
      s += (digit[Math.floor(number * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
    }
    s = s || '整';
    number = Math.floor(number);
    for (let i = 0; i < unit[0].length && number > 0; i++) {
      let p = '';
      for (let j = 0; j < unit[1].length && number > 0; j++) {
        p = digit[number % 10] + unit[1][j] + p;
        number = Math.floor(number / 10);
      }
      s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
    }
    return head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
  },
};
