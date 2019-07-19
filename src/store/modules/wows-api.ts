import axios, { AxiosInstance, AxiosResponse } from "axios";
import * as log from "electron-log";
import _ from "lodash";
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
        _.get(response, ["data", "error"])
      ) {
        return Promise.reject(_.get(response, ["data", "error"]));
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

      const account: WgAccount | undefined = _.find(response.data.data,
        _.matchesProperty("nickname", playerName)
      );

      if (account) {
        log.debug(`findPlayer(${playerName}) => ${account.account_id}`);
        return Promise.resolve(account.account_id);

      } else {
        return Promise.reject(Error("Player not found"));
      }

    } catch(error) {
      log.error(error);
      return Promise.reject(Error("Player not found"));
    }
  }

  async getPlayersStats(
    accounts: AccountId[],
    matchGroup: string = "pvp"
    // ): Promise<(PlayerStatistics | HiddenPlayerStatistics)[]> {
  ): Promise<{ [id: string]: PlayerStatistics | HiddenPlayerStatistics }> {
    if (matchGroup === "ranked") matchGroup = "rank_solo";
    else if (matchGroup === "cooperative") matchGroup = "pve";

    // Our second step is looking up the player's stats using their account IDs.
    const params = {
      account_id: accounts.join(","),
      extra: ""
    };

    if (matchGroup === "rank_solo") params.extra = "statistics.rank_solo";
    if (matchGroup === "pve") params.extra = "statistics.pve";

    try {
      const response = await this.api.get("/wows/account/info/", { params: params });

      const players = _.mapValues(response.data.data, (wgPlayer: WgPlayer) => {
        const group = _.get(wgPlayer, ["statistics", matchGroup]);

        if (wgPlayer.hidden_profile || !group) {
          return new HiddenPlayerStatistics();

        } else {
          // TODO: Operations
          return new PlayerBattleStatistics(group);
        }
      });
      return Promise.resolve(players);

    } catch(error) {
      return Promise.reject(error);
    }
  }

  async getPlayerClan(accountId: AccountId): Promise<ClanRecord | NoClan> {
    try {
      const response = await this.api.get("/wows/clans/accountinfo/", {
        params: { account_id: accountId, extra: "clan" }
      })

      const playerClan: WgClanInfo | undefined = _.get(response, ["data", "data", accountId, "clan"]);
      if (playerClan) {
        return Promise.resolve(new ClanRecord(playerClan));

      } else {
        return Promise.resolve(new NoClan());
      }

    } catch(error) {
      return Promise.reject(error);
    }
  }

  async getShip(shipId: ShipId): Promise<Ship> {
    console.log(`getShip(${shipId})`);
    // shipDb may contain expected values only,
    // so check if there's a full cache record
    if (this.shipDb.hasFull(shipId)) {
      let ship: WgShip = this.shipDb.get(shipId);
      log.debug(`Cache hit: ${shipId} => ${ship.name}`);

      return Promise.resolve(new Ship(ship));

    } else {
      log.debug(`Cache miss: ${shipId}`);

      try {
        const response = await this.api.get("/wows/encyclopedia/ships/", {
          params: {
            ship_id: shipId,
            fields: "-default_profile,-modules,-upgrades,-next_ships"
          }
        });

        const wgShip: WgShip | undefined = _.get(response, ["data", "data", shipId]);
        if (wgShip) {
          // no cache hit earlier, so cache it now
          this.shipDb.setFull(shipId, wgShip);
          return Promise.resolve(new Ship(wgShip));
        } else {
          return Promise.reject(Error("Ship not found."));
        }

      } catch(error) {
        log.error(error);
        return Promise.reject(error);
      }
    }
  }

  async getShips(
    shipIds: ShipId[]
  ): Promise<ShipDict> {

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
  ): Promise<ShipBattleStatistics | HiddenShipStatistics> {

    if (matchGroup === "ranked") matchGroup = "rank_solo";
    else if (matchGroup === "cooperative") matchGroup = "pve";
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

      if (!_.get(shipStats, matchGroup)) {
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
