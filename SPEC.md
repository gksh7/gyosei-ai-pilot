# Legal AI Pilot 仕様書

*作成日：2026年5月5日*

---

## 1. メディア概要

### 名称
**Legal AI Pilot - 行政書士AI Pilot｜2026法改正ナビ**

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
- スクレイパーがエラーになった場合、AIが自動で構造解析・修復
- 休まず動き続けるシステム

### 進化性
- 記事のパフォーマンス（PV・クリック）をAIが自動観察
- 人気コンテンツの傾向を学習し、翌日のテーマ選定に反映
- 「好みを当てる編集長」エンジン

### 事業性
- 記事内容に応じたアフィリエイトリンクをAIが自動選択・挿入
- A8などのASPを活用
- チャット形式のコンプライアンス診断コンテンツ

---

## 3. 技術スタック

| 役割 | 技術 |
|------|------|
| フロントエンド | Next.js + Tailwind CSS |
| UIコンポーネント | shadcn/ui（必要に応じて導入） |
| ホスティング | Vercel（独自ドメイン） |
| データベース | Supabase（PostgreSQL） |
| 定期実行 | GitHub Actions（毎朝） |
| AI（記事生成） | Claude API - Sonnet |
| AI（ロジック系） | Claude API - Haiku |
| スクレイピング | Playwright（JS描画あり） + Cheerio（静的HTML） |
| X自動投稿 | twitter-api-v2 |
| チャット診断 | Vercel AI SDK（useChat） |

---

## 4. システムアーキテクチャ

```
GitHub Actions（毎朝定時実行）
  [1] スクレイパー（官公庁・AI系ニュース収集）
        ↓ エラー時 → Haiku AIが構造解析→セレクタ自動修正
  [2] Haiku：前日analyticsを解釈 → 今日のテーマ選定
  [3] Sonnet：記事本文 + SEOメタ + ツイート文を同時生成
  [4] Supabaseに保存 → VercelがISR自動更新
  [5] X API v2でツイート投稿

Vercel（Next.js）
  - 記事一覧・詳細ページ（SSG/ISR）
  - チャット形式コンプライアンス診断
  - 管理画面

Supabase
  - articles（記事）
  - sources（スクレイプ対象）
  - analytics（PV・クリック）
  - affiliates（アフィリエイトリンク）
  - topics_config（テーマ優先度）
```

---

## 5. 開発フェーズ

### Phase 1：基盤構築
- [ ] Supabaseプロジェクト作成・DBスキーマ設計
- [ ] Next.jsプロジェクト作成（Vercel連携）
- [ ] スクレイパー実装（Tier1サイト優先）
- [ ] Claude APIで記事生成パイプライン
- [ ] SEOメタ・OGP・サイトマップ自動生成
- [ ] X自動投稿連携
- [ ] GitHub Actions定時実行設定

### Phase 2：進化エンジン
- [ ] analyticsトラッキング実装
- [ ] Haikuエージェント群（編集長ロジック）
- [ ] スクレイパー自己修復エージェント

### Phase 3：マネタイズ
- [ ] A8アフィリエイトDBとリンク自動注入
- [ ] チャット形式コンプライアンス診断コンテンツ

---

## 6. スクレイプ対象サイト

### Tier 1（毎日・優先）
| サイト | ドメイン | スクレイプ方法 |
|--------|---------|--------------|
| デジタル庁 | digital.go.jp | Playwright |
| 経済産業省 | meti.go.jp | Playwright |
| 法務省 | moj.go.jp | Cheerio |
| 総務省 | soumu.go.jp | Cheerio |
| 日本行政書士会連合会 | gyosei.or.jp | Cheerio |
| e-Gov法令検索 | elaws.e-gov.go.jp | Cheerio |

### Tier 2（毎日）
| サイト | ドメイン | スクレイプ方法 |
|--------|---------|--------------|
| NHK | nhk.or.jp | Playwright |
| 内閣府 | cao.go.jp | Cheerio |
| 公正取引委員会 | jftc.go.jp | Cheerio |
| 国税庁 | nta.go.jp | Cheerio |

### Tier 3（週1）
| サイト | ドメイン | スクレイプ方法 |
|--------|---------|--------------|
| IPA | ipa.go.jp | Cheerio |
| 厚生労働省 | mhlw.go.jp | Cheerio |
| 中小企業庁 | chusho.meti.go.jp | Cheerio |

---

## 7. X（Twitter）アカウント

| 項目 | 内容 |
|------|------|
| ユーザー名 | @GyoseiAIPilot |
| 表示名 | 行政書士AI Pilot｜2026法改正ナビ |
| プロフィール | 2026年改正行政書士法、あなたの会社は大丈夫？コンサル・人材・通信教育企業の「知らずに違反」を防ぐAI法務ナビ。官公庁情報をAIが毎日収集・解説します。 |
| API権限 | OAuth 1.0a / Read and Write |
| 投稿頻度 | 記事生成のたびに1投稿（1日1〜5回程度） |

### ツイートフォーマット
```
【タイトル】

要約1文

#行政書士法 #2026年改正 #コンプライアンス
https://（記事URL）
```

---

## 8. SEO設計

- `generateMetadata`：各記事ページのタイトル・description・OGP
- `@vercel/og`：動的OGP画像生成
- `next-sitemap`：サイトマップ自動生成
- JSON-LD構造化データ（Articleスキーマ）
- 記事生成時にClaudeが同時生成：SEOタイトル・メタdescription・タグ

---

## 9. コスト試算

| 項目 | 月額 |
|------|------|
| Claude API（Sonnet：記事生成） | 約$4〜5 |
| Claude API（Haiku：ロジック系） | 約$0.1〜0.5 |
| Vercel | 無料 |
| Supabase | 無料 |
| GitHub Actions | 無料 |
| X API | 無料（月1,500投稿まで） |
| **合計** | **約$5〜6/月** |
