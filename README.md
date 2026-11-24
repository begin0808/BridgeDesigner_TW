<!-- Copyright (c) 2025-2026 Gene Ressler
     Modified in 2026 (2026-11-24) for Traditional Chinese educational localization (BridgeDesigner_TW).
     SPDX-License-Identifier: GPL-3.0-or-later -->

# 橋梁結構設計師（繁體中文教學版） / Bridge Designer, Cloud Edition (zh-Hant)

> **語言切換 / Language**：**繁體中文（預設）** ｜ [English README](README.en.md)
>
> **線上試用（GitHub Pages）**：https://begin0808.github.io/BridgeDesigner_TW/

---

## 授權、修改紀錄與非商業教育使用聲明

- **原專案與版權**：本專案改作自開源軟體 [gene-ressler/bridge-designer](https://github.com/gene-ressler/bridge-designer)（原名 West Point Bridge Designer / ASCE Bridge Designer, Cloud Edition，原始碼版權 © 2025-2026 Gene Ressler）。
- **修改聲明（依 GNU GPLv3 第 5(a) 條）**：本專案為**非官方繁體中文教學修改版**（最後重大修改日期：**2026-11-24**），針對繁體中文使用者與各類結構工程教學需求進行全面繁體中文化、中文 PDF 匯出字型支援、中文說明文件全文檢索與課堂互動引導增強。
- **開源授權**：本專案整體依原專案之 **[GNU General Public License v3.0 (GPL-3.0-or-later)](COPYING)** 授權條款公開原始碼釋出，並保留原作者完整 Git 提交歷史與各檔案版權宣告。
- **中文字型授權**：內嵌之 Noto Sans TC（與思源黑體同源之 Google 開源發行字型）採 **[SIL Open Font License 1.1](public/fonts/OFL.txt)** 授權。
- **非商業教育用途聲明（第三方元件庫）**：原專案使用之 UI 元件庫 `jqwidgets-ng` 僅限非商業用途免費使用（詳見 [jQWidgets 授權條款](https://www.jqwidgets.com/license/)）。**本專案與部署網站僅供免費、無廣告之非商業教育與學習使用，嚴禁作為商業用途或實際工程設計施工依據。**
- **無官方隸屬與無擔保聲明**：本專案依現狀提供，不提供任何明示或默示之擔保或保證；與美國西點軍校（USMA）、美國土木工程師學會（ASCE）及原專案作者無任何官方隸屬、合作或背書關係。官方英文版請前往 [ASCE Bridge Designer 官方網站](https://www.asce.org/career-growth/pre-college-outreach/bridge-designer)。

---

## 繁體中文化與教學增強功能

- [x] **第一階段（核心操作介面）**：主選單、工具列、專案設定精靈、材料與斷面規格、繪圖區標題欄與標註、桿件明細表、載重測試報告、成本計算明細、桿件受力分析、不穩定／細長比檢核教學視窗、3D 載重動畫設定、設計版本歷史、存檔／開檔、3D 列印匯出介面、範例橋梁與設計範本。
- [x] **第二階段（中文 PDF 與系統提示）**：PDF 匯出內嵌開源思源黑體（Noto Sans TC，[SIL OFL 1.1](public/fonts/OFL.txt)）、每日設計小訣竅（36 則 Tips）、系統通知（18 則 Toast）與瀏覽器相容性提示頁面。
- [x] **第三階段（完整說明文件與中文檢索）**：完整 178 篇線上說明文件與中英對照工程詞彙表（Glossary）繁體中文化，並實作 Orama CJK 分詞中文＋英文全文搜尋索引。
- [x] **課堂教學增強**：
  - **互動式「課堂 5 步驟引導條」**：可自由拖曳移動、進入 3D 動畫時自動收合不擋畫面，即時偵測節點、桿件、載重測試、受力優化與 PDF 報表進度並自動打勾。
  - **「新手圖文速成指南」4 分頁視窗**：內建 5 步驟流程、工具列真實圖示對照表、紅藍拉壓受力與選材祕訣、常見失敗原因排解（FAQ）。
  - **介面優化**：桿件明細表空狀態中文操作引導提示，以及工具列／選單／關於視窗連回 ASCE 官方網站與開源專案之快捷入口。

---

## 本機開發與建置指令

```bash
npm install
npx ng serve --port 4200
# 正式版建置（GitHub Pages 路徑）
npx ng build --configuration production --base-href /BridgeDesigner_TW/
```

---

## Original Upstream README

# Bridge Designer, Cloud Edition

This repository contains the Bridge Designer, Cloud Edition sources. It's a single-page Angular client-side application
with no back end.

The source is released under the [GNU Public License, v3](https://www.gnu.org/licenses). See [COPYING](COPYING).

## Releases

Following are subject to change.

- **Official release.** The supported, stable app release is hosted by the American Society of Civil Engineers
  [here](https://www.asce.org/career-growth/pre-college-outreach/bridge-designer). The project team is deeply grateful
  for this support.
- **Staging release.** A staging app release with more info than presented in this page is
  [here](https://gene-ressler.github.io/bridge-designer/). This is meant for beta testers. We appreciate the Github
  support that allows this to work.
- **CLI tools.** Compiled command line tools for contest support and development are at
  [`/src/tools/dist`](src/tools/dist). See the [README](src/tools#readme) there.
