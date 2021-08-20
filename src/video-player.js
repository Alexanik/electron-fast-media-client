const EventEmitter = require('events')
const Player = require('./player')

class VideoPlayer extends Player  {
    constructor(window, ipcMain) {
        super(window, ipcMain)
    }
}

module.exports = VideoPlayer