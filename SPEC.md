# Gyosei AI Pilot 仕様書

*作成日：2026年5月5日 / 最終更新：2026年5月5日*

---

## 1. メディア概要

### 名称
**Gyosei AI Pilot - 行政書士AI Pilot｜2026法改正ナビ**

### コンセプト
2026年1月1日施行の改正行政書士法をテーマにした、AI自律型メディア。
官公庁情報をAIが毎日収集・解説し、Human out of the loopで自律的に成長する。

### ターゲット
- コンサル会社
- 大人向け通信教育企業
- 人材会社
- 「知らずに法律違反を犯すリスク」に不安を抱える企業の法務・コンプライアンス担当者

### 背景
無資格者が「アドバイス料」「システム利用料」名目で補助金申請書などを作成することが厳罰化（1年以下の懲役または100万円以下の罰金）。この「知らずに違反するリスク」に対し、最新の法規制とAI技術を掛け合わせた実務ガイドを提供する。

---

## 2. 3つの評価軸

### 稼働性
- AIが24時間、官公庁・AI系ニュースを監視
- スクレイパーがエラーになった場合、AIが自動で構造解析・修復（Phase 2）
- 休まず動き続けるシステム

### 進化性
- 記事のパフォーマンス（PV・クリック）をAIが自動観察
- 人気コンテンツの傾向を学習し、翌日のテーマ選定に反映（Phase 2）
- 「好みを当てる編集長」エンジン

### 事業性
- 記事内容に応じたアフィリエイトリンクをAIが自動選択・挿入（Phase 3）
- A8などのASPを活用
- チャット形式のコンプライアンス診断コンテンツ ✅ 実装済み

---

## 3. 技術スタック

| 役割 | 技術 |
|------|------|
| フロントエンド | Next.js 16 + Tailwind CSS v4 |
| ホスティング | Vercel（gyosei-ai-pilot.com） |
| データベース | Supabase（PostgreSQL・東京リージョン） |
| 定期実行 | GitHub Actions（平日毎朝7時JST） |
| AI（記事生成） | Claude API - claude-sonnet-4-6 |
| AI（診断・ロジック系） | Claude API - claude-haiku-4-5-20251001 |
| スクレイピング | Playwright（JS描画あり） + Cheerio（静的HTML） |
| X自動投稿 | twitter-api-v2（※APIプランの制約で現在停止中） |
| アクセス解析 | Google Analytics 4（G-KEFDKT6RHW） |

---

## 4. システムアーキテクチャ

```
GitHub Actions（平日毎朝7時JST・cron: '0 22 * * 1-5'）
  [1] スクレイパー（官公庁13サイト収集）
  [2] 直近30件の記事タイトルを取得（重複防止）
  [3] Sonnet：記事本文 + SEOメタ + ツイート文を同時生成
  [4] Supabaseに保存 → VercelがISR自動更新
  [5] X API v2でツイート投稿（※現在402エラーで停止中）

Vercel（Next.js App Router）
  - 記事一覧ページ（10件/ページ・ページネーション）
  - 記事詳細ページ（参考情報源表示）
  - コンプライアンス診断ページ（/diagnosis）
  - 診断API（/api/diagnosis）

Supabase
  - articles（記事）
  - sources（スクレイプ対象・13サイト）
  - analytics（PV・クリック）※Phase 2
  - affiliates（アフィリエイトリンク）※Phase 3
  - topics_config（テーマ優先度）※Phase 2
```

---

## 5. 開発フェーズ

### Phase 1：基盤構築
- [x] Supabaseプロジェクト作成・DBスキーマ設計
- [x] Next.jsプロジェクト作成（Vercel連携）
- [x] スクレイパー実装（13サイト・Cheerio + Playwright）
- [x] Claude APIで記事生成パイプライン（重複防止機能含む）
- [x] SEOメタ・OGP設定
- [x] GitHub Actions定時実行設定（GitHub Secrets設定済み）
- [x] カスタムドメイン取得（gyosei-ai-pilot.com）・Vercel接続
- [x] Google Analytics 4導入
- [x] コンプライアンス診断ページ（/diagnosis）
- [ ] サイトマップ自動生成（/sitemap.xml）
- [ ] X自動投稿（APIプランの課題あり・停止中）

### Phase 2：進化エンジン
- [ ] スクレイパー自己修復エージェント
- [ ] analyticsデータ連動の編集エンジン（人気テーマ自動学習）

### Phase 3：マネタイズ
- [ ] A8アフィリエイトリンク自動挿入

---

## 6. スクレイプ対象サイト

### Tier 1（毎日・優先）
| サイト | URL | スクレイプ方法 |
|--------|-----|--------------|
| デジタル庁 | digital.go.jp/news/ | Playwright |
| 経済産業省 | meti.go.jp/whatsnew.html | Cheerio |
| 法務省 | moj.go.jp/press_index.html | Cheerio |
| 総務省 | soumu.go.jp/menu_news/s-news/ | Cheerio |
| 日本行政書士会連合会 | gyosei.or.jp/information/ | Cheerio |
| e-Gov法令検索 | elaws.e-gov.go.jp | Cheerio |

### Tier 2（毎日）
| サイト | URL | スクレイプ方法 |
|--------|-----|--------------|
| 内閣府 | cao.go.jp/press/index.html | Cheerio |
| 公正取引委員会 | jftc.go.jp/houdou/pressrelease/ | Cheerio |
| 国税庁 | nta.go.jp/information/release/ | Cheerio |
| NHKニュース | nhk.or.jp/news/cat07.html | Cheerio（bot対策で失敗中） |

### Tier 3（週1）
| サイト | URL | スクレイプ方法 |
|--------|-----|--------------|
| IPA | ipa.go.jp/security/announce/ | Cheerio |
| 厚生労働省 | mhlw.go.jp/stf/houdou/ | Cheerio |
| 中小企業庁 | chusho.meti.go.jp/koukai/other/ | Cheerio（タイムアウト中） |

---

## 7. X（Twitter）アカウント

| 項目 | 内容 |
|------|------|
| ユーザー名 | @GyoseiAIPilot |
| 表示名 | 行政書士AI Pilot｜2026法改正ナビ |
| API権限 | OAuth 1.0a / Read and Write |
| 現状 | Free tierでは402エラーで投稿不可。Basic tier（$100/月）が必要。現在は停止中。 |

---

## 8. SEO設計

- `generateMetadata`：各記事ページのタイトル・description・OGP ✅
- Google Analytics 4：アクセス計測 ✅
- サイトマップ（/sitemap.xml）：未実装
- JSON-LD構造化データ：未実装
- 記事生成時にClaudeが同時生成：SEOタイトル・メタdescription・タグ ✅

---

## 9. コスト試算

| 項目 | 月額 |
|------|------|
| Claude API（Sonnet：記事生成） | 約$4〜5 |
| Claude API（Haiku：診断） | 約$0.1〜0.5 |
| Vercel | 無料 |
| Supabase | 無料 |
| GitHub Actions | 無料 |
| Google Analytics | 無料 |
| X API | Free tier（投稿不可・停止中） |
| ドメイン（gyosei-ai-pilot.com） | 初年度無料・2年目以降1,408円/年 |
| **合計** | **約$5〜6/月（ドメイン除く）** |
