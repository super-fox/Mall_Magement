import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
// 引入全局样式
import './assets/css/global.css'
//引入登录背景样式
import './assets/css/login.css'
//引入字体图标
import './assets/fonts/iconfont.css'
//引入vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'
//引入进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import axios from 'axios'
//配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//请求拦截
axios.interceptors.request.use(config => {
  // console.log(config)
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //必须return config
  return config
})
//响应拦截器
axios.interceptors.response.use(config=>{
  NProgress.done()
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.use(VueQuillEditor)

//设置一个事件过滤器
Vue.filter('dataFormat', origin => {
  const dt = new Date(origin)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const h = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${h}:${mm}:${ss}`
})

Vue.component('tree-table', TreeTable)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
