import axios, { AxiosInstance, AxiosResponse } from "axios";
import * as log from "electron-log";
import * as R from "ramda";
import { ShipDB } from "./ship-db";

export class Ship {
  shipId: ShipId;
  name: string;
  isPremium: boolean;
  isTest: boolean;
  type: string;

  constructor(ship: WgShip) {
    this.shipId = ship.ship_id_str;
    this.name = ship.name;
    this.type = ship.type;
    this.isPremium =
      ship.is_premium ||
      ship.is_special ||
      ship.price_gold > 0 ||
      ship.price_credit === 1;
    this.isTest = ship.has_demo_profile;
  }
}

type ShipDict = { [id: string]: Ship };
/**
 * Ship info from Wargaming API
 * Request URL: /wows/encyclopedia/ships/
 *
 */
interface WgShip {
  // Ship description
  description: string;
  // Indicates that ship characteristics are used for illustration, and may be changed.
  has_demo_profile: boolean;
  // Indicates if the ship is Premium ship
  is_premium: boolean;
  // Indicates if the ship is on a special offer
  is_special: boolean;
  // Number of slots for upgrades
  mod_slots?: number;
  // Ship name
  name: string;
  // Nation
  nation: string;
  // List of ships available for research in form of pairs
  next_ships?: any;
  // Cost in credits
  price_credit: number;
  // Cost in gold
  price_gold: number;
  // Ship ID
  ship_id: ShipId;
  // Ship string ID
  ship_id_str: string;
  // Tier
  tier: number;
  // Type of ship
  type: string;
  // List of compatible Modifications
  upgrades?: number[];
}

export type Id = string;
export type AccountId = Id;
export type ShipId = Id;
export type ClanId = Id;

enum MatchGroup {
  Pvp,
  Pve,
  Club,
  Ranked,
  Operations
}

/**
 * Account from Wargaming API
 * Request URL: /wows/account/list/
 *
 */
interface WgAccount {
  readonly account_id: AccountId;
  readonly nickname: string;
}

/**
 * Player from Wargaming API
 * Request URL: /wows/account/info/
 *
 */
interface WgPlayer {
  // User ID
  readonly account_id: AccountId;
  // Date when player's account was created
  readonly created_at: string;
  // Indicates if the game profile is hidden
  readonly hidden_profile: boolean;
  // Player's karma
  // Warning. The field will be disabled.
  readonly karma?: number;
  // Last battle time
  readonly last_battle_time: string;
  // Service Record level
  readonly leveling_points: number;
  // Service Record points
  readonly leveling_tier: number;
  // End time of last game session
  readonly logout_at: string;
  // Player name
  readonly nickname: string;
  // Date when stats for player and player's ships were updated
  readonly stats_updated_at: string;
  // Date when player details were updated
  readonly updated_at: string;

  // Player's private data
  readonly private?: any;

  // Player statistics
  readonly statistics: WgPlayerStats;
}

/**
 * Player stats from Wargaming API
 * Request URL: /wows/account/info/
 * Field: statistics
 *
 */
interface WgPlayerStats {
  readonly battles: number;
  readonly distance: number;

  readonly club?: WgBattleStats;

  readonly oper_div?: WgOperStats;
  readonly oper_div_hard?: WgOperStats;
  readonly oper_solo?: WgOperStats;

  readonly pve?: WgBattleStats;
  readonly pve_div2?: WgBattleStats;
  readonly pve_div3?: WgBattleStats;
  readonly pve_solo?: WgBattleStats;

  readonly pvp?: WgBattleStats;
  readonly pvp_div2?: WgBattleStats;
  readonly pvp_div3?: WgBattleStats;
  readonly pvp_solo?: WgBattleStats;

  readonly rank_div2?: WgBattleStats;
  readonly rank_div3?: WgBattleStats;
  readonly rank_solo?: WgBattleStats;
}

/**
 * Battle stats from Wargaming API
 * Request URL: /wows/account/info/
 * Field: statistics
 * Request URL: /wows/ships/stats/
 *
 */
interface WgBattleStats {
  readonly battles: number;
  readonly damage_dealt: number;
  readonly wins: number;
  readonly draws: number;
  readonly losses: number;
  readonly frags: number;
  readonly survived_battles: number;
  readonly survived_wins: number;
  readonly xp: number;
}

/**
 * Operation stats from Wargaming API
 * Request URL: /wows/account/info/
 * Field: statistics
 * Request URL: /wows/ships/stats/
 *
 */
interface WgOperStats {
  readonly battles: number;
  readonly wins: number;
  readonly losses: number;
  readonly survived_battles: number;
  readonly survived_wins: number;
  readonly xp: number;
}

/**
 * Player clan info from Wargaming API
 * Request URL: /wows/clans/accountinfo/
 *
 */
interface WgPlayerClan {
  // User ID
  readonly account_id: AccountId;
  // Player name
  readonly account_name: string;
  // Clan ID
  readonly clan_id: ClanId;
  // Date when player joined clan
  readonly joined_at: string;
  // Technical position name
  readonly role: string;
  // Short info about clan.
  readonly clan?: WgClanInfo;
}

/**
 * Clan info from Wargaming API
 * Request URL: /wows/clans/accountinfo/
 * Field: clan
 *
 */
interface WgClanInfo {
  // Clan ID
  readonly clan_id: ClanId;
  // Clan creation date
  readonly created_at: string;
  // Number of clan members
  readonly members_count: number;
  // Clan name
  readonly name: string;
  // Clan tag
  readonly tag: string;
}

/**
 *PlayerStatistics for player's ship from Wargaming API
 * Request URL: /wows/ships/stats/
 *
 */
interface WgPlayerShipStats {
  // User ID
  readonly account_id: AccountId;
  // Battles fought
  readonly battles: number;
  // Miles travelled
  readonly distance: number;
  // Last battle time
  readonly last_battle_time: string;
  // Ship ID
  readonly ship_id: ShipId;
  // Date when details on ships were updated
  readonly updated_at: string;

  //PlayerStatistics in Team battles.
  // An extra field.
  readonly club?: WgBattleStats;

  // Player's statistics for playing the Operation mode, normal difficulty, in a Division..
  // An extra field.
  readonly oper_div?: WgOperStats;
  // Player's statistics for playing the Operation mode, hard difficulty, in a Division..
  // An extra field.
  readonly oper_div_hard?: WgOperStats;
  // Player's statistics for playing solo the Operation mode, normal difficulty..
  // An extra field.
  readonly oper_solo?: WgOperStats;

  // Player statistics in all Co-op Battles.
  // An extra field.
  readonly pve?: WgBattleStats;
  readonly pve_div2?: WgBattleStats;
  readonly pve_div3?: WgBattleStats;
  readonly pve_solo?: WgBattleStats;

  readonly pvp?: WgBattleStats;
  readonly pvp_div2?: WgBattleStats;
  readonly pvp_div3?: WgBattleStats;
  readonly pvp_solo?: WgBattleStats;

  readonly rank_div2?: WgBattleStats;
  readonly rank_div3?: WgBattleStats;
  readonly rank_solo?: WgBattleStats;
}

export enum RecordKind {
  Player,
  Clan,
  Ship,
  Hidden,
  NoClan,
  Unresolved
}

export interface PlayerStatistics {
  readonly kind: RecordKind.Player;

  readonly battles: number;
  readonly winrate: number;
  readonly avgExp: number;
  readonly avgDmg: number;
  readonly kdRatio: number;

  readonly finishedLoading: boolean;
  readonly hasData: boolean;
}

export class PlayerBattleStatistics implements PlayerStatistics {
  readonly kind = RecordKind.Player;

  readonly battles: number;
  readonly winrate: number;
  readonly avgExp: number;
  readonly avgDmg: number;
  readonly kdRatio: number;

  readonly finishedLoading: boolean = true;
  readonly hasData: boolean = true;

  constructor(stats: WgBattleStats) {
    this.battles = stats.battles;
    this.winrate = (stats.wins / stats.battles) * 100;
    (this.avgExp = stats.xp / stats.battles),
      (this.avgDmg = stats.damage_dealt / stats.battles);
    this.kdRatio = stats.frags / (stats.battles - stats.survived_battles);
  }
}

export class PlayerOperationStatistics implements PlayerStatistics {
  readonly kind = RecordKind.Player;

  readonly battles: number;
  readonly winrate: number;
  readonly avgExp: number;
  readonly avgDmg: number;
  readonly kdRatio: number;

  readonly finishedLoading: boolean = true;
  readonly hasData: boolean = true;

  constructor(stats: WgOperStats) {
    this.battles = stats.battles;
    this.winrate = (stats.wins / stats.battles) * 100;
    (this.avgExp = stats.xp / stats.battles), (this.avgDmg = 0);
    this.kdRatio = 0;
  }
}

export class HiddenPlayerStatistics {
  kind = RecordKind.Hidden;

  readonly finishedLoading: boolean = true;
  readonly hasData: boolean = false;
}

export class UnresolvedPlayerStatistics {
  kind = RecordKind.Unresolved;

  readonly finishedLoading: boolean = false;
  readonly hasData: boolean = false;
}

export class ClanRecord {
  readonly kind = RecordKind.Clan;

  readonly id: ClanId;
  readonly createdAt: string;
  readonly membersCount: number;
  readonly name: string;
  readonly tag: string;

  readonly finishedLoading: boolean = true;
  readonly hasData: boolean = true;

  constructor(info: WgClanInfo) {
    this.id = info.clan_id;
    this.createdAt = info.created_at;
    this.membersCount = info.members_count;
    this.name = info.name;
    this.tag = info.tag;
  }
}

export class NoClan {
  readonly kind = RecordKind.NoClan;

  readonly finishedLoading: boolean = true;
  readonly hasData: boolean = false;
}

export class UnresolvedClanRecord {
  readonly kind = RecordKind.Unresolved;

  readonly finishedLoading: boolean = false;
  readonly hasData: boolean = false;
}

export interface ShipStatistics {
  readonly kind: RecordKind;

  readonly battles: number;
  readonly winrate: number;
  readonly avgExp: number;
  readonly avgDmg: number;
  readonly kdRatio: number;

  readonly finishedLoading: boolean;
  readonly hasData: boolean;
}

export class ShipBattleStatistics implements ShipStatistics {
  readonly kind = RecordKind.Ship;

  readonly battles: number;
  readonly victories: number;
  readonly survived: number;
  readonly frags: number;
  readonly avgExp: number;
  readonly avgDmg: number;
  readonly kdRatio: number;
  readonly winrate: number;
  readonly pr: number;

  readonly finishedLoading: boolean = true;
  readonly hasData: boolean = true;

  // finishedLoading: boolean = false;

  constructor(stats: WgBattleStats, shipId: ShipId, shipDb: ShipDB) {
    this.battles = stats.battles;
    this.victories = stats.wins;
    this.survived = stats.survived_battles;
    this.frags = stats.frags;
    this.avgExp = stats.battles ? stats.xp / stats.battles : 0;
    this.avgDmg = stats.battles ? stats.damage_dealt / stats.battles : 0;
    (this.kdRatio =
      stats.battles - stats.survived_battles
        ? stats.frags / (stats.battles - stats.survived_battles)
        : 0),
      (this.winrate = stats.battles ? (stats.wins / stats.battles) * 100 : 0);

    this.pr = 0;

    if (shipDb.has(shipId)) {
      // PR Calculation courtesy of http://wows-numbers.com/de/personal/rating
      const exp = shipDb.get(shipId);

      if (
        exp.average_damage_dealt &&
        exp.win_rate &&
        exp.average_frags * this.battles
      ) {
        const rDmg = this.avgDmg / exp.average_damage_dealt;
        const rWins = this.winrate / exp.win_rate;
        const rFrags = this.frags / (exp.average_frags * this.battles);

        const nDmg = Math.max(0, (rDmg - 0.4) / (1 - 0.4));
        const nWins = Math.max(0, (rWins - 0.7) / (1 - 0.7));
        const nFrags = Math.max(0, (rFrags - 0.1) / (1 - 0.1));

        this.pr = 700 * nDmg + 300 * nFrags + 150 * nWins;
      }
    }
  }
}

export class HiddenShipStatistics {
  kind = RecordKind.Hidden;

  readonly finishedLoading: boolean = true;
  readonly hasData: boolean = false;
}

export class UnresolvedShipStatistics {
  kind = RecordKind.Unresolved;

  readonly finishedLoading: boolean = true;
  readonly hasData: boolean = false;
}

export class WowsApi {
  api: AxiosInstance;
  shipDb: ShipDB;

  key: string;
  url: string;

  constructor(key: string, url: string, shipDb: ShipDB) {
    this.api = axios.create({
      baseURL: url,
      timeout: 20000,
      params: {
        application_id: key
      }
    });

    const responseHandler = (response: AxiosResponse<any>) => {
      if (
        response.data.status !== "ok" ||
        R.path(["data", "error"], response)
      ) {
        return Promise.reject(R.path(["data", "error"], response));
      } else {
        return response;
      }
    };

    const errorHandler = (error: any) => {
      return Promise.reject(error);
    };

    this.api.interceptors.response.use(responseHandler, errorHandler);

    this.shipDb = shipDb;
    this.key = key;
    this.url = url;

    log.debug(`Created WowsApi(${key}, ${url})`);
  }

  clearCache() {
    this.shipDb.clear();
  }

  async findAccount(playerName: string): Promise<AccountId> {
    return new Promise((resolve, reject) => {
      log.debug(`findPlayer(${playerName})`);
      // Find the player's account ID. We use Wargaming's
      // API to search by the player's name. The API returns a list of
      // players whose names match our search (i.e. searching for 'Alfred'
      // returns 'Alfred1', 'Alfred_accurate', 'AlfredAlfred' an so on), so
      // we have to search the response list ourselves for the right player
      this.api
        // .get(`/wows/account/list/?search=${encodeURIComponent(playerName)}`)
        .get("/wows/account/list/", { params: { search: playerName } })
        .then(response => {
          const account: WgAccount | undefined = R.find(
            R.propEq("nickname", playerName)
          )(response.data.data);
          if (account) {
            log.debug(`findPlayer(${playerName}) => ${account.account_id}`);
            return resolve(account.account_id);
          } else {
            return reject(Error("Player not found"));
          }
        })
        .catch(error => {
          // console.log(error);
          log.error(error);
          return reject(Error("Player not found"));
        });
    });
  }

  // private playerStatsToRecord(stats: WgPlayerStats, matchGroup: string):PlayerStatistics | HiddenRecord {
  //   if (
  //     resp &&
  //     (!resp.statistics ||
  //       resp.hidden_profile ||
  //       !R.path(["statistics", matchGroup], resp))
  //   ) {
  //     return new HiddenRecord();
  //   } else {
  //     const group = resp.statistics[matchGroup];
  //     return newPlayerStatistics(
  //       group.battles,
  //       (group.wins / group.battles) * 100,
  //       group.xp / group.battles,
  //       group.damage_dealt / group.battles,
  //       group.frags / (group.battles - group.survived_battles),
  //     );
  //   }
  // }

  async getPlayersStats(
    accounts: AccountId[],
    matchGroup: string = "pvp"
    // ): Promise<(PlayerStatistics | HiddenPlayerStatistics)[]> {
  ): Promise<{ [id: string]: PlayerStatistics | HiddenPlayerStatistics }> {
    if (matchGroup === "ranked") matchGroup = "rank_solo";
    else if (matchGroup === "cooperative") matchGroup = "pve";

    return new Promise((resolve, reject) => {
      // Our second step is looking up the player's stats using their account IDs.
      const params = {
        account_id: accounts.join(","), //R.map( (acc) => account_id, accounts).join(","),
        extra: ""
      };

      if (matchGroup === "rank_solo") params.extra = "statistics.rank_solo";
      if (matchGroup === "pve") params.extra = "statistics.pve";

      this.api
        .get("/wows/account/info/", { params: params })
        .then(response => {
          const players = R.map((resp: WgPlayer) => {
            if (
              resp &&
              (!resp.statistics ||
                resp.hidden_profile ||
                !R.path(["statistics", matchGroup], resp))
            ) {
              return new HiddenPlayerStatistics();
            } else {
              const group = resp.statistics[matchGroup];
              // TODO: Operations
              return new PlayerBattleStatistics(group);
            }
          })(response.data.data);
          return resolve(players);
        })
        .catch(error => {
          return reject(error);
        });
    });
  }

  async getPlayerClan(accountId: AccountId): Promise<ClanRecord | NoClan> {
    return new Promise((resolve, reject) => {
      this.api
        .get("/wows/clans/accountinfo/", {
          params: { account_id: accountId, extra: "clan" }
        })
        .then(resp => {
          // console.log(resp);

          const getClan = R.path<WgClanInfo | undefined>(["data", "data", accountId, "clan"]);
          const playerClan = getClan(resp);
          console.log(playerClan);

          if (playerClan) {
            return new ClanRecord(playerClan);
          } else {
            return new NoClan();
          }
        })
        .catch(error => {
          console.log(error);
          return reject(error);
        });
    });
  }

  async getShip(shipId: ShipId): Promise<Ship> {
    return new Promise((resolve, reject) => {
      console.log(`getShip(${shipId})`);
      // shipDb may contain expected values only,
      // so check if there's a full record including
      // name
      if (this.shipDb.hasFull(shipId)) {
        let ship: WgShip = this.shipDb.get(shipId);
        log.debug(`Cache hit: ${shipId} => ${ship.name}`);
        // console.log(ship);
        return resolve(new Ship(ship));
      } else {
        log.debug(`Cache miss: ${shipId}`);
        this.api
          .get("/wows/encyclopedia/ships/", {
            params: {
              ship_id: shipId,
              fields: "-default_profile,-modules,-upgrades,-next_ships"
            }
          })
          .then(response => {
            const wgShip: WgShip = R.path(["data", "data", shipId], response);
            if (wgShip) {
              // no cache hit earlier, so cache it now
              this.shipDb.setFull(shipId, wgShip);
              return resolve(new Ship(wgShip));
            } else {
              return reject(Error("Ship not found."));
            }
          })
          .catch(error => {
            log.error(error);
            return reject(error);
          });
      }
    });
  }

  async getShips(
    shipIds: ShipId[]
    // ): Promise<Ship[]> {
  ): Promise<ShipDict> {
    // return new Promise((resolve, reject) => {
    let shipsToApi: ShipId[] = [];
    // let shipsFromDb: WgShip[] = [];
    let shipsFromDb: ShipDict = {};
    let shipsFromApi: ShipDict = {};

    // Look for cached ships first
    for (const shipId of shipIds) {
      // shipDb may contain expected values only,
      // so check if there's a full record including
      // name
      if (this.shipDb.hasFull(shipId)) {
        const wgShip: WgShip = this.shipDb.get(shipId);
        log.debug(`Cache hit: ${shipId} => ${wgShip.name}`);
        shipsFromDb[shipId] = new Ship(wgShip);
      } else {
        log.debug(`Cache miss: ${shipId}`);
        shipsToApi.push(shipId);
      }
    }

    // Then resolve the rest -- if any -- via API
    try {
      shipsToApi = shipIds;
      if (shipsToApi.length > 0) {
        const response = await this.api.get("/wows/encyclopedia/ships/", {
          params: {
            ship_id: shipsToApi.join(","),
            fields: "-default_profile,-modules,-upgrades,-next_ships"
          }
        });

        console.log(response);

        const wgShips = response.data.data;

        // shipsFromApi = R.map((wgShip: WgShip) => {
        //   this.shipDb.setFull(wgShip.ship_id, wgShip);
        //   return wgShip;
        // })(wgShips.data.data);

        for (const shipId in wgShips) {
          this.shipDb.setFull(shipId, wgShips[shipId]);
          shipsFromApi[shipId] = new Ship(wgShips[shipId]);
        }
      }

      console.log(shipsFromApi);

      // let allShips: ShipDict = {};
      // for (const wgShip of R.concat(shipsFromDb, shipsFromApi)) {
      //   allShips[wgShip.ship_id] = new Ship(wgShip);
      // }

      return Promise.resolve({
        ...shipsFromApi,
        ...shipsFromDb
      });
    } catch (error) {
      log.error(error);
      return Promise.reject(error);
    }
  }

  async getPlayerShip(
    shipId: ShipId,
    accountId: AccountId,
    matchGroup: string = "pvp"
  ): Promise<ShipBattleStatistics | HiddenShipStatistics> {
    if (matchGroup === "ranked") matchGroup = "rank_solo";
    else if (matchGroup === "cooperative") matchGroup = "pve";
    // return new Promise((resolve, reject) => {
    const params = {
      account_id: accountId,
      ship_id: shipId,
      extra: ""
    };
    if (matchGroup === "rank_solo") params.extra = "rank_solo";
    if (matchGroup === "pve") params.extra = "pve";

    try {
      const response = await this.api.get("/wows/ships/stats/", {
        params: params
      });
      const ship = response.data.data[accountId];

      if (!ship) {
        return Promise.resolve(new HiddenShipStatistics());
      }

      const shipStats = ship[0];

      if (!R.prop(matchGroup, shipStats)) {
        return Promise.reject(
          Error("Player has no record in the selected matchGroup")
        );
      }

      const group = shipStats[matchGroup];
      const shipData = new ShipBattleStatistics(group, shipId, this.shipDb);

      return Promise.resolve(shipData);
    } catch (error) {
      console.error(error);
      log.error(error);
      return Promise.reject(error);
    }
  }
}
