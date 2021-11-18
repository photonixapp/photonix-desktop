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

let webview = document.querySelector('#contentFrame')

showConfig = () => {
  let config = remote.getGlobal('getConfig')()
  document.querySelector('#config').innerHTML = JSON.stringify(config)
}

hideLogin = () => {
  document.querySelector('#login').style.display = 'none'
}

showLogin = () => {
  document.querySelector('#login').style.display = 'block'
}

showSettings = () => {
  webview.executeJavaScript("window.showSettings()")
}

login = () => {
  // if (remote.getGlobal('login')(
  //   document.querySelector('#server').value,
  //   document.querySelector('#username').value,
  //   document.querySelector('#password').value
  // )) {
    hideLogin()
  // }
}

logout = () => {
  showLogin()
}

checkAuthenticated = () => {
  if (remote.getGlobal('isAuthenticated')()) {
    hideLogin()
  }
  else {
    showLogin()
  }
}


// Listeners for button clicks
// document.querySelector('.selectDir').addEventListener('click', function () {
//   ipcRenderer.send('select-dir')
//   showConfig()
// })
// document.querySelector('.saveConfig').addEventListener('click', function () {
//   ipcRenderer.send('save-config')
//   hideSettings()
// })

// document.querySelector('.loadConfig').addEventListener('click', showConfig)
document.querySelector('.login').addEventListener('click', login)
// document.querySelector('#settingsButton').addEventListener('click', showSettings)
// ipcRenderer.on('show-settings', showSettings)
ipcRenderer.on('logout', logout)


checkAuthenticated()
