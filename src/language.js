const path = require('path')
const fs = require('fs')

class Language {
    constructor(currentLocale, defaultLocale) {
        let defaultLocaleFilePath = path.join(__dirname, '..', 'locales', defaultLocale + '.json')
        let currentLocaleFilePath = path.join(__dirname, '..', 'locales', currentLocale + '.json')

        if (!fs.existsSync(defaultLocaleFilePath))
            throw `Default locale file does not exists in ${defaultLocaleFilePath}`

        let defaultLocaleFile = fs.readFileSync(defaultLocaleFilePath, 'utf8')
        let currentLocaleFile = fs.readFileSync(currentLocaleFilePath, 'utf8')

        try {
            this.locale = JSON.parse(defaultLocaleFile)
            let currentLocale = JSON.parse(currentLocaleFile)

            Object.assign(this.locale, currentLocale)
        }
        catch (exception) {
        }
    }

    get(key) {
        if (this.locale[key] === undefined)
            return key

        return this.locale[key]
    }
}

module.exports = Language