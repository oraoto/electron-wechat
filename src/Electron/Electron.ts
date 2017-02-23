import { app, BrowserWindow, ipcMain, globalShortcut, Tray, nativeImage, Menu } from 'electron';
import * as windowStateKeeper from 'electron-window-state';
import * as path from 'path';
import * as url from 'url';
import * as Config from '../Config'

let mainWindow: Electron.BrowserWindow;
let tray: Electron.Tray;

function createWindow() {

    let mainWindowState = windowStateKeeper({
        defaultWidth: 1280,
        defaultHeight: 800
    });

    mainWindow = new BrowserWindow({
        'x': mainWindowState.x,
        'y': mainWindowState.y,
        'width': mainWindowState.width,
        'height': mainWindowState.height,
        'autoHideMenuBar': true,
        'webPreferences': {
            webSecurity: false,
        }
    })
    mainWindowState.manage(mainWindow);

    mainWindow.loadURL(Config.APP_HOST);

    if (Config.DEBUG) {
        mainWindow.webContents.openDevTools();
    }
    if (!Config.DEBUG) {
        mainWindow.setMenu(null);
    }

    mainWindow.on('close', (e) => {
        if (mainWindow.isVisible()) {
            e.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null
    });

    mainWindow.setMenuBarVisibility(false);

    createTray(mainWindow);
}


function createTray(window: Electron.BrowserWindow) {
    let image = nativeImage.createFromPath(path.join(Config.APP_ROOT, './assets/tray.png'));
    image.setTemplateImage(true);
    tray = new Tray(image);
    tray.setToolTip('微信助手');

    const contextMenu = Menu.buildFromTemplate([
        { label: '显示', click: () =>  window.show() },
        { label: '退出', click: () => app.exit(0) }
    ]);
    tray.setContextMenu(contextMenu);

    tray.on('click', () => window.show());
}

function disableDevTools() {
    const ret = globalShortcut.register('ctrl+shift+i', () => {
        return false;
    })
}

function disableReload() {
    globalShortcut.register('ctrl+r', () => {
        return false;
    });
}

app.on('ready', function () {
    createWindow();
    if (!Config.DEBUG) {
        disableDevTools();
        disableReload();
    }
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});

ipcMain.on('message', function () {
    console.log('receive message');
});
