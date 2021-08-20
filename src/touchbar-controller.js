const { TouchBar } = require('electron')
const { TouchBarButton, TouchBarSpacer, TouchBarLabel, TouchBarSlider } = TouchBar
const nativeImage = require('electron').nativeImage

class TouchbarContoller {
    constructor(player) {
        this.player = player
        this.images = {
            play: nativeImage.createFromNamedImage('NSTouchBarPlayTemplate', [-1, 0, 1]),
            pause: nativeImage.createFromNamedImage('NSPauseTemplate', [-1, 0, 1]),
        }
        this.playPauseButton = new TouchBarButton({
            icon: this.images.play,
            click: this.onPlayPauseButtonClick.bind(this)
        })
        this.currentTimeLabel = new TouchBarLabel({
            label: '00:00:00'
        })
        this.durationLabel = new TouchBarLabel({
            label: '99:99:99'
        })
        this.progressSlider = new TouchBarSlider({
            minValue: 0,
            maxValue: 100,
            value: 0,
            change: this.onProgressSliderChange.bind(this)
        })

        this.player.on('play', this.onPlayerPlay.bind(this))
        this.player.on('pause', this.onPlayerPause.bind(this))
        this.player.on('time-update', this.onPlayerTimeUpdate.bind(this))
    }

    build() {
        this.update()

        let touchbar = new TouchBar({
            items: [
                this.playPauseButton,
                new TouchBarSpacer({ size: 'flexible' }),
                this.currentTimeLabel,
                new TouchBarSpacer({ size: 'flexible' }),
                this.progressSlider,
                new TouchBarSpacer({ size: 'flexible' }),
                this.durationLabel
            ]
        })

        return touchbar
    }

    sToHms(seconds) {
        var time = [
            Math.floor(((seconds % 31536000) % 86400) / 3600), //Hours
            Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), //Minutes
            (((seconds % 31536000) % 86400) % 3600) % 60 //Seconds
        ]

        return time.map(n => n < 10 ? '0' + n : n.toString()).map(n => n.substr(0, 2)).join(':')
    }

    sToMs(seconds) {
        var time = [
            Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), //Minutes
            (((seconds % 31536000) % 86400) % 3600) % 60 //Seconds
        ]

        return time.map(n => n < 10 ? '0' + n : n.toString()).map(n => n.substr(0, 2)).join(':')
    }

    sToHumanReadeable(seconds, duration) {
        if (duration <= 60)
            return seconds.toString()          
        
        if (duration <= 3600)
            return this.sToMs(seconds)

        return this.sToHms(seconds)
    }

    update() {
        if (!this.player.paused)
            this.playPauseButton.icon = this.images.pause
        else
            this.playPauseButton.icon = this.images.play

        let currentTime = this.player.currentTime
        let duration = this.player.duration
        let onePercentOfProgress = duration / 100.0
        let progressInPercents = Math.floor(currentTime / onePercentOfProgress)

        this.currentTimeLabel.label = this.sToHumanReadeable(currentTime, duration)
        this.durationLabel.label = this.sToHumanReadeable(duration, duration)
        this.progressSlider.value = progressInPercents
    }

    onPlayPauseButtonClick() {
        if (!this.player.paused)
            this.player.pause()
        else
            this.player.play()
    }

    onProgressSliderChange(value) {
        let duration = this.player.duration
        let onePercentOfProgress = duration / 100.0
        let progressInSeconds = value * onePercentOfProgress

        this.player.seek(progressInSeconds)
    }

    onPlayerPlay(player) {
        this.update()
    }

    onPlayerPause(player) {
        this.update()
    }

    onPlayerTimeUpdate(player) {
        this.update()
    }
}

module.exports = TouchbarContoller