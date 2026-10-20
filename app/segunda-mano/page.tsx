import { redirect } from 'next/navigation'

export const runtime = 'edge'

export default function SegundaManoRetiredPage(): never {
  redirect('/articles/category/toptrends')
}
