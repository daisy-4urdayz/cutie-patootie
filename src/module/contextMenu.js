const { ipcRenderer } = require('electron');

/**
 * HTML 요소에 우클릭 컨텍스트 메뉴를 설정합니다.
 * @param {HTMLElement} targetElement - 우클릭 이벤트를 감지할 대상 HTML 요소
 * @param {Function} onImageChangeCallback - '이미지 변경' 메뉴를 클릭했을 때 호출될 콜백 함수
 */
function setupContextMenu(targetElement, onImageChangeCallback) {
    // 대상 요소에 'contextmenu' (우클릭) 이벤트 리스너를 추가합니다.
    targetElement.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // 브라우저의 기본 컨텍스트 메뉴를 표시하지 않도록 방지
        ipcRenderer.send('show-context-menu'); // 메인 프로세스로 'show-context-menu' 메시지 전송
    });

    // 메인 프로세스에서 'change-image-from-menu' 메시지를 받으면 콜백 함수를 실행합니다.
    ipcRenderer.on('change-image-from-menu', () => {
        if (typeof onImageChangeCallback === 'function') {
            onImageChangeCallback(); // 이미지 변경 콜백 함수 호출
        }
    });

    console.log('[ContextMenu] 컨텍스트 메뉴 설정 완료.');
}

module.exports = { setupContextMenu };