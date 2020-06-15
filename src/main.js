// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import iView from 'view-design'
import 'view-design/dist/styles/iview.css'

Vue.config.productionTip = false

axios.defaults.transformRequest = [
  function (data) {
    return JSON.stringify(data)
  }
]
axios.defaults.responseType = 'json'
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8'
// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  return response.data
})

Vue.use(iView)

Vue.use(VueAxios, axios)
// Vue.prototype.$axios = axios

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
