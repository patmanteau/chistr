import { Module, VuexModule, Mutation } from "vuex-module-decorators";
// import { MutationTree, GetterTree, ActionTree } from "vuex";
// import { ArenaVehicle, RootState } from '../types';
import * as types from "../mutation-types";
import config from "../../config";

// interface SettingsState {
//   wows
// }

@Module
export default class Settings extends VuexModule {
  wows = config.get("wows");

  @Mutation
  [types.SET_WOWS_API_KEY](state, key) {
    state.wows.api.key = key;
    config.set("wows.api.key", key);
  }

  @Mutation
  [types.SET_WOWS_API_URL](state, url) {
    state.wows.api.url = url;
    config.set("wows.api.url", url);
  }

  @Mutation
  [types.SET_WOWS_PATH](state, path) {
    state.wows.path = path;
    config.set("wows.path", path);
  }

  @Mutation
  [types.SET_WOWS_MATCHGROUP](state, matchgroup) {
    state.wows.matchgroup = matchgroup;
    config.set("wows.matchgroup", matchgroup);
  }
}

// const namespaced = true;

// const state = {
//   wows: config.get("wows")
// };

// const getters = {};

// const mutations = {
//   [types.SET_WOWS_API_KEY](state, key) {
//     state.wows.api.key = key;
//     config.set("wows.api.key", key);
//   },

//   [types.SET_WOWS_API_URL](state, url) {
//     state.wows.api.url = url;
//     config.set("wows.api.url", url);
//   },

//   [types.SET_WOWS_PATH](state, path) {
//     state.wows.path = path;
//     config.set("wows.path", path);
//   },

//   [types.SET_WOWS_MATCHGROUP](state, matchgroup) {
//     state.wows.matchgroup = matchgroup;
//     config.set("wows.matchgroup", matchgroup);
//   }
// };

// const actions = {};

// export const settings: Module<SettingsState, RootState> = {
//   namespaced,
//   state,
//   getters,
//   mutations,
//   actions
// };
