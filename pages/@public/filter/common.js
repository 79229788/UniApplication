import Vue from 'vue';
import basicUtils from '@/assets/utils/base';

/**
 * 日期格式化
 */
Vue.filter('dateFormat', (value, format) => {
  if(!value) return '';
  if(value && /^\d+:\d+(:\d+)?$/.test(value)) {
    value = `${uni.app.moment().format('YYYY-MM-DD')} ${value}`;
  }
  return uni.app.moment(value).format(format);
});

/**
 * 金额格式化
 */
Vue.filter('moneyFormat', (value, decimals = 2) => {
  const money = (value || 0).toFixed(decimals + 1);
  return money.slice(0, -1);
});


/**
 * 身份证格式化
 */
Vue.filter('idCardFormat', (value) => {
  if(!value) return '';
  return `${value.slice(0, 6)}-${value.slice(6, 10)}-${value.slice(10, 14)}-${value.slice(14)}`;
});
/**
 * 文本省略
 */
Vue.filter('ellipsis', (value, length) => {
  if(!value) return '';
  value = value + '';
  if(value.length > length) {
    const endReg = new RegExp('[^\u4e00-\u9fa5|\\w]$');
    const fullReg = new RegExp('[^\u4e00-\u9fa5|\\w]', 'g');
    let text = value.slice(0, length).replace(endReg, '');
    if(text.length < length) {
      text += value.slice(text.length, value.length)
        .replace(fullReg, '').slice(0, length - text.length);
    }
    return text + '..';
  }
  return value;
});
/**
 * 文本域转代码
 */
Vue.filter('textarea2code', (value) => {
  if(!value) return value;
  return basicUtils.textarea2code(value);
});
/**
 * 文本域转单行文本
 */
Vue.filter('textarea2text', (value) => {
  if(!value) return value;
  return basicUtils.textarea2text(value);
});
/**
 * 代码转单行文本
 */
Vue.filter('code2text', (value) => {
  if(!value) return value;
  return basicUtils.code2text(value);
});
/**
 * 代码转文本域
 */
Vue.filter('code2textarea', (value) => {
  if(!value) return value;
  return basicUtils.code2textarea(value);
});
/**
 * 强制https
 */
Vue.filter('https', (value) => {
  if(!value) return '';
  return value.replace(/^http:/, 'https:');
});