const {
  app,
  BrowserWindow,
  Menu,
  desktopCapturer,
  ipcMain,
  nativeImage,
  Notification,
  session,
  shell,
} = require("electron");
const path = require("node:path");
const { spawn } = require("node:child_process");

const isDevelopment = !app.isPackaged;
const appIcon = isDevelopment
  ? path.join(__dirname, "..", "src", "assets", "icons", "logo.png")
  : path.join(process.resourcesPath, "icon.png");
const appIconImage = nativeImage.createFromPath(appIcon).resize({
  width: 256,
  height: 256,
});

app.setName("NHO ERP");
if (process.platform === "linux") {
  app.commandLine.appendSwitch("enable-features", "WebRTCPipeWireCapturer");
  app.commandLine.appendSwitch("class", "nho-erp");
  app.setDesktopName("nho-erp.desktop");
}

function createWindow() {
  // Disable Electron's default menu on Windows and Linux in every environment.
  Menu.setApplicationMenu(null);

  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    frame: false,
    icon: appIconImage,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.setIcon(appIconImage);
  mainWindow.setMenu(null);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.maximize();
  mainWindow.once("ready-to-show", () => mainWindow.show());

  if (isDevelopment) {
    mainWindow.loadURL(
      process.env.ELECTRON_RENDERER_URL || "http://localhost:3000",
    );
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

function windowFromEvent(event) {
  return BrowserWindow.fromWebContents(event.sender);
}

ipcMain.handle("ticket:print", async (event, token, height) => {
  if (
    !windowFromEvent(event) ||
    typeof token !== "string" ||
    !/^nho-ticket-[a-f0-9-]{36}$/.test(token) ||
    !Number.isFinite(height) ||
    height < 80 ||
    height > 2000
  )
    throw new Error("Invalid ticket print request.");
  const ticket = BrowserWindow.getAllWindows().find(
    (window) =>
      window.webContents.getTitle() === token &&
      window.webContents.getURL() === "about:blank",
  );
  if (!ticket) throw new Error("Ticket print window was closed.");
  try {
    await new Promise((resolve, reject) => {
      ticket.webContents.print(
        {
          silent: true,
          printBackground: true,
          margins: { marginType: "none" },
          pageSize: { width: 80000, height: Math.ceil(height * 1000) },
        },
        (success, reason) => {
          if (success) resolve();
          else reject(new Error(reason || "Ticket printing failed."));
        },
      );
    });
  } finally {
    if (!ticket.isDestroyed()) ticket.close();
  }
});

ipcMain.on("window:minimize", (event) => windowFromEvent(event)?.minimize());
ipcMain.on("window:toggle-maximize", (event) => {
  const window = windowFromEvent(event);
  if (!window) return;
  if (window.isMaximized()) window.unmaximize();
  else window.maximize();
});
ipcMain.on("window:close", (event) => {
  const window = windowFromEvent(event);
  if (window && !window.isDestroyed()) window.destroy();
});
ipcMain.on("notification:show", (event, payload) => {
  if (!Notification.isSupported() || !payload || typeof payload !== "object")
    return;

  const title = String(payload.title ?? "NHO ERP").slice(0, 120);
  const body = String(payload.body ?? "").slice(0, 500);
  const route =
    typeof payload.route === "string" && payload.route.startsWith("/")
      ? payload.route
      : null;
  if (!body) return;

  const notification = new Notification({
    title,
    body,
    icon: appIconImage,
    timeoutType: "default",
  });
  notification.on("click", () => {
    const window = windowFromEvent(event) ?? BrowserWindow.getAllWindows()[0];
    if (!window || window.isDestroyed()) return;
    if (window.isMinimized()) window.restore();
    window.show();
    window.focus();
    if (route) window.webContents.send("notification:clicked", route);
  });
  notification.show();
});
ipcMain.handle("permissions:open-media-settings", async (_event, kind) => {
  if (process.platform === "win32") {
    await shell.openExternal(
      kind === "camera"
        ? "ms-settings:privacy-webcam"
        : "ms-settings:privacy-microphone",
    );
    return true;
  }
  if (process.platform === "darwin") {
    await shell.openExternal(
      kind === "camera"
        ? "x-apple.systempreferences:com.apple.preference.security?Privacy_Camera"
        : "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone",
    );
    return true;
  }

  const settings = spawn("gnome-control-center", ["privacy"], {
    detached: true,
    stdio: "ignore",
  });
  settings.on("error", () => {
    const fallback = spawn("systemsettings6", [], {
      detached: true,
      stdio: "ignore",
    });
    fallback.on("error", () => {});
    fallback.unref();
  });
  settings.unref();
  return true;
});

app.whenReady().then(() => {
  app.setAppUserModelId("com.nho.erp");

  session.defaultSession.setPermissionCheckHandler((_webContents, permission) =>
    ["media", "display-capture"].includes(permission),
  );
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      callback(["media", "display-capture"].includes(permission));
    },
  );
  session.defaultSession.setDisplayMediaRequestHandler(
    async (_request, callback) => {
      const denyCapture = () => {
        try {
          callback({});
        } catch (callbackError) {
          // Electron 37 can throw while rejecting a failed Wayland portal
          // request. The renderer's getDisplayMedia call is rejected already.
          console.warn("Display capture request was cancelled.");
        }
      };
      try {
        const sources = await desktopCapturer.getSources({
          types: ["screen", "window"],
          thumbnailSize: { width: 0, height: 0 },
        });
        if (!sources[0]) {
          denyCapture();
          return;
        }
        callback({
          video: sources[0],
          ...(process.platform === "win32" ? { audio: "loopback" } : {}),
        });
      } catch (error) {
        console.error("Display capture failed:", error);
        denyCapture();
      }
    },
    { useSystemPicker: true },
  );
  require("./updater.cjs").setupUpdater();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("inbox:open-whatsapp", async (_event, phone) => {
  if (typeof phone !== "string" || !/^\d{5,20}$/.test(phone))
    throw new Error("Invalid phone number");
  await shell.openExternal(`https://web.whatsapp.com/send?phone=${phone}`);
});
