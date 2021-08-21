const { globalShortcut } = require('electron')

class ShortcutsController {
    constructor(player) {
        try {
            globalShortcut.register('MediaPlayPause', this.onMediaPlayPause.bind(this))
        }
        catch (exception) {
            //TODO: Exception log
        }
    }

    onMediaPlayPause() {
        if (!this.player.paused)
            this.player.player()
        else
            this.player.paused()
    }
}

module.exports = ShortcutsController