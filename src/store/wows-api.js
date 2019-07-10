const axios = require("axios");
import * as log from "electron-log";
// import R from "ramda";
const R = require("ramda");

export class WowsApi {
  constructor(key, url, shipdb) {
    this.api = axios.create({
      baseURL: url,
      timeout: 20000,
      params: {
        application_id: key
      }
    });

    const responseHandler = response => {
      if (
        response.data.status !== "ok" ||
        R.path(["data", "error"], response)
      ) {
        return Promise.reject(R.path(["data", "error"], response));
      } else {
        return response;
      }
    };

    const errorHandler = error => {
      return Promise.reject(error);
    };

    this.api.interceptors.response.use(responseHandler, errorHandler);

    this.shipdb = shipdb;
    this.key = key;
    this.url = url;
  }

  clearCache() {
    this.shipdb.clear();
  }

  findPlayer(playerName) {
    return new Promise((resolve, reject) => {
      // Find the player's account ID. We use Wargaming's
      // API to search by the player's name. The API returns a list of
      // players whose names match our search (i.e. searching for 'Alfred'
      // returns 'Alfred1', 'Alfred_accurate', 'AlfredAlfred' an so on), so
      // we have to search the response list ourselves for the right player
      this.api
        .get(`/wows/account/list/?search=${encodeURIComponent(playerName)}`)
        .then(response => {
          const playerRecord = R.find(R.propEq("nickname", playerName))(
            response.data.data
          );
          if (playerRecord) {
            return resolve({
              // Player found, so return his account ID
              accountId: playerRecord.account_id,
              name: playerRecord.nickname
            });
          } else {
            return reject(Error("Player not found"));
          }
        })
        .catch(error => {
          console.log(error);
          return Error("Player not found");
        });
    });
  }

  getPlayers(accountIds, matchGroup = "pvp") {
    if (matchGroup === "ranked") matchGroup = "rank_solo";
    else if (matchGroup === "cooperative") matchGroup = "pve";
    return new Promise((resolve, reject) => {
      // Our second step is looking up the player's stats using their account IDs.
      const params = {
        account_id: R.map(R.prop("accountId"), accountIds).join(","),
        extra: ""
      };
      if (matchGroup === "rank_solo") params.extra = "statistics.rank_solo";
      if (matchGroup === "pve") params.extra = "statistics.pve";

      this.api
        .get("/wows/account/info/", { params: params })
        .then(response => {
          const players = R.mapObjIndexed((playerStats, _accountId, _obj) => {
            if (
              playerStats &&
              (!playerStats.statistics ||
                playerStats.hidden_profile ||
                !R.path(["statistics", matchGroup], playerStats))
            ) {
              return {
                name: playerStats.nickname,
                hidden: true
              };
            } else {
              const group = playerStats.statistics[matchGroup];
              return {
                battles: group.battles,
                winrate: (group.wins / group.battles) * 100,
                avgExp: group.xp / group.battles,
                avgDmg: group.damage_dealt / group.battles,
                kdRatio: group.frags / (group.battles - group.survived_battles),
                name: playerStats.nickname
              };
            }
          })(response.data.data);
          return resolve(players);
        })
        .catch(error => {
          return reject(error);
        });
    });
  }

  getPlayerClan(accountId) {
    return new Promise((resolve, reject) => {
      this.api
        .get("/wows/clans/accountinfo/", {
          params: { account_id: accountId, extra: "clan" }
        })
        .then(response => {
          const clan = R.path(["data", "data", accountId, "clan"], response);
          return clan
            ? resolve({
                id: clan.clan_id,
                createdAt: clan.created_at,
                membersCount: clan.members_count,
                name: clan.name,
                tag: clan.tag
              })
            : reject(Error("Player is not in a clan."));
        })
        .catch(error => {
          console.log(error);
          return reject(error);
        });
    });
  }

  getShip(shipId) {
    return new Promise((resolve, reject) => {
      // shipDb may contain expected values only,
      // so check if there's a full record including
      // name
      if (this.shipdb.hasFull(shipId)) {
        let ship = this.shipdb.get(shipId);
        log.debug(`Cache hit: ${shipId} => ${ship.name}`);
        // console.log(ship);
        return resolve(ship);
      } else {
        log.debug(`Cache miss: ${shipId}`);
        this.api
          .get(`/wows/encyclopedia/ships/?ship_id=${shipId}`)
          .then(response => {
            const ship = R.path(["data", "data", shipId], response);
            if (ship) {
              let shipData = {
                name: ship.name,
                isPremium: ship.is_premium || ship.is_special || ship.price_gold > 0 || ship.price_credit === 1,
                isTestShip: ship.has_demo_profile,
                ...ship
              };
              this.shipdb.setFull(shipId, shipData);
              return resolve(shipData);
            } else {
              return reject(Error("Ship not found."));
            }
          })
          .catch(error => {
            log.error(error);
            // console.log(error);
            return reject(error);
          });
      }
    });
  }

  getPlayerShip(shipId, accountId, matchGroup = "pvp") {
    if (matchGroup === "ranked") matchGroup = "rank_solo";
    else if (matchGroup === "cooperative") matchGroup = "pve";
    return new Promise((resolve, reject) => {
      const params = {
        account_id: accountId,
        ship_id: shipId
      };
      if (matchGroup === "rank_solo") params.extra = "rank_solo";
      if (matchGroup === "pve") params.extra = "pve";
      this.api
        .get("/wows/ships/stats/", { params: params })
        .then(response => {
          const ship = R.path(["data", "data", accountId], response);
          if (!ship) {
            return reject(Error("No ship data found."));
          }

          const shipStats = ship[0];
          if (!R.prop(matchGroup, shipStats)) {
            return reject(
              Error("Player has no record in the selected matchGroup")
            );
          }

          const group = shipStats[matchGroup];
          const shipData = {
            battles: group.battles,
            victories: group.wins,
            winrate: group.battles ? (group.wins / group.battles) * 100 : 0,
            survived: group.survived_battles,
            frags: group.frags,
            avgExp: group.battles ? group.xp / group.battles : 0,
            avgDmg: group.battles ? group.damage_dealt / group.battles : 0,
            kdRatio:
              group.battles - group.survived_battles
                ? group.frags / (group.battles - group.survived_battles)
                : 0,
            pr: 0
          };

          if (this.shipdb.has(shipId)) {
            // PR Calculation courtesy of http://wows-numbers.com/de/personal/rating
            const exp = this.shipdb.get(shipId);

            if (
              exp.average_damage_dealt &&
              exp.win_rate &&
              exp.average_frags * shipData.battles
            ) {
              const rDmg = shipData.avgDmg / exp.average_damage_dealt;
              const rWins = shipData.winrate / exp.win_rate;
              const rFrags =
                shipData.frags / (exp.average_frags * shipData.battles);

              const nDmg = Math.max(0, (rDmg - 0.4) / (1 - 0.4));
              const nWins = Math.max(0, (rWins - 0.7) / (1 - 0.7));
              const nFrags = Math.max(0, (rFrags - 0.1) / (1 - 0.1));

              shipData.pr = 700 * nDmg + 300 * nFrags + 150 * nWins;
            } else {
              shipData.pr = 0;
            }
          }
          return resolve(shipData);
        })
        .catch(error => {
          console.log(error);
          return reject(error);
        });
    });
  }
}
