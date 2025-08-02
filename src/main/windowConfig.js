const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const pathJoin = require("../shared/pathJoin");

async function getWindowConfig() {
    const configPath = path.join(pathJoin.getSharedPath(), "config.json");
    const raw = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(raw);

    const mode = config.window?.mode || "fixed";

    if (mode === "image") {
        const imageName = config.window.image || "default.png";
        const imagePath = pathJoin.getImagePath(imageName);

        const metadata = await sharp(imagePath).metadata();
        const { width, height } = metadata;

        return { width, height };
    } else {
        const width = config.window.width || 800;
        const height = config.window.height || 600;
        return { width, height };
    }
}

module.exports = { getWindowConfig };
