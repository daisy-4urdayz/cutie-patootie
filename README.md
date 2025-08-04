# My cutie patooties 💕

- [다운로드 링크](https://github.com/daisy-4urdayz/cutie-patootie/releases/latest): https://github.com/daisy-4urdayz/cutie-patootie/releases/tag/v1.0.0


- `My cutie patooties`는 Electron을 사용한 데스크탑 위젯 애플리케이션입니다.
- 좋아하는 아이의 사진을 위젯처럼 모니터 화면에 띄워 놓고 싶었습니다.
- 크로미움 기반 브라우저를 사용하기 때문에 메모리를 좀 잡아먹을 수 있습니다. 게다가 GPU 사용을 강제로 해제해서 CPU에서 돌아갑니다.
- 이 폴더 안에는 프로그램 실행 파일과 제가 사용한 모든 소스 코드가 포함되어 있습니다.
- 원래대로라면 개발용/배포용 폴더를 분리해야겠지만 제가 npm한테 너무 시달린 탓에 거기까지는 못하겠습니다. 제가 개발한/쓰던 '그대로' 있습니다.
- 어느 정도냐면 `node_module`이랑 `.vscode` 같은 것도 들어가 있습니다.
- 제일 처음 켜면 창이 엄청나게 크게 뜹니다. 최초 1회 조정 후에는 해당 크기로 유지됩니다. 사진 가장 아래를 붙잡고 줄이시는 걸 추천합니다.

---

## 📦 설치 방법

이 앱은 설치 과정이 필요 없는 **포터블(Portable)** 앱입니다.

1. 다운로드한 압축 파일을 원하는 위치에 풀어 주세요.  
2. `My cutie patooties.exe`를 더블클릭하면 바로 실행됩니다. 혹시 파일이 보이지 않는다면 `cutie-patootie\dist\win-unpacked` 폴더에 들어가 보세요.
3. 종료하려면 우클릭 후 `종료`를 눌러 주세요.

---

## 📂 폴더 구조
```
dist/win-unpacked/
├─ My cutie patooties.exe ← 프로그램 실행 파일
├─ ...
└─ resources/
   ├─ app/
   │  ├─ src/
   │  │  ├─ main/       ← 메인 소스 코드
   │  │  ├─ module/     ← 모듈화한 파일들
   │  │  ├─ renderer/
   │  │  │  └─ asset/   ← 이미지를 넣는 폴더
   │  │  └─ shared/     ← config.json(앱 설정 파일)의 위치
   └─ └─ package.json
```
- 프로그램 실행은 최상위의 **`My cutie patooties.exe`**를 실행하세요.
- 소스 코드는 **`resources/app`** 폴더에 있습니다.
- 적어 두지 않은 건 딱히 신경쓰실 필요 없는 것들입니다. 만들어 놓고 안 쓴 파일도 있긴 합니다.

---

## ⚙️ 설정 파일 (config.json)

- `dist/win-unpacked/resources/app/src/shared/config.json`에 있는데, 수정은 별로 권장하지 않습니다.
- 사실 제일 중요한 건 `/module`에 있습니다.

---

## 🖼️ 이미지 & 리소스

- 앱에서 사용하는 이미지는 `resources/app/asset/` 폴더에 있어야 합니다.
- 이미지를 교체하려면 원하는 이미지를 복사해서 해당 폴더에 넣어 주세요. 파일명 변경 등은 특별히 필요하지 않습니다.
- 지원하는 확장자: `png, jpeg, gif, webp`
- png 외에는 시험해 본 적이 없습니다만 일단 지원은 합니다.

---

## 🔹 주의 사항

- 이 폴더 안의 파일들을 삭제하거나 옮기면 앱이 실행되지 않을 수 있습니다.
- Windows SmartScreen에서 "알 수 없는 앱" 경고가 나올 수 있습니다. → **추가 정보 > 실행**을 눌러 주세요.
- 이미지는 sharp로 관리하고 있는데, 이 친구가 저를 굉장히 힘들게 했습니다. 사용하지 않는 것 같아 보이는 파일/폴더여도 전부 이 친구와 연결되어 있으니 `package.json` 파일은 되도록이면 수정하지 마세요.
- 안타깝게도 mac과 Linux는 지원하지 않습니다. 혹시라도 수정해서 쓰실 수 있다면 환영합니다.
- 코드/프로그램 수정, 재배포, 수정 후 재배포, 공유, 뜯어서 구경하기 등 어떤 식으로 사용하셔도 됩니다. 대신 재배포하실 때는 제 Github 주소만 어딘가에 넣어 주세요.

## 💥 버그

- 시간이 지나면 창이 증식하는 문제가 있었습니다. 코드 수정 후 윈도우 두 대로 시험해 봤는데 고쳐진 것 같습니다.
- 또 찾으면 수정합니다...

---

## 📧 문의

- 제작자: daisy  
- 문의: [GitHub Issues](https://github.com/daisy-4urdayz/cutie-patootie)