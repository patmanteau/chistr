import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";

import modules from "./modules";
import { RootState } from './types';

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    version: "1.0.0"
  },
  modules: modules,
  strict: process.env.NODE_ENV !== "production"
};

export default new Vuex.Store<RootState>(store);

// export default new Vuex.Store({
//   modules,
//   strict: process.env.NODE_ENV !== "production"
// });
