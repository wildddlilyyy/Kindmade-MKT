# Kindmade SEO Report

Kindmade SEO Report 是一個 Python SEO 爬蟲與報告產生工具，用來檢查同網域頁面的基礎 SEO 狀態，輸出 CSV、HTML dashboard，以及可部署到 GitHub Pages 的靜態報告資料。

## 專案內容

- `seo_crawler/`：核心爬蟲、頁面分析、CSV 匯出與單頁 HTML dashboard。
- `scripts/score_seo_report.py`：讀取爬蟲 CSV，加入 SEO 分數、等級、修正優先級與建議。
- `scripts/generate_pages_site.py`：把評分後資料切成 GitHub Pages 使用的 JSON 報告資料。
- `scripts/generate_full_report.py`：產生完整 Markdown / HTML 稽核報告。
- `docs/`：GitHub Pages 靜態網站與歷史報告資料。
- `output/`：本機執行後產生的 CSV 與 HTML 報告。大多數輸出檔不會提交到 Git。

## 本機環境

建議使用專案內的虛擬環境，避免影響電腦上的其他 Python 專案。

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
```

如果已經建立過 `.venv`，之後只要直接使用 `.venv` 裡的 Python 執行指令即可。

## 基本爬蟲

```powershell
.\.venv\Scripts\python -m seo_crawler.main --url https://kindmade.com.tw/ --max-pages 100 --output output/seo_report_full.csv
```

常用參數：

- `--url`：起始網址，預設為 `https://kindmade.com.tw/`
- `--max-pages`：最多爬取頁數，預設為 `100`
- `--output`：CSV 輸出路徑
- `--timeout`：單次請求逾時秒數，預設為 `15`
- `--delay`：每個請求之間的停頓秒數，預設為 `0.2`

## 加入 SEO 評分

爬蟲完成後，執行評分腳本：

```powershell
.\.venv\Scripts\python scripts\score_seo_report.py
```

此腳本會讀取：

```text
output/seo_report_full.csv
```

並輸出：

```text
output/seo_report_scored.csv
```

## 產生 HTML Dashboard

如果只需要快速瀏覽 dashboard，可以使用核心 UI：

```powershell
.\.venv\Scripts\python -m seo_crawler.ui --input output/seo_report_scored.csv --output output/seo_report.html
```

## 更新 GitHub Pages 報告資料

要把最新評分結果整理成 `docs/` 靜態網站使用的報告資料：

```powershell
.\.venv\Scripts\python scripts\generate_pages_site.py
```

腳本會在 `docs/reports/YYYY-MM-DD/` 建立當天報告，並更新 `docs/reports.json`。

## 產生完整稽核報告

```powershell
.\.venv\Scripts\python scripts\generate_full_report.py
```

預設輸出：

```text
output/seo_full_audit_report.md
output/seo_full_audit_report.html
```

## 建議完整流程

```powershell
.\.venv\Scripts\python -m seo_crawler.main --url https://kindmade.com.tw/ --max-pages 100 --output output/seo_report_full.csv
.\.venv\Scripts\python scripts\score_seo_report.py
.\.venv\Scripts\python -m seo_crawler.ui --input output/seo_report_scored.csv --output output/seo_report.html
.\.venv\Scripts\python scripts\generate_pages_site.py
```

## GitHub Pages

GitHub Pages 設定：

- Source：Deploy from a branch
- Branch：`main`
- Folder：`/docs`

發布網址：

https://wildddlilyyy.github.io/Kindmade-SEO-Report/

## 開發注意事項

- 爬蟲只會追蹤同網域 HTML 頁面，圖片、PDF、JS、CSS 等靜態檔會略過。
- CSV 以 `utf-8-sig` 輸出，方便使用 Excel 開啟中文內容。
- `.venv/`、`__pycache__/` 與大多數 `output/` 產物不會提交到 Git。
- 若要提交新的公開報告，通常只需要提交 `docs/` 內更新後的檔案。
