import R from 'ramda'
import * as types from '../mutation-types'
import {WowsApi} from '../wows-api'
import {ShipDB} from '../ship-db'
import * as log from 'electron-log'

const jsonfile = require('jsonfile')
const path = require('path')
const shipdb = new ShipDB()

const didFinishOk = function (ok, name, extraData = null) {
  const obj = {
    name: name,
    data: {
      finishedLoading: true,
      hasRecord: ok
    }
  }
  if (extraData) {
    Object.assign(obj.data, extraData)
  }
  return obj
}

const state = {
  active: false,
  hasData: false,
  arena: {
    mapname: '',
    playerName: '',
    lastMatchDate: '',
    matchGroup: ''
  },
  players: [],
  playerIndex: {},
  errors: [],
  // for progress display
  completedOperations: 0,
  totalOperations: 1
}

let wows

const getters = {
  friends (state, getters) {
    return R.filter(player => player.relation <= 1)(state.players)
  },

  foes (state, getters) {
    return R.filter(player => player.relation > 1)(state.players)
  },

  players (state, getters) {
    return state.players
  },

  progress (state) {
    return R.clamp(0, 1, state.completedOperations / state.totalOperations)
  },

  finishedLoading (state, getters) {
    return state.hasData &&
      R.all(R.path(['personal', 'finishedLoading']) &&
      R.path(['clan', 'finishedLoading']) &&
      R.path(['ship', 'finishedLoading']))(state.players)
  },

  player: (state) => (name) => {
    return state.players[state.playerIndex[name]]
  }
}

const mutations = {
  [types.SET_ARENA_ACTIVE] (state, isActive) {
    state.active = isActive
    if (!isActive) {
      state.arena.lastMatchDate = ''
    }
  },

  [types.SET_ARENA_DATA] (state, arenaData) {
    state.arena = {
      mapName: arenaData.mapDisplayName,
      playerName: arenaData.playerName,
      lastMatchDate: arenaData.dateTime,
      matchGroup: arenaData.matchGroup
      // dateTime:"04.07.2017 15:26:52"
      // duration:1200
      // gameLogic:"Domination"
      // gameMode:7
      // logic:"Domination"
      // mapDisplayName:"17_NA_fault_line"
      // mapId:11
      // mapName:"spaces/17_NA_fault_line"
      // matchGroup:"ranked"
      // name:"7x7"
      // playerID:0
      // playerName:"rottzorr"
      // playerVehicle:"PJSB006-Fuso-1943"
      // playersPerTeam:7
      // scenario:"Ranked_Domination"
      // scenarioConfigId:90
      // teamsCount:2
    }
    // state.hasData = true
  },

  [types.ADD_ERROR] (state, error) {
    state.errors.push(error)
  },

  [types.CLEAR_ERRORS] (state) {
    state.errors = []
  },

  [types.INITIALIZE_PLAYER_DATA] (state, playerList) {
    state.hasData = false
    const tempPlayers = []
    const tempIndex = {}
    state.playerIndex = {}
    for (const item of playerList) {
      tempIndex[item.name] = tempPlayers.length
      tempPlayers.push({
        accountId: '',
        name: item.name,
        relation: item.relation,
        errors: [],
        personal: {
          hasRecord: false,
          battles: 0,
          winrate: 0,
          avgExp: 0,
          avgDmg: 0,
          kdRatio: 0.0,
          finishedLoading: false
        },
        clan: {
          id: '',
          hasRecord: false,
          finishedLoading: false,
          createdAt: '',
          membersCount: 0,
          name: '',
          tag: ''
        },
        ship: {
          id: item.shipId,
          hasRecord: false,
          name: '',
          battles: 0,
          victories: 0,
          survived: 0,
          frags: 0,
          avgExp: 0,
          avgDmg: 0,
          kdRatio: 0.0,
          winrate: 0.0,
          pr: 0,
          finishedLoading: false
        }
      })
      state.players = tempPlayers
      state.playerIndex = tempIndex
      state.completedOperations = 0
      state.totalOperations = 1
      state.hasData = true
    }
  },

  [types.SET_PLAYER_DATA] (state, { name, data }) {
    Object.assign(state.players[state.playerIndex[name]], data)
  },

  [types.SET_PERSONAL_DATA] (state, { name, data }) {
    Object.assign(state.players[state.playerIndex[name]].personal, data)
  },

  [types.SET_CLAN_DATA] (state, { name, data }) {
    Object.assign(state.players[state.playerIndex[name]].clan, data)
  },

  [types.SET_SHIP_DATA] (state, { name, data }) {
    Object.assign(state.players[state.playerIndex[name]].ship, data)
  },

  [types.SET_TOTAL_OPERATIONS] (state, { count }) {
    state.totalOperations = count
  },

  [types.INC_COMPLETED_OPERATIONS] (state) {
    state.completedOperations++
  }
}

const actions = {
  readArenaData ({ state, dispatch, commit, rootState }) {
    const arenaJson = path.resolve(rootState.Settings.wows.path, 'replays/tempArenaInfo.json')
    jsonfile.readFile(arenaJson, (error, obj) => {
      if (error) {
        if (error.code !== 'ENOENT') {
          log.error(error)
          console.log(error)
        }
        if (state.arena.active) {
          commit(types.SET_ARENA_ACTIVE, false)
        }
      } else {
        if (state.arena.lastMatchDate !== obj.dateTime) {
          commit(types.SET_ARENA_DATA, obj)
          commit(types.SET_ARENA_ACTIVE, true)
          commit(types.INITIALIZE_PLAYER_DATA, obj.vehicles)
          dispatch('resolve')
        }
      }
    })
  },

  resolve ({ state, dispatch, commit, rootState }) {
    // set progress count
    commit(types.SET_TOTAL_OPERATIONS, {
      // For each player,
      // 1. find accountId by name
      // 2. set player stats
      // 3. set ship name
      // 4. set ship stats
      // 5. set clan info
      // Then set all player stats
      count: 5 * state.players.length
    })

    wows = new WowsApi(rootState.Settings.wows.api.key, rootState.Settings.wows.api.url, shipdb)
    let matchGroup = rootState.Settings.wows.matchgroup
    if (matchGroup === 'auto') {
      matchGroup = state.arena.matchGroup
    }

    Promise.all(state.players.map(player => dispatch('findPlayer', player.name)).map(p => p.catch(e => e)))
    .then(results => {
      // filter Error objects
      const players = R.filter(r => !(r instanceof Error), results)
      dispatch('resolvePlayers', { players, matchGroup })
      for (const player of players) {
        dispatch('resolveShip', { name: player.name, matchGroup: matchGroup })
        dispatch('resolveClan', player.name)
      }
    })
    .catch(e => console.log(e))
  },

  findPlayer ({ state, commit }, name) {
    return new Promise((resolve, reject) => {
      // Get the player's account ID
      wows.findPlayer(name)
        .then(playerData => {
          commit(types.SET_PLAYER_DATA, {
            name: name,
            data: playerData
          })
          commit(types.INC_COMPLETED_OPERATIONS)
          console.log(`Found player: ${name} => ${playerData.accountId}`)
          return resolve(playerData)
        })
        .catch(error => {
          R.forEach(typ => commit(typ, didFinishOk(false, name)))([types.SET_PERSONAL_DATA, types.SET_CLAN_DATA, types.SET_SHIP_DATA])
          commit(types.INC_COMPLETED_OPERATIONS)
          console.log(error)
          return reject(error)
        })
    })
  },

  resolveClan ({ state, getters, commit }, name) {
    const player = getters.player(name)
    if (!player.accountId) {
      return Promise.reject(Error(`Invalid account id for player ${name}`))
    } else {
      wows.getPlayerClan(player.accountId)
      .then(clanData => {
        commit(types.SET_CLAN_DATA, didFinishOk(true, name, clanData))
        commit(types.INC_COMPLETED_OPERATIONS)
        return Promise.resolve()
      })
      .catch(error => {
        commit(types.SET_CLAN_DATA, didFinishOk(false, name))
        commit(types.INC_COMPLETED_OPERATIONS)
        console.log(error)
        return Promise.resolve()
      })
    }
  },

  resolveShip ({ state, getters, commit, rootState }, { name, matchGroup }) {
    const player = getters.player(name)
    // Resolve the ship's name first
    wows.getShipName(player.ship.id)
    .then(shipName => {
      commit(types.SET_SHIP_DATA, { name: name, data: { name: shipName } })
      commit(types.INC_COMPLETED_OPERATIONS)
    })
    .catch(error => {
      commit(types.SET_SHIP_DATA, { name: name, data: { name: 'Ship not found' } })
      commit(types.INC_COMPLETED_OPERATIONS)
      log.error(error)
      console.log(error)
    })

    if (!player.accountId) {
      return Promise.reject(Error('Invalid account id'))
    } else {
      wows.getPlayerShip(player.ship.id, player.accountId, matchGroup)
        .then(shipData => {
          commit(types.SET_SHIP_DATA, didFinishOk(true, name, shipData))
          commit(types.INC_COMPLETED_OPERATIONS)
          return Promise.resolve()
        })
        .catch(error => {
          commit(types.SET_SHIP_DATA, didFinishOk(false, name))
          commit(types.INC_COMPLETED_OPERATIONS)
          console.log(error)
          return Promise.resolve()
        })
    }
  },

  resolvePlayers ({ state, commit, rootState }, { players, matchGroup }) {
    wows.getPlayers(players, matchGroup)
    .then(playerData => {
      for (const player of Object.values(playerData)) {
        // console.log(accountId)
        if (player.hidden) {
          R.forEach(typ => commit(typ, didFinishOk(false, player.name)), [types.SET_PERSONAL_DATA, types.SET_SHIP_DATA])
          commit(types.INC_COMPLETED_OPERATIONS)
        } else {
          commit(types.SET_PERSONAL_DATA, didFinishOk(true, player.name, R.omit(['name'], player)))
          commit(types.INC_COMPLETED_OPERATIONS)
        }
      }
      return Promise.resolve()
    })
    .catch(error => {
      console.log(error)
      return Promise.reject(error)
    })
  },

  clearApiCache () {
    shipdb.clear()
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
