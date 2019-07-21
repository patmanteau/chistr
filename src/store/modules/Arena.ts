import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import _ from "lodash";
import * as types from "../mutation-types";
import { Promise } from "bluebird";
import {
  WowsApi,
  PlayerStatistics,
  ClanRecord,
  ShipStatistics,
  HiddenPlayerStatistics,
  AccountId,
  ShipId,
  Ship,
  NoClan,
  UnresolvedShipStatistics,
  UnresolvedClanRecord,
  UnresolvedPlayerStatistics,
  RecordKind
} from "@/store/api/wows-api";
// import ShipDB from "@/store/api/ship-db";
import * as log from "electron-log";

const jsonfile = require("jsonfile");
const path = require("path");
// const shipdb = new ShipDB();

// const namespaced: boolean = true;

let wows: WowsApi;

enum PlayerRelation {
  Self = 0,
  Friend = 1,
  Foe = 2
}

export class Player {
  // kind: PlayerKind.Resolved;

  relation: PlayerRelation;
  name: string = "";
  shipId: ShipId;

  accountId: AccountId;
  profileHidden: boolean;

  ship: Ship | UnresolvedShipStatistics;
  clan: ClanRecord | NoClan | UnresolvedClanRecord;
  personalStats:
    | PlayerStatistics
    | HiddenPlayerStatistics
    | UnresolvedPlayerStatistics;
  shipStats: ShipStatistics | UnresolvedShipStatistics;

  finishedLoading: boolean = true;

  errors: string[] = [];

  constructor(name: string, relation: PlayerRelation, shipId: ShipId) {
    this.name = name;
    this.relation = relation;
    this.shipId = shipId;

    this.accountId = "";
    this.profileHidden = false;

    this.ship = new UnresolvedShipStatistics();
    this.clan = new UnresolvedClanRecord();
    this.personalStats = new UnresolvedPlayerStatistics();
    this.shipStats = new UnresolvedShipStatistics();
  }
}

export class PlayerAccountInfo {
  accountId: AccountId;
  profileHidden: boolean;

  constructor(accountId: AccountId, profileHidden: boolean) {
    this.accountId = accountId;
    this.profileHidden = profileHidden;
  }
}

class MatchInfo {
  mapId: string;
  mapDisplayName: string;
  mapName: string;
  mapDescription: string;
  mapIcon: string;
  playerName: string;
  lastMatchDate: string;
  matchGroup: string;

  constructor({
    mapId,
    mapDisplayName,
    playerName,
    dateTime,
    matchGroup
  }: {
    mapId: string;
    mapDisplayName: string;
    playerName: string;
    dateTime: string;
    matchGroup: string;
  }) {
    const mapData = require("@/data/maps.json");
    this.mapId = mapId;
    this.mapDisplayName = mapDisplayName;
    this.playerName = playerName;
    this.lastMatchDate = dateTime;
    this.matchGroup = matchGroup;

    this.mapName = mapData[mapId].name;
    this.mapDescription = mapData[mapId].description;
    this.mapIcon = mapData[mapId].icon;
  }
}

/**
 * Basic player and ship information read from
 * World of Warships' tempArenaInfo.json
 */
interface Vehicle {
  shipId: string;
  relation: number;
  id: string;
  name: string;
}

@Module
export default class Arena extends VuexModule {
  active = false;
  hasData = false;
  matchInfo: MatchInfo | undefined;

  players = new Array<Player>(); //new Map<string, Player>();
  errors = [];

  // for progress display
  completedOperations = 0;
  totalOperations = 1;

  get progress(): number {
    return _.clamp(
      (this.completedOperations / this.totalOperations) * 1.1,
      0,
      1
    );
  }

  get finishedLoading(): boolean {
    return this.completedOperations >= this.totalOperations;
  }

  @Mutation
  [types.SET_ARENA_ACTIVE](isActive: boolean) {
    this.active = isActive;
  }

  @Mutation
  [types.SET_ARENA_DATA](arenaData: any) {
    const mapData = require("../../data/maps.json");

    this.matchInfo = new MatchInfo(arenaData);

    this.players = new Array<Player>();
    for (const v of arenaData.vehicles) {
      let p = new Player(v.name, v.relation, v.shipId);
      this.players.push(p);
    }

    this.completedOperations = 0;
    this.totalOperations = 1;
    this.hasData = true;
  }

  @Mutation
  [types.ADD_ERROR](error: any) {
    this.errors.push(error);
  }

  @Mutation
  [types.CLEAR_ERRORS]() {
    this.errors = [];
  }

  @Mutation
  [types.SET_PLAYER_ACCOUNT_ID]({
    index,
    accountId
  }: {
    index: number;
    accountId: AccountId;
  }) {
    this.players[index].accountId = accountId;
  }

  @Mutation
  [types.SET_PLAYER_DATA]({ index, data }: { index: number; data: any }) {
    this.players[index] = {
      ...data,
      ...this.players[index]
    };
  }

  @Mutation
  [types.SET_PLAYER_STATS]({
    index,
    data
  }: {
    index: number;
    data: PlayerStatistics | HiddenPlayerStatistics;
  }) {
    if (data.kind === RecordKind.Hidden) {
      this.players[index].profileHidden = true;
    }
    this.players[index] = {
      ...this.players[index],
      personalStats: data
    };
  }

  @Mutation
  [types.SET_CLAN_DATA]({
    index,
    data
  }: {
    index: number;
    data: ClanRecord | NoClan;
  }) {
    this.players[index] = {
      ...this.players[index],
      clan: data
    };
  }

  @Mutation
  [types.SET_SHIP_DATA]({ index, data }: { index: number; data: Ship }) {
    this.players[index] = {
      ...this.players[index],
      ship: data
    };
  }

  @Mutation
  [types.SET_SHIP_STATS]({
    index,
    data
  }: {
    index: number;
    data: ShipStatistics;
  }) {
    this.players[index] = {
      ...this.players[index],
      shipStats: data
    };
  }

  @Mutation
  [types.SET_TOTAL_OPERATIONS]({ count }: { count: number }) {
    this.totalOperations = count;
  }

  @Mutation
  [types.INC_COMPLETED_OPERATIONS]() {
    this.completedOperations++;
  }

  @Action
  readArenaData() {
    const arenaJson = path.resolve(
      this.context.rootState.Settings.wows.path,
      "replays/tempArenaInfo.json"
    );
    jsonfile.readFile(arenaJson, (error, obj) => {
      if (error) {
        if (error.code !== "ENOENT") {
          log.error(error);
        }
        if (this.active) {
          this.context.commit(types.SET_ARENA_ACTIVE, false);
        }
      } else {
        if (!this.matchInfo || this.matchInfo.lastMatchDate !== obj.dateTime) {
          this.context.commit(types.SET_ARENA_DATA, obj);
          this.context.commit(types.SET_ARENA_ACTIVE, true);
          // this.context.commit(types.INITIALIZE_ARENA, obj.vehicles);
          this.context.dispatch("resolve");
        }
      }
    });
  }

  @Action
  async resolve() {
    // set progress count
    this.context.commit(types.SET_TOTAL_OPERATIONS, {
      //
      // For each player,
      // 1. find accountId by name
      // 2. set player stats
      // 3. set ship name
      // 4. set ship stats
      // 5. set clan info
      // Then set all player stats
      //
      count: 4 * this.players.length + 1
    });

    wows = new WowsApi(
      this.context.rootState.Settings.wows.api.key,
      this.context.rootState.Settings.wows.api.url
      // shipdb
    );

    let matchGroup = this.context.rootState.Settings.wows.matchgroup;
    if (matchGroup === "auto") {
      matchGroup = this.matchInfo.matchGroup;
    }

    // Fill state.players:
    // 1. Try to resolve vehicle.playerName to a Player object via API
    // 2a. If successful, continue resolution
    // 2b. If unsuccessful, make a stub using only the data from vehicle
    try {
      // Use some kind of Promise.some()
      let accIds: AccountId[] = await Promise.all(
        _.reject(
          this.players
            .map((_p: Player, i: number) =>
              this.context.dispatch("findPlayer", i)
            )
            .map(p => p.catch(e => e)),
          r => r instanceof Error
        )
      );
      // let accIds = await Promise.join(this.players.map((_player, index) => {
      //   return this.context.dispatch("findPlayer", index);
      // }))

      await this.context.dispatch("resolvePlayers", matchGroup);
      await this.context.dispatch("resolveShips");

      this.context.commit(types.SET_ARENA_ACTIVE, true);

      await Promise.join(
        _.flatMap(this.players, (_player, index) => {
          return [
            this.context.dispatch("resolveShipStats", { index, matchGroup }),
            this.context.dispatch("resolveClan", index)
          ];
        })
      );

      // this.context.dispatch("resolvePlayers", matchGroup);
      // this.context.dispatch("resolveShips");

      // this.context.commit(types.SET_ARENA_ACTIVE, true);

      // for (const index of this.players.keys()) {
      //   this.context.dispatch("resolveShipStats", index, matchGroup);
      //   this.context.dispatch("resolveClan", index);
      // }
    } catch (error) {
      log.error(error);
    }
  }

  @Action
  async findPlayer(index: number): Promise<AccountId> {
    // Get the player's account ID
    const player = this.players[index];

    try {
      const accountId = await wows.findAccount(player.name);
      log.debug(`${player.name} has accId ${accountId}`);

      this.context.commit(types.SET_PLAYER_ACCOUNT_ID, {
        index,
        accountId
      });

      this.context.commit(types.INC_COMPLETED_OPERATIONS);
      console.log(`Found player: ${player.name} => ${accountId}`);

      return Promise.resolve(accountId);
    } catch (error) {
      log.error(error);

      _.forEach(
        [types.SET_PLAYER_STATS, types.SET_CLAN_DATA, types.SET_SHIP_STATS],
        (typ: string) => this.context.commit(typ, didFinishOk(false, index))
      );

      this.context.commit(types.INC_COMPLETED_OPERATIONS);

      log.error(error);
      return Promise.reject(error);
    }
  }

  @Action
  async resolveClan(index: number) {
    // const player = this.context.getters.player(name);
    // const player = this.players[this.playerIndex[name]];
    // if (!player.accountId) {
    //   return Promise.reject(Error(`Invalid account id for player ${name}`));
    // } else {
    const player = this.players[index];

    try {
      const clanData = await wows.getPlayerClan(player.accountId);
      this.context.commit(
        types.SET_CLAN_DATA,
        didFinishOk(true, index, clanData)
      );
      this.context.commit(types.INC_COMPLETED_OPERATIONS);
      return Promise.resolve();
    } catch (error) {
      this.context.commit(types.SET_CLAN_DATA, didFinishOk(false, index));
      this.context.commit(types.INC_COMPLETED_OPERATIONS);
      console.log(error);
      return Promise.resolve();
    }
  }

  @Action
  async resolveShips() {
    const shipIds: ShipId[] = this.players.map(p => p.shipId);

    try {
      let ships = await wows.getShips(shipIds);
      for (const [index, player] of this.players.entries()) {
        const ship = ships[player.shipId];

        if (ship) {
          this.context.commit(
            types.SET_SHIP_DATA,
            didFinishOk(true, index, ship)
          );
        } else {
          this.context.commit(
            types.SET_SHIP_DATA,
            didFinishOk(false, index, {
              name: "Ship not found"
            })
          );
        }
        this.context.commit(types.INC_COMPLETED_OPERATIONS);
      }
      return Promise.resolve();
    } catch (error) {
      this.context.commit(types.INC_COMPLETED_OPERATIONS);
      return Promise.reject(error);
    }
  }

  @Action
  async resolveShipStats({
    index,
    matchGroup
  }: {
    index: number;
    matchGroup: string;
  }) {
    // First resolve ship
    const player = this.players[index];

    if (!player.accountId) {
      return Promise.reject(Error("Invalid account id"));
    } else if (player.profileHidden) {
      console.log(
        `Won't get ship stats for ${player.name}...profile is hidden`
      );
      log.debug(`Won't get ship stats for ${player.name}...profile is hidden`);
      this.context.commit(types.INC_COMPLETED_OPERATIONS);
    } else {
      try {
        const shipData = await wows.getPlayerShip(
          player.shipId,
          player.accountId,
          matchGroup
        );
        this.context.commit(
          types.SET_SHIP_STATS,
          didFinishOk(true, index, shipData)
        );
        this.context.commit(types.INC_COMPLETED_OPERATIONS);
        return Promise.resolve();
      } catch (error) {
        this.context.commit(types.SET_SHIP_STATS, didFinishOk(false, index));
        this.context.commit(types.INC_COMPLETED_OPERATIONS);
        console.error(error);

        return Promise.resolve();
      }
    }
  }

  @Action
  async resolvePlayers(matchGroup: string) {
    try {
      const accountIds = this.players.map(p => p.accountId);
      const playerData = await wows.getPlayersStats(accountIds, matchGroup);

      for (const [index, player] of this.players.entries()) {
        const name = player.name;
        const data = playerData[player.accountId]; //.find(pd => pd.name === name);
        if (data) {
          this.context.commit(
            types.SET_PLAYER_STATS,
            didFinishOk(true, index, data)
          );
        } else {
          log.error(`Got no response at all for player ${name}`);
        }
      }
      this.context.commit(types.INC_COMPLETED_OPERATIONS);
      return Promise.resolve();
    } catch (error) {
      console.log(error);
      this.context.commit(types.INC_COMPLETED_OPERATIONS);

      return Promise.reject(error);
    }
  }

  @Action
  clearApiCache() {
    // shipdb.clear();
    wows.clearApiCache();
  }
}

function didFinishOk(ok: boolean, index: number, extraData: any = undefined) {
  // let obj = {
  //   index,
  //   data: {
  //     finishedLoading: true,
  //     hasData: ok
  //   }
  // };
  let obj = {
    index,
    data: {}
  };

  if (extraData) {
    // Object.assign(obj.data, extraData);
    obj.data = {
      ...extraData,
      ...obj.data
    };
  }

  return obj;
}
