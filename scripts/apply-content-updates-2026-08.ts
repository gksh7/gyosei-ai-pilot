import { supabase } from './supabase-client'
import { notifyIndexing } from './indexing-client'

const SITE_BASE = 'https://gyosei-ai-pilot.com'
const APPLY = process.argv.includes('--apply')

/**
 * 2026-08 バッチ: GSCクエリデータに基づく検索意図ミスマッチ・順位改善のための本文追記。
 *  - pillar-kobutsu     : 「自分で取る流れ」早わかりセクション + 内部リンク3本（順位16.6位/「申請 自分」で32位）
 *  - visa-agency-risk   : 「利用する側の注意点・依頼先チェックリスト」（「ビザ申請代行 注意点」49imp/55位）
 *  - agricultural-land  : 「行政書士に代理申請を依頼する流れ・費用」（「農地転用 代理申請」20imp/48位）
 *
 * content 内の一意な文字列を anchor に、その直前/直後へブロックを挿入する。
 * 既に挿入済み（marker 文字列を含む）ならスキップして冪等に。
 */

type Patch = {
  slug: string
  marker: string        // 挿入済み判定に使う一意文字列
  anchor: string        // content 内の一意な既存文字列
  position: 'before' | 'after'
  block: string         // 挿入する HTML
}

const KOBUTSU_OVERVIEW = `<h2>古物商許可を自分で取る流れ｜5ステップ早わかり</h2>
<p>行政書士に依頼せず自分で古物商許可を申請する場合の全体像は、次の5ステップだ。各ステップの詳細はこの後のセクションで解説する。</p>
<ol>
  <li><strong>①管轄警察署の生活安全課に事前相談する</strong>：電話で必要書類と営業所の要件を確認しておくと、窓口での差し戻しを防げる。</li>
  <li><strong>②必要書類を収集する</strong>：住民票の写し・身分証明書・登記されていないことの証明書などを揃える。発行から3か月の有効期限に注意。</li>
  <li><strong>③古物商許可申請書を記入する</strong>：取り扱う古物の区分（13品目）・営業所・ネット販売のURLを記載する。</li>
  <li><strong>④警察署の窓口に提出し、手数料19,000円を納付する</strong>：申請先は営業所を管轄する警察署の生活安全課。</li>
  <li><strong>⑤標準40日の審査を経て許可証を受け取る</strong>：不許可の場合でも手数料は返還されない。</li>
</ol>
<p>自分で申請した場合の実費は<strong>個人で約20,500円〜</strong>、行政書士に依頼すると<strong>5万〜9万円程度</strong>が目安だ。書類収集と平日の窓口対応の時間を確保できるなら、初めてでも自分で申請できる難易度といえる。他の許認可を自分で取る場合の進め方は<a href="/articles/pillar-construction-permit-diy-cost-guide-1779470755193">建設業許可を自分で取る方法と費用</a>、専門家へ依頼する場合の費用感は<a href="/articles/pillar-gyoseishoshi-nani-shite-kureru-hiyo-soba-1779470834571">行政書士に頼めること一覧と費用相場</a>で解説している。</p>

`

const VISA_CHECKLIST = `<h2>ビザ申請代行を利用する側の注意点｜依頼先の選び方チェックリスト</h2><p>外国人材の受け入れを進める企業が、ビザ（在留資格）申請を外部に依頼する場合、依頼先が適法に業務を行える事業者かどうかを必ず確認する必要があります。無資格の代行業者に依頼すると、書類の品質リスクだけでなく、依頼した企業側が違法行為に関与したと見られるおそれもあります。依頼前に次の点をチェックしてください。</p><ul><li><strong>申請取次の資格を持つ行政書士・弁護士か</strong>：出入国在留管理庁への申請の取次ができるのは、申請取次の届出をした行政書士、弁護士、または受入れ機関の職員などに限られます。担当者の行政書士登録番号を確認しましょう。</li><li><strong>契約書に「申請書類の作成」「申請の代理・取次」が業務範囲として明記されているか</strong>：「サポートのみ」と説明しながら実際は書類を作成している業者は要注意です。</li><li><strong>再委託の有無と再委託先</strong>：コンサル会社が受注し実際の申請は提携行政書士が行う体制の場合、その行政書士が誰かを明示できるか確認します。</li><li><strong>報酬体系が明確か</strong>：「不許可なら全額返金」などを過度に強調する業者は、無理な申請を通そうとするリスクがあります。</li><li><strong>不許可時の対応方針</strong>：理由の確認や再申請のサポート範囲を事前に取り決めておきます。</li></ul><p>自社で在留資格申請を行う場合の流れや不許可を避けるポイントは<a href="/articles/pillar-zairyu-shikaku-shinsei-gyoseishoshi-hiyo-jibunde-1779470979339">行政書士なしで在留資格申請は危険？不許可リスク回避法</a>で、2026年改正行政書士法をふまえた社内体制の整え方は<a href="/articles/zairyu-shikaku-gyoseishoshi-law-2026-compliance-1778279026879">在留資格と行政書士法2026年改正の実務対応</a>で解説しています。</p>`

const NOUCHI_DELEGATE = `<h2>農地転用の代理申請を行政書士に依頼する｜費用・期間・依頼の流れ</h2><p>「自社で書類を作るのは難しい」「農業委員会とのやり取りを任せたい」という場合は、農地転用申請を<strong>行政書士に代理申請として依頼する</strong>のが適法かつ確実な方法です。行政書士は農地法第4条・第5条の許可申請書の作成と提出代理を独占業務として行えます。</p><h3>依頼した場合の費用・期間の目安</h3><ul><li><strong>行政書士報酬</strong>：農地法第4条（自己転用）で5万〜15万円、第5条（権利移動を伴う転用）で8万〜20万円程度が目安です。面積・立地・添付図面の量、開発許可の要否によって幅があります。</li><li><strong>実費</strong>：登記事項証明書・公図・住民票などの取得費用として数千円程度。</li><li><strong>期間</strong>：農業委員会の受付は月1回が一般的で、申請から許可までおおむね1〜2か月（都道府県知事の許可の場合）。大規模案件で農林水産大臣との協議が必要な場合はさらに長くなります。</li></ul><h3>依頼の流れ</h3><ol><li>行政書士に転用の目的・場所・面積を伝え、可否の見通しと見積もりを確認する</li><li>委任状の作成と必要書類の収集（行政書士が代行取得できるものも多い）</li><li>行政書士が申請書・事業計画書・資金計画・土地利用計画図などを作成する</li><li>農業委員会へ提出し、審査・現地調査・意見聴取に対応する</li><li>許可通知を受領する</li></ol><p>コンサルティング会社が農地転用を含むサービスを提供する際に、どこまでを自社で行い、どこからを行政書士に任せるべきかは<a href="/articles/agricultural-land-conversion-application-agent-without-license-1780052663632">農地転用申請を農業コンサルが代行すると違法になるか</a>、法人が負う罰則リスクは<a href="/articles/gyoseishoshi-both-penalty-corporate-risk-1781610331173">行政書士法の「両罰規定」とは何か</a>で詳しく解説しています。</p>`

const patches: Patch[] = [
  {
    slug: 'pillar-kobutsu-sho-kyoka-jibun-de-torikata-hitsuyoshorui-1779471136176',
    marker: '古物商許可を自分で取る流れ｜5ステップ早わかり',
    anchor: '<h2>古物商許可の必要書類一覧｜個人申請の場合</h2>',
    position: 'before',
    block: KOBUTSU_OVERVIEW,
  },
  {
    slug: 'pillar-kobutsu-sho-kyoka-jibun-de-torikata-hitsuyoshorui-1779471136176',
    marker: '依頼先は必ず行政書士資格の有無を確認したい',
    anchor: '行政書士に依頼すれば書類収集から申請まで一任でき、補正対応も代行してもらえる。',
    position: 'after',
    block: 'ただし依頼先は必ず行政書士資格の有無を確認したい（無資格業者への依頼リスクは<a href="/articles/kobutsu-dealer-permit-unauthorized-agent-illegal-1787134576128">古物商許可申請を無資格で代行すると違法か</a>で解説）。',
  },
  {
    slug: 'visa-application-agency-gyoseishoshi-violation-risk-1783080020608',
    marker: 'ビザ申請代行を利用する側の注意点',
    anchor: 'ビザ申請代行サービスを提供する企業は、サービスの設計段階から行政書士法のラインを意識した体制づくりを進めることが不可欠です。</p>',
    position: 'after',
    block: VISA_CHECKLIST,
  },
  {
    slug: 'agricultural-land-conversion-application-unlicensed-agent-1785411903877',
    marker: '農地転用の代理申請を行政書士に依頼する',
    anchor: 'コンサルタントとしてのノウハウを活かしながら行政書士法のラインを守るためには、業務設計の段階から法的整理を行うことが不可欠です。</p>',
    position: 'after',
    block: NOUCHI_DELEGATE,
  },
]

async function main() {
  console.log(APPLY ? '🚀 APPLY モード（DBを更新します）\n' : '🔍 DRY-RUN（--apply で実行）\n')

  const touchedSlugs = new Set<string>()

  for (const p of patches) {
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, slug, content')
      .eq('slug', p.slug)
      .single()

    if (error || !article) {
      console.error(`❌ 記事なし: ${p.slug} ${error?.message ?? ''}`)
      continue
    }

    let content: string = article.content

    if (content.includes(p.marker)) {
      console.log(`⏭️  挿入済みスキップ: ${p.slug} [${p.marker.slice(0, 20)}…]`)
      continue
    }

    const idx = content.indexOf(p.anchor)
    if (idx === -1) {
      console.error(`❌ anchor が見つかりません: ${p.slug}\n   "${p.anchor.slice(0, 60)}…"`)
      continue
    }
    if (content.indexOf(p.anchor, idx + 1) !== -1) {
      console.error(`❌ anchor が複数一致: ${p.slug} — 中止`)
      continue
    }

    if (p.position === 'before') {
      content = content.replace(p.anchor, p.block + p.anchor)
    } else {
      content = content.replace(p.anchor, p.anchor + p.block)
    }

    console.log(`\n✅ ${p.slug}`)
    console.log(`   +${p.block.length}字 (${p.position} "${p.anchor.slice(0, 30)}…")`)
    console.log(`   ── 挿入プレビュー ──\n${p.block.slice(0, 400)}${p.block.length > 400 ? ' …' : ''}\n`)

    if (APPLY) {
      const { error: upErr } = await supabase
        .from('articles')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', article.id)
      if (upErr) {
        console.error(`   ❌ 更新失敗: ${upErr.message}`)
        continue
      }
      console.log('   💾 更新完了')
      touchedSlugs.add(p.slug)
    }
  }

  if (APPLY) {
    for (const slug of touchedSlugs) {
      try {
        await notifyIndexing(`${SITE_BASE}/articles/${slug}`)
      } catch (err) {
        console.error(`⚠️  Indexing API通知失敗 (${slug}):`, (err as Error).message)
      }
    }
  }

  process.exit(0)
}

main()
