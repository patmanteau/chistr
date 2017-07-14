import axios from 'axios'
const ElectronStore = require('electron-store')
const electronstore = new ElectronStore({
  defaults: {
    wows_api_key: 'demo',
    wows_api_url: 'http://api.worldofwarships.eu'
  },
  name: 'chistr'
})

let api = axios.create({
  baseURL: electronstore.get('wows_api_url'),
  timeout: 20000
})

api.defaults.params = {}
api.defaults.params['application_id'] = electronstore.get('wows_api_key')

let WOWSAPI = {
  getPlayer (playerName, matchGroup = 'pvp') {
    if (matchGroup === 'ranked') matchGroup = 'rank_solo'
    return new Promise((resolve, reject) => {
      // Our first step is finding the player's account ID. We use Wargaming's
      // API to search by the player's name. The API returns a list of
      // players whose names match our search (i.e. searching for 'Alfred'
      // returns 'Alfred1', 'Alfred_accurate', 'AlfredAlfred' an so on), so
      // we have to search the response list ourselves for the right player

      api.get('/wows/account/list/?search=' + encodeURIComponent(playerName))
        .then(response => {
          console.log(response)
          if (response.data.status !== 'ok' || response.data.meta.count < 1) {
            reject(Error('Player not found at all.'))
          }

          // Look for the right player
          let playerRecord
          for (let entry of response.data.data) {
            if (entry !== undefined && decodeURIComponent(entry.nickname) === playerName) {
              playerRecord = entry
            }
          }

          // We couldn't find the right player, so give up
          if (playerRecord === undefined) {
            reject(Error('Player not found in list.'))
          }

          // Player found, so return his account ID
          let playerData = {}
          playerData['accountId'] = playerRecord.account_id
          playerData['playerName'] = decodeURIComponent(playerRecord.nickname)
          return playerData
        })
        .then(playerData => {
          // console.log(playerData)
          // Our second step is looking up the player's stats using his account ID.
          let params = {
            account_id: playerData.accountId.toString()
          }
          if (matchGroup === 'rank_solo') params.extra = 'statistics.rank_solo'
          if (matchGroup === 'pve') params.extra = 'statistics.pve'
          api.get('/wows/account/info/', {
            params: params
          })
            .then(response => {
              console.log(response.data)
              if (response.data.status !== 'ok') {
                reject(Error('Error retrieving player info (' + response.data.error.message + ')'))
              }

              let playerStats = response.data.data[playerData.accountId]
              // If the player's profile is hidden, give up
              if (playerStats.hidden_profile === true) {
                reject(Error('Player profile is hidden.'))
              }

              if (!playerStats.statistics.hasOwnProperty(matchGroup)) {
                reject(Error('Player has no record in the selected matchGroup'))
              }
              playerData.playerHasRecord = true
              let group = playerStats.statistics[matchGroup]
              playerData.playerBattles = group.battles
              playerData.playerWinrate = (group.wins / group.battles * 100).toFixed(2)
              playerData.playerAvgExp = (group.xp / group.battles).toFixed()
              playerData.playerAvgDmg = (group.damage_dealt / group.battles).toFixed()
              playerData.playerKdRatio = (group.frags / (group.battles - group.survived_battles)).toFixed(2)
              resolve(playerData)
            })
            .catch(error => {
              console.log(error)
              reject(error)
            })
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  getShipName (shipId) {
    return new Promise((resolve, reject) => {
      api.get('/wows/encyclopedia/ships/?ship_id=' + shipId)
        .then(response => {
          if (response.data.status === 'ok' && response.data.data[shipId] !== undefined) {
            resolve(response.data.data[shipId].name)
          } else {
            reject(Error('Ship not found.'))
          }
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  },

  getPlayerShip (shipId, accountId, matchGroup = 'pvp') {
    if (matchGroup === 'ranked') matchGroup = 'rank_solo'
    return new Promise((resolve, reject) => {
      // Look for the ship's name first...
      // api.get('/wows/encyclopedia/ships/?ship_id=' + shipId)
      //   .then(response => {
      //     let shipData = {}
      //     if (response.data.status !== 'ok' || response.data.data[shipId] === undefined) {
      //       reject(Error('Ship not found.'))
      //     }
      //     shipData.shipId = shipId
      //     shipData.shipName = response.data.data[shipId].name
      //     return shipData
      //   })
      //   .then(shipData => {
      //     console.log(shipData)
      //     // Now get the player's stats
      let params = {
        account_id: accountId,
        ship_id: shipId
      }
      if (matchGroup === 'rank_solo') params.extra = 'rank_solo'
      if (matchGroup === 'pve') params.extra = 'pve'
      api.get('/wows/ships/stats/', {
        params: params
      })
        .then(response => {
          let shipData = {}
          console.log(response)
          if (response.data.status !== 'ok' || response.data.data[accountId] === undefined) {
            reject(Error('No ship data found.'))
          }

          if (response.data.data[accountId][0].pvp === undefined) {
            reject(Error('Player has no PVP battles in ship.'))
          }

          let shipStats = response.data.data[accountId][0]

          console.log(matchGroup)
          if (!shipStats.hasOwnProperty(matchGroup)) {
            reject(Error('Player has no record in the selected matchGroup'))
          }
          shipData.shipHasRecord = true
          let group = shipStats[matchGroup]
          shipData.shipBattles = group.battles
          shipData.shipVictories = group.wins
          shipData.shipWinrate = (group.wins / group.battles * 100).toFixed(2)
          shipData.shipSurvived = group.survived_battles
          shipData.shipFrags = group.frags
          shipData.shipAvgExp = (group.xp / group.battles).toFixed()
          shipData.shipAvgDmg = (group.damage_dealt / group.battles).toFixed()
          shipData.shipKdRatio = (group.frags / (group.battles - group.survived_battles)).toFixed(2)
          console.log(shipData)
          resolve(shipData)
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  }
}

export let wowsapi = WOWSAPI
