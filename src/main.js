// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import iView from 'view-design'
import 'view-design/dist/styles/iview.css'
import vuecookie from 'vue-cookie'
import {
  cookie
} from './libs/common'

Vue.config.productionTip = false

axios.defaults.transformRequest = [
  function (data) {
    return JSON.stringify(data)
  }
]
Vue.prototype.$cookie = vuecookie
axios.defaults.responseType = 'json'
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'

// 添加request拦截器
axios.interceptors.request.use(config => {
  // JWT的token
  let token = cookie('token')
  config.headers.common['token'] = token
  let url = config.url
  if (url.indexOf('share') === 0 || url.indexOf('base') === 0) { // share开头的接口都走api对应的服务
    config.url = `api/${url}`
  }
  return config
})
let vm = null
// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  if (response.data.code !== 0) {
    vm && vm.$Message.error(response.data.msg)
  }
  return response.data
},error => {
  if (error.response.data.status === 400 || (error.response.data.status === 500 && error.response.data.message != 401)) {
    vm && vm.$Message.error(error.response.data.message)
  }
})


Vue.use(iView)

Vue.use(VueAxios, axios)
// Vue.prototype.$axios = axios

/* eslint-disable no-new */
vm = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
