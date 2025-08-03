// src/main/windowConfig.js
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const pathJoin = require("../shared/pathJoin"); // src/main에서 src/shared로 가는 경로

// pathJoin.js에서 getModulePath() 함수를 사용하여 imageManager를 가져옵니다.
// 이 코드는 메인 프로세스에서 실행되므로, Node.js의 require 메커니즘이 getModulePath()가 반환하는 절대 경로를 이해합니다.
const imageManager = require(pathJoin.getModulePath() + '/imageManager'); // <-- 이 부분 수정!

async function getWindowConfig() {
    const configPath = path.join(pathJoin.getSharedPath(), "config.json");
    const raw = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(raw);

    const mode = config.window?.mode || "fixed";

    if (mode === "image") {
        const initialImagePath = imageManager.getInitialImagePath();

        if (!initialImagePath) {
            console.warn("[WindowConfig] 초기 이미지 경로를 가져올 수 없습니다. 기본 크기를 사용합니다.");
            const width = config.window.width || 800;
            const height = config.window.height || 600;
            return { width, height };
        }

        try {
            const metadata = await sharp(initialImagePath).metadata();
            const { width, height } = metadata;
            console.log(`[WindowConfig] 초기 이미지 크기: ${width}x${height}`);
            return { width, height };
        } catch (error) {
            console.error("[WindowConfig] 초기 이미지 메타데이터 읽기 오류:", error);
            const width = config.window.width || 800;
            const height = config.window.height || 600;
            return { width, height };
        }
    } else {
        const width = config.window.width || 800;
        const height = config.window.height || 600;
        return { width, height };
    }
}

module.exports = { getWindowConfig };