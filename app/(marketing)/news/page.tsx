import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { 
  Newspaper, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight,
  ChevronRight,
  Bell
} from 'lucide-react'

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

interface Event {
  id: string
  title: string
  description: string | null
  start_ts: string
  end_ts: string
  location: string | null
  category: string
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-NG', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    'Announcement': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    'Academic': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    'Sports': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    'Facilities': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    'Cultural': 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    'Other': 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  }
  return colors[category] || colors['Other']
}

const fallbackNews = [
  {
    id: 'fallback-1',
    title: 'Elyon Schools Celebrates 30 Years of Excellence',
    summary: 'Join us as we commemorate three decades of nurturing young minds and producing outstanding graduates who are making impacts across Nigeria and beyond.',
    published_at: '2024-11-15',
    slug: '',
    featured: true,
    category: 'Announcement',
  },
  {
    id: 'fallback-2',
    title: 'Outstanding WAEC Results for Class of 2024',
    summary: 'Our SSS 3 students have achieved a 98% pass rate in the 2024 WAEC examinations.',
    published_at: '2024-10-28',
    slug: '',
    featured: true,
    category: 'Academic',
  },
  {
    id: 'fallback-3',
    title: 'Admission Open for 2025 Academic Session',
    summary: 'Applications for the 2025/2026 academic session are now open. Early registration discounts available.',
    published_at: '2024-09-20',
    slug: '',
    featured: false,
    category: 'Announcement',
  },
]

const fallbackEvents = [
  { id: 'e1', title: 'Parent-Teacher Meeting', start_ts: '2025-06-15T09:00:00', location: 'School Hall', category: 'Academic', description: 'Term review and discussion of student progress' },
  { id: 'e2', title: 'Inter-House Sports Competition', start_ts: '2025-07-20T08:00:00', location: 'School Grounds', category: 'Sports', description: 'Annual inter-house athletics competition' },
  { id: 'e3', title: 'Cultural Day Celebration', start_ts: '2025-08-01T10:00:00', location: 'School Grounds', category: 'Cultural', description: 'Celebration of Nigerian cultural heritage' },
]

export default async function NewsPage() {
  const supabase = await createClient()

  const [newsResult, eventsResult] = await Promise.all([
    supabase
      .from('news_posts')
      .select('id, title, summary, slug, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20),
    supabase
      .from('events')
      .select('id, title, description, start_ts, end_ts, location, category')
      .gte('start_ts', new Date().toISOString())
      .order('start_ts', { ascending: true })
      .limit(10),
  ])

  const liveNews = newsResult.data
  const liveEvents = eventsResult.data

  const useNewsData = liveNews && liveNews.length > 0
  const useEventsData = liveEvents && liveEvents.length > 0

  const featuredNews = useNewsData
    ? liveNews.slice(0, 2)
    : fallbackNews.filter(n => n.featured).slice(0, 2)

  const regularNews = useNewsData
    ? liveNews.slice(2)
    : fallbackNews.filter(n => !n.featured)

  const displayedEvents = useEventsData ? liveEvents : fallbackEvents

  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-violet-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-100">
              <Bell className="mr-1 h-3 w-3" />
              Stay Updated
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              News & Events
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Stay informed about the latest happenings at Elyon Schools. 
              From academic achievements to upcoming events, find it all here.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" />
              Latest News
            </h2>

            {featuredNews.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-semibold text-muted-foreground mb-4">Featured Stories</h3>
                <div className="grid gap-6 lg:grid-cols-2">
                  {featuredNews.map((article: any) => (
                    <Card key={article.id} className="hover-elevate">
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg" />
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(article.published_at || article.created_at)}
                          </span>
                        </div>
                        <CardTitle className="text-xl">{article.title}</CardTitle>
                        {article.summary && <CardDescription>{article.summary}</CardDescription>}
                      </CardHeader>
                      <CardContent>
                        {article.slug ? (
                          <Link href={`/news/${article.slug}`}>
                            <Button variant="ghost" className="p-0 h-auto gap-1 text-primary hover:text-primary/80">
                              Read More <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="ghost" className="p-0 h-auto gap-1 text-primary hover:text-primary/80">
                            Read More <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {regularNews.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-4">Recent News</h3>
                <div className="grid gap-4">
                  {regularNews.map((article: any) => (
                    <Card key={article.id} className="hover-elevate">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          <div className="hidden sm:block w-24 h-24 rounded-lg bg-gradient-to-br from-muted to-muted/50 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-sm text-muted-foreground">
                                {formatDate(article.published_at || article.created_at)}
                              </span>
                            </div>
                            <h3 className="font-semibold text-foreground">{article.title}</h3>
                            {article.summary && (
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {!useNewsData && featuredNews.length === 0 && (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No news articles published yet. Check back soon!</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Upcoming Events
            </h2>

            <div className="grid gap-6 lg:grid-cols-2">
              {displayedEvents.map((event: any) => (
                <Card key={event.id} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category}
                      </Badge>
                    </div>
                    <CardTitle>{event.title}</CardTitle>
                    {event.description && <CardDescription>{event.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{formatDate(event.start_ts)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{formatTime(event.start_ts)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {displayedEvents.length === 0 && (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No upcoming events at the moment. Check back soon!</p>
                </CardContent>
              </Card>
            )}

            <div className="mt-12 text-center">
              <Card className="inline-block bg-muted/50">
                <CardContent className="py-6 px-8">
                  <Calendar className="h-10 w-10 mx-auto text-primary" />
                  <h3 className="mt-4 font-semibold text-foreground">School Calendar</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    Download the complete school calendar for the 2024/2025 academic session.
                  </p>
                  <Button className="mt-4 gap-2">
                    Download Calendar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Stay Connected</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
            Don&apos;t miss any important updates from Elyon Schools. 
            Follow us on social media or contact us directly.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="gap-2">
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
