export type Article = {
  id: string
  title: string
  slug: string
  content: string
  summary: string | null
  seo_title: string | null
  seo_description: string | null
  tags: string[] | null
  tweet_text: string | null
  tweet_posted_at: string | null
  tweet_id: string | null
  source_ids: string[] | null
  status: 'draft' | 'published'
  og_image_url: string | null
  faq: { question: string; answer: string }[] | null
  created_at: string
  updated_at: string
}

export type Source = {
  id: string
  name: string
  url: string
  tier: number
  scrape_method: 'playwright' | 'cheerio'
  frequency: 'daily' | 'weekly'
  selector: string | null
  is_active: boolean
  last_scraped_at: string | null
  created_at: string
}

export type Analytics = {
  id: string
  article_id: string
  date: string
  page_views: number
  clicks: number
  affiliate_clicks: number
  created_at: string
}

export type Affiliate = {
  id: string
  service_name: string
  description: string | null
  categories: string[] | null
  a8_link: string
  banner_url: string | null
  is_active: boolean
  created_at: string
}

export type TopicConfig = {
  id: string
  topic: string
  priority: number
  performance_score: number
  last_updated_at: string
}
