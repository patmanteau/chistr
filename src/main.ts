import Vue from "vue";
// import VueI18n from 'vue-i18n'
// Vue.use(VueI18n)

// import axios from "axios";
const axios = require("axios");
// Vue.http = Vue.prototype.$http = axios;
Vue.prototype.$http = axios;

import App from "./App.vue";
import router from "./router";
import store from "./store";

import { ipcRenderer } from "electron";

Vue.config.productionTip = false;

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faAngleRight,
  faBullseye,
  faChartPie,
  faCheck,
  faCheckCircle,
  faCog,
  faRedo,
  faRocket,
  faSortDown,
  faSortUp,
  faStar,
  faTimes,
  faVial
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(
  faAngleRight,
  faBullseye,
  faChartPie,
  faCheck,
  faCheckCircle,
  faCog,
  faRedo,
  faRocket,
  faSortDown,
  faSortUp,
  faStar,
  faTimes,
  faVial
);

Vue.component("font-awesome-icon", FontAwesomeIcon);

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
