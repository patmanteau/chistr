'use strict'

import { app, BrowserWindow, Menu, shell } from 'electron'
import * as windowState from 'electron-window-state'
import config from '../config'

const log = require('electron-log')
log.transports.console.level = 'info'
log.transports.file.level = 'info'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  let mainWindowState = windowState({
    file: 'chistr-window-state.json',
    defaultWidth: 1200,
    defaultHeight: 800
  })

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height
  })

  mainWindowState.manage(mainWindow)

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  createMenu()

  // Open all target="_blank" link in external browser
  // See: http://www.qcode.in/convert-vue-js-app-native-desktop-app-using-electron/
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })
}

function createMenu () {
  const template = [
    {
      label: 'File',
      submenu: [
        // {
        //   label: 'Edit settings file...',
        //   click () { electronstore.openInEditor() }
        // },
        {
          label: 'Settings...',
          click () { mainWindow.webContents.send('open-settings') }
        },
        {type: 'separator'},
        {role: 'quit'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          role: 'reload',
          accelerator: 'CmdOrCtrl+R'
        },
        {
          role: 'forcereload',
          accelerator: 'CmdOrCtrl+Shift+R'
        }
        // {
        //   role: 'toggledevtools',
        //   accelerator: 'CmdOrCtrl+Shift+I'
        // }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About...',
          click () { mainWindow.webContents.send('open-about') }
        }
      ]
    }
  ]

  if (config.get('app.debug')) {
    template[0].submenu.unshift({ label: 'Edit settings file...', click () { config.openInEditor() } })
    template[1].submenu.push({ role: 'toggledevtools', accelerator: 'CmdOrCtrl+Shift+I' })
  }

  if (process.platform === 'darwin') {
    template.splice(1, 0, {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        // { role: 'pasteandmatchstyle' },
        { role: 'delete' },
        { role: 'selectall' }
      ]
    })
  }
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
