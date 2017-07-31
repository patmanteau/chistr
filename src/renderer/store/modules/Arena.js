// import Vue from 'vue'
import _ from 'lodash/fp'
import * as types from '../mutation-types'
import {WowsApi} from '../wows-api'
import {ShipDB} from '../ship-db'
import * as log from 'electron-log'

const jsonfile = require('jsonfile')
const path = require('path')
const shipdb = new ShipDB()

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
  errors: []
}

const shipnames = new Map()
let wows

const getters = {
  friends (state, getters) {
    return _.filter(player => player.relation <= 1)(state.players)
  },

  foes (state, getters) {
    return _.filter(player => player.relation > 1)(state.players)
  },

  players (state, getters) {
    return state.players
  },

  finishedLoading (state, getters) {
    return _.all(player => player.personal.finishedLoading && player.clan.finishedLoading && player.ship.finishedLoading)(state.players)
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
    state.hasData = true
  },

  [types.ADD_ERROR] (state, error) {
    state.errors.push(error)
  },

  [types.CLEAR_ERRORS] (state) {
    state.errors = []
  },

  [types.INITIALIZE_PLAYER_DATA] (state, playerList) {
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
          dispatch('resolvePlayers')
        }
      }
    })
  },

  resolvePlayers ({ state, dispatch, commit, rootState }) {
    wows = new WowsApi(rootState.Settings.wows.api.key, rootState.Settings.wows.api.url, shipdb)

    for (let { name } of state.players) {
      // const name = key
      log.info(`Resolve player ${name}`)
      dispatch('findPlayer', name)
        .then(() => {
          dispatch('resolveShip', name)
          dispatch('resolveClan', name)
          dispatch('resolvePlayer', name)
        })
        .catch(error => {
          for (const typ of [types.SET_PERSONAL_DATA, types.SET_CLAN_DATA, types.SET_SHIP_DATA]) {
            commit(typ, {
              name: name,
              data: {
                finishedLoading: true,
                hasRecord: false
              }
            })
          }
          console.log(error)
        })
    }
  },

  findPlayer ({ state, commit }, name) {
    return new Promise((resolve, reject) => {
      // Get the player's account ID
      wows.findPlayer(name)
        .then(playerData => {
          commit(types.SET_PLAYER_DATA, {
            name: name,
            data: { ...playerData }
          })
          console.log(`Found player: ${name} => ${playerData.accountId}`)
          return resolve(playerData.accountId)
        })
        .catch(error => {
          console.log(error)
          return reject(error)
        })
    })
  },

  resolveClan ({ state, commit }, name) {
    return new Promise((resolve, reject) => {
      const player = state.players[state.playerIndex[name]]
      if (!player.accountId) {
        return reject(Error('Invalid account id'))
      } else {
        wows.getPlayerClan(player.accountId)
        .then(clanData => {
          commit(types.SET_CLAN_DATA, { name: name, data: { hasRecord: true, finishedLoading: true, ...clanData } })
          return resolve()
        })
        .catch(error => {
          commit(types.SET_CLAN_DATA, { name: name, data: { finishedLoading: true } })
          console.log(error)
          return resolve()
        })
      }
    })
  },

  resolveShip ({ state, commit, rootState }, name) {
    return new Promise((resolve, reject) => {
      // Select the correct match group
      let matchGroup = rootState.Settings.wows.matchgroup
      if (matchGroup === 'auto') {
        matchGroup = state.arena.matchGroup
      }

      const player = state.players[state.playerIndex[name]]
      // Resolve the ship's name first
      if (shipnames.has(player.ship.id)) {
        commit(types.SET_SHIP_DATA, { name: name, data: { name: shipnames.get(player.ship.id) } })
      } else {
        wows.getShipName(player.ship.id)
        .then(shipName => {
          commit(types.SET_SHIP_DATA, { name: name, data: { name: shipName } })
          shipnames.set(player.ship.id, shipName)
        })
        .catch(error => {
          log.error(error)
          console.log(error)
        })
      }

      if (!player.accountId) {
        return reject(Error('Invalid account id'))
      } else {
        wows.getPlayerShip(player.ship.id, player.accountId, matchGroup)
          .then(shipData => {
            commit(types.SET_SHIP_DATA, {
              name: name,
              data: {
                finishedLoading: true,
                hasRecord: true,
                ...shipData
              }
            })
            return resolve()
          })
          .catch(error => {
            commit(types.SET_SHIP_DATA, {
              name: name,
              data: {
                finishedLoading: true,
                hasRecord: false
              }
            })
            log.warn(error)
            console.log(error)
            return resolve()
          })
      }
    })
  },

  resolvePlayer ({ state, commit, rootState }, name) {
    return new Promise((resolve, reject) => {
      // Select the correct match group
      let matchGroup = rootState.Settings.wows.matchgroup
      if (matchGroup === 'auto') {
        matchGroup = state.arena.matchGroup
      }

      const player = state.players[state.playerIndex[name]]
      wows.getPlayer(player.accountId, matchGroup)
      .then(playerData => {
        commit(types.SET_PERSONAL_DATA, {
          name: name,
          data: {
            finishedLoading: true,
            hasRecord: true,
            ...playerData
          }
        })
        return resolve(playerData)
      })
      .catch(error => {
        for (const typ of [types.SET_PERSONAL_DATA, types.SET_SHIP_DATA]) {
          commit(typ, {
            name: name,
            data: {
              finishedLoading: true,
              hasRecord: false
            }
          })
        }
        log.warn(error)
        console.log(error)
        return reject(error)
      })
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
