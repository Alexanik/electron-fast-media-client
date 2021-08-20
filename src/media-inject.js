const { ipcRenderer } = require('electron')

function getVideo() {
    try {
        return document.getElementsByTagName("video")[0]
    }
    catch (e) {
        return null
    }
}

function getAudio() {
    try {
        return document.getElementsByTagName("audio")[0]
    }
    catch (e) {
        return null
    }
}

function lookForVideo() {
    var video = getVideo()

    if (video == null)
        return
}

function lookForAudio() {
    var audio = getAudio()

    if (audio == null)
        return
}

function lookForVideoHide() {
    var video = getVideo()

    if (video != null)
        return
}

function lookForAudioHide() {
    var audio = getAudio()

    if (audio != null)
        return
}