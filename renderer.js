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


// Listeners for button clicks
document.querySelector('.close').addEventListener('click', function () {
  ipcRenderer.send('close-main-window')
})
document.querySelector('.selectDir').addEventListener('click', function () {
  ipcRenderer.send('select-dir')
  loadConfig()
})
document.querySelector('.saveConfig').addEventListener('click', function () {
  ipcRenderer.send('save-config')
})
document.querySelector('.loadConfig').addEventListener('click', loadConfig)


// Load config data to display for debugging
loadConfig()
