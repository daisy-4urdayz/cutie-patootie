const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const pathJoin = require("../shared/pathJoin.js");
const windowManager = require('./windowManager');
const { getWindowConfig, saveWindowConfig } = require("./windowConfig.js");

app.disableHardwareAcceleration();

let mainWindow;
let currentTitle = "";

async function createMainWindow()
{
    try
    {
        const { width: initialWidth, height: initialHeight } = await getWindowConfig();

        mainWindow = new BrowserWindow(
        {
            title: currentTitle,
            titleBarStyle: "hiddenInset",
            width: initialWidth,
            height: initialHeight,
            alwaysOnTop: true,
            frame: false,
            transparent: true,
            hasShadow: false,
            show: false,
            webPreferences:
            {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        mainWindow.loadFile(pathJoin.getRenderPath() + "/index.html");
        console.log("[HTML] HTML 파일 로딩 완료");

        ipcMain.on("resize-window", (event, { width, height }) =>
        {
            windowManager.resizeWindowToFitScreen(mainWindow, width, height);
        });

        ipcMain.on('refresh-window-state', () =>
        {
            console.log("[Main] 'refresh-window-state' IPC 요청 수신 (동작 없음)");
        });

        mainWindow.on('ready-to-show', () =>
        {
            console.log("[Main] ready-to-show 이벤트 발생. 창을 표시합니다.");
            mainWindow.show();
            
            // 추가: 렌더러에게 현재 창 크기 정보 전달
            const [currentWidth, currentHeight] = mainWindow.getContentSize();
            mainWindow.webContents.send('initial-window-size', { width: currentWidth, height: currentHeight });
            console.log(`[Main] 렌더러에게 초기 창 크기 전달: ${currentWidth}x${currentHeight}`);
        });

        mainWindow.on("resized", () =>
        {
            if (!mainWindow.isDestroyed())
            {
                const [width, height] = mainWindow.getSize();
                saveWindowConfig({ width, height });
                console.log(`[Main] 창 크기 저장: ${width}x${height}`);
            }
        });

    }
    catch (err)
    {
        console.error("[Window] 창 생성 실패:", err);
    }
}

console.log("[APP] 앱 시작 시점");

app.whenReady().then(() =>
{
    console.log("[APP] 앱 준비 완료: Electron 초기화 완료");
    createMainWindow();

    app.on("activate", () =>
    {
        console.log("[APP] macOS activate 이벤트 발생(Dock 아이콘 클릭됨)");
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
});

app.on("window-all-closed", () =>
{
    console.log("[APP] 모든 창이 닫힘");
    if (process.platform !== "darwin") app.quit();
});

ipcMain.on("set-title-bar-blank", (event) =>
{
    if (mainWindow && !mainWindow.isDestroyed())
    {
        mainWindow.setTitle("");
    }
});
