# Presence 網站

[Presence](https://github.com/chung223/Presence)（離開座位 Mac 自動鎖定、回來自動解鎖；iPhone 與 Apple Watch 簡報遙控）的官網，用 GitHub Pages 從 `main` 分支的根目錄發佈：https://chung223.github.io/presence-site/

| 路徑 | 內容 |
|---|---|
| `index.html` | 首頁（繁體中文） |
| `en/`、`ja/`、`ko/`、`zh-Hans/`、`de/`、`fr/`、`es/` | 其他七種語言的首頁（跟 App 支援的語言一樣）。結構和繁體頁完全一樣，只換文字、截圖、App Store 連結與當地價格；**改繁體頁時，這七種語言要跟著改** |
| `privacy/` | 隱私權政策，一頁八段：繁體中文、英文（`#english`）、`#ja`、`#ko`、`#zh-hans`、`#de`、`#fr`、`#es`。App repo 的 `docs/privacy.md` 是繁中與英文的同一份內容，**兩邊要一起改**；App Store Connect 的隱私權政策網址各語言連到自己那一段 |
| `404.html` | 找不到頁面（用絕對路徑 `/presence-site/`） |
| `assets/site.css` | 全部的樣式 |
| `assets/site.js` | 開場的「走開就鎖」示範、講台的簡報遙控示範、捲到講台時關燈 |
| `assets/shots/` | 實際畫面（從 App repo 的 `docs/images/mac/`、`metadata/screenshots/` 轉成 WebP） |
| `assets/og.png`、`og-<語言>.png` | 分享預覽圖，原稿在 `tools/og.html`、`tools/og-<語言>.html` |

## 設計

白天的座位 → 關燈的講台 → 燈再亮起。主色取自 App 圖示的青綠到藍；橘色只給 Presence Pro 與簡報遙控，跟 App 一樣。
中文用 Noto Sans TC（日文、韓文、簡中分別用 Noto Sans JP、KR、SC），英文字標與數字、英德法西的內文用 Bricolage Grotesque，都從 Google Fonts 載入。
韓文用 `word-break: keep-all`、日文用 `word-break: auto-phrase`，標題才不會斷在詞的中間。示範裡會變動的文字（狀態、提示、跳頁按鈕）在 `site.js` 的 `STRINGS`，說法取自 App 的字串表。

### 價格

方案卡片寫當地 App Store 的實際價格（查詢：`asc subscriptions pricing summary --app 6822611221 --territory JPN`、`asc iap pricing summary …`）：
台灣 NT$30／150／390、美國 US$0.99／4.99／12.99、日本 ¥150／800／2,000、韓國 ₩1,100／7,700／22,000、歐元區 0,99／5,99／14,99 €。
簡體中文頁（中國大陸沒有上架）寫美元並註明以 App Store 為準。改價格時這裡要跟著改。

- **開場示範**：拖著「你」離開 Mac，數字跟 App 一樣：訊號取最近 4 秒的中位數、解鎖門檻 −62、鎖定門檻 −76 dBm、離開後 4 秒鎖定；選單列與狀態用 App 裡的說法。沒人碰的時候會自己走一趟（系統開了「減少動態效果」就不會）。
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
