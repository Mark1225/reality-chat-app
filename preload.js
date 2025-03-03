const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendMediaId: (mediaId) => ipcRenderer.send('set-media-id', mediaId),
  onNewComment: (callback) => ipcRenderer.on('new-comment', (event, data) => callback(data)),
  closeApp: () => ipcRenderer.send('close-app')
});