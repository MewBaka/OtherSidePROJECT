import path from 'path';
import {app, ipcMain} from 'electron';
import serve from 'electron-serve';
import {createWindow} from './helpers';
import {RemoteHandler} from './app/mainHandler';
import {ServerConstants} from "./config";

const WIDTH = 1280 * 0.75;
const HEIGHT = 720 * 0.75;
const isDevMode = ServerConstants.app.devMode;
const isProd = (process.env.NODE_ENV === 'production');

if (isProd) {
    serve({directory: 'app'})
} else {
    app.setPath('userData', `${app.getPath('userData')} (development)`)
}

;(async () => {
    await app.whenReady();

    const mainWindow = createWindow('main', {
        width: WIDTH,
        height: HEIGHT,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        frame: true,
        useContentSize: true,
    });
    mainWindow.setMenu(null);
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.setMinimumSize(WIDTH, HEIGHT);
    });

    RemoteHandler.getInstance().register(ipcMain, mainWindow);

    if (!isProd || isDevMode) {
        mainWindow.webContents.on('before-input-event', (_, input) => {
            if (input.key === 'F12') {
                mainWindow.webContents.openDevTools();
            }
        });
    }

    if (isProd) {
        await mainWindow.loadURL('app://./')
    } else {
        const port = process.argv[2]
        await mainWindow.loadURL(`http://localhost:${port}/`)
    }
})();

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

ipcMain.on('message', async (event, arg) => {
    event.reply('message', `${arg} World!`)
});
