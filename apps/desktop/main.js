// Processo principal do Electron. O DevFlow é um app online (dados no servidor),
// então a janela abre a aplicação hospedada — evitando problemas de roteamento
// com file:// e mantendo o app sempre atualizado.
const { app, BrowserWindow, shell } = require('electron');

const APP_URL = process.env.DEVFLOW_URL || 'https://bytedesk-two.vercel.app';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0a0a0a',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL(APP_URL);

  // Abre links externos (target=_blank / window.open) no navegador padrão.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      void shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
