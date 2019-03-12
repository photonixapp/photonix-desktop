const { ipcRenderer } = require('electron')


// Keep the window hidden instead of fully closing. Full close is performed by menu or tray.
window.onbeforeunload = (e) => {
  let windowVisible = ipcRenderer.sendSync('window-visible')
  if (windowVisible) {
    e.returnValue = false
  }
  else {
    e.returnValue = true
  }
  ipcRenderer.send('close-main-window')
}

loadConfig = () => {
  document.querySelector('#config').innerHTML = JSON.stringify(ipcRenderer.sendSync('get-config'))
}

hideSettings = () => {
  document.querySelector('#login').style.display = 'none'
}
showSettings = () => {
  document.querySelector('#login').style.display = 'block'
}


// Listeners for button clicks
document.querySelector('.selectDir').addEventListener('click', function () {
  ipcRenderer.send('select-dir')
  loadConfig()
})
document.querySelector('.saveConfig').addEventListener('click', function () {
  ipcRenderer.send('save-config')
  hideSettings()
})
document.querySelector('.loadConfig').addEventListener('click', loadConfig)
document.querySelector('.login').addEventListener('click', function () {
  if (ipcRenderer.sendSync('login')) {
    hideSettings()
  }
})
document.querySelector('#settingsButton').addEventListener('click', showSettings)
ipcRenderer.on('show-settings', showSettings);


// Load config data to display for debugging
loadConfig()
