import Vue from 'vue'
import VeeValidate from 'vee-validate'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import 'font-awesome/css/font-awesome.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(VeeValidate)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
