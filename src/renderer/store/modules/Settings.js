import * as types from '../mutation-types'
const ElectronStore = require('electron-store')

const electronstore = new ElectronStore({
  defaults: {
    wows: {
      api: {
        key: 'demo',
        url: 'http://api.worldofwarships.eu'
      },
      path: 'C:/Games/World_of_Warships'
    }
  },
  name: 'chistr'
})

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
  }
}

const actions = {}

export default {
  state,
  getters,
  mutations,
  actions
}
