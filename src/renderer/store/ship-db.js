import R from 'ramda'

const ElectronStore = require('electron-store')

export class ShipDB {
  constructor () {
    let datasource = require('../../data/expected.json')
    datasource.data = R.pickBy((key, val) => !R.isEmpty(val), datasource.data)

    this.db = new ElectronStore({
      defaults: datasource,
      name: 'chistr-ships'
    })

    if (datasource.time > this.db.get('time')) {
      console.log('Updating expected values...')
      R.forEach((shipId, data) => {
        this.set(shipId, data)
      })(datasource.data)
      this.db.set('time', datasource.time)
    }
  }

  clear () {
    this.db.clear()
    let datasource = require('../../data/expected.json')
    datasource.data = R.pickBy((key, val) => !R.isEmpty(val), datasource.data)
    this.db.store = datasource
  }

  has (shipId) {
    return this.db.has(`data.${shipId.toString()}`)
  }

  hasName (shipId) {
    return this.has(shipId) &&
      this.get(shipId).hasOwnProperty('name') &&
      // refresh ship names after some time
      this.get(shipId).timestamp > Date.now() - (1000 * 60 * 60 * 24 * 7)
  }

  get (shipId) {
    return this.db.get(`data.${shipId.toString()}`)
  }

  getName (shipId) {
    if (this.hasName(shipId)) {
      return this.get(shipId).name
    } else {
      return undefined
    }
  }

  set (shipId, dataObj) {
    const _shipId = shipId.toString()
    if (this.has(_shipId)) {
      this.db.set(`data.${_shipId}`, { ...this.db.get(`data.${_shipId}`), ...dataObj })
    } else {
      this.db.set(`data.${_shipId}`, dataObj)
    }
  }

  setName (shipId, name) {
    this.set(shipId, { name: name, timestamp: Date.now() })
  }

  delete (shipId) {
    this.db.delete(shipId.toString())
  }
}
