const { ipcRenderer } = require('electron')

function getVideo() {
    try {
        return document.getElementsByTagName("video")[0]
    }
    catch (exception) {
        return null
    }
}

function lookForVideo() {
    var interval = setInterval(() => {
        console.log('look for video')

        var video = getVideo()

        if (video === undefined)
            return;

        let paused = video.paused
        let volume = video.volume
        let duration = video.duration
        let currentTime = video.currentTime

        video.onplay = onPlay
        video.onpause = onPause
        video.ontimeupdate = onTimeUpdate

        video.onvolumechange = (e) => {        
            ipcRenderer.send('EVENT_VOLUME_CHANGE', paused, volume, duration, currentTime)    
        }

        ipcRenderer.send('EVENT_READY', paused, volume, duration, currentTime)

        clearInterval(interval)
        lookForVideoHide()
    }, 250)
}


function lookForVideoHide() {
    var interval = setInterval(() => {
        console.log('look for hide video')

        var video = getVideo()

        if (video != null)
            return

        ipcRenderer.send('EVENT_HIDE')

        clearInterval(interval)
        lookForVideo()
    }, 250)
}

function play() {
    getVideo()?.play()
}

function pause() {
    getVideo()?.pause()
}

function seek(event, newTime) {
    let video = getVideo()

    if (video === undefined)
        return

    video.currentTime = newTime
}

function onPlay() {
    ipcRenderer.send('EVENT_PLAY', null)
}

function onPause() {
    ipcRenderer.send('EVENT_PAUSE', null)
}

function onTimeUpdate() {
    let video = getVideo()

    if (video === undefined)
        return

    ipcRenderer.send('EVENT_TIME_UPDATE', video.paused, video.duration, video.currentTime)
}

window.onload = lookForVideo()

ipcRenderer.on('EVENT_PLAY', play)
ipcRenderer.on('EVENT_PAUSE', pause)
ipcRenderer.on('EVENT_SEEK', seek)