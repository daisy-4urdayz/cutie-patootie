// src/renderer/renderer.js

const pathJoin = require("../shared/pathJoin");
const imageManager = require(pathJoin.getModulePath() + '/imageManager');
const contextMenu = require(pathJoin.getModulePath() + '/contextMenu');

const { ipcRenderer } = require("electron");

console.log("renderer.js 파일 실행 시작!");

let initialWindowWidth = 0;
let initialWindowHeight = 0;

// ⭐ 추가: 메인 프로세스로부터 초기 창 크기 수신 ⭐
ipcRenderer.on('initial-window-size', (event, { width, height }) => {
    initialWindowWidth = width;
    initialWindowHeight = height;
    console.log(`[Renderer] 메인 프로세스로부터 초기 창 크기 수신: ${initialWindowWidth}x${initialWindowHeight}`);
    
    // 만약 DOMContentLoaded가 이미 발생했다면 여기서 imageManager 시작
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        startImageManagerIfReady();
    }
});

window.addEventListener("DOMContentLoaded", () => {
    // DOM이 준비되었을 때 imageManager를 시작할 준비가 되었음을 알림
    startImageManagerIfReady();
});

function startImageManagerIfReady() {
    // 초기 창 크기 정보가 있고 DOM이 로드되었을 때만 시작
    if (initialWindowWidth > 0 && initialWindowHeight > 0 && 
        (document.readyState === 'complete' || document.readyState === 'interactive')) {
        
        const currentImage = document.getElementById("currentImage");
        const nextImage = document.getElementById("nextImage");

        if (!currentImage || !nextImage) {
            console.error("[Renderer] 'currentImage' 또는 'nextImage' 중 하나 이상의 이미지 요소를 찾을 수 없습니다. index.html의 ID를 확인해 주세요.");
            return;
        }

        // ⭐ 변경: imageManager.startAutoImageChange에 고정된 창 크기 전달 ⭐
        imageManager.startAutoImageChange(currentImage, nextImage, initialWindowWidth, initialWindowHeight, 5000, 15000);

        contextMenu.setupContextMenu(currentImage, () => {
            imageManager.changeImageManually();
        });
        
        // 이 함수는 한 번만 실행되어야 하므로, 더 이상 호출되지 않도록 플래그를 설정하거나
        // 로직 자체를 이미지를 시작하는 곳으로 옮길 수 있습니다.
        // 현재는 첫 호출 이후에 다시 호출되어도 문제가 없도록 설계되어 있습니다.
    }
}