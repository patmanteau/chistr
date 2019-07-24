import * as types from "../mutation-types";
import config from "../../config";

const state = {
  playerListSort: config.get("app.playerListSort")
};

const getters = {};

const mutations = {
  [types.SET_PLAYER_LIST_SORT](state: any, obj: any) {
    Object.assign(state.playerListSort, obj);
    config.set("app.playerListSort", obj);
  }
};

const actions = {
  setPlayerListSortKey(
    { state, commit }: { state: any; commit: any },
    key: any
  ) {
    let newSort = { ...state.playerListSort };
    if (state.playerListSort.key === key) {
      newSort.order = state.playerListSort.order * -1;
    }
    newSort.key = key;
    commit(types.SET_PLAYER_LIST_SORT, newSort);
  }
};

export default {
  state,
  getters,
  mutations,
  actions
};
