"use strict";

import { app, protocol, shell, BrowserWindow, Menu } from "electron";
import {
  createProtocol,
  installVueDevtools
} from "vue-cli-plugin-electron-builder/lib";
// import * as windowState from "electron-window-state";
const windowState = require("electron-window-state");
import config from "./config";

const isDevelopment = process.env.NODE_ENV !== "production";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | undefined;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

function createWindow() {
  // Get saved window state
  const winOpts = {
    file: "chistr-window-state.json",
    defaultWidth: 1200,
    defaultHeight: 800
  };
  let mainWindowState = windowState(winOpts);

  // Create the browser window.
  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindowState.manage(win);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  win.on("closed", () => {
    win = undefined;
  });

  createMenu(win);

  // Open all target="_blank" link in external browser
  // See: http://www.qcode.in/convert-vue-js-app-native-desktop-app-using-electron/
  win.webContents.on("new-window", (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
}

function createMenu(mainWindow: BrowserWindow) {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [
        // {
        //   label: 'Edit settings file...',
        //   click () { electronstore.openInEditor() }
        // },
        {
          label: "Edit settings file...",
          click() {
            config.openInEditor();
          }
        },
        {
          label: "Settings...",
          click() {
            mainWindow.webContents.send("open-settings");
          }
        },
        { type: "separator" },
        { role: "quit" }
      ]
    },
    {
      label: "View",
      submenu: [
        {
          role: "reload",
          accelerator: "CmdOrCtrl+R"
        },
        {
          role: "forcereload",
          accelerator: "CmdOrCtrl+Shift+R"
        },
        {
          type: "separator"
        },
        {
          role: "zoomin",
          accelerator: "CmdOrCtrl+plus"
        },
        {
          role: "zoomout",
          accelerator: "CmdOrCtrl+Shift+-"
        },
        { type: "separator" },
        {
          role: "toggledevtools",
          accelerator: "CmdOrCtrl+Shift+I"
        }
      ]
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About...",
          click() {
            mainWindow.webContents.send("open-about");
          }
        }
      ]
    }
  ];

  // if (config.get("app.debug")) {
  //   template[0].submenu.unshift({
  //     label: "Edit settings file...",
  //     click() {
  //       config.openInEditor();
  //     }
  //   });
  //   template[1].submenu.push({ type: "separator" });
  //   template[1].submenu.push({
  //     role: "toggledevtools",
  //     accelerator: "CmdOrCtrl+Shift+I"
  //   });
  // }

  if (process.platform === "darwin") {
    template.splice(1, 0, {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        // { role: 'pasteandmatchstyle' },
        { role: "delete" },
        { role: "selectall" }
      ]
    });
  }
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installVueDevtools();
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
