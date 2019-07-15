import { Module, VuexModule, Mutation, Action } from "vuex-module-decorators";
import { MutationTree, GetterTree, ActionTree } from "vuex";
// import * as R from "ramda";
// const R = require("ramda");
import * as R from "ramda";
import * as types from "../mutation-types";
import {
  WowsApi,
  PlayerStatistics,
  ClanRecord,
  ShipStatistics,
  HiddenPlayerStatistics,
  AccountId,
  ShipId,
  Ship,
  NoClan
} from "../wows-api";
import { ShipDB } from "../ship-db";
import * as log from "electron-log";
import { RootState } from "../types";
import { stringify } from "querystring";

const jsonfile = require("jsonfile");
const path = require("path");
const shipdb = new ShipDB();

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
  // account: PlayerAccountInfo | undefined;
  ship: Ship | undefined;
  clan: ClanRecord | NoClan | undefined;
  personalStats: PlayerStatistics | HiddenPlayerStatistics | undefined;
  shipStats: ShipStatistics | undefined;

  finishedLoading: boolean = true;

  errors: string[] = [];

  constructor(name: string, relation: PlayerRelation, shipId: ShipId) {
    this.name = name;
    this.relation = relation;
    this.shipId = shipId;

    this.accountId = "";
    this.profileHidden = false;
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

// export interface ArenaState {
//   active: boolean;
//   hasData: boolean;

//   matchInfo?: MatchInfo;

//   players: Player[];
//   playerIndex: {};
//   errors: [];
//   completedOperations: number;
//   totalOperations: number;
// }

class MatchInfo {
  mapId: string;
  mapDisplayName: string;
  mapName: string;
  mapDescription: string;
  mapIcon: string;
  playerName: string;
  lastMatchDate: string;
  matchGroup: string;

  constructor(
    { mapId, mapDisplayName, playerName, dateTime, matchGroup }
    : { mapId: string, mapDisplayName: string, playerName: string, dateTime: string, matchGroup: string }
    ) {
    const mapData = require("../../data/maps.json");
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
  //  {
  //   lastMatchDate: 0
  // };

  // This will be filled from tempArenaInfo.json
  // when a new match starts
  // vehicles = new Array<Vehicle>();
  // These will be resolved by API calls
  players = new Array<Player>(); //new Map<string, Player>();
  // players: Player[] = [];
  // playerIndex = {};
  errors = [];
  // for progress display
  completedOperations = 0;
  totalOperations = 1;

  get friends(): Player[] {
    return R.filter((player: Player) => player.relation <= 1)(this.players);
  }

  get foes(): Player[] {
    return R.filter((player: Player) => player.relation > 1)(this.players);
  }

  // get players(state: ArenaState, _getters): Player[] {
  //   return state.players;
  // }

  get progress(): number {
    return R.clamp(
      0,
      1,
      (this.completedOperations / this.totalOperations) * 1.1
    );
  }

  get finishedLoading(): boolean {
    // return (
    //   this.hasData &&
    //   R.all(
    //     R.path(["personal", "finishedLoading"]) &&
    //       R.path(["clan", "finishedLoading"]) &&
    //       R.path(["ship", "finishedLoading"])
    //   )(this.players)
    // );
    return (
      this.hasData &&
      R.all(p => p.finishedLoading, this.players)
    )
  }

  // get findPlayerIndex(): (name: string) => {
  //   return this.players.findIndex((val, idx, obj) => {
  //     return val.name === name;
  //   });
  // }

  @Mutation
  [types.SET_ARENA_ACTIVE](isActive: boolean) {
    this.active = isActive;
    if (!isActive) {
      this.matchInfo = undefined;
      // this.matchInfo!.lastMatchDate = "";
    }
  }

  @Mutation
  [types.SET_ARENA_DATA](arenaData: any) {
    const mapData = require("../../data/maps.json");

    this.matchInfo = new MatchInfo(arenaData);

    // this.vehicles = arenaData.vehicles;
    this.players = new Array<Player>();
    for (const v of arenaData.vehicles) {
      let p = new Player(v.name, v.relation, v.shipId);
      this.players.push(p);
    }

    this.completedOperations = 0;
    this.totalOperations = 1;
    this.hasData = true;

    //  {
    //   mapId: arenaData.mapId,
    //   mapName: mapData[arenaData.mapId].name,
    //   mapDescription: mapData[arenaData.mapId].description,
    //   mapIcon: mapData[arenaData.mapId].icon,
    //   mapDisplayName: arenaData.mapDisplayName,
    //   playerName: arenaData.playerName,
    //   lastMatchDate: arenaData.dateTime,
    //   matchGroup: arenaData.matchGroup
    //   // dateTime:"04.07.2017 15:26:52"
    //   // duration:1200
    //   // gameLogic:"Domination"
    //   // gameMode:7
    //   // logic:"Domination"
    //   // mapDisplayName:"17_NA_fault_line"
    //   // mapId:11
    //   // mapName:"spaces/17_NA_fault_line"
    //   // matchGroup:"ranked"
    //   // name:"7x7"
    //   // playerID:0
    //   // playerName:"rottzorr"
    //   // playerVehicle:"PJSB006-Fuso-1943"
    //   // playersPerTeam:7
    //   // scenario:"Ranked_Domination"
    //   // scenarioConfigId:90
    //   // teamsCount:2
    // };
    // state.hasData = true
  }

  @Mutation
  [types.ADD_ERROR](error: any) {
    this.errors.push(error);
  }

  @Mutation
  [types.CLEAR_ERRORS]() {
    this.errors = [];
  }

  // @Mutation
  // [types.INITIALIZE_ARENA](vehicles: Vehicle[]) {
  //   this.players = new Array<Player>();
  //   // for (const v of vehicles) {
  //   //   let p = new Player(v.name, v.relation, v.shipId);
  //   //   this.players.push(p);
  //   // }
  //   this.vehicles = vehicles;

  //   this.completedOperations = 0;
  //   this.totalOperations = 1;
  //   this.hasData = true;
  //   // this.hasData = false;
  //   // const tempPlayers = [];
  //   // const tempIndex = {};
  //   // this.playerIndex = {};
  //   // for (const item of playerList) {
  //   //   tempIndex[item.name] = tempPlayers.length;
  //   //   tempPlayers.push({
  //   //     accountId: "",
  //   //     name: item.name,
  //   //     relation: item.relation,
  //   //     errors: [],
  //   //     personal: {
  //   //       hasRecord: false,
  //   //       battles: 0,
  //   //       winrate: 0,
  //   //       avgExp: 0,
  //   //       avgDmg: 0,
  //   //       kdRatio: 0.0,
  //   //       finishedLoading: false
  //   //     },
  //   //     clan: {
  //   //       id: "",
  //   //       hasRecord: false,
  //   //       finishedLoading: false,
  //   //       createdAt: "",
  //   //       membersCount: 0,
  //   //       name: "",
  //   //       tag: ""
  //   //     },
  //   //     ship: {
  //   //       id: item.shipId,
  //   //       hasRecord: false,
  //   //       name: "",
  //   //       isPremium: false,
  //   //       isTestShip: false,
  //   //       battles: 0,
  //   //       victories: 0,
  //   //       survived: 0,
  //   //       frags: 0,
  //   //       avgExp: 0,
  //   //       avgDmg: 0,
  //   //       kdRatio: 0.0,
  //   //       winrate: 0.0,
  //   //       pr: 0,
  //   //       finishedLoading: false
  //   //     }
  //   //   });
  //   //   this.players = tempPlayers;
  //   //   this.playerIndex = tempIndex;
  //   //   this.completedOperations = 0;
  //   //   this.totalOperations = 1;
  //   //   this.hasData = true;
  //   // }
  // }

  // @Mutation
  // setPlayerAccountId(playerName: string, accountId: AccountId) {
  //   log.debug(`Setting ${playerName}'s accountId: ${accountId}`);
  //   // Object.assign(this.players[this.playerIndex[playerName]], data);
  //   const idx = this.players.findIndex((val, idx, obj) => {
  //     return val.name == playerName;
  //   })

  //   if (idx > 0) {
  //     this.players[idx].accountId = accountId;
  //   } else {
  //     log.error(`Player ${playerName} not found!`);
  //   }
  // }
  @Mutation
  [types.SET_PLAYER_ACCOUNT_ID]({ index, accountId } : { index: number, accountId: AccountId }) {
    this.players[index].accountId = accountId;
  }

  @Mutation
  [types.SET_PLAYER_DATA]({ index, data } : { index: number, data: any}) {
    this.players[index] = {
      ...data,
      ...this.players[index]
    }
  }

  @Mutation
  [types.SET_PLAYER_STATS]({ index, data } : { index: number, data: PlayerStatistics | HiddenPlayerStatistics }) {
    if (data instanceof HiddenPlayerStatistics) {
      this.players[index].profileHidden = true;
    } else {
      this.players[index].personalStats = {
        ...data,
      }
    }
  }

  @Mutation
  [types.SET_CLAN_DATA]({ index, data } : { index: number, data: any }) {
    this.players[index].clan = {
      ...data
    }
  }

  @Mutation
  [types.SET_SHIP_DATA]({ index, data } : { index: number, data: Ship }) {
    this.players[index].ship = {
      ...data,
      // ...this.players[index].ship
    }
  }

  @Mutation
  [types.SET_SHIP_STATS]({ index, data } : { index: number, data: ShipStatistics}) {
    this.players[index].shipStats = {
      ...data,
      // ...this.players[index].shipStats
    }
  }

  @Mutation
  [types.SET_TOTAL_OPERATIONS](count: number) {
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
      count: 3 * this.players.length + 1
    });

    wows = new WowsApi(
      this.context.rootState.Settings.wows.api.key,
      this.context.rootState.Settings.wows.api.url,
      shipdb
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
        R.reject(
          r => r instanceof Error,
          this.players
            .map((_p: Player, i: number) => this.context.dispatch("findPlayer", i))
            .map(p => p.catch(e => e))
        )
      );

      this.context.dispatch("resolvePlayers", matchGroup);
      this.context.dispatch("resolveShips");

      this.context.commit(types.SET_ARENA_ACTIVE, true);
      for (const index of this.players.keys()) {
        this.context.dispatch("resolveShipStats", index, matchGroup);
        this.context.dispatch("resolveClan", index);
      }
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

      R.forEach((typ: string) =>
        this.context.commit(typ, didFinishOk(false, index))
      )([
        types.SET_PLAYER_DATA,
        types.SET_CLAN_DATA,
        types.SET_SHIP_DATA
      ]);

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
        didFinishOk(true, name, clanData)
      );
      this.context.commit(types.INC_COMPLETED_OPERATIONS);
      return Promise.resolve();

    } catch(error) {
      this.context.commit(types.SET_CLAN_DATA, didFinishOk(false, index));
      this.context.commit(types.INC_COMPLETED_OPERATIONS);
      console.log(error);
      return Promise.resolve();
    }
  }

  @Action
  async resolveShips() {
    const shipIds: ShipId[] = this.players.map(p => p.shipId);
    console.log(shipIds);

    try {
      let ships = await wows.getShips(shipIds);
      console.log(ships);

      for (const [index, player] of this.players.entries()) {
        const ship = ships[player.shipId];

        if (ship) {
          this.context.commit(types.SET_SHIP_DATA, {
            index,
            data: ship
          });

        } else {
          this.context.commit(types.SET_SHIP_DATA, {
            index,
            data: {
              name: "Ship not found"
            }
          });
        }
        this.context.commit(types.INC_COMPLETED_OPERATIONS);
      }
      return Promise.resolve();

    } catch(error) {
      this.context.commit(types.INC_COMPLETED_OPERATIONS);
      return Promise.reject();

    }
  }

  @Action
  async resolveShipStats(index: number, matchGroup: string) {
    // First resolve ship
    const player = this.players[index];
    if (!player.accountId) {
      return Promise.reject(Error("Invalid account id"));

    } else if (player.profileHidden) {
      log.debug(`Won't get ship stats for ${player.name}...profile is hidden`);

    } else {

      try {
        const shipData = await wows.getPlayerShip(player.shipId, player.accountId, matchGroup);
        this.context.commit(
          types.SET_SHIP_STATS,
          didFinishOk(true, index, shipData)
        );
        this.context.commit(types.INC_COMPLETED_OPERATIONS);
        return Promise.resolve();

      } catch(error) {
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
          this.context.commit(types.SET_PLAYER_STATS, { index, data });
        } else {
          log.error(`Got no response at all for player ${name}`);
        }
      }
      this.context.commit(types.INC_COMPLETED_OPERATIONS);
      return Promise.resolve();

    } catch(error) {
      console.log(error);
      this.context.commit(types.INC_COMPLETED_OPERATIONS);
      return Promise.reject(error);
    }
  }

  @Action
  clearApiCache() {
    shipdb.clear();
  }
}

function didFinishOk(ok: boolean, index: number, extraData: any = undefined) {
  let obj = {
    index,
    data: {
      finishedLoading: true,
      hasRecord: ok
    }
  };

  if (extraData) {
    // Object.assign(obj.data, extraData);
    obj.data = {
      ...extraData,
      ...obj.data
    }
  }

  return obj;
};
