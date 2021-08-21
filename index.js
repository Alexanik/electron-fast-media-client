const { app, BrowserWindow, ipcMain, session, Menu, MenuItem } = require('electron')
const Store = require('electron-store')
const path = require('path')
const Url = require('url-parse')

const Language = require('./src/language')
const AudioPlayer = require('./src/audio-player')
const VideoPlayer = require('./src/video-player')
const TouchbarContoller = require('./src/touchbar-controller')
const ShortcutsController = require('./src/shortcuts-controller')
const Player = require('./src/player')

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

    createContextMenu() {
        let menu = new Menu()

        menu.append(new MenuItem({
            label: this.language.get('On top'),
            type: 'checkbox',
            checked: this.mainWindow.isAlwaysOnTop(),
            click: () => this.mainWindow.setAlwaysOnTop(!this.mainWindow.isAlwaysOnTop())
        }))
        menu.append(new MenuItem({
            type: 'separator'
        }))
        menu.append(new MenuItem({
            label: this.language.get('Quit'),
            role: 'quit'
        }))

        return menu
    }

    onWidevineReady(version, lastVersion) {
        this.language = new Language(app.getLocale(), 'en')
        this.mainWindow = this.createWindow(this.type, this.options)
        this.mainWindowContextMenu = this.createContextMenu()

        this.mainWindow.webContents.on('context-menu', (e, params) => {
            this.mainWindowContextMenu.popup(this.mainWindow, params.x, params.y)
        })

        this.mainWindow.loadURL(this.store.get('startPageUrl'))

        if (this.options?.player != undefined)
            this.player = new this.options.player(this.mainWindow, ipcMain)
        else if (this.type === 'video' )
            this.player = new VideoPlayer(this.mainWindow, ipcMain)
        else
            this.player = new AudioPlayer(this.mainWindow, ipcMain)

        this.touchbar = new TouchbarContoller(this.player)

        this.shortcuts = new ShortcutsController(this.player)

        this.player.on('ready', this.onPlayerReady.bind(this))
        this.player.on('hide', this.onPlayerHide.bind(this))
    }

    onMainWindowReadyToShow() {
        this.mainWindow.show()
        this.mainWindow.focus()

        if (this.options?.openDevTools === true)
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
module.exports.Player = Player