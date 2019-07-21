import { Module, VuexModule, Mutation } from "vuex-module-decorators";
import * as types from "@/store/mutation-types";
import config from "@/config";

@Module
export default class Settings extends VuexModule {
  wows = config.get("wows");

  @Mutation
  [types.SET_WOWS_API_KEY](key: string) {
    this.wows.api.key = key;
    config.set("wows.api.key", key);
  }

  @Mutation
  [types.SET_WOWS_API_URL](url: string) {
    this.wows.api.url = url;
    config.set("wows.api.url", url);
  }

  @Mutation
  [types.SET_WOWS_PATH](path: string) {
    this.wows.path = path;
    config.set("wows.path", path);
  }

  @Mutation
  [types.SET_WOWS_MATCHGROUP](matchgroup: string) {
    this.wows.matchgroup = matchgroup;
    config.set("wows.matchgroup", matchgroup);
  }
}
