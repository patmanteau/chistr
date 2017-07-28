import axios from 'axios'
import * as log from 'electron-log'
import _ from 'lodash/fp'

export class WowsApi {
  constructor (key, url, shipdb) {
    this.api = axios.create({
      baseURL: url,
      timeout: 20000,
      params: {
        application_id: key
      }
    })

    this.shipdb = shipdb

    this.key = key
    this.url = url
  }

  clearCache () {
    this.shipdb.clear()
  }

  findPlayer (playerName) {
    return new Promise((resolve, reject) => {
      // Find the player's account ID. We use Wargaming's
      // API to search by the player's name. The API returns a list of
      // players whose names match our search (i.e. searching for 'Alfred'
      // returns 'Alfred1', 'Alfred_accurate', 'AlfredAlfred' an so on), so
      // we have to search the response list ourselves for the right player

      this.api.get(`/wows/account/list/?search=${encodeURIComponent(playerName)}`)
        .then(response => {
          if (response.data.status !== 'ok' || !response.data.meta.count) {
            return reject(Error('Player not found at all.'))
          }

          // Get the correct player or give up
          const playerRecord = _.find({nickname: playerName})(response.data.data)
          if (!playerRecord) {
            return reject(Error('Player not found in list.'))
          }

          // Player found, so return his account ID
          return resolve({
            accountId: playerRecord.account_id,
            playerName: playerRecord.nickname
          })
        })
        .catch(error => {
          log.error(error)
          return reject(error)
        })
    })
  }

  getPlayer (accountId, matchGroup = 'pvp') {
    if (matchGroup === 'ranked') matchGroup = 'rank_solo'
    else if (matchGroup === 'cooperative') matchGroup = 'pve'
    return new Promise((resolve, reject) => {
      // Our second step is looking up the player's stats using his account ID.
      const params = {
        account_id: accountId.toString()
      }
      if (matchGroup === 'rank_solo') params.extra = 'statistics.rank_solo'
      if (matchGroup === 'pve') params.extra = 'statistics.pve'

      this.api.get('/wows/account/info/', { params: params })
        .then(response => {
          if (response.data.status !== 'ok') {
            return reject(Error(`Error retrieving player info (${response.data.error.message})`))
          }

          const playerStats = response.data.data[accountId]
          // If the player's profile is hidden, give up
          if (playerStats.hidden_profile) {
            return reject(Error('Player profile is hidden.'))
          }

          if (!playerStats.statistics.hasOwnProperty(matchGroup)) {
            return reject(Error('Player has no record in the selected matchGroup'))
          }

          const group = playerStats.statistics[matchGroup]
          const playerData = {
            playerHasRecord: true,
            playerBattles: group.battles,
            playerWinrate: (group.wins / group.battles * 100).toFixed(2),
            playerAvgExp: (group.xp / group.battles).toFixed(),
            playerAvgDmg: (group.damage_dealt / group.battles).toFixed(),
            playerKdRatio: (group.frags / (group.battles - group.survived_battles)).toFixed(2)
          }

          return resolve(playerData)
        })
        .catch(error => {
          return reject(error)
        })
    })
  }

  getPlayerClan (accountId) {
    return new Promise((resolve, reject) => {
      this.api.get('/wows/clans/accountinfo/', { params: { account_id: accountId, extra: 'clan' } })
        .then(response => {
          if (response.data.status === 'ok' &&
              response.data.data[accountId] &&
              response.data.data[accountId].clan) {
            const clan = response.data.data[accountId].clan
            return resolve({
              clanId: clan.clan_id,
              clanCreatedAt: clan.created_at,
              clanMembersCount: clan.members_count,
              clanName: clan.name,
              clanTag: clan.tag
            })
          } else {
            return reject(Error('Player is not in a clan.'))
          }
        })
        .catch(error => {
          console.log(error)
          return reject(error)
        })
    })
  }

  getShipName (shipId) {
    return new Promise((resolve, reject) => {
      if (this.shipdb.hasName(shipId)) {
        let shipName = this.shipdb.getName(shipId)
        log.info(`Cache hit: ${shipId} => ${shipName}`)
        return resolve(shipName)
      } else {
        log.info(`Cache miss: ${shipId}`)
        this.api.get(`/wows/encyclopedia/ships/?ship_id=${shipId}`)
          .then(response => {
            if (response.data.status === 'ok' && response.data.data[shipId]) {
              this.shipdb.setName(shipId, response.data.data[shipId].name)
              return resolve(response.data.data[shipId].name)
            } else {
              return reject(Error('Ship not found.'))
            }
          })
          .catch(error => {
            console.log(error)
            return reject(error)
          })
      }
    })
  }

  getPlayerShip (shipId, accountId, matchGroup = 'pvp') {
    if (matchGroup === 'ranked') matchGroup = 'rank_solo'
    else if (matchGroup === 'cooperative') matchGroup = 'pve'
    return new Promise((resolve, reject) => {
      const params = {
        account_id: accountId,
        ship_id: shipId
      }
      if (matchGroup === 'rank_solo') params.extra = 'rank_solo'
      if (matchGroup === 'pve') params.extra = 'pve'
      this.api.get('/wows/ships/stats/', { params: params })
        .then(response => {
          if (response.data.status !== 'ok' || !response.data.data[accountId]) {
            return reject(Error('No ship data found.'))
          }

          if (!response.data.data[accountId][0].pvp) {
            return reject(Error('Player has no PVP battles in ship.'))
          }

          let shipStats = response.data.data[accountId][0]
          if (!shipStats.hasOwnProperty(matchGroup)) {
            return reject(Error('Player has no record in the selected matchGroup'))
          }

          const group = shipStats[matchGroup]
          const shipData = {
            shipHasRecord: true,
            shipBattles: group.battles,
            shipVictories: group.wins,
            shipWinrate: (group.wins / group.battles * 100).toFixed(2),
            shipSurvived: group.survived_battles,
            shipFrags: group.frags,
            shipAvgExp: (group.xp / group.battles).toFixed(),
            shipAvgDmg: (group.damage_dealt / group.battles).toFixed(),
            shipKdRatio: (group.frags / (group.battles - group.survived_battles)).toFixed(2),
            shipPR: 0
          }

          if (this.shipdb.has(shipId)) {
            // PR Calculation courtesy of http://wows-numbers.com/de/personal/rating
            const exp = this.shipdb.get(shipId)

            const rDmg = shipData.shipAvgDmg / exp.average_damage_dealt
            const rWins = shipData.shipWinrate / exp.win_rate
            const rFrags = shipData.shipFrags / (exp.average_frags * shipData.shipBattles)

            const nDmg = Math.max(0, (rDmg - 0.4) / (1 - 0.4))
            const nWins = Math.max(0, (rWins - 0.7) / (1 - 0.7))
            const nFrags = Math.max(0, (rFrags - 0.1) / (1 - 0.1))

            shipData.shipPR = (700 * nDmg + 300 * nFrags + 150 * nWins).toFixed()
          }

          return resolve(shipData)
        })
        .catch(error => {
          console.log(error)
          return reject(error)
        })
    })
  }
}
