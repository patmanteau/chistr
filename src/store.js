import Vue from "vue";
import Vuex from "vuex";

import modules from "./store/modules";

Vue.use(Vuex);

// export default new Vuex.Store({
//   state: {},
//   mutations: {},
//   actions: {}
// });

export default new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== "production"
});
