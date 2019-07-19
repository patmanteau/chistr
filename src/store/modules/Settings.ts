import { Module, VuexModule, Mutation } from "vuex-module-decorators";
import * as types from "../mutation-types";
import config from "../../config";

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
