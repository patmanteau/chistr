import Vue from "vue";
// import VueI18n from 'vue-i18n'
// Vue.use(VueI18n)

// import axios from "axios";
const axios = require("axios");
Vue.http = Vue.prototype.$http = axios;

import App from "./App.vue";
import router from "./router";
import store from "./store";

import { ipcRenderer } from "electron";

import "@fortawesome/fontawesome-free/js/all";

Vue.config.productionTip = false;

// handle window menu events
ipcRenderer.on("open-settings", (_event, _args) => {
  router.push("/settings");
});
ipcRenderer.on("open-about", (_event, _args) => {
  router.push("/about");
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
