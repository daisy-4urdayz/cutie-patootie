// src/modules/imageManager.js
const fs = require('fs');
const path = require('path');
const pathJoin = require('../shared/pathJoin');

const IMAGE_DIR = pathJoin.getAssetPath();

let currentImageIndex = -1;
let imageFiles = [];
let changeInterval = null;

// 새 변수: 현재 활성화된 이미지 요소 (current-image 또는 next-image)
let activeImageElement = null;
// 새 변수: 비활성화된 이미지 요소 (activeImageElement의 반대)
let inactiveImageElement = null;

function loadImages() {
    try {
        const files = fs.readdirSync(IMAGE_DIR);
        imageFiles = files.filter(file => /\.(png|jpe?g|gif|webp)$/i.test(file));
        if (imageFiles.length === 0) {
            console.warn(`[ImageManager] ${IMAGE_DIR} 폴더에 이미지가 없습니다.`);
        } else {
            console.log('[ImageManager] 이미지 로드 완료:', imageFiles);
        }
    } catch (error) {
        console.error('[ImageManager] 이미지 폴더를 읽는 중 오류 발생:', error);
        imageFiles = [];
    }
}

function getNextImage(isRandom = true) {
    if (imageFiles.length === 0) {
        loadImages();
        if (imageFiles.length === 0) return null;
    }

    let nextIndex;
    if (isRandom) {
        do {
            nextIndex = Math.floor(Math.random() * imageFiles.length);
        } while (nextIndex === currentImageIndex && imageFiles.length > 1);
    } else {
        nextIndex = (currentImageIndex + 1) % imageFiles.length;
    }

    currentImageIndex = nextIndex;
    const imageName = imageFiles[currentImageIndex];
    return path.join(IMAGE_DIR, imageName);
}

// ⭐ 새로 추가되는 함수: 이미지 전환 로직 ⭐
function transitionImage(newImagePath, callback) {
    if (!activeImageElement || !inactiveImageElement) {
        console.error("[ImageManager] 이미지 요소가 초기화되지 않았습니다.");
        return;
    }

    // 새 이미지를 비활성화된 요소에 로드
    inactiveImageElement.src = newImagePath;

    // 이미지가 로드될 때까지 기다림
    inactiveImageElement.onload = () => {
        console.log('[ImageManager] 새 이미지 로드 완료:', newImagePath);

        // 새 이미지를 활성화 (보이게 함)
        inactiveImageElement.classList.add('active');
        // 이전 이미지를 비활성화 (숨김)
        activeImageElement.classList.remove('active');

        // active/inactive 요소 교체
        [activeImageElement, inactiveImageElement] = [inactiveImageElement, activeImageElement];

        // 이미지 로드 및 전환 완료 후 콜백 실행 (창 크기 조절 등)
        if (typeof callback === 'function') {
            callback(activeImageElement);
        }
    };

    inactiveImageElement.onerror = () => {
        console.error('[ImageManager] 새 이미지 로드 실패:', newImagePath);
        // 오류 처리: 콜백은 호출하지 않거나, 오류 콜백을 별도로 전달할 수 있습니다.
    };
}


// ⭐ startAutoImageChange 함수 시그니처 변경 및 로직 수정 ⭐
// 이제 두 개의 이미지 요소를 받습니다.
function startAutoImageChange(currentImgEl, nextImgEl, minIntervalMs = 5000, maxIntervalMs = 15000) {
    activeImageElement = currentImgEl; // 처음엔 current-image가 active
    inactiveImageElement = nextImgEl;  // next-image는 inactive

    // 초기 이미지 설정 (첫 번째 이미지를 currentImgEl에 설정하고 active 클래스 추가)
    const initialImagePath = getNextImage(true);
    if (initialImagePath) {
        activeImageElement.src = initialImagePath;
        activeImageElement.classList.add('active'); // 첫 이미지 활성화
    } else {
        console.warn("[ImageManager] 표시할 초기 이미지가 없습니다.");
        return;
    }


    if (changeInterval) {
        clearTimeout(changeInterval);
    }

    const changeImage = () => {
        const imagePath = getNextImage(true);
        if (imagePath) {
            console.log('[ImageManager] 다음 이미지 자동 변경 준비:', imagePath);
            // transitionImage 함수를 호출하여 이미지 전환과 콜백을 처리합니다.
            transitionImage(imagePath, (loadedImgEl) => {
                // 이미지가 완전히 로드되고 전환된 후 호출될 콜백
                // renderer.js에서 받았던 onload 로직을 여기서 대신 호출
                if (loadedImgEl.naturalWidth && loadedImgEl.naturalHeight) {
                    console.log(`[Renderer] 이미지 로드 완료 및 크기: ${loadedImgEl.naturalWidth}x${loadedImgEl.naturalHeight}`);
                    ipcRenderer.send("resize-window", { width: loadedImgEl.naturalWidth, height: loadedImgEl.naturalHeight });

                    setTimeout(() => {
                        ipcRenderer.send('refresh-window-state');
                        console.log("[Renderer] 메인 프로세스에 창 상태 갱신 요청을 보냈습니다.");
                    }, 100);
                }
            });
        }
        const nextInterval = Math.floor(Math.random() * (maxIntervalMs - minIntervalMs + 1)) + minIntervalMs;
        changeInterval = setTimeout(changeImage, nextInterval);
    };

    // 초기 이미지 설정 후 바로 첫 타이머 시작 (지연 시작)
    const initialDelay = Math.floor(Math.random() * (maxIntervalMs - minIntervalMs + 1)) + minIntervalMs;
    changeInterval = setTimeout(changeImage, initialDelay);
}

// ⭐ changeImageManually 함수 시그니처 변경 및 로직 수정 ⭐
// 이제 activeImageElement를 사용합니다.
function changeImageManually() {
    const imagePath = getNextImage(false);
    if (imagePath) {
        console.log('[ImageManager] 다음 이미지 수동 변경 준비:', imagePath);
        transitionImage(imagePath, (loadedImgEl) => {
            // 수동 변경 시에도 창 크기 조절 로직 호출
            if (loadedImgEl.naturalWidth && loadedImgEl.naturalHeight) {
                console.log(`[Renderer] 이미지 로드 완료 및 크기: ${loadedImgEl.naturalWidth}x${loadedImgEl.naturalHeight}`);
                ipcRenderer.send("resize-window", { width: loadedImgEl.naturalWidth, height: loadedImgEl.naturalHeight });

                setTimeout(() => {
                    ipcRenderer.send('refresh-window-state');
                    console.log("[Renderer] 메인 프로세스에 창 상태 갱신 요청을 보냈습니다.");
                }, 100);
            }
        });
    }
}

function getInitialImagePath() {
    if (imageFiles.length === 0) {
        loadImages();
    }
    if (imageFiles.length > 0) {
        return path.join(IMAGE_DIR, imageFiles[0]);
    }
    return null;
}

loadImages();

module.exports = {
    startAutoImageChange,
    changeImageManually,
    getInitialImagePath
};