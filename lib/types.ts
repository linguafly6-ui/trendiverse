export interface Article {
  id: number
  title: string
  slug: string
  category: string
  content: string | null
  excerpt: string | null
  image_url: string | null
  thumbnail_url: string | null
  read_time_minutes: number | null
  views: number
  trending: number | boolean
  published_at: string
}

export interface Deal {
  id: number
  product_name: string
  original_price: number
  discount_price: number
  discount_percent: number
  image_url: string | null
  affiliate_url: string
  expires_at: string | null
  category_id: number | null
}

export interface Tool {
  id: number
  title: string
  slug: string
  description: string | null
  type: string
  config: string | null
}
