import * as types from '../mutation-types'

const state = {
  playerListSort: {
    key: 'playerWinrate',
    order: 1
  }
}

const getters = {}

const mutations = {
  [types.SET_PLAYER_LIST_SORT] (state, obj) {
    Object.assign(state.playerListSort, obj)
  }
}

const actions = {
  setPlayerListSortKey ({ state, commit }, key) {
    let newSort = {}
    if (state.playerListSort.key === key) {
      newSort.order = state.playerListSort.order * -1
    }
    newSort.key = key
    commit(types.SET_PLAYER_LIST_SORT, newSort)
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
