import axios from 'axios'
import * as log from 'electron-log'

export class WowsApi {
  constructor (key, url, shipdb) {
    this.api = axios.create({
      baseURL: url,
      timeout: 20000,
      params: {
        application_id: key
      }
    })

    this.shipdb = shipdb // new ShipDB()

    this.key = key
    this.url = url
  }

  clearCache () {
    this.shipdb.clear()
  }

  getPlayer (playerName, matchGroup = 'pvp') {
    if (matchGroup === 'ranked') matchGroup = 'rank_solo'
    else if (matchGroup === 'cooperative') matchGroup = 'pve'
    return new Promise((resolve, reject) => {
      // Our first step is finding the player's account ID. We use Wargaming's
      // API to search by the player's name. The API returns a list of
      // players whose names match our search (i.e. searching for 'Alfred'
      // returns 'Alfred1', 'Alfred_accurate', 'AlfredAlfred' an so on), so
      // we have to search the response list ourselves for the right player

      this.api.get(`/wows/account/list/?search=${encodeURIComponent(playerName)}`)
        .then(response => {
          if (response.data.status !== 'ok' || response.data.meta.count < 1) {
            reject(Error('Player not found at all.'))
          }

          // Look for the right player
          let playerRecord
          for (const entry of response.data.data) {
            if (entry !== undefined && decodeURIComponent(entry.nickname) === playerName) {
              playerRecord = entry
            }
          }

          // We couldn't find the right player, so give up
          if (playerRecord === undefined) {
            reject(Error('Player not found in list.'))
          }

          // Player found, so return his account ID
          return {
            accountId: playerRecord.account_id,
            playerName: decodeURIComponent(playerRecord.nickname)
          }
        })
        .then(playerData => {
          // Our second step is looking up the player's stats using his account ID.
          const params = {
            account_id: playerData.accountId.toString()
          }
          if (matchGroup === 'rank_solo') params.extra = 'statistics.rank_solo'
          if (matchGroup === 'pve') params.extra = 'statistics.pve'

          this.api.get('/wows/account/info/', { params: params })
            .then(response => {
              if (response.data.status !== 'ok') {
                reject(Error(`Error retrieving player info (${response.data.error.message})`))
                return
              }

              let playerStats = response.data.data[playerData.accountId]
              // If the player's profile is hidden, give up
              if (playerStats.hidden_profile === true) {
                reject(Error('Player profile is hidden.'))
                return
              }

              if (!playerStats.statistics.hasOwnProperty(matchGroup)) {
                reject(Error('Player has no record in the selected matchGroup'))
                return
              }

              const group = playerStats.statistics[matchGroup]
              Object.assign(playerData, {
                playerHasRecord: true,
                playerBattles: group.battles,
                playerWinrate: (group.wins / group.battles * 100).toFixed(2),
                playerAvgExp: (group.xp / group.battles).toFixed(),
                playerAvgDmg: (group.damage_dealt / group.battles).toFixed(),
                playerKdRatio: (group.frags / (group.battles - group.survived_battles)).toFixed(2)
              })

              resolve(playerData)
            })
            .catch(error => {
              return error
            })
        })
        .catch(error => {
          log.error(error)
          reject(error)
        })
    })
  }

  getPlayerClan (accountId) {
    return new Promise((resolve, reject) => {
      this.api.get('/wows/clans/accountinfo/', { params: { account_id: accountId, extra: 'clan' } })
        .then(response => {
          if (response.data.status === 'ok' &&
              response.data.data[accountId] !== null &&
              response.data.data[accountId].clan !== null) {
            const clan = response.data.data[accountId].clan
            resolve({
              clanId: clan.clan_id,
              clanCreatedAt: clan.created_at,
              clanMembersCount: clan.members_count,
              clanName: clan.name,
              clanTag: clan.tag
            })
          } else {
            reject(Error('Player is not in a clan.'))
          }
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  }

  getShipName (shipId) {
    return new Promise((resolve, reject) => {
      if (this.shipdb.hasName(shipId)) {
        let shipName = this.shipdb.getName(shipId)
        log.info(`Cache hit: ${shipId} => ${shipName}`)
        resolve(shipName)
      } else {
        log.info(`Cache miss: ${shipId}`)
        this.api.get(`/wows/encyclopedia/ships/?ship_id=${shipId}`)
          .then(response => {
            if (response.data.status === 'ok' && response.data.data[shipId] !== undefined) {
              this.shipdb.setName(shipId, response.data.data[shipId].name)
              resolve(response.data.data[shipId].name)
            } else {
              reject(Error('Ship not found.'))
            }
          })
          .catch(error => {
            console.log(error)
            reject(error)
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
          const shipData = {}
          if (response.data.status !== 'ok' || response.data.data[accountId] === undefined || response.data.data[accountId] === null) {
            reject(Error('No ship data found.'))
            return
          }

          if (response.data.data[accountId][0].pvp === undefined) {
            reject(Error('Player has no PVP battles in ship.'))
            return
          }

          let shipStats = response.data.data[accountId][0]
          if (!shipStats.hasOwnProperty(matchGroup)) {
            reject(Error('Player has no record in the selected matchGroup'))
            return
          }

          const group = shipStats[matchGroup]
          Object.assign(shipData, {
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
          })

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

          resolve(shipData)
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  }
}
