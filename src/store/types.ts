export interface RootState {
    version: string;
}

export interface ArenaVehicle {
    shipId: string;
    relation: number;
    id: string;
    name: string;
}

export class Player {
    //
    name: string = "";
    accountId: string = "";

    relation: number = 0;

    errors: string[] = [];

    personal?: PersonalRecord;
    clan?: ClanRecord;
    ship?: ShipRecord;

    constructor(name: string, accountId: string) {
        this.name = name;
        this.accountId = accountId;
    }
}

export class PersonalRecord {
    battles: number = 0;
    winrate: number = 0;
    avgExp: number = 0;
    avgDmg: number = 0;
    kdRatio: number = 0.0;
    finishedLoading: boolean = false;
}

export class ClanRecord {
    id: string = "";
    hasRecord: boolean = false;
    finishedLoading: boolean = false;
    createdAt: string = "";
    membersCount: number = 0;
    name: string = "";
    tag: string = "";
}

export class ShipRecord {
    id: string = "";
    hasRecord: boolean = false;
    name: string = "";
    isPremium: boolean = false;
    isTestShip: boolean = false;
    battles: number = 0;
    victories: number = 0;
    survived: number = 0;
    frags: number = 0;
    avgExp: number = 0;
    avgDmg: number = 0;
    kdRatio: number = 0.0;
    winrate: number = 0.0;
    pr: number = 0;
    finishedLoading: boolean = false;
}

// {
//     accountId: "",
//     name: item.name,
//     relation: item.relation,
//     errors: [],
//     personal: {
//       hasRecord: false,
//       battles: 0,
//       winrate: 0,
//       avgExp: 0,
//       avgDmg: 0,
//       kdRatio: 0.0,
//       finishedLoading: false
//     },
//     clan: {
//       id: "",
//       hasRecord: false,
//       finishedLoading: false,
//       createdAt: "",
//       membersCount: 0,
//       name: "",
//       tag: ""
//     },
//     ship: {
//       id: item.shipId,
//       hasRecord: false,
//       name: "",
//       isPremium: false,
//       isTestShip: false,
//       battles: 0,
//       victories: 0,
//       survived: 0,
//       frags: 0,
//       avgExp: 0,
//       avgDmg: 0,
//       kdRatio: 0.0,
//       winrate: 0.0,
//       pr: 0,
//       finishedLoading: false
//     }
//   }
