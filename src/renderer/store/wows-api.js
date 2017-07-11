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
// api.defaults.params['application_id'] = '545b3a14a15636951011be7718233e5f'

let WOWSAPI = {
  getPlayer (playerName) {
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
          api.get('/wows/account/info/?account_id=' + playerData.accountId)
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
              playerData.playerHasRecord = true
              playerData.playerBattles = playerStats.statistics.pvp.battles
              playerData.playerWinrate = (playerStats.statistics.pvp.wins / playerStats.statistics.pvp.battles * 100).toFixed(2)
              playerData.playerAvgExp = (playerStats.statistics.pvp.xp / playerStats.statistics.pvp.battles).toFixed()
              playerData.playerAvgDmg = (playerStats.statistics.pvp.damage_dealt / playerStats.statistics.pvp.battles).toFixed()
              playerData.playerKdRatio = (playerStats.statistics.pvp.frags / (playerStats.statistics.pvp.battles - playerStats.statistics.pvp.survived_battles)).toFixed(2)
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

  getPlayerShip (shipId, accountId) {
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
      api.get('/wows/ships/stats/?account_id=' + accountId + '&ship_id=' + shipId)
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

          shipData.shipHasRecord = true
          shipData.shipBattles = shipStats.pvp.battles
          shipData.shipVictories = shipStats.pvp.wins
          shipData.shipWinrate = (shipStats.pvp.wins / shipStats.pvp.battles * 100).toFixed(2)
          shipData.shipSurvived = shipStats.pvp.survived_battles
          shipData.shipFrags = shipStats.pvp.frags
          shipData.shipAvgExp = (shipStats.pvp.xp / shipStats.pvp.battles).toFixed()
          shipData.shipAvgDmg = (shipStats.pvp.damage_dealt / shipStats.pvp.battles).toFixed()
          shipData.shipKdRatio = (shipStats.pvp.frags / (shipStats.pvp.battles - shipStats.pvp.survived_battles)).toFixed(2)
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
