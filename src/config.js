const ElectronStore = require('electron-store')

const config = new ElectronStore({
  defaults: {
    wows: {
      api: {
        key: 'demo',
        url: 'http://api.worldofwarships.eu'
      },
      path: 'C:/Games/World_of_Warships'
    },
    app: {
      debug: false,
      matchgroup: 'auto',
      playerListSort: {
        key: 'playerWinrate',
        order: 1
      }
    }
  },
  name: 'chistr'
})

if (!config.has('app.playerListSort')) {
  config.set('app.playerListSort', {
    key: 'playerWinrate',
    order: 1
  })
}

export default config
