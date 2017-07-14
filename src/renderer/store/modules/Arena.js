import * as types from '../mutation-types'
import {wowsapi} from '../wows-api'

const jsonfile = require('jsonfile')

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
  playerNames: {}
}

const shipnames = new Map()

const getters = {
  friends () {
    return state.players.filter(player => player.relation <= 1)
  },

  foes () {
    return state.players.filter(player => player.relation > 1)
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
      mapname: arenaData.mapDisplayName,
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

  [types.INITIALIZE_PLAYER_DATA] (state, playerList) {
    let newPlayers = []
    let newPlayerNames = {}
    for (let player of playerList) {
      newPlayerNames[player.name] = newPlayers.length
      newPlayers.push({
        playerName: player.name,
        playerHasRecord: false,
        playerBattles: 0,
        playerWinrate: 0,
        playerAvgExp: 0,
        playerAvgDmg: 0,
        playerKdRatio: 0.0,
        playerError: [],
        shipId: player.shipId,
        shipHasRecord: false,
        shipName: '',
        shipBattles: 0,
        shipVictories: 0,
        shipSurvived: 0,
        shipFrags: 0,
        shipAvgExp: 0,
        shipAvgDmg: 0,
        shipKdRatio: 0.0,
        shipError: [],
        relation: player.relation,
        finishedLoading: false
      })
    }
    state.players = newPlayers
    state.playerNames = newPlayerNames
  },

  [types.SET_PLAYER_DATA] (state, { playerName, playerData }) {
    Object.assign(state.players[state.playerNames[playerName]], playerData)
  },

  [types.SET_PLAYER_HAS_RECORD] (state, { playerName, val }) {
    state.players[state.playerNames[playerName]].playerHasRecord = val
  },

  [types.SET_PLAYER_SHIP_DATA] (state, { playerName, shipData }) {
    Object.assign(state.players[state.playerNames[playerName]], shipData)
  },

  [types.SET_PLAYER_SHIP_HAS_RECORD] (state, { playerName, val }) {
    state.players[state.playerNames[playerName]].shipHasRecord = val
  }
}

const actions = {
  readArenaData ({ state, dispatch, commit }) {
    let arenaJson = 'C:/Games/World_of_Warships/replays/tempArenaInfo.json'
    jsonfile.readFile(arenaJson, (error, obj) => {
      if (error) {
        console.log(error)
        commit(types.SET_ARENA_ACTIVE, false)
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

  resolvePlayers ({ state, dispatch, commit }) {
    for (let player of state.players) {
      dispatch('resolvePlayer', player)
    }
  },

  resolvePlayer ({ state, commit }, player) {
    // Resolve the ship's name first
    if (shipnames.has(player.shipId)) {
      commit(types.SET_PLAYER_DATA, {
        playerName: player.playerName,
        playerData: {
          shipName: shipnames.get(player.shipId)
        }
      })
    } else {
      wowsapi.getShipName(player.shipId)
      .then(shipName => {
        commit(types.SET_PLAYER_DATA, {
          playerName: player.playerName,
          playerData: {
            shipName: shipName
          }
        })
        shipnames.set(player.shipId, shipName)
      })
      .catch(error => {
        console.log(error)
      })
    }

    // Get the player's account ID and stats next
    console.log('Resolve player ' + player.playerName)
    wowsapi.getPlayer(player.playerName, state.arena.matchGroup)
      .then(playerData => {
        commit(types.SET_PLAYER_DATA, {
          playerName: player.playerName,
          playerData: playerData
        })
        commit(types.SET_PLAYER_HAS_RECORD, {
          playerName: player.playerName,
          val: true
        })

        // Then get the ship's stats
        wowsapi.getPlayerShip(player.shipId, player.accountId, state.arena.matchGroup)
          .then(shipData => {
            commit(types.SET_PLAYER_SHIP_DATA, {
              playerName: player.playerName,
              shipData: shipData
            })
            commit(types.SET_PLAYER_SHIP_HAS_RECORD, {
              playerName: player.playerName,
              val: true
            })
            // resolve()
          })
        .catch(error => {
          commit(types.SET_PLAYER_SHIP_HAS_RECORD, {
            playerName: player.playerName,
            val: false
          })
          console.log(error)
          // reject(error)
        })
      })
      .catch(error => {
        commit(types.SET_PLAYER_HAS_RECORD, {
          playerName: player.playerName,
          val: false
        })
        console.log(error)
        // reject(error)
      })
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
