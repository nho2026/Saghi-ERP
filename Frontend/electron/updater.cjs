const { app, ipcMain, BrowserWindow, dialog } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
function setupUpdater() {
  const { autoUpdater } = require("electron-updater");
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.allowDowngrade = false;
  autoUpdater.allowPrerelease = false;
  const preferenceFile = path.join(
    app.getPath("userData"),
    "update-preferences.json",
  );
  let automatic = true;
  try {
    automatic =
      JSON.parse(fs.readFileSync(preferenceFile, "utf8")).automatic !== false;
  } catch {}
  const configured =
    app.isPackaged &&
    fs.existsSync(path.join(process.resourcesPath, "app-update.yml"));
  let state = {
    status: configured ? "idle" : "unavailable",
    version: app.getVersion(),
    automatic,
    progress: 0,
    message: !app.isPackaged
      ? "Updates are available in the installed desktop app."
      : !configured
        ? "A release source has not been configured for this build."
        : "",
  };
  let meetingActive = false;
  const emit = (patch) => {
    state = { ...state, ...patch };
    for (const w of BrowserWindow.getAllWindows())
      w.webContents.send("updater:state", state);
  };
  const trusted = (event) => {
    const w = BrowserWindow.fromWebContents(event.sender);
    const frameUrl = event.senderFrame?.url || "";
    const expected = app.isPackaged
      ? pathToFileURL(path.join(__dirname, "..", "dist", "index.html")).href
      : process.env.ELECTRON_RENDERER_URL || "http://localhost:3000";
    let valid = false;
    try {
      valid = app.isPackaged
        ? frameUrl.split("#")[0] === expected
        : new URL(frameUrl).origin === new URL(expected).origin;
    } catch {}
    return w && event.senderFrame === event.sender.mainFrame && valid;
  };
  const handle = (name, fn) =>
    ipcMain.handle(name, async (event, ...args) => {
      if (!trusted(event)) throw new Error("Unavailable sender");
      try {
        return await fn(...args);
      } catch (error) {
        emit({ status: "error", message: error.message });
        return state;
      }
    });
  autoUpdater.on("checking-for-update", () =>
    emit({ status: "checking", message: "Checking for updates…" }),
  );
  autoUpdater.on("update-available", (info) =>
    emit({
      status: "available",
      latestVersion: info.version,
      releaseNotes:
        typeof info.releaseNotes === "string"
          ? info.releaseNotes
          : (info.releaseNotes ?? []).map((x) => x.note).join("\n"),
      message: "An update is available.",
      progress: 0,
    }),
  );
  autoUpdater.on("update-not-available", () =>
    emit({ status: "current", message: "You have the latest version." }),
  );
  autoUpdater.on("download-progress", (p) =>
    emit({
      status: "downloading",
      progress: Math.round(p.percent),
      message: "Downloading update…",
    }),
  );
  autoUpdater.on("update-downloaded", () =>
    emit({
      status: "ready",
      progress: 100,
      message: "Ready to restart and install.",
    }),
  );
  autoUpdater.on("error", (e) => emit({ status: "error", message: e.message }));
  const check = async () => {
    if (
      !configured ||
      ["checking", "downloading", "ready", "available"].includes(state.status)
    )
      return state;
    await autoUpdater.checkForUpdates();
    return state;
  };
  handle("updater:state", () => state);
  handle("updater:check", check);
  handle("updater:download", async () => {
    if (state.status !== "available") return state;
    emit({ status: "downloading", progress: 0 });
    await autoUpdater.downloadUpdate();
    return state;
  });
  handle("updater:automatic", (value) => {
    if (typeof value !== "boolean") throw new Error("Invalid preference");
    fs.writeFileSync(preferenceFile, JSON.stringify({ automatic: value }), {
      mode: 0o600,
    });
    automatic = value;
    emit({ automatic });
    return state;
  });
  handle("updater:meeting", (value) => {
    meetingActive = value === true;
    return true;
  });
  handle("updater:install", async (language = "en") => {
    const translations = {
      en: [
        "Install later",
        "Restart and install",
        "Install update",
        "Restart NHO ERP to install the update?",
        "Save any unfinished work before continuing.",
      ],
      ar: [
        "التثبيت لاحقاً",
        "إعادة التشغيل والتثبيت",
        "تثبيت التحديث",
        "إعادة تشغيل NHO ERP لتثبيت التحديث؟",
        "احفظ العمل غير المكتمل قبل المتابعة.",
      ],
      ku: [
        "دواتر دایبمەزرێنە",
        "دەستپێکردنەوە و دامەزراندن",
        "دامەزراندنی نوێکردنەوە",
        "NHO ERP دەست پێ بکاتەوە بۆ دامەزراندنی نوێکردنەوە؟",
        "پێش بەردەوامبوون کارە تەواونەکراوەکان پاشەکەوت بکە.",
      ],
    };
    const text =
      translations[
        typeof language === "string" &&
        ["ar", "ku"].includes(language.split("-")[0])
          ? language.split("-")[0]
          : "en"
      ];
    if (state.status !== "ready") return state;
    if (meetingActive) {
      emit({ message: "Leave the live meeting before installing the update." });
      return state;
    }
    const reply = await dialog.showMessageBox({
      type: "question",
      buttons: [text[0], text[1]],
      defaultId: 0,
      cancelId: 0,
      title: text[2],
      message: text[3],
      detail: text[4],
    });
    if (reply.response === 1) autoUpdater.quitAndInstall(false, true);
    return state;
  });
  const timer = setInterval(() => {
    if (automatic && configured) void check().catch(() => {});
  }, 4 * 3600000);
  timer.unref();
  setTimeout(() => {
    if (automatic && configured) void check().catch(() => {});
  }, 15000).unref();
}
module.exports = { setupUpdater };
