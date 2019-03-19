const { ipcRenderer } = require('electron')

window.sendToElectron = function (channel) {
  ipcRenderer.send(channel)
}

window.sendSyncToElectron = function(channel) {
  return ipcRenderer.sendSync(channel)
}