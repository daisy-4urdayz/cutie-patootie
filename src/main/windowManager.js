// src/main/windowManager.js

const { BrowserWindow, screen } = require('electron'); // Electron 모듈 필요

// 창 크기를 모니터에 맞춰 제한하고 조절하는 함수
function resizeWindowToFitScreen(browserWindow, desiredWidth, desiredHeight) {
    if (!browserWindow || browserWindow.isDestroyed()) {
        console.warn("[WindowManager] 유효하지 않은 BrowserWindow 객체입니다.");
        return;
    }

    const [currentContentWidth, currentContentHeight] = browserWindow.getContentSize();

    // 현재 디스플레이의 최대 작업 영역 크기 가져오기
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    // 이미지 크기가 화면을 넘어서지 않도록 제한
    let newWidth = Math.min(desiredWidth, screenWidth);
    let newHeight = Math.min(desiredHeight, screenHeight);

    // 비율 유지를 위한 추가 로직
    const imageAspectRatio = desiredWidth / desiredHeight;
    const screenAspectRatio = screenWidth / screenHeight;

    if (newWidth === screenWidth && imageAspectRatio > screenAspectRatio) {
        newHeight = Math.round(screenWidth / imageAspectRatio);
    } else if (newHeight === screenHeight && imageAspectRatio < screenAspectRatio) {
        newWidth = Math.round(screenHeight * imageAspectRatio);
    }

    // 현재 창 위치를 가져와서 해당 위치에서 크기만 변경
    const [x, y] = browserWindow.getPosition();

    // 기존 크기와 다를 때만 조절 (불필요한 조작 방지)
    if (currentContentWidth !== newWidth || currentContentHeight !== newHeight) {
        console.log(`[WindowManager] 창 크기 조절: ${newWidth}x${newHeight} (요청: ${desiredWidth}x${desiredHeight}, 화면 제한: ${screenWidth}x${screenHeight})`);
        browserWindow.setBounds({ x, y, width: newWidth, height: newHeight });
    }
}

module.exports = {
    resizeWindowToFitScreen
};