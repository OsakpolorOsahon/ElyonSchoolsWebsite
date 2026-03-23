import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Calendar, Newspaper } from 'lucide-react'

export const revalidate = 60

interface NewsPost {
  id: string
  title: string
  summary: string | null
  body: string
  slug: string
  status: string
  published_at: string | null
  created_at: string
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('news_posts')
    .select('id, title, summary, body, slug, status, published_at, created_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) notFound()

  const post = article as NewsPost
  const publishedDate = post.published_at || post.created_at

  return (
    <div className="min-h-screen">
      <section className="relative py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-violet-950/20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link href="/news">
            <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-foreground -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back to News
            </Button>
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-100">
              <Newspaper className="mr-1 h-3 w-3" />
              News
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(publishedDate)}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>
          {post.summary && (
            <p className="mt-4 text-lg text-muted-foreground">{post.summary}</p>
          )}
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl mb-10" />

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {post.body.split('\n').map((paragraph, i) =>
              paragraph.trim() ? (
                <p key={i} className="mb-4 text-foreground leading-relaxed">
                  {paragraph}
                </p>
              ) : (
                <div key={i} className="mb-4" />
              )
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <Link href="/news">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to News
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
