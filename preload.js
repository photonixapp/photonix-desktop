const { ipcRenderer } = require('electron')

window.sendToElectron = function (channel, arg) {
  ipcRenderer.send(channel, arg)
}

window.sendSyncToElectron = function(channel, arg) {
  return ipcRenderer.sendSync(channel, arg)
}
