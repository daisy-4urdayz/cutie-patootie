const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const pathJoin = require("../shared/pathJoin.js");
const windowManager = require('./windowManager');
const { getWindowConfig, saveWindowConfig } = require("./windowConfig.js");

app.disableHardwareAcceleration();

let mainWindow = null; // 명시적으로 null로 초기화
let currentTitle = "";

async function createMainWindow()
{
    // 이미 창이 존재하면 새로 만들지 않음
    if (mainWindow && !mainWindow.isDestroyed())
    {
        console.log("[Window] 창이 이미 존재함. 포커스만 이동.");
        mainWindow.focus();
        return mainWindow;
    }

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

        // IPC 리스너는 한 번만 등록 (중복 방지)
        if (!ipcMain.listenerCount("resize-window"))
        {
            ipcMain.on("resize-window", (event, { width, height }) =>
            {
                if (mainWindow && !mainWindow.isDestroyed())
                {
                    windowManager.resizeWindowToFitScreen(mainWindow, width, height);
                }
            });
        }

        if (!ipcMain.listenerCount('refresh-window-state'))
        {
            ipcMain.on('refresh-window-state', () =>
            {
                console.log("[Main] 'refresh-window-state' IPC 요청 수신 (동작 없음)");
            });
        }

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
            if (mainWindow && !mainWindow.isDestroyed())
            {
                const [width, height] = mainWindow.getSize();
                saveWindowConfig({ width, height });
                console.log(`[Main] 창 크기 저장: ${width}x${height}`);
            }
        });

        // 창이 닫힐 때 참조 정리
        mainWindow.on('closed', () =>
        {
            console.log("[Window] 창이 닫힘. 참조 정리.");
            mainWindow = null;
        });

        return mainWindow;
    }
    catch (err)
    {
        console.error("[Window] 창 생성 실패:", err);
        mainWindow = null;
    }
}

console.log("[APP] 앱 시작 시점");

app.whenReady().then(() =>
{
    console.log("[APP] 앱 준비 완료: Electron 초기화 완료");
    createMainWindow();

    app.on("activate", () =>
    {
        console.log("[APP] activate 이벤트 발생");
        // 더 안전한 체크: mainWindow 참조와 getAllWindows 둘 다 확인
        if (!mainWindow || mainWindow.isDestroyed() || BrowserWindow.getAllWindows().length === 0)
        {
            console.log("[APP] 새 창 생성 필요");
            createMainWindow();
        }
        else
        {
            console.log("[APP] 기존 창에 포커스");
            mainWindow.focus();
        }
    });
});

app.on("window-all-closed", () =>
{
    console.log("[APP] 모든 창이 닫힘");
    mainWindow = null; // 참조 정리
    if (process.platform !== "darwin") app.quit();
});

// IPC 리스너도 안전하게 처리
if (!ipcMain.listenerCount("set-title-bar-blank"))
{
    ipcMain.on("set-title-bar-blank", (event) =>
    {
        if (mainWindow && !mainWindow.isDestroyed())
        {
            mainWindow.setTitle("");
        }
    });
}
