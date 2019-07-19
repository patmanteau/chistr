import Vue from "vue";
Vue.config.productionTip = false;

import * as axios from "axios";
Vue.prototype.$http = axios;

import * as log from "electron-log";
log.transports.console.format = "{h}:{i}:{s} {text}";

import App from "./App.vue";
import router from "./router";
import store from "./store";
import { ipcRenderer } from "electron";


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
ipcRenderer.on("open-settings", (_event: any, _args: any) => {
  router.push("/settings");
});
ipcRenderer.on("open-about", (_event: any, _args: any) => {
  router.push("/about");
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
