process.once('loaded', () => {
  global.electron = require('electron')
  global.electron.webFrame.setZoomFactor(1.2)
})
