// src/renderer/renderer.js

// pathJoin 모듈을 가져옵니다. renderer.js는 src/renderer에 있고, pathJoin.js는 src/shared에 있으므로
// 상대 경로를 '..' 한 번만 사용하여 src 폴더로 이동한 후 'shared/pathJoin'을 지정합니다.
const pathJoin = require("../shared/pathJoin"); // <-- pathJoin 모듈 가져오기

// pathJoin.getModulePath() 함수가 반환하는 절대 경로를 사용하여 모듈을 가져옵니다.
// Node.js의 require는 절대 경로를 처리할 수 있습니다.
const imageManager = require(pathJoin.getModulePath() + '/imageManager'); // <-- pathJoin 사용
const contextMenu = require(pathJoin.getModulePath() + '/contextMenu');   // <-- pathJoin 사용

const { ipcRenderer } = require("electron");

console.log("renderer.js 파일 실행 시작!");

window.addEventListener("DOMContentLoaded", () => {
    const img = document.getElementById("mainImage");

    if (!img) {
        console.error("[Renderer] ID 'mainImage'를 가진 요소를 찾을 수 없습니다.");
        return;
    }

    imageManager.startAutoImageChange(img, 5000, 15000);

    img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        console.log(`[Renderer] 이미지 로드 완료 및 크기: ${width}x${height}`);
        ipcRenderer.send("resize-window", { width, height });

        setTimeout(() => {
            ipcRenderer.send('refresh-window-state');
            console.log("[Renderer] 메인 프로세스에 창 상태 갱신 요청을 보냈습니다.");
        }, 100);
    };

    img.onerror = () => {
        console.error("[Renderer] 이미지 로드 실패!");
    };

    contextMenu.setupContextMenu(img, () => {
        imageManager.changeImageManually(img);
    });
});