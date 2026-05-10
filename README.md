# 行政書士AI Pilot｜2026法改正ナビ

**URL:** https://gyosei-ai-pilot.com

2026年1月1日施行の改正行政書士法をテーマにした、AI自律型メディア。  
官公庁情報をAIが毎日収集・解説し、**Human out of the loop** で自律的に成長し続けるシステムです。

---

## 背景・課題設定

改正行政書士法により、無資格者が「アドバイス料」「システム利用料」などの名目で補助金申請書類を作成することが厳罰化されました（1年以下の懲役または100万円以下の罰金）。

「知らずに法律違反を犯すリスク」に不安を抱える企業の法務・コンプライアンス担当者に向け、最新の法規制情報とAI技術を掛け合わせた実務ガイドを毎日届けます。

### ターゲット

- コンプライアンス担当者（中小企業・スタートアップ）
- コンサル会社・人材会社
- 大人向け通信教育企業

---

## 3つの評価軸

### 稼働性
- AIが24時間、官公庁・AI系ニュースを監視
- スクレイパーがエラーになった場合、AIが自動で構造解析・修復（Phase 2実装済み）
- 休まず動き続けるシステム

### 進化性
- 記事のパフォーマンス（PV・クリック）をAIが自動観察
- 人気コンテンツの傾向を学習し、翌日のテーマ選定に反映（Phase 2実装済み）
- 「好みを当てる編集長」エンジン

### 事業性
- チャット形式のコンプライアンス診断コンテンツ（実装済み）
- 記事内容に応じたアフィリエイトリンクをAIが自動選択・挿入（Phase 3）

---

## 技術スタック

| 役割 | 技術 |
|------|------|
| フロントエンド | Next.js 16 + Tailwind CSS v4 |
| ホスティング | Vercel |
| データベース | Supabase（PostgreSQL・東京リージョン） |
| 定期実行 | GitHub Actions（平日毎朝7時JST） |
| AI（記事生成） | Claude API - claude-sonnet-4-6 |
| AI（診断・ロジック系） | Claude API - claude-haiku-4-5 |
| スクレイピング | Playwright（JS描画あり） + Cheerio（静的HTML） + RSS |
| X自動投稿 | twitter-api-v2（Pay Per Use） |
| アクセス解析 | Google Analytics 4 |

---

## システムアーキテクチャ

```
GitHub Actions（平日毎朝7時JST）
  [1] スクレイパー（官公庁12サイト収集）
  [2] 直近30件の記事タイトルを取得（重複防止）
  [3] Sonnet：記事本文 + SEOメタ + ツイート文を同時生成
  [4] Supabaseに保存 → VercelがISR自動更新
  [5] X API v2でツイート投稿

Vercel（Next.js App Router）
  - 記事一覧ページ（10件/ページ・ページネーション）
  - 記事詳細ページ（参考情報源表示）
  - コンプライアンス診断ページ（/diagnosis）
  - 診断API（/api/diagnosis）

Supabase
  - articles（記事）
  - sources（スクレイプ対象・12サイト）
  - analytics（PV・クリック）
  - affiliates（アフィリエイトリンク）※Phase 3
  - topics_config（テーマ優先度）
```

---

## スクレイプ対象サイト（12サイト）

### Tier 1（毎日・優先）

| サイト | スクレイプ方法 |
|--------|--------------|
| デジタル庁 | Playwright |
| 経済産業省 | Cheerio |
| 法務省 | Cheerio |
| 総務省 | Cheerio |
| 日本行政書士会連合会 | Cheerio |
| e-Gov法令検索 | Cheerio |

### Tier 2（毎日）

| サイト | スクレイプ方法 |
|--------|--------------|
| 内閣府 | Cheerio |
| 公正取引委員会 | Cheerio |
| 国税庁 | Cheerio |
| NHKニュース | RSS（bot対策回避） |

### Tier 3（週1）

| サイト | スクレイプ方法 |
|--------|--------------|
| IPA | Cheerio |
| 厚生労働省 | Cheerio |

---

## 開発フェーズ

### Phase 1：基盤構築（完了）

- [x] Supabaseプロジェクト作成・DBスキーマ設計
- [x] Next.jsプロジェクト作成（Vercel連携）
- [x] スクレイパー実装（Cheerio + Playwright + RSS）
- [x] Claude APIで記事生成パイプライン（重複防止機能含む）
- [x] カスタムドメイン（gyosei-ai-pilot.com）・Vercel接続
- [x] GitHub Actions定時実行設定
- [x] X自動投稿（2026年5月9日稼働開始）
- [x] コンプライアンス診断ページ（/diagnosis）
- [x] SEOメタ・OGP設定・サイトマップ自動生成
- [x] JSON-LD構造化データ（WebSite・NewsArticle・BreadcrumbList 等）
- [x] パンくずリスト（全ページ）
- [x] OGP画像動的生成（Vercel OG・記事タイトル入り）
- [x] Google Search Console 登録・サイトマップ送信済み
- [x] Google Analytics 4 導入（自社IP除外設定済み）
- [x] 法的ページ新設（/privacy・/about・/terms・/tokutei・/contact）
- [x] お問い合わせフォーム（Resend連携）

### Phase 2：進化エンジン（完了）

- [x] スクレイパー自己修復エージェント（Claude Haiku・セレクタ自動解析・DB自動更新）
- [x] analyticsデータ連動の編集エンジン（人気テーマ自動学習）

### Phase 3：マネタイズ

- [ ] A8アフィリエイトリンク自動挿入

---

## SEO設計

- `generateMetadata`：各記事ページのタイトル・description・OGP ✅
- OGP画像・Twitter Card（summary_large_image）：全ページ ✅
- 記事ごとに動的OGP画像を生成（Vercel OG・記事タイトル入りゴールドデザイン）✅
- パンくずリスト：全ページ（UI表示 + BreadcrumbList JSON-LD）✅
- Google Analytics 4：アクセス計測・自社IP除外設定済み ✅
- Google Search Console：登録・所有権確認済み・サイトマップ送信済み ✅
- サイトマップ（/sitemap.xml）：静的ページ + 全記事・1時間更新 ✅
- robots.txt：全クローラー許可・/api/ 除外 ✅
- JSON-LD構造化データ：WebSite・CollectionPage・ItemList・NewsArticle・WebPage・BreadcrumbList ✅
- 記事生成時にClaudeが同時生成：SEOタイトル・メタdescription・タグ・ビッグワード ✅

---

## X（Twitter）アカウント

[@GyoseiAIPilot](https://x.com/GyoseiAIPilot) — 毎朝7時に自動投稿稼働中（2026年5月9日〜）
