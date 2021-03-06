const Sharp = require('sharp')
const Fs = require('fs')
const Os = require('os')
const rimraf = require('rimraf')
const Shell = require('electron').shell

class Generator {

  generate(originalImagePath, choice) {
    const contentsJson = this.makeContentsJson(choice)
    const downloadPath = Os.homedir().concat('/Downloads')
    const folderPath = downloadPath.concat('/AppIcon.appiconset')

    this.writeFolder(folderPath)
    this.writeContentsJson(contentsJson, folderPath)
    this.writeImages(originalImagePath, contentsJson, folderPath)
    this.showFinder(folderPath)
  }

  // Helper

  showFinder(path) {
    Shell.showItemInFolder(path)
  }

  writeFolder(folderPath) {
    if (Fs.existsSync(folderPath)) {
      rimraf.sync(folderPath)
    }

    Fs.mkdirSync(folderPath)
  }

  writeContentsJson(json, folderPath) {
    const path = folderPath.concat('/Contents.json')
    Fs.writeFileSync(path, JSON.stringify(json, null, 2).replace(new RegExp(": ", "g"), " : "))
  }

  writeImages(originalImagePath, contentsJson, folderPath) {
    contentsJson.images.forEach((object) => {
      const output = folderPath.concat(`/${object.filename}`)
      const size = object.size.split('x')[0]
      const scale = object.scale.replace('x', '')
      const finalSize = size * scale

      Sharp(originalImagePath)
        .resize(finalSize, finalSize)
        .toFile(output, (error, info) => {
          console.log(error)
          console.log(info)
        })
    })
  }

  makeContentsJson(choice) {
    const idioms = this.idioms(choice)
    const content = Fs.readFileSync(__dirname + '/Contents.json', 'utf8')
    const json = JSON.parse(content)

    json.images = json.images
    .filter((object) => {
      return idioms.includes(object.idiom)
    }).map((object) => {
      const size = object.size.split('x')[0]
      object.filename = `icon_${size}@${object.scale}.png`

      return object
    })

    return json
  }

  idioms(choice) {
    switch (choice) {
      case 'iOS (iPhone)':
        return ['iphone', 'ios-marketing']
      case 'iOS (iPad)':
        return ['ipad', 'ios-marketing']
      case 'iOS (Universal)':
        return ['iphone', 'ipad', 'ios-marketing']
      case 'macOS':
        return ['mac']
      case 'tvOS':
        return []
      case 'watchOS':
        return ['watch', 'watch-marketing']
      default:
        return []
    }
  }
}


module.exports = Generator
