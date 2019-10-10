import { app, BrowserWindow, ipcMain } from 'electron'


const {autoUpdater} = require('electron-updater');
const feedUrl = `http://127.0.0.1:5500/win32`;
require('update-electron-app')();
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, webContents;
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)
  webContents = mainWindow.webContents;

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
ipcMain.on('update', (e, arg) => {
  console.log('update');
  checkForUpdates();
});
let checkForUpdates = () => {
  autoUpdater.setFeedURL(feedUrl);

  autoUpdater.on('error', (message) => {
    sendUpdateMessage('error', message);
  });
  autoUpdater.on('checking-for-update', function(message) {
    sendUpdateMessage('checking-for-update', message);
  });
  autoUpdater.on('update-available', function(message) {
    sendUpdateMessage('update-not-available', message)
  });
  autoUpdater.on('download-progress', function(progressObj) {
    sendUpdateMessage('downloadProgress', progressObj);
  });
  autoUpdater.on('update-downloaded', function(event, releaseNotes, releaseName,updateUrl,quitAndUpdate) {
    sendUpdateMessage('isUpdateNow');
    ipcMain.on('updateNow',  (e, arg) => {
      autoUpdater.quitAndInstall();
    })
  });
  autoUpdater.checkForUpdates();
};
function sendUpdateMessage(message, data) {
  console.log({message, data});
  webContents.send('message', { message, data });
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
