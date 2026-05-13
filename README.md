# 行政書士AI Pilot｜2026法改正ナビ

**URL:** https://gyosei-ai-pilot.com

2026年1月1日施行の改正行政書士法をテーマにした、AI自律型メディア。  
官公庁情報をAIが毎日収集・解説し、**Human out of the loop** で自律的に成長し続けるシステムです。

---

## 背景・課題設定

2026年1月1日の改正行政書士法により、無資格者が「アドバイス料」「システム利用料」などの名目で補助金申請書類を作成することが厳罰化されました（1年以下の懲役または100万円以下の罰金）。

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
- 記事のPV・クリックをAIが自動観察し、人気テーマを翌日のテーマ選定に反映（Phase 2）
- **Google検索データ（GSC）を毎朝取得し、2つの視点で自動強化（Phase 4）**
  - 高impression・低CTRの記事 → Claudeがタイトル改善案を3候補生成・Supabaseに保存
  - 検索1〜10位だが専用記事がないキーワード → 翌朝の記事テーマに自動注入
- 「好みを当てる編集長」エンジン

### 事業性
- チャット形式のコンプライアンス診断コンテンツ（実装済み）
- 記事内容に応じたアフィリエイトリンクをAIが自動選択・挿入（Phase 3実装済み）

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
| 検索データ取得 | Google Search Console API（googleapis） |

---

## システムアーキテクチャ

```
GitHub Actions（平日毎朝7時JST）
  [0] GSC最適化（Google Search Console API）
      - 高impression・低CTRの記事タイトル改善案をHaikuが生成 → gsc_suggestionsに保存
      - 1〜10位だがカバー記事がないキーワード（ギャップクエリ）を検出
  [1] スクレイパー（官公庁12サイト収集）
  [2] 直近30件の記事タイトルを取得（重複防止）
      + GSCギャップクエリを最優先テーマとして注入
      + 直近30日PV上位タグを優先テーマとして追加
  [3] Sonnet：記事本文 + SEOメタ + ツイート文 + FAQ（Q&A 3件）を同時生成
  [4] Supabaseに保存 → VercelがISR自動更新
  [5] Google Indexing API でURLをGoogleに即時通知
  [6] X API v2でツイート投稿

Vercel（Next.js App Router）
  - 記事一覧ページ（10件/ページ・ページネーション）
  - 記事詳細ページ（参考情報源表示）
  - コンプライアンス診断ページ（/diagnosis）
  - 診断API（/api/diagnosis）

Supabase
  - articles（記事・faq: jsonb カラム含む）
  - sources（スクレイプ対象・12サイト）
  - analytics（PV・クリック・アフィリエイトクリック）
  - affiliates（アフィリエイトリンク）
  - topics_config（テーマ優先度）
  - gsc_suggestions（タイトル改善候補・GSCデータ付き）
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

### Phase 3：マネタイズ（完了）

- [x] A8アフィリエイトリンク自動挿入（2026年5月11日）
  - 記事タグ×categoriesマッチングで関連アフィリエイトを自動選択（最大3件）
  - 記事ページ・トップページ：右サイドバー表示（768px以上）
  - 診断結果ページ：結果下部に縦並び表示・riskLevelで振り分け可能
  - /api/affiliate-click でクリック追跡→A8リダイレクト
  - A8承認済み5件登録（KANBEI SIGN・弥生会計 Next・MFクラウド会計・MF会社設立・アガルート行政書士講座）
  - 残り承認待ちは is_active=true + a8_link 更新で即反映

### Phase 4：GSC連動 進化エンジン強化（2026年5月13日・完了）

- [x] Google Search Console API 連携（googleapis・サービスアカウント認証）
- [x] 高impression・低CTR記事の自動検出 → Haiku がタイトル改善案3候補を生成 → `gsc_suggestions` テーブルに保存
- [x] 検索1〜10位のギャップクエリ自動検出 → 翌朝の記事テーマに最優先注入
- [x] GSCデータ未取得時は自動スキップ（パイプライン継続）

### Phase 5：SEO強化・セキュリティ・プロンプト改善（2026年5月14日・完了）

- [x] **Supabase RLS 有効化** — 全テーブルにRow-Level Securityを設定。パイプラインをservice_role keyに切り替え
- [x] **Google Indexing API** — 記事公開直後にURLをGoogleへ即時通知（`scripts/indexing-client.ts`）
- [x] **FAQPage JSON-LD** — Claudeが記事生成時にQ&A 3件を同時生成。記事ページに構造化データ出力＋「よくある質問」UI表示。Googleリッチリザルト対象
- [x] **記事生成プロンプト改善** — 不適切テーマ（風俗・わいせつ）の禁止、タイトル固定パターンの解消、最新ニュース起点の記事生成に変更

### UI/デザイン改善（2026年5月12日）

- [x] 人気記事ランキングバッジ：1位ゴールド・2位シルバー・3位ブロンズ・4位グレーの丸バッジ
- [x] 記事一覧カード：「続きを読む →」左端・日付右端に変更
- [x] アフィリエイトサイドバー：「関連サービス」h2見出し追加（スマホ・デスクトップ両対応）
- [x] 記事ページ：コンプライアンス診断CTAを追加
  - スマホ：サイドバー上部に紺色カード（無料・即時診断 + ゴールドボタン）
  - デスクトップ：フッター直上にフルワイドバナー
- [x] 記事ページ デスクトップ：タイトル行に「関連サービス」h2を2カラム配置（h1と高さ揃え）
- [x] ※広告を含む場合があります：デスクトップは日付と同高さ・スマホはエリア末尾
- [x] レスポンシブ余白調整：768〜1023px は gap-9（2/3）・1024px以上は gap-14
- [x] OG画像：タイトルフォントサイズ拡大・URL位置を30px上に調整
- [x] 記事本文 h2：上余白 46px に調整

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
- JSON-LD構造化データ：WebSite・CollectionPage・ItemList・NewsArticle・WebPage・BreadcrumbList・**FAQPage** ✅
- FAQPage JSON-LD：記事ごとにQ&A 3件を自動生成・Googleリッチリザルト（展開表示）対象 ✅
- Google Indexing API：記事公開直後にURLをGoogleへ即時通知 ✅
- 記事生成時にClaudeが同時生成：SEOタイトル・メタdescription・タグ・ビッグワード・FAQ ✅

---

## X（Twitter）アカウント

[@GyoseiAIPilot](https://x.com/GyoseiAIPilot) — 毎朝7時に自動投稿稼働中（2026年5月9日〜）
