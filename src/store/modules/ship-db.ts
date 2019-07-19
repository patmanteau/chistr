import _ from "lodash";
import ElectronStore from "electron-store";

export class ShipDB {
  db: ElectronStore<any>;

  constructor() {
    let datasource = require("../../data/expected.json");
    datasource.data = _.pickBy(
      datasource.data,
      (key: string, val: any) => !_.isEmpty(val),

    );

    this.db = new ElectronStore({
      defaults: datasource,
      name: "chistr-ships"
    });

    if (datasource.time > this.db.get("time")) {
      console.log("Updating expected values...");
      _.forOwn(
        datasource.data,
        (shipId: string, data: any) => { this.set(shipId, data) }
      );
      this.db.set("time", datasource.time);
    }
  }

  clear() {
    this.db.clear();
    let datasource = require("../../data/expected.json");
    datasource.data = _.pickBy(
      datasource.data,
      (key: String, val: any) => !_.isEmpty(val),
    );
    this.db.store = datasource;
  }

  has(shipId: string) {
    // return this.db.has(`data.${shipId.toString()}`);
    return this.db.has(`data.${shipId}`);
  }

  hasFull(shipId: string) {
    return (
      this.has(shipId) &&
      this.get(shipId).hasOwnProperty("name") &&
      // refresh ship names after some time
      this.get(shipId).timestamp > Date.now() - 1000 * 60 * 60 * 24 * 7
    );
  }

  get(shipId: string) {
    return this.db.get(`data.${shipId.toString()}`);
  }

  set(shipId: string, dataObj: any) {
    const _shipId = shipId.toString();
    if (this.has(_shipId)) {
      this.db.set(`data.${_shipId}`, {
        ...this.db.get(`data.${_shipId}`),
        ...dataObj
      });
    } else {
      this.db.set(`data.${_shipId}`, dataObj);
    }
  }

  setFull(shipId: string, ship: any) {
    this.set(shipId, { timestamp: Date.now(), ...ship });
  }

  delete(shipId: string) {
    this.db.delete(shipId);
  }
}
