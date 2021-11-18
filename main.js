const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeImage } = require('electron')
const fs = require('fs')


let mainWindow = null
let tray = null
let config = {}
let authenticated = false
let menuTemplate = [
  {
    label: 'File',
    submenu : [
      {label: 'Settings', click() {showSettings()}},
      {role: 'quit'},
      {type: 'separator'},
      {label: 'Logout', click() {logout()}}
    ]
  },
  {
    label : "View",
    submenu : [
      {role: 'togglefullscreen'},
      {type: 'separator'},
      {role: 'reload'},
      {role: 'toggledevtools'},
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click() { require('electron').shell.openExternal('https://photonix.org') }
      }
    ]
  }
]


app.on('ready', () => {
  loadConfig()
  
  // Creation of window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    },
    icon: 'static/images/logo.png'
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.loadFile('index.html')
  // mainWindow.webContents.openDevTools()

  let menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // IPC listeners
  ipcMain.on('close-main-window', (event, arg) => closeMainWindow())

  ipcMain.on('window-visible', (event, arg) => {
    event.returnValue = mainWindow.isVisible()
  })

  ipcMain.on('select-dir', (event, arg) => {
    const files = dialog.showOpenDialogSync({
      title: 'Select folder',
      properties: ['openDirectory']
    })
    event.returnValue = files
  })

  ipcMain.on('get-settings', (event) => {
    console.log('get-settings')
    event.returnValue = config
  })

  ipcMain.on('set-settings', (event, arg) => {
    console.log('set-settings')
    let updateContextMenu = false

    for (let key in arg) {
      console.log('  ' + key + ': ' + arg[key])
      config[key] = arg[key]
      if (['watchPhotos', 'analyzePhotos'].indexOf(key) > -1) {
        updateContextMenu = true
      }
    }

    saveConfig()
    if (updateContextMenu) {
      setContextMenu()
    }
    event.returnValue = true
  })
})

showMainWindow = () => {
  mainWindow.show()
  mainWindow.restore()
  mainWindow.focus()
}

closeMainWindow = () => {
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  }
  else {
    mainWindow.destroy()
  }
}

quit = () => {
  mainWindow.destroy()
}

loadConfig = () => {
  let path = app.getPath('userData') + '/config.json'
  fs.readFile(path, 'utf-8', (err, data) => {
    if (err) {
      console.log('An error ocurred reading the file: ' + err.message);
      return
    }
    console.log('The file content is: ' + data)
    config = JSON.parse(data)

    setContextMenu()
  })
}

getConfig = () => {
  return config
}

saveConfig = () => {
  let path = app.getPath('userData') + '/config.json'
  let content = JSON.stringify(config)
 
  console.log('Writing to ' + path)
  fs.writeFile(path, content, (err) => {
    if (err) {
      console.log('An error ocurred creating the file: ' + err.message)
    }
    console.log('The file has been succesfully saved')
  })
}

setContextMenu = () => {
  // Tray icon amd menu
  if (tray === null) {
    const icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABzklEQVRYw+2XPU7DQBCFPwhQJlIIIEQogB4QSGTTUEMFEjEdHCIH4OcCQQhuAAVbUuYESQURRQ6ATEBCCR2QFDbNWjKWnax/kgaeNJK9Xvs9e97OrOGvYyzifTlgHlgEbMAEWkB7mGJXgHOgoUj94hE4U3MTwyxwDfT6EHujB1wBM3HJi8BrCGJvvAPbUckPge8Y5E58AaUob54EuVuECJPztwTJnWip1TMQ1zoPFELYUkpLSmkJIXRFXOosNS23G4ZhOzAMQ1dAF1h2E457BBwDk0OsJVPAUT8B+yOovntBAnLA6ggErANZ52TCdWEhcE0Wi+Tz+V9jQgjfYwemaVKr1YL6Tx7oeC/sBplHSmnZISGltPqYcccvBfYIu7Dt147XVKfTTkG5XAagUqlQr9d1U+BwPXkHp8NUtoh1wAYstwndKWgHfYGE8eA2oLcO3I9AwH2/QnSjSvGw0ANu3QMpz4QPYA7YGvSkdDpNJpOh2WxSrVYxTVO30d0NmjQTcxcUFC/K6FrYBD4T3pAUwuarpG5Mgvwgqmk2gOeYu6BCXOfm1E6mG4K4C1yEybkOloFTVUh8iVOpVAM4AZaG/WuWVe3baRCmcnmHf4TED6ypmmi/7iVJAAAAAElFTkSuQmCC')
    tray = new Tray(icon)
  }

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Watch for new photos', type: 'checkbox', checked: config.watchPhotos, click() {toggleWatchPhotos()} },
    { label: 'Run analysis on photos', type: 'checkbox', checked: config.analyzePhotos, click() {toggleAnalyzePhotos()} },
    { type: 'separator' },
    { label: 'Show main window', click() {showMainWindow()} },
    { label: 'Close', click() {quit()}},
  ])

  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
}

login = (server, username, password) => {
  console.log(server + ' ' + username + ' ' + password)
  authenticated = true
  return true
}

logout = () => {
  authenticated = false
  mainWindow.webContents.executeJavaScript('checkAuthenticated()')
  return true
}

isAuthenticated = () => {
  return authenticated
}

showSettings = () => {
  mainWindow.webContents.send('show-settings')
}

toggleWatchPhotos = () => {
  if (!config.watchPhotos) {
    config.watchPhotos = true
  }
  else {
    config.watchPhotos = false
  }
  saveConfig()
}

toggleAnalyzePhotos = () => {
  if (!config.analyzePhotos) {
    config.analyzePhotos = true
  }
  else {
    config.analyzePhotos = false
  }
  saveConfig()
}
