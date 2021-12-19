const debug = process.env.NODE_ENV === 'development';
const env = !debug ? 'prod' : 'dev';
export default {
  DEBUG: debug,
	ENV: env,
	VERSION: debug ? 'debug' : '1.0.0',
	//静态资源域名
	KDATAURL: 'https://data.yutuobang.net',
	KCNDURL: 'https://cdn.yutuobang.net',
	KAPIURL: debug ? 'http://api.dev.yutuobang.net' : 'https://api.yutuobang.net',
	KUPLOADURL: 'https://upload.yutuobang.net',
	KUTILSURL: 'https://utils.yutuobang.net',
	KADMIN_STATIC_PAGE_URL: debug ? 'http://admin.dev.yutuobang.net/pages' : 'https://page.yutuobang.net/prod',
	//会话id
	KSESSIONID: debug ? '' : '',

}
