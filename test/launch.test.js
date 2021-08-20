const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron')
const path = require('path')
const { MediaClient } = require('./../electron-fast-media-client')

describe('Application launch', function() {
    this.timeout(10000)

    this.beforeEach(function() {
        this.app = new Application({
            path: electronPath,
            args: [path.join(__dirname, '../')],
            requireName: 'electronRequire'
        })

        return this.app.start()
    })

    this.afterEach(function() {
        if (this.app && this.app.isRunning())
            return this.app.stop()
    })

    it('shows an initial window', function() {
        return this.app.client.getWindowCount().then(function(count) {
            assert.equal(count, 1)
        })
    })
})