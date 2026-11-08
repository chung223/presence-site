# Presence 網站

[Presence](https://github.com/chung223/Presence)（離開座位 Mac 自動鎖定、回來自動解鎖；iPhone 與 Apple Watch 簡報遙控）的官網，用 GitHub Pages 從 `main` 分支的根目錄發佈：https://chung223.github.io/presence-site/

| 路徑 | 內容 |
|---|---|
| `index.html` | 首頁（繁體中文） |
| `en/`、`ja/`、`ko/`、`zh-Hans/`、`de/`、`fr/`、`es/` | 其他七種語言的首頁（跟 App 支援的語言一樣）。結構和繁體頁完全一樣，只換文字、截圖、App Store 連結與當地價格；**改繁體頁時，這七種語言要跟著改** |
| `privacy/` | 隱私權政策，一頁八段：繁體中文、英文（`#english`）、`#ja`、`#ko`、`#zh-hans`、`#de`、`#fr`、`#es`。App repo 的 `docs/privacy.md` 是繁中與英文的同一份內容，**兩邊要一起改**；App Store Connect 的隱私權政策網址各語言連到自己那一段 |
| `404.html` | 找不到頁面（用絕對路徑 `/presence-site/`） |
| `assets/site.css` | 全部的樣式 |
| `assets/site.js` | 開場的「走開就鎖」示範、講台的簡報遙控示範、捲到講台時關燈、觸控板與鍵盤示範、手勢圖 |
| `assets/icons.svg` | 全站共用的圖示（`<svg class="ico"><use href="assets/icons.svg#名稱"/></svg>`，子資料夾的頁面寫 `../assets/`） |
| `assets/shots/` | 實際畫面（從 App repo 的 `docs/images/mac/`、`metadata/screenshots/` 轉成 WebP） |
| `assets/og.png`、`og-<語言>.png` | 分享預覽圖，原稿在 `tools/og.html`、`tools/og-<語言>.html` |

**改了 `site.css`、`site.js` 或 `icons.svg`，要把每一頁連結後面的 `?v=日期` 一起換新**（八個首頁、`privacy/`、`404.html`；`grep -rn '?v=' --include='*.html' .`）。GitHub Pages 會讓瀏覽器快取 10 分鐘，Safari 會拿新的 HTML 配舊的 CSS，整頁跑版（2026-11-08 發生過）。

## 設計

白天的座位 → 關燈的講台 → 燈再亮起。主色取自 App 圖示的青綠到藍；橘色只給 Presence Pro 與簡報遙控，跟 App 一樣。
中文用 Noto Sans TC（日文、韓文、簡中分別用 Noto Sans JP、KR、SC），英文字標與數字、英德法西的內文用 Bricolage Grotesque，都從 Google Fonts 載入。
韓文用 `word-break: keep-all`、日文用 `word-break: auto-phrase`，標題才不會斷在詞的中間。示範裡會變動的文字（狀態、提示、跳頁按鈕）在 `site.js` 的 `STRINGS`，說法取自 App 的字串表。

### 價格

方案卡片寫當地 App Store 的實際價格（查詢：`asc subscriptions pricing summary --app 6822611221 --territory JPN`、`asc iap pricing summary …`）：
台灣 NT$30／150／390、美國 US$0.99／4.99／12.99、日本 ¥150／800／2,000、韓國 ₩1,100／7,700／22,000、歐元區 0,99／5,99／14,99 €。
簡體中文頁（中國大陸沒有上架）寫美元並註明以 App Store 為準。改價格時這裡要跟著改。

- **開場示範**：拖著「你」離開 Mac，數字跟 App 一樣：訊號取最近 4 秒的中位數、解鎖門檻 −62、鎖定門檻 −76 dBm、離開後 4 秒鎖定；選單列與狀態用 App 裡的說法。沒人碰的時候會自己走一趟（系統開了「減少動態效果」就不會）。
- **少字、用圖**：說明交給示範與截圖，不寫段落。「怎麼判斷」是走開、回來兩條流程圖（`.flows`）；功能清單是「圖示＋短標＋一句」（`.feats`，Mac 版功能與講台各一組）；隱私是四個圖示加短標（`.trust`）。開場示範的圖表已經畫出中位數與兩條門檻，下面不再用字重講。中文標題用 `<span class="c">` 一句一句包起來，只在標點後換行（其他語言用 `text-wrap: balance`）。
- **觸控板與鍵盤**（`#trackpad`，講台之後燈再亮起）：手機觸控區拖曳 → Mac 游標跟著動，點一下是左鍵、兩指點或滑鼠右鍵是右鍵、兩指滑動捲動；文字框組字中不送（跟 App 一樣），Return 換行；打字時游標藏起來。沒人碰時自己示範一輪（`data-demo` 是各語言示範的那句話），「減少動態效果」時不播。觸控區裡的六格手勢圖照 App 的 `GestureGlyph` 畫，一次動一格，碰一下觸控區或點文字框就收起來（跟 App 一樣）；桌面上手機在左、Mac 在右，跟講台反過來；手勢名稱、「打字到 Mac」等字跟 App 的字串表一字不差。
- **講台**：`[data-night]` 那一段在畫面中央時，`body` 加上 `.night`，整頁變暗。手機上的觸控區對應投影幕：雷射筆、聚光燈（四周暗 80%、邊緣在半徑 0.9～1.1 倍）、螢光筆（4 秒後淡掉、翻頁清掉）都照 App 的做法畫。

## 本機預覽

```bash
python3 -m http.server 4325 --directory ..
```

打開 http://localhost:4325/presence-site/ （和線上一樣在 `/presence-site/` 底下）。

## 分享預覽圖

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1200,630 --virtual-time-budget=9000 --screenshot=assets/og.png http://localhost:4325/presence-site/tools/og.html
```

其他語言換成 `assets/og-<語言>.png` 與 `tools/og-<語言>.html`。
