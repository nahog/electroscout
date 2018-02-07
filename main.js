// Handle setupevents as quickly as possible
const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
   // Squirrel event handled and app will exit in 1000ms, so don't do anything else
   return;
}

const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// Set environment
//process.env.NODE_ENV = 'production';

let mainWindow;
let settingsWindow;

// Listen for the app to be ready
app.on('ready', () => {
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
    settingsWindow.close();
});

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
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

                    //settingsWindow.setMenu(null);

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