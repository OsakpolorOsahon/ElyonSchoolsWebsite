import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react'

export const revalidate = 60

export const metadata = {
  title: 'Events - Elyon Schools',
  description: 'Stay up to date with upcoming events, activities, and important dates at Elyon Schools.',
}

interface SchoolEvent {
  id: string
  title: string
  description: string | null
  start_ts: string
  end_ts: string | null
  location: string | null
  category: string | null
}

const categoryColors: Record<string, string> = {
  Academic: 'bg-blue-100 text-blue-700',
  Sports: 'bg-green-100 text-green-700',
  Cultural: 'bg-purple-100 text-purple-700',
  Other: 'bg-gray-100 text-gray-700',
}

export default async function EventsPage() {
  const supabase = await createClient()

  const now = new Date().toISOString()

  const [upcomingRes, pastRes] = await Promise.all([
    supabase
      .from('events')
      .select('id, title, description, start_ts, end_ts, location, category')
      .gte('start_ts', now)
      .order('start_ts', { ascending: true }),
    supabase
      .from('events')
      .select('id, title, description, start_ts, end_ts, location, category')
      .lt('start_ts', now)
      .order('start_ts', { ascending: false })
      .limit(10),
  ])

  const upcomingEvents: SchoolEvent[] = upcomingRes.data || []
  const pastEvents: SchoolEvent[] = pastRes.data || []

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleDateString('en-NG', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })

  const formatTime = (ts: string) =>
    new Date(ts).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <section className="bg-primary text-primary-foreground py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-primary-foreground/80" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Events Calendar</h1>
          <p className="mt-4 text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Stay connected with our school community. Find upcoming events, activities, and important dates.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Upcoming Events
          </h2>

          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No upcoming events scheduled at this time.</p>
                <p className="text-sm mt-2">Check back soon for new events.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map(event => {
                const typeColor = event.category
                  ? (categoryColors[event.category] || 'bg-gray-100 text-gray-700')
                  : 'bg-gray-100 text-gray-700'
                return (
                  <Card key={event.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                    <CardContent className="pt-5 pb-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="shrink-0 w-14 text-center bg-primary/5 rounded-lg p-2">
                            <p className="text-xs text-muted-foreground uppercase">
                              {new Date(event.start_ts).toLocaleDateString('en-NG', { month: 'short' })}
                            </p>
                            <p className="text-2xl font-bold text-primary leading-tight">
                              {new Date(event.start_ts).getDate()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.start_ts).getFullYear()}
                            </p>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold text-lg text-foreground">{event.title}</h3>
                              {event.category && (
                                <Badge className={`text-xs ${typeColor}`}>
                                  {event.category}
                                </Badge>
                              )}
                            </div>
                            {event.description && (
                              <p className="text-muted-foreground text-sm mb-2">{event.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(event.start_ts)} at {formatTime(event.start_ts)}
                                {event.end_ts && ` — ${formatTime(event.end_ts)}`}
                              </span>
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-6 w-6" />
              Past Events
            </h2>
            <div className="space-y-3">
              {pastEvents.map(event => (
                <Card key={event.id} className="opacity-70">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(event.start_ts)}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-gray-100 text-gray-600 shrink-0">Past</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 text-center">
          <Link href="/news">
            <Button variant="outline" className="gap-2">
              View News &amp; Updates <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    </>
  )
}
