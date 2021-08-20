const EventEmitter = require('events')

class Player extends EventEmitter {
    constructor(window, ipcMain) {
        super()

        this.window = window
        this.ipcMain = ipcMain

        ipcMain.on('EVENT_READY', this.onReady.bind(this))
        ipcMain.on('EVENT_HIDE', this.onHide.bind(this))
        ipcMain.on('EVENT_VOLUME_CHANGE', this.onVolumeChange.bind(this))
        ipcMain.on('EVENT_TIME_UPDATE', this.onTimeUpdate.bind(this))
        ipcMain.on('EVENT_PLAY', this.onPlay.bind(this))
        ipcMain.on('EVENT_PAUSE', this.onPause.bind(this))
    }

    play() {
        this.window.webContents.send('EVENT_PLAY', null)
    }

    pause() {
        this.window.webContents.send('EVENT_PAUSE', null)
    }

    seek(newTime) {
        this.window.webContents.send('EVENT_SEEK', newTime)
    }

    setVolume(newVolume) {
        this.window.webContents.send('EVENT_VOLUME', newVolume)
    }

    update(paused, volume, duration, currentTime) {
        this.paused = paused
        this.volume = volume
        this.duration = duration
        this.currentTime = currentTime
    }

    onReady(e, paused, volume, duration, currentTime) {
        this.update(paused, volume, duration, currentTime)

        this.emit('ready', this)
    }

    onHide() {
        this.update(undefined, undefined, undefined, undefined)

        this.emit('hide', this)
    }

    onVolumeChange(e, paused, volume, duration, currentTime) {
        this.update(paused, volume, duration, currentTime)

        this.emit('volume-change', this)
    }

    onTimeUpdate(e, paused, duration, currentTime) {
        this.update(paused, this.volume, duration, currentTime)

        this.emit('time-update', this)
    }

    onPlay() {
        this.paused = false

        this.emit('play', this)
    }

    onPause(e) {
        this.paused = true

        this.emit('pause', this)
    }
}

module.exports = Player