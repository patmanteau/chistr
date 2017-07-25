import * as types from '../mutation-types'
import { esSettings } from '../../../defaultsettings'
const ElectronStore = require('electron-store')

console.log(esSettings)
const electronstore = new ElectronStore(esSettings)

const state = {
  wows: electronstore.get('wows')
}

const getters = {}

const mutations = {
  [types.SET_WOWS_API_KEY] (state, key) {
    state.wows.api.key = key
    electronstore.set('wows.api.key', key)
  },

  [types.SET_WOWS_API_URL] (state, url) {
    state.wows.api.url = url
    electronstore.set('wows.api.url', url)
  },

  [types.SET_WOWS_PATH] (state, path) {
    state.wows.path = path
    electronstore.set('wows.path', path)
  },

  [types.SET_WOWS_MATCHGROUP] (state, matchgroup) {
    state.wows.matchgroup = matchgroup
    electronstore.set('wows.matchgroup', matchgroup)
  }
}

const actions = {}

export default {
  state,
  getters,
  mutations,
  actions
}
