const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () =>
{
    const img = document.querySelector(".mainImage");

    if (!img) return;

    img.onload = () =>
    {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        console.log(`[Renderer] 이미지 크기: ${width}x${height}`);
        ipcRenderer.send("resize-window", { width, height });
    };
});
