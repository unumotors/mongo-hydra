const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

async function writeFile(path, filename, content) {
  mkDirByPathSync(path)
  await promisify(fs.writeFile)(path + filename, content)
}

// source https://stackoverflow.com/a/40686853/2596452
function mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
  const { sep } = path
  const initDir = path.isAbsolute(targetDir) ? sep : ''
  const baseDir = isRelativeToScript ? __dirname : '.'

  return targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir)
    try {
      fs.mkdirSync(curDir)
    } catch (err) {
      if (err.code === 'EEXIST') { // curDir already exists!
        return curDir
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
      if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`)
      }

      const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1
      if (!caughtErr || caughtErr && targetDir === curDir) {
        throw err // Throw if it's just the last created dir.
      }
    }

    return curDir
  }, initDir)
}

function filenamesInFolder(folder, withExtension = false) {
  const files = fs.readdirSync(folder)
  if (withExtension) return files
  return files.map(f => f.split('.').slice(0, -1).join('.'))
}

function watch(folder, f) {
  let fsWait = false
  fs.watch(folder, (event, filename) => {
    if (filename) {
      if (fsWait) return
      fsWait = setTimeout(() => {
        fsWait = false
      }, 100)
      f()
    }
  })
}

module.exports = { writeFile, filenamesInFolder, watch }
