const fs = require('fs');
const path = require('path');
const pathJoin = require('../shared/pathJoin');
const { ipcRenderer } = require('electron');

const IMAGE_DIR = pathJoin.getAssetPath();

// 현재 활성화된 이미지 파일의 인덱스(아직 아무것도 로드되지 않았음)
let currentImageIndex = -1;
let imageFiles = [];
let changeInterval = null;

let activeImageElement = null;
let inactiveImageElement = null;

// 창 크기 고정
let fixedWindowWidth = 0;
let fixedWindowHeight = 0;

function loadImages()
{
    try
    {
        const files = fs.readdirSync(IMAGE_DIR);
        imageFiles = files.filter(file => /\.(png|jpe?g|gif|webp)$/i.test(file));
        if (imageFiles.length === 0)
        {
            console.warn(`[ImageManager] ${IMAGE_DIR} 폴더에 이미지가 없습니다.`);
        }
        
        else
        {
            console.log('[ImageManager] 이미지 로드 완료:', imageFiles.length + '개');
        }
    }
    
    catch (error)
    {
        console.error('[ImageManager] 이미지 폴더를 읽는 중 오류 발생:', error);
        imageFiles = [];
    }
}

function getNextImage(isRandom = true)
{
    if (imageFiles.length === 0)
    {
        loadImages();
        if (imageFiles.length === 0) return null;
    }

    let nextIndex;
    if (isRandom)
    {
        do
        {
            nextIndex = Math.floor(Math.random() * imageFiles.length);
        } while (nextIndex === currentImageIndex && imageFiles.length > 1);
    }
    
    else
    {
        nextIndex = (currentImageIndex + 1) % imageFiles.length;
    }

    currentImageIndex = nextIndex;
    const imageName = imageFiles[currentImageIndex];
    return path.join(IMAGE_DIR, imageName);
}

function transitionImage(newImagePath)
{
    if (!activeImageElement || !inactiveImageElement)
    {
        console.error("[ImageManager] 이미지 요소가 초기화되지 않았습니다.");
        return;
    }

    // 1. 새 이미지를 비활성화된 요소(inactiveImageElement)에 로드
    //    이 시점에서 inactiveImageElement는 opacity: 0 상태여야 합니다.
    inactiveImageElement.src = newImagePath;

    inactiveImageElement.onload = () =>
    {
        console.log('[ImageManager] 새 이미지 로드 완료:', newImagePath);

        // 2. 클래스 토글 전에, 불필요한 클래스가 붙어있을 경우를 대비하여 초기화
        activeImageElement.classList.remove('bgImageActive');
        activeImageElement.classList.add('bgImage'); // 현재 활성화된 이미지를 비활성 상태로 만듦 (opacity: 0)

        // 중요: 강제 리페인트/리플로우 유발 (브라우저가 DOM 변경을 즉시 적용하도록 유도)
        // 이 라인은 DOM을 변경하고, 브라우저가 이 변경을 즉시 계산하도록 만듭니다.
        // 다음 라인(inactiveImageElement.classList.add)이 실행되기 전에
        // activeImageElement의 opacity 변화가 적용될 시간을 줍니다.
        void activeImageElement.offsetWidth; 

        inactiveImageElement.classList.remove('bgImage'); // 혹시 모를 상황 대비 (bgImage 제거)
        inactiveImageElement.classList.add('bgImageActive'); // 새로 로드된 이미지를 활성 상태로 만듦 (opacity: 1)
        
        // transitionend 이벤트 핸들러 등록 시점 확인
        // inactiveImageElement가 'bgImageActive' 클래스를 얻으면서 transition이 시작됩니다.
        // 이 시점에 이벤트를 등록하는 것이 올바릅니다.
        // { once: true } 옵션으로 한번만 실행되도록 보장합니다.
        inactiveImageElement.addEventListener('transitionend', function handler(e)
        {
            // 이벤트가 정확히 opacity 속성에서 발생했는지 확인 (선택 사항이지만 안전함)
            if (e.propertyName === 'opacity')
            {
                console.log('[ImageManager] 이미지 페이드 전환 완료.');
                inactiveImageElement.removeEventListener('transitionend', handler); // 한 번 실행 후 제거

                // active/inactive 요소 교체
                // 이 시점에서 inactiveImageElement는 이미 opacity:1 상태가 되었으므로 activeImageElement가 되어야 합니다.
                // 이전 activeImageElement는 이제 inactiveImageElement가 되어 다음 로드에 사용됩니다.
                [activeImageElement, inactiveImageElement] = [inactiveImageElement, activeImageElement];

                // 창 크기 조절 요청 스킵 (고정된 창 크기 사용)
                console.log(`[ImageManager] 창 크기 조절 요청 스킵. 고정된 창 크기: ${fixedWindowWidth}x${fixedWindowHeight}`);
            }
        }, { once: true });
    };

    inactiveImageElement.onerror = () =>
    {
        console.error('[ImageManager] 새 이미지 로드 실패:', newImagePath);
    };
}

// startAutoImageChange 함수에 고정된 창 크기 인자 추가
function startAutoImageChange(currentImgEl, nextImgEl, initialWindowWidth, initialWindowHeight, minIntervalMs = 5000, maxIntervalMs = 300000)
{
    activeImageElement = currentImgEl;
    inactiveImageElement = nextImgEl;

    // 고정된 창 크기 설정
    fixedWindowWidth = initialWindowWidth;
    fixedWindowHeight = initialWindowHeight;

    // 첫 이미지 로드 시 창 크기 조절은 여전히 필요할 수 있음
    // (앱 시작 시 최초 1회만 고정된 크기로 맞춤)
    const initialImagePath = getNextImage(true);
    if (initialImagePath)
    {
        activeImageElement.src = initialImagePath;
        activeImageElement.classList.add('bgImageActive');

        activeImageElement.onload = () =>
        {
            console.log('[ImageManager] 초기 이미지 로드 완료:', initialImagePath);
            // 첫 이미지 로드 시 고정된 창 크기로 IPC 호출
            if (fixedWindowWidth && fixedWindowHeight)
            {
                console.log(`[ImageManager] 초기 창 크기 설정 요청: ${fixedWindowWidth}x${fixedWindowHeight}`);
                ipcRenderer.send("resize-window", { width: fixedWindowWidth, height: fixedWindowHeight });
            }
            
            else
            {
                // 만약 고정 크기가 제대로 전달되지 않았다면, 이미지 크기에 맞춤 (백업)
                if (activeImageElement.naturalWidth && activeImageElement.naturalHeight)
                {
                    console.warn("[ImageManager] 고정 창 크기 정보 없음. 초기 이미지 크기에 맞추어 조절:", activeImageElement.naturalWidth, activeImageElement.naturalHeight);
                    ipcRenderer.send("resize-window", { width: activeImageElement.naturalWidth, height: activeImageElement.naturalHeight });
                }
            }

            ipcRenderer.send('refresh-window-state');

            // 자동 변경 타이머 시작
            if (changeInterval)
            {
                clearTimeout(changeInterval);
            }
            const initialDelay = Math.floor(Math.random() * (maxIntervalMs - minIntervalMs + 1)) + minIntervalMs;
            changeInterval = setTimeout(changeImage, initialDelay);
            console.log(`[ImageManager] 첫 자동 변경은 ${initialDelay}ms 후에 시작됩니다.`);
        };
        activeImageElement.onerror = () =>
        {
            console.error('[ImageManager] 초기 이미지 로드 실패:', initialImagePath);
            if (changeInterval)
            {
                clearTimeout(changeInterval);
            }
            // 이미지 변경에 1초 딜레이
            const initialDelay = Math.floor(Math.random() * (maxIntervalMs - minIntervalMs + 1)) + minIntervalMs;
            changeInterval = setTimeout(changeImage, initialDelay);
        };
    }
    
    else
    {
        console.warn("[ImageManager] 표시할 초기 이미지가 없습니다. 자동 변경 시작 불가.");
        return;
    }

    const changeImage = () =>
    {
        const imagePath = getNextImage(true);
        if (imagePath)
        {
            console.log('[ImageManager] 다음 이미지 자동 변경 준비:', imagePath);
            transitionImage(imagePath);
        }
        const nextInterval = Math.floor(Math.random() * (maxIntervalMs - minIntervalMs + 1)) + minIntervalMs;
        changeInterval = setTimeout(changeImage, nextInterval);
        console.log(`[ImageManager] 다음 자동 변경은 ${nextInterval}ms 후에 시작됩니다.`);
    };
}


function changeImageManually()
{
    const imagePath = getNextImage(false);
    if (imagePath)
    {
        console.log('[ImageManager] 다음 이미지 수동 변경 준비:', imagePath);
        transitionImage(imagePath);
    }
}

function getInitialImagePath()
{
    // 이 함수는 windowConfig.js에서 호출되어 초기 이미지 크기를 가져올 때만 사용됩니다. imageManager 내부 로직에서는 직접 사용되지 않습니다.
    if (imageFiles.length === 0)
    {
        loadImages();
    }
    if (imageFiles.length > 0)
    {
        return path.join(IMAGE_DIR, imageFiles[0]);
    }
    return null;
};

loadImages(); // 초기 이미지 파일 목록 로드

module.exports =
{
    startAutoImageChange,
    changeImageManually,
    getInitialImagePath // windowConfig.js에서 필요하므로 계속 내보냅니다.
};