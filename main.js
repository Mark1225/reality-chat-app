const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');  // ✅ ファイル操作のために追加
const WebSocket = require('ws');

const assetsPath = path.join(__dirname, 'assets');  // ✅ assets フォルダのパス
console.log('📂 assets フォルダのパス:', assetsPath);

// ✅ assets フォルダの中身を確認
fs.readdir(assetsPath, (err, files) => {
  if (err) {
    console.error('⚠️ assets フォルダが見つかりません:', err);
  } else {
    console.log('📂 assets フォルダの中身:', files);
  }
});

let mainWindow;
let ws = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    alwaysOnTop: true,
    transparent: true,
    frame: false,
    icon: process.platform === 'darwin'
    ? path.join(__dirname, 'assets/icon.icns')  // ✅ Mac 用
    : process.platform === 'win32'
    ? path.join(__dirname, 'assets/icon.ico')  // ✅ Windows 用
    : path.join(__dirname, 'assets/icon.png'), // ✅ Linux 用
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // ✅ セキュアな方法で通信
      contextIsolation: true,
    }
  });

  mainWindow.loadFile('index.html');
}

function connectWebSocket(mediaId) {
  if (ws) {
    ws.close();
  }

  const socketUrl = `wss://comment.reality.app/?media_id=${mediaId}`;
  ws = new WebSocket(socketUrl);

  ws.on('open', () => console.log('WebSocket 接続成功:', socketUrl));

  ws.on('message', (data) => {
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.nickname && parsedData.content) {
        mainWindow.webContents.send('new-comment', {
          nickname: parsedData.nickname,
          content: parsedData.content,
        });
      }
    } catch (error) {
      console.error('JSON 解析エラー:', error);
    }
  });

  ws.on('close', () => console.log('WebSocket closed'));
  ws.on('error', (err) => console.log('WebSocket error:', err));
}

// ✅ メディア ID を受け取って WebSocket に接続
ipcMain.on('set-media-id', (event, mediaId) => {
  connectWebSocket(mediaId);
});

// ✅ アプリを閉じる
ipcMain.on('close-app', () => {
  app.quit();
});

app.whenReady().then(createWindow);