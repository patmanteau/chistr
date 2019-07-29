import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";
import * as log from "electron-log";
import _ from "lodash";
import ShipDB from "@/store/api/ship-db";
import { Promise } from "bluebird";
import config from "@/config";

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

export class Ship {
  readonly kind = RecordKind.Ship;
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

export class NoShip {
  readonly kind = RecordKind.Unresolved;
}

type ShipDict = { [id: string]: Ship };

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
  readonly victories: number;
  readonly survived: number;
  readonly frags: number;
  readonly winrate: number;
  readonly avgExp: number;
  readonly totalExp: number;
  readonly avgDmg: number;
  readonly totalDmg: number;
  readonly kdRatio: number;

  readonly finishedLoading: boolean = true;
  readonly hasData: boolean = true;

  private constructor(
    battles: number,
    victories: number,
    survived: number,
    frags: number,
    totalExp: number,
    totalDmg: number
  ) {
    this.battles = battles;
    this.victories = victories;
    this.survived = survived;
    this.frags = frags;
    this.winrate = (victories / battles) * 100;
    this.avgExp = totalExp / battles;
    this.totalExp = totalExp;
    this.avgDmg = totalDmg / battles;
    this.totalDmg = totalDmg;
    this.kdRatio = frags / (battles - survived);
  }

  static from(stats: WgBattleStats): PlayerBattleStatistics {
    return new PlayerBattleStatistics(
      stats.battles,
      stats.wins,
      stats.survived_battles,
      stats.frags,
      stats.xp,
      stats.damage_dealt
    );
  }

  add(
    other: PlayerBattleStatistics | HiddenPlayerStatistics
  ): PlayerBattleStatistics {
    if (other instanceof HiddenPlayerStatistics) {
      return this;
    } else {
      return new PlayerBattleStatistics(
        this.battles + other.battles,
        this.victories + other.victories,
        this.survived + other.survived,
        this.frags + other.frags,
        this.totalExp + other.totalExp,
        this.totalDmg + other.totalDmg
      );
    }
  }
}

// export class PlayerOperationStatistics implements PlayerStatistics {
//   readonly kind = RecordKind.Player;

//   readonly battles: number;
//   readonly victories: number;
//   readonly winrate: number;
//   readonly survived: number;
//   readonly avgDmg: number = 0;
//   readonly avgExp: number;
//   readonly totalExp: number;
//   readonly kdRatio: number = 0;

//   readonly finishedLoading: boolean = true;
//   readonly hasData: boolean = true;

//   private constructor(
//     battles: number,
//     victories: number,
//     survived: number,
//     totalExp: number,
//   ) {
//     this.battles = battles;
//     this.victories = victories;
//     this.survived = survived;
//     this.winrate = (victories / battles) * 100;
//     this.avgExp = totalExp / battles;
//     this.totalExp = totalExp;
//   }

//   static from(stats: WgOperStats): PlayerOperationStatistics {
//     return new PlayerOperationStatistics(
//       stats.battles,
//       stats.wins,
//       stats.survived_battles,
//       stats.xp,
//     );
//   }

//   add(other: PlayerOperationStatistics | HiddenPlayerStatistics): PlayerOperationStatistics {
//     if (other instanceof HiddenPlayerStatistics) {
//       return this;

//     } else if (other instanceof PlayerBattleStatistics) {
//       console.log("Attempted to add battle to operation stats");
//       return this;

//     } else {
//       return new PlayerOperationStatistics(
//         this.battles + other.battles,
//         this.victories + other.victories,
//         this.survived + other.survived,
//         this.totalExp + other.totalExp,
//       );
//     }
//   }
// }

export class HiddenPlayerStatistics {
  kind = RecordKind.Hidden;

  readonly finishedLoading: boolean = true;
  readonly hasData: boolean = false;

  add(
    other: PlayerBattleStatistics | HiddenPlayerStatistics
  ): PlayerBattleStatistics | HiddenPlayerStatistics {
    return other;
  }
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

  private readonly shipId: ShipId;
  private readonly shipDb: ShipDB;

  readonly battles: number;
  readonly victories: number;
  readonly survived: number;
  readonly frags: number;
  readonly avgExp: number;
  readonly totalExp: number;
  readonly avgDmg: number;
  readonly totalDmg: number;
  readonly kdRatio: number;
  readonly winrate: number;
  readonly pr: number;

  readonly finishedLoading: boolean = true;
  readonly hasData: boolean = true;

  private constructor(
    battles: number,
    victories: number,
    survived: number,
    frags: number,
    totalExp: number,
    totalDmg: number,
    shipId: ShipId,
    shipDb: ShipDB
  ) {
    this.battles = battles;
    this.victories = victories;
    this.survived = survived;
    this.frags = frags;
    this.avgExp = battles ? totalExp / battles : 0;
    this.totalExp = totalExp;
    this.avgDmg = battles ? totalDmg / battles : 0;
    this.totalDmg = totalDmg;
    this.kdRatio = battles - survived ? frags / (battles - survived) : 0;
    this.winrate = battles ? (victories / battles) * 100 : 0;
    this.shipId = shipId;
    this.shipDb = shipDb;

    this.pr = 0;

    if (shipDb.has(shipId)) {
      // PR Calculation courtesy of http://wows-numbers.com/de/personal/rating
      const exp = shipDb.get(shipId);

      if (
        exp.average_damage_dealt &&
        exp.win_rate &&
        exp.average_frags * battles
      ) {
        const rDmg = this.avgDmg / exp.average_damage_dealt;
        const rWins = this.winrate / exp.win_rate;
        const rFrags = frags / (exp.average_frags * battles);

        const nDmg = Math.max(0, (rDmg - 0.4) / (1 - 0.4));
        const nWins = Math.max(0, (rWins - 0.7) / (1 - 0.7));
        const nFrags = Math.max(0, (rFrags - 0.1) / (1 - 0.1));

        this.pr = 700 * nDmg + 300 * nFrags + 150 * nWins;
      }
    }
  }

  static from(
    stats: WgBattleStats,
    shipId: ShipId,
    shipDb: ShipDB
  ): ShipBattleStatistics {
    return new ShipBattleStatistics(
      stats.battles,
      stats.wins,
      stats.survived_battles,
      stats.frags,
      stats.xp,
      stats.damage_dealt,
      shipId,
      shipDb
    );
  }

  add(other: ShipBattleStatistics | NoShipStatistics): ShipBattleStatistics {
    if (other instanceof NoShipStatistics) {
      return this;
    } else {
      const battles = this.battles + other.battles;
      const victories = this.victories + other.victories;
      const survived = this.survived + other.survived;
      const frags = this.frags + other.frags;
      const totalExp = this.totalExp + other.totalExp;
      const totalDmg = this.totalDmg + other.totalDmg;

      return new ShipBattleStatistics(
        battles,
        victories,
        survived,
        frags,
        totalExp,
        totalDmg,
        this.shipId,
        this.shipDb
      );
    }
  }
}

export class NoShipStatistics {
  kind = RecordKind.Hidden;

  readonly finishedLoading: boolean = true;
  readonly hasData: boolean = false;

  add(
    other: ShipBattleStatistics | NoShipStatistics
  ): ShipBattleStatistics | NoShipStatistics {
    return other;
  }
}

export class UnresolvedShipStatistics {
  kind = RecordKind.Unresolved;

  readonly finishedLoading: boolean = true;
  readonly hasData: boolean = false;
}

export class WowsApi {
  api: AxiosInstance;
  shipDb: ShipDB;

  // debug: boolean;

  key: string;
  url: string;

  constructor(key: string, url: string) {
    this.api = axios.create({
      baseURL: url,
      timeout: 20000,
      params: {
        application_id: key
      }
    });

    const debug = config.get("app.debugRequests");

    const responseHandler = (response: AxiosResponse<any>) => {
      if (response.data.status !== "ok" || _.get(response, ["data", "error"])) {
        return Promise.reject(_.get(response, ["data", "error"]));
      } else {
        return response;
      }
    };

    const debugResponseHandler = (response: AxiosResponse<any>) => {
      const resJson = JSON.stringify(
        _.pick(response, ["data", "status", "statusText", "headers"])
      );
      log.debug(`Response <= ${resJson}`);
      return responseHandler(response);
    };

    const errorHandler = (error: any) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        log.error(`Error ${error.status}`);
        log.error("Headers:");
        log.error(error.headers);
        log.error("Data:");
        log.error(error.data);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        log.error("No response received");
        log.error("Request:");
        log.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        log.error("Internal error");
        log.error(error);
      }

      return Promise.reject(error);
    };

    const debugRequestHandler = (request: AxiosRequestConfig) => {
      const reqJson = JSON.stringify(request.params);
      log.debug(`Request => ${reqJson}`);
      return request;
    };

    if (debug) {
      log.debug(
        "Debug mode is active. Recording all requests and responses...this will be slow."
      );
    }

    this.api.interceptors.response.use(
      debug ? debugResponseHandler : responseHandler,
      errorHandler
    );

    if (debug) {
      this.api.interceptors.request.use(debugRequestHandler);
    }

    // this.shipDb = shipDb;
    this.shipDb = new ShipDB();
    this.key = key;
    this.url = url;

    log.debug(`Created WowsApi(${key}, ${url})`);
  }

  clearCache() {
    this.shipDb.clear();
  }

  async findAccount(playerName: string): Promise<AccountId> {
    log.debug(`findPlayer(${playerName})`);
    // Find the player's account ID. We use Wargaming's
    // API to search by the player's name. The API returns a list of
    // players whose names match our search (i.e. searching for 'Alfred'
    // returns 'Alfred1', 'Alfred_accurate', 'AlfredAlfred' an so on), so
    // we have to search the response list ourselves for the right player
    try {
      const response = await this.api.get("/wows/account/list/", {
        params: {
          search: playerName
        }
      });

      const account: WgAccount | undefined = _.find(
        response.data.data,
        _.matchesProperty("nickname", playerName)
      );

      if (account) {
        log.debug(`findPlayer(${playerName}) => ${account.account_id}`);
        return Promise.resolve(account.account_id);
      } else {
        return Promise.reject(Error("Player not found"));
      }
    } catch (error) {
      log.error(error);
      return Promise.reject(Error("Player not found"));
    }
  }

  async getPlayersStats(
    accounts: AccountId[],
    matchGroup: string = "pvp"
    // ): Promise<(PlayerStatistics | HiddenPlayerStatistics)[]> {
  ): Promise<{ [id: string]: PlayerStatistics | HiddenPlayerStatistics }> {
    log.debug(`getPlayersStats(${accounts})`);
    let groups: string[] = ["pvp"];

    if (matchGroup === "ranked")
      groups = ["rank_solo", "rank_div2", "rank_div3"];
    else if (matchGroup === "cooperative") groups = ["pve"];
    else if (matchGroup === "operation")
      groups = ["oper_solo", "oper_div", "oper_div_hard"];
    else if (matchGroup === "club") groups = ["club"];

    // Our second step is looking up the player's stats using their account IDs.
    const params = {
      account_id: accounts.join(","),
      // statistics.pvp gets delivered by default and the API errors when it's
      // requested as extra
      extra: _.without(groups, "pvp")
        .map(g => `statistics.${g}`)
        .join(",")
    };

    try {
      const response = await this.api.get("/wows/account/info/", {
        params: params
      });

      const stats: {
        [id: string]: PlayerStatistics | HiddenPlayerStatistics;
      } = {};

      for (const accountId of accounts) {
        const wgPlayer = _.get(response, ["data", "data", accountId]);

        if (wgPlayer.hidden_profile) {
          stats[accountId] = new HiddenPlayerStatistics();
        } else {
          // TODO: Operations
          const wgBattleStats = _.map(groups, g => {
            const groupStats = _.get(wgPlayer, ["statistics", g]);

            if (groupStats) {
              return PlayerBattleStatistics.from(groupStats);
            } else {
              return new HiddenPlayerStatistics();
            }
          });

          stats[accountId] = _.reduce(
            wgBattleStats,
            (acc, battleStats) => {
              return acc.add(battleStats);
            },
            new HiddenPlayerStatistics()
          );
        }
      }
      return Promise.resolve(stats);
    } catch (error) {
      log.error(error);
      return Promise.reject(error);
    }
  }

  async getShips(shipIds: ShipId[]): Promise<ShipDict> {
    log.debug(`getShips(${shipIds})`);

    let shipsToApi: ShipId[] = [];
    let shipsFromDb: ShipDict = {};
    let shipsFromApi: ShipDict = {};

    // Look for cached ships first
    for (const shipId of shipIds) {
      // shipDb may contain expected values only,
      // so check if there's a full record including
      // name
      if (this.shipDb.hasFull(shipId)) {
        const wgShip: WgShip = this.shipDb.get(shipId);
        log.debug(`Cache hit => ${wgShip.name}`);
        shipsFromDb[shipId] = new Ship(wgShip);
      } else {
        log.debug(`Ship ${shipId} not in cache`);
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

        const wgShips = response.data.data;

        for (const shipId in wgShips) {
          this.shipDb.setFull(shipId, wgShips[shipId]);
          shipsFromApi[shipId] = new Ship(wgShips[shipId]);
        }
      }

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
  ): Promise<ShipBattleStatistics | NoShipStatistics> {
    log.debug(`getPlayerShip(${shipId}, ${accountId}, ${matchGroup})`);

    let groups: string[] = ["pvp"];

    if (matchGroup === "ranked")
      groups = ["rank_solo", "rank_div2", "rank_div3"];
    else if (matchGroup === "cooperative") groups = ["pve"];

    // Our second step is looking up the player's stats using their account IDs.
    const params = {
      account_id: accountId,
      ship_id: shipId,
      // pvp gets delivered by default and the API errors when it's
      // requested as extra
      extra: _.without(groups, "pvp").join(",")
    };

    try {
      const response = await this.api.get("/wows/ships/stats/", {
        params: params
      });
      const wgShipStats = _.get(response, ["data", "data", accountId, "0"]);

      if (!wgShipStats) {
        return Promise.resolve(new NoShipStatistics());
      }

      const wgBattleStats = _.map(groups, group => {
        const groupStats = _.get(wgShipStats, group);

        if (groupStats) {
          return ShipBattleStatistics.from(groupStats, shipId, this.shipDb);
        } else {
          return new NoShipStatistics();
        }
      });

      const aggStats = _.reduce(
        wgBattleStats,
        (acc, battleStats) => {
          return acc.add(battleStats);
        },
        new NoShipStatistics()
      );

      return Promise.resolve(aggStats);
    } catch (error) {
      // console.error(error);
      log.error(error);
      return Promise.reject(error);
    }
  }

  async getPlayerClan(accountId: AccountId): Promise<ClanRecord | NoClan> {
    log.debug(`getPlayerClan(${accountId})`);
    try {
      const response = await this.api.get("/wows/clans/accountinfo/", {
        params: { account_id: accountId, extra: "clan" }
      });

      const playerClan: WgClanInfo | undefined = _.get(response, [
        "data",
        "data",
        accountId,
        "clan"
      ]);
      if (playerClan) {
        return Promise.resolve(new ClanRecord(playerClan));
      } else {
        return Promise.resolve(new NoClan());
      }
    } catch (error) {
      log.error(error);
      return Promise.reject(error);
    }
  }

  clearApiCache() {
    this.shipDb.clear();
  }
}
