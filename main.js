// Technical
// TODO: Make proper tests instead of test data and methods dispersed througt the app
// TODO: Split into different files to improve code redability
// TODO: Test in mac and linux (specially the tray icon functionality)
// TODO: Move logic out of the html files (use more IPC)
// TODO: Use local files for libs (now all are on cdn)

// Functional
// TODO: See if we can use some data from the server for the very high / very low targets (instead of 50% more of the high / low)
// TODO: Get alarms from the server
// TODO: Show data in a graph instead of text
// TODO: Show other events apart from sgv
// TODO: Minimize to tray setting

// Handle setupevents as quickly as possible
const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
   // Squirrel event handled and app will exit in 1000ms, so don't do anything else
   return;
}

const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain, Tray, nativeImage} = electron;

// Set environment (comment during development to enable inspector)
process.env.NODE_ENV = 'production';

let mainWindow;
let settingsWindow;
let contextMenu;
let tray;

const noneNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/none.png'));

const rangeNoneNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/range-none.png'));
const rangeUpUpNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/range-up-up.png'));
const rangeUpNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/range-up.png'));
const rangeHalfUpNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/range-half-up.png'));
const rangeFlatNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/range-flat.png'));
const rangeFalfDownNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/range-half-down.png'));
const rangeDownNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/range-down.png'));
const rangeDownDownNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/range-down-down.png'));

const outNoneNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/out-none.png'));
const outUpUpNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/out-up-up.png'));
const outUpNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/out-up.png'));
const outHalfUpNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/out-half-up.png'));
const outFlatNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/out-flat.png'));
const outHalfDownNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/out-half-down.png'));
const outDownNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/out-down.png'));
const outDownDownNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/out-down-down.png'));

const veryOutNoneNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/very-out-none.png'));
const veryOutUpUpNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/very-out-up-up.png'));
const veryOutUpNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/very-out-up.png'));
const veryOutHalfUpNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/very-out-half-up.png'));
const veryOutFlatNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/very-out-flat.png'));
const veryOutHalfDownNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/very-out-half-down.png'));
const veryOutDownNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/very-out-down.png'));
const veryOutDownDownNativeImage = nativeImage.createFromPath(path.join(__dirname, 'assets/icons/arrows/very-out-down-down.png'));

// Direction to tray icon
const dir2ImageInRange = {
    NONE: rangeNoneNativeImage,
    DoubleUp: rangeUpUpNativeImage,
    SingleUp: rangeUpNativeImage,
    FortyFiveUp: rangeHalfUpNativeImage,
    Flat: rangeFlatNativeImage,
    FortyFiveDown: rangeFalfDownNativeImage,
    SingleDown: rangeDownNativeImage,
    DoubleDown: rangeDownDownNativeImage,
    'NOT COMPUTABLE': rangeNoneNativeImage,
    'RATE OUT OF RANGE': rangeNoneNativeImage
};
const dir2ImageOutOfRange = {
    NONE: outNoneNativeImage,
    DoubleUp: outUpUpNativeImage,
    SingleUp: outUpNativeImage,
    FortyFiveUp: outHalfUpNativeImage,
    Flat: outFlatNativeImage,
    FortyFiveDown: outHalfDownNativeImage,
    SingleDown: outDownNativeImage,
    DoubleDown: outDownDownNativeImage,
    'NOT COMPUTABLE': outNoneNativeImage,
    'RATE OUT OF RANGE': outNoneNativeImage
};
const dir2ImageVeryOutOfRange = {
    NONE: veryOutNoneNativeImage,
    DoubleUp: veryOutUpUpNativeImage,
    SingleUp: veryOutUpNativeImage,
    FortyFiveUp: veryOutHalfUpNativeImage,
    Flat: veryOutFlatNativeImage,
    FortyFiveDown: veryOutHalfDownNativeImage,
    SingleDown: veryOutDownNativeImage,
    DoubleDown: veryOutDownDownNativeImage,
    'NOT COMPUTABLE': veryOutNoneNativeImage,
    'RATE OUT OF RANGE': veryOutNoneNativeImage
};

// Listen for the app to be ready
app.on('ready', () => {
    // Tray icon
    tray = new Tray(noneNativeImage);
    tray.setToolTip('Updating glucose value...');

    // Create new window
    mainWindow = new BrowserWindow({});

    // Load html into the window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Quit app when closed
    mainWindow.on('close', () => {
        app.quit();
    });

    // Build menu from teplate
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu);
});

// Catch ipc events
ipcMain.on('settings:save', () => {
    mainWindow.webContents.send('main:refresh');
    settingsWindow.close();
});
ipcMain.on('glucose:update', (context, data) => {
    if (data.value >= data.targets.veryHigh || data.value <= data.targets.veryLow) {
        tray.setImage(dir2ImageVeryOutOfRange[data.direction] || asteriskNativeImage);
    }
    else if (data.value >= data.targets.high || data.value <= data.targets.low) {
        tray.setImage(dir2ImageOutOfRange[data.direction] || asteriskNativeImage);
    }
    else {
        tray.setImage(dir2ImageInRange[data.direction] || asteriskNativeImage);
    }
    tray.setToolTip(data.text);
});

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Refresh',
                accelerator: 'F5',
                click() {
                    mainWindow.webContents.send('main:refresh');
                }
            },
            {
                label: 'Settings...',
                click() {
                    // Create new window
                    settingsWindow = new BrowserWindow({
                        width: 350,
                        height: 430,
                        title: 'Settings'
                    });

                    // Garbage collection handle
                    settingsWindow.on('close', () => {
                        settingsWindow = null;
                    })

                    settingsWindow.setMenu(null);

                    // Load html into the window
                    settingsWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'settingsWindow.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                }
            },
            {
                label: 'Quit',
                accelerator: 'CmdOrCtrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// Fix menu for mac
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// Add dev tools if we are on debug
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: 'CmdOrCtrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}