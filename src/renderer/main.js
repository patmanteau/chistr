import Vue from 'vue'
import VueI18n from 'vue-i18n'
// import VeeValidate from 'vee-validate'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import { ipcRenderer } from 'electron'

import 'font-awesome/css/font-awesome.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(VueI18n)
// Vue.use(VeeValidate)

// handle window menu events
ipcRenderer.on('open-settings', (event, args) => {
  router.push('/settings')
})
ipcRenderer.on('open-about', (event, args) => {
  router.push('/about')
})

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
