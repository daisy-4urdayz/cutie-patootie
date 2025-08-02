const path = require("path");

// 기준 경로: D:\clippy\src\shared 기준으로 프로젝트 루트 계산
const rootDir = path.resolve(__dirname, "..", "..");

// src/main 디렉토리 경로 반환
function getMainPath() { return path.join(rootDir, "src", "main"); }

// src/renderer 디렉토리 경로 반환
function getRenderPath() { return path.join(rootDir, "src", "renderer"); }

// src/renderer/asset 디렉토리 경로 반환
function getAssetPath() { return path.join(getRenderPath(), "asset"); }

// src/shared 디렉토리 경로 반환
function getSharedPath() { return path.join(rootDir, "src", "shared"); }

// 특정 이미지 파일의 전체 경로 반환
function getImagePath(imageName) { return path.join(getAssetPath(), imageName); }

// config 디렉토리 경로 반환
function getConfigPath() { return path.join(rootDir, "config"); }

// temp 디렉토리 경로 반환
function getTempPath() { return path.join(rootDir, "temp"); }

module.exports =
{
  getAssetPath,
  getMainPath,
  getRenderPath,
  getSharedPath,
  getImagePath,
  getConfigPath,
  getTempPath,
};
