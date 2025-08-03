const { app, BrowserWindow, ipcMain } = require("electron");
const pathJoin = require("../shared/pathJoin.js");
const { getWindowConfig } = require("./windowConfig.js");
app.disableHardwareAcceleration(); // Title bar 삭제를 위한 하드웨어 가속 해제(CPU에서 처리함)

// Title 공백화
let mainWindow;
let currentTitle = "";

// 비동기 작업 선언(async)
async function createMainWindow()
{
    try
	{
		// getWindowConfig()가 설정값을 완전히 가져올 때까지 mainWindow 정지(await)
        const { width, height } = await getWindowConfig();

        mainWindow = new BrowserWindow
		({
            title: currentTitle,
            titleBarStyle: "hiddenInset",
            width,
            height,
            alwaysOnTop: true,
            frame: false,
            transparent: true,
            hasShadow: false,
            webPreferences:
			{
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        await mainWindow.loadFile(pathJoin.getRenderPath() + "/index.html");
        console.log("[HTML] HTML 파일 로딩 완료");

        // renderer.js에서 요청 시 창 상태 갱신
		// 윈도우 창의 고질적인 버그 해결을 위한 화면 리로딩
        ipcMain.on('refresh-window-state', () =>
		{
			if (mainWindow && !mainWindow.isDestroyed())
			{
				mainWindow.hide();
				mainWindow.show();
				console.log("[renderer.js] IPC 요청으로 창 상태 갱신 시도: hide/show()");
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