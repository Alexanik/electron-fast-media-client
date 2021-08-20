const { app, BrowserWindow, ipcMain, session, Menu, MenuItem } = require('electron')
const Store = require('electron-store')
const path = require('path')
const Url = require('url-parse')
const AudioPlayer = require('./src/audio-player')
const VideoPlayer = require('./src/video-player')
const TouchbarContoller = require('./src/touchbar-controller')

class FastMediaClient {
    constructor(startPageUrl, type, options) {
        if (startPageUrl === undefined || type === undefined)
            throw "startPageUrl and type values cannot be undefined"

        if (type != 'audio' && type != 'video')
            throw `type value must be audio or video`

        this.store = new Store({
            startPageUrl: {
                type: 'string',
                format: 'url',
                default: startPageUrl
            }
        })
        this.type = type
        this.options = options

        if (this.store.get('startPageUrl') === undefined)
            this.store.set('startPageUrl', startPageUrl)
        else {
            let parsedStartPageUrl = new Url(startPageUrl)
            let parsedStoredStartPageUrl = new Url(this.store.get('startPageUrl'))

            if (parsedStoredStartPageUrl.host !== parsedStartPageUrl.host)
                this.store.set('startPageUrl', startPageUrl)
        }

        app.on('widevine-ready', this.onWidevineReady.bind(this))
    }

    createWindow(type, options) {
        let window = new BrowserWindow({
            width: options?.width ?? 800,
            height: options?.height ?? 600,
            minWidth: options?.minWidth ?? 800,
            minHeight: options?.minHeight ?? 600,
            webPreferences: {
                nodeIntegration: true,
                experimentalFeatures: false,
                show: false,
                contextIsolation: true,
                preload: options?.preload ?? (type === 'video' ? path.join(__dirname, 'src/video-inject.js') : path.join(__dirname, 'src/audio-inject.js'))
            }
        })
        window.once('ready-to-show', this.onMainWindowReadyToShow.bind(this))
        window.on('close', this.onMainWindowClose.bind(this))
        window.webContents.setWindowOpenHandler(({ url }) => {
            return { action: 'deny' }
        });

        let contextMenu = new Menu()

        return window
    }

    onWidevineReady(version, lastVersion) {
        this.mainWindow = this.createWindow(this.type, this.options)
        //this.mainWindow.loadURL(this.store.get('startPageUrl'))
        //TODO: back right loadURL
        this.mainWindow.loadURL('https://www.netflix.com/watch/81325589?trackId=251726442&tctx=0%2C0%2C4804aafc-bbef-40d5-b95b-25476011b6ff-84441094%2C%2C6e75bde6-0564-4371-80e6-bbbcebf89988_ROOT%2C')

        if (this.options?.player != undefined)
            this.player = new this.options.player(this.mainWindow, ipcMain)
        else if (this.type === 'video' )
            this.player = new VideoPlayer(this.mainWindow, ipcMain)
        else
            this.player = new AudioPlayer(this.mainWindow, ipcMain)

        this.touchbar = new TouchbarContoller(this.player)

        this.player.on('ready', this.onPlayerReady.bind(this))
        this.player.on('hide', this.onPlayerHide.bind(this))
    }

    onMainWindowReadyToShow() {
        this.mainWindow.show()
        this.mainWindow.focus()
        //TODO: remove open dev tools
        this.mainWindow.webContents.openDevTools()
    }

    onMainWindowClose() {
        this.store.set('startPageUrl', this.mainWindow.webContents.getURL())
    }

    onPlayerReady(player) {
        this.mainWindow.setTouchBar(this.touchbar.build())
    }

    onPlayerHide(player) {
        this.mainWindow.setTouchBar(null)
    }
}

module.exports.FastMediaClient = FastMediaClient