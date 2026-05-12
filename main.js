const { app, BrowserWindow, Menu, MenuItem, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Configuración de logs para ver si hay errores al actualizar
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Conexión con tu cuenta de GitHub real
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'franciscosotelob-creator',
  repo: 'sistema-de-presupuestos'
});
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Necesario para Firebase directo
      spellcheck: true         // Corrector ortográfico en español
    }
  });

  win.maximize();
  win.loadFile('index.html');

  // Al iniciar la app, busca si subiste código nuevo a GitHub
  win.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  // Menú del clic derecho (Copiar, Pegar, Ortografía)
  win.webContents.on('context-menu', (event, params) => {
    const menu = new Menu();

    for (const suggestion of params.dictionarySuggestions) {
      menu.append(new MenuItem({
        label: suggestion,
        click: () => win.webContents.replaceMisspelling(suggestion)
      }));
    }

    if (params.dictionarySuggestions.length > 0) {
      menu.append(new MenuItem({ type: 'separator' }));
    }

    menu.append(new MenuItem({ label: 'Cortar', role: 'cut', enabled: params.editFlags.canCut }));
    menu.append(new MenuItem({ label: 'Copiar', role: 'copy', enabled: params.editFlags.canCopy }));
    menu.append(new MenuItem({ label: 'Pegar', role: 'paste', enabled: params.editFlags.canPaste }));
    menu.append(new MenuItem({ type: 'separator' }));
    menu.append(new MenuItem({ label: 'Seleccionar todo', role: 'selectAll' }));

    menu.popup();
  });
}

// Cuando detecta y termina de descargar una nueva actualización de GitHub
autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Sistema de Presupuesto',
    message: 'Se ha descargado una nueva versión del sistema de forma automática. El programa se reiniciará ahora para aplicarla.',
    buttons: ['Reiniciar y Aplicar']
  }).then(() => {
    autoUpdater.quitAndInstall();
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});