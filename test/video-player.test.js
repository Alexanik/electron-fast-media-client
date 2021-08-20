const assert = require('assert')
const sinon = require('sinon')
const EventEmitter = require('events')
const { VideoPlayer } = require('../src/video-player')

describe('Video player', function() {
    this.beforeEach(function() {
        this.spy = sinon.spy(function() {
            return new Promise(function(resolve) {
                resolve('success')
            })
        })

        let window = {
            webContents: {
                executeJavaScript: this.spy
            }
        }
        this.ipc = new EventEmitter()
        this.videoPlayer = new VideoPlayer(window, this.ipc)
    })

    this.afterEach(function() {
        this.videoPlayer = undefined
        this.ipc = undefined
        this.spy = undefined
    })

    it('emits EVENT_VIDEO_READY', function() {
        this.videoPlayer.on('EVENT_VIDEO_READY', function() {
            assert(true)
        })
        this.ipc.emit('EVENT_VIDEO_READY')
    })
})