const { ipcRenderer } = require("electron");

console.log("renderer.js 파일 실행 시작!"); // 이 로그가 나와야 합니다.

window.addEventListener("DOMContentLoaded", () => {
    const img = document.getElementById("mainImage"); 

    if (!img) {
        console.error("[Renderer] ID 'mainImage'를 가진 요소를 찾을 수 없습니다.");
        return;
    }

    // ✨ renderer.js에서 이미지 src를 설정합니다. ✨
    const imageName = "default.png";
    const imagePath = `asset/${imageName}`; // 경로가 올바른지 확인 (index.html 기준)
    img.src = imagePath;
    console.log(`[Renderer] 이미지 src 설정: ${imagePath}`);


    img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        console.log(`[Renderer] 이미지 로드 완료 및 크기: ${width}x${height}`);
        ipcRenderer.send("resize-window", { width, height });

        // 이미지 로드 및 창 크기 조절 후, 창 상태 갱신을 요청합니다.
        setTimeout(() => {
            ipcRenderer.send('refresh-window-state');
            console.log("[Renderer] 메인 프로세스에 창 상태 갱신 요청을 보냈습니다.");
        }, 100); // 필요에 따라 지연 시간 조절
    };

    img.onerror = () => {
        console.error("[Renderer] 이미지 로드 실패!");
    };
});