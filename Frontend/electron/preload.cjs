const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronWindow", {
  printTicket: (token, height) =>
    ipcRenderer.invoke("ticket:print", token, height),
  openWhatsapp: (phone) => ipcRenderer.invoke("inbox:open-whatsapp", phone),
  minimize: () => ipcRenderer.send("window:minimize"),
  toggleMaximize: () => ipcRenderer.send("window:toggle-maximize"),
  close: () => ipcRenderer.send("window:close"),
  showNotification: (notification) =>
    ipcRenderer.send("notification:show", notification),
  onNotificationClick: (callback) => {
    const listener = (_event, route) => callback(route);
    ipcRenderer.on("notification:clicked", listener);
    return () => ipcRenderer.removeListener("notification:clicked", listener);
  },
  openMediaSettings: (kind) =>
    ipcRenderer.invoke("permissions:open-media-settings", kind),
});

contextBridge.exposeInMainWorld("electronUpdater", {
  state: () => ipcRenderer.invoke("updater:state"),
  check: () => ipcRenderer.invoke("updater:check"),
  download: () => ipcRenderer.invoke("updater:download"),
  install: (language) => ipcRenderer.invoke("updater:install", language),
  automatic: (value) => ipcRenderer.invoke("updater:automatic", value),
  meeting: (value) => ipcRenderer.invoke("updater:meeting", value),
  onState: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on("updater:state", listener);
    return () => ipcRenderer.removeListener("updater:state", listener);
  },
});
