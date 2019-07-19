import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";

import Arena from "./modules/Arena";
import Interface from "./modules/Interface";
import Settings from "./modules/Settings";
import { RootState } from "./types";

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {
    version: "1.0.0"
  },
  modules: {
    Arena,
    Interface,
    Settings
  },
  strict: process.env.NODE_ENV !== "production"
};

export default new Vuex.Store<RootState>(store);
