import * as types from "../mutation-types";
import config from "../../config";

const state = {
  wows: config.get("wows")
};

const getters = {};

const mutations = {
  [types.SET_WOWS_API_KEY](state, key) {
    state.wows.api.key = key;
    config.set("wows.api.key", key);
  },

  [types.SET_WOWS_API_URL](state, url) {
    state.wows.api.url = url;
    config.set("wows.api.url", url);
  },

  [types.SET_WOWS_PATH](state, path) {
    state.wows.path = path;
    config.set("wows.path", path);
  },

  [types.SET_WOWS_MATCHGROUP](state, matchgroup) {
    state.wows.matchgroup = matchgroup;
    config.set("wows.matchgroup", matchgroup);
  }
};

const actions = {};

export default {
  state,
  getters,
  mutations,
  actions
};
