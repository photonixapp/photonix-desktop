const { ipcRenderer, remote } = require('electron')


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

let frame = document.querySelector('#contentIframe').contentWindow
frame.onload = (e) => {
  console.log('frame loaded')
  sendSettingsToIframe()
}

showConfig = () => {
  let config = remote.getGlobal('getConfig')()
  document.querySelector('#config').innerHTML = JSON.stringify(config)
}

hideSettings = () => {
  document.querySelector('#login').style.display = 'none'
}
showSettings = () => {
  document.querySelector('#login').style.display = 'block'
}
sendSettingsToIframe = () => {
  let config = remote.getGlobal('getConfig')()
  frame.postMessage({
    type: 'config',
    data: config
  }, '*')
}
login = () => {
  if (remote.getGlobal('login')(
    document.querySelector('#server').value,
    document.querySelector('#username').value,
    document.querySelector('#password').value
  )) {
    hideSettings()
  }
}
logout = () => {
  // frame.postMessage({
  //   type: 'logout'
  // }, '*')
  if (remote.getGlobal('logout')()) {
    console.log('loggedout')
    showSettings()
  }
}
checkAuthenticated = () => {
  if (remote.getGlobal('isAuthenticated')()) {
    hideSettings()
  }
  else {
    showSettings()
  }
}


// Listeners for button clicks
document.querySelector('.selectDir').addEventListener('click', function () {
  ipcRenderer.send('select-dir')
  showConfig()
})
document.querySelector('.saveConfig').addEventListener('click', function () {
  ipcRenderer.send('save-config')
  hideSettings()
})
document.querySelector('.loadConfig').addEventListener('click', showConfig)
document.querySelector('.login').addEventListener('click', login)
// document.querySelector('#settingsButton').addEventListener('click', showSettings)
document.querySelector('#settingsButton').addEventListener('click', sendSettingsToIframe)
ipcRenderer.on('show-settings', showSettings)
ipcRenderer.on('logout', logout)


checkAuthenticated()
