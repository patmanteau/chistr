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

// This is kludgy - if an older config file exists, it won't
// have a playerListSort key. ElectronStore defaults, though,
// only seem to apply to top-level properties, ignoring the already
// existing app key. So, either use a new top-level property,
// which I don't want to do, or insert the key after ElectronStore
// creation if needed
config.has('app.playerListSort') || config.set('app.playerListSort', {
  key: 'playerWinrate',
  order: 1
})

export default config
