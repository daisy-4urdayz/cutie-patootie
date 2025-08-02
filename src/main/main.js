const
{
	app,
	BrowserWindow
} = require("electron");
const pathJoin = require("../shared/pathJoin.js");
const
{
	getWindowConfig
} = require("./windowConfig.js");

// Title 설정: 공백
let mainWindow;
let currentTitle = "";

// 비동기 함수로 변경
async function createMainWindow()
{
	try
	{
		const
		{
			width,
			height
		} = await getWindowConfig(); // await 사용

		mainWindow = new BrowserWindow(
		{
			title: currentTitle,
			titleBarStyle: "hidden",
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

		// HTML 로드 여부 확인
		await mainWindow.loadFile(pathJoin.getRenderPath() + "/index.html");
		console.log("[HTML] HTML 파일 로딩 완료");

		// 페이지 로드 완료 확인
		mainWindow.webContents.on("did-finish-load", () =>
		{
			console.log("[Event] did-finish-load 이벤트 발생");
		});
	}
	catch (err)
	{
		console.error("[Window] 창 생성 실패:", err);
	}
}

// 앱이 준비되었다면
console.log("[APP] 앱 시작 시점");

app.whenReady().then(() =>
{
	console.log("[APP] 앱 준비 완료: Electron 초기화 완료");
	createMainWindow();

	// macOS 전용: Dock에서 아이콘을 클릭했다면 발생하는 이벤트
	app.on("activate", () =>
	{
		console.log("[APP] macOS activate 이벤트 발생(Dock 아이콘 클릭됨)");
		if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
	});
});

// Windows & Linux 전용: 모든 창이 닫히면 앱을 종료함
app.on("window-all-closed", () =>
{
	console.log("[APP] 모든 창이 닫힘");
	if (process.platform !== "darwin") app.quit();
});
