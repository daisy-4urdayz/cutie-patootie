const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const pathJoin = require("../shared/pathJoin");
const CONFIG_FILE_PATH = path.join(pathJoin.getSharedPath(), "config.json");

// 기본 설정값 (config.json 파일이 없거나 오류 발생 시 사용)
const DEFAULT_CONFIG = {
    window:
    {
        mode: "fixed", // 또는 "image"
        width: 800,
        height: 600
    }
};


async function getWindowConfig()
{
    let config = DEFAULT_CONFIG;
    try
    {
        if (fs.existsSync(CONFIG_FILE_PATH))
        {
            const raw = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
            config = JSON.parse(raw);
        }
    }
    catch (error)
    {
        console.error("[WindowConfig] config.json 파일을 읽거나 파싱하는 중 오류 발생:", error);
        // 오류 발생 시 기본 config 사용
    }

    const mode = config.window ?.mode || "fixed";

    if (mode === "image")
    {
        // 초기 이미지 경로를 얻기 위한 임시 로직 (imageManager 종속성 제거)
        const assetDirPath = pathJoin.getAssetPath();
        let initialImagePath = null;
        try
        {
            const imageFiles = fs.readdirSync(assetDirPath)
                .filter(file => /\.(png|jpe?g|gif|webp)$/i.test(file));
            if (imageFiles.length > 0)
            {
                initialImagePath = path.join(assetDirPath, imageFiles[0]);
            }
        }
        catch (error)
        {
            console.error("[WindowConfig] 이미지 폴더 읽기 오류:", error);
        }


        if (!initialImagePath)
        {
            console.warn("[WindowConfig] 초기 이미지 경로를 가져올 수 없습니다. 기본 크기를 사용합니다.");
            const width = config.window.width || DEFAULT_CONFIG.window.width;
            const height = config.window.height || DEFAULT_CONFIG.window.height;
            return { width, height };
        }

        try
        {
            const metadata = await sharp(initialImagePath).metadata();
            const { width, height } = metadata;
            console.log(`[WindowConfig] 초기 이미지 크기: ${width}x${height}`);
            return { width, height };
        }
        catch (error)
        {
            console.error("[WindowConfig] 초기 이미지 메타데이터 읽기 오류:", error);
            const width = config.window.width || DEFAULT_CONFIG.window.width;
            const height = config.window.height || DEFAULT_CONFIG.window.height;
            return { width, height };
        }
    }
    else
    {
        const width = config.window.width || DEFAULT_CONFIG.window.width;
        const height = config.window.height || DEFAULT_CONFIG.window.height;
        return { width, height };
    }
}

// 창 설정 저장
async function saveWindowConfig(newWindowSize)
{
    let config = DEFAULT_CONFIG;
    try
    {
        if (fs.existsSync(CONFIG_FILE_PATH))
        {
            const raw = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
            config = JSON.parse(raw);
        }
    }
    catch (error)
    {
        console.error("[WindowConfig] 기존 config.json 읽기 오류 (저장 전):", error);
    }

    // window 객체가 없으면 생성
    if (!config.window)
    {
        config.window = {};
    }

    // 새로운 너비와 높이 저장
    config.window.width = newWindowSize.width;
    config.window.height = newWindowSize.height;

    try
    {
        await fs.promises.writeFile(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
        console.log("[WindowConfig] 창 설정 저장 완료:", newWindowSize);
    }
    catch (error)
    {
        console.error("[WindowConfig] config.json 파일을 저장하는 중 오류 발생:", error);
    }
}


module.exports =
{
    getWindowConfig,
    saveWindowConfig,
};
