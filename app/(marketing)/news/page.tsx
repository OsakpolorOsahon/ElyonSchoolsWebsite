'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Newspaper, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight,
  ChevronRight,
  Bell
} from 'lucide-react'

const newsArticles = [
  {
    id: 1,
    title: 'Elyon Schools Celebrates 30 Years of Excellence',
    summary: 'Join us as we commemorate three decades of nurturing young minds and producing outstanding graduates who are making impacts across Nigeria and beyond.',
    date: '2024-11-15',
    category: 'Announcement',
    featured: true,
  },
  {
    id: 2,
    title: 'Outstanding WAEC Results for Class of 2024',
    summary: 'Our SSS 3 students have achieved a 98% pass rate in the 2024 WAEC examinations, with 45 students scoring distinctions in all subjects.',
    date: '2024-10-28',
    category: 'Academic',
    featured: true,
  },
  {
    id: 3,
    title: 'New Computer Laboratory Commissioned',
    summary: 'We are pleased to announce the opening of our state-of-the-art computer laboratory equipped with 50 modern computers and high-speed internet.',
    date: '2024-10-15',
    category: 'Facilities',
    featured: false,
  },
  {
    id: 4,
    title: 'Inter-House Sports Competition Results',
    summary: 'Blue House emerged victorious in this year\'s inter-house sports competition, winning gold in athletics, football, and volleyball.',
    date: '2024-10-05',
    category: 'Sports',
    featured: false,
  },
  {
    id: 5,
    title: 'Admission Open for 2025 Academic Session',
    summary: 'We are now accepting applications for the 2025/2026 academic session. Early registration discounts available until December 31st.',
    date: '2024-09-20',
    category: 'Announcement',
    featured: true,
  },
  {
    id: 6,
    title: 'Students Win Science Competition',
    summary: 'Our secondary school students clinched first place at the State Science Fair with their innovative solar-powered water purification project.',
    date: '2024-09-10',
    category: 'Academic',
    featured: false,
  },
]

const upcomingEvents = [
  {
    id: 1,
    title: 'Parent-Teacher Meeting',
    date: '2024-12-15',
    time: '9:00 AM - 2:00 PM',
    location: 'School Hall',
    description: 'Term review and discussion of student progress',
    category: 'Academic',
  },
  {
    id: 2,
    title: 'Christmas Carol Service',
    date: '2024-12-20',
    time: '10:00 AM - 12:00 PM',
    location: 'School Chapel',
    description: 'Annual Christmas celebration with carols and performances',
    category: 'Cultural',
  },
  {
    id: 3,
    title: 'Second Term Begins',
    date: '2025-01-08',
    time: '8:00 AM',
    location: 'All Campuses',
    description: 'Resumption for the second term of 2024/2025 session',
    category: 'Academic',
  },
  {
    id: 4,
    title: 'Spelling Bee Competition',
    date: '2025-01-25',
    time: '11:00 AM - 2:00 PM',
    location: 'Primary School Hall',
    description: 'Annual inter-class spelling competition for primary students',
    category: 'Academic',
  },
  {
    id: 5,
    title: 'Career Day',
    date: '2025-02-14',
    time: '9:00 AM - 3:00 PM',
    location: 'Secondary School Block',
    description: 'Professionals share insights about various career paths',
    category: 'Other',
  },
  {
    id: 6,
    title: 'Cultural Day Celebration',
    date: '2025-03-01',
    time: '10:00 AM - 4:00 PM',
    location: 'School Grounds',
    description: 'Celebration of Nigerian cultural heritage with traditional attires and food',
    category: 'Cultural',
  },
]

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-NG', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
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

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState('news')
  const featuredNews = newsArticles.filter(article => article.featured)
  const regularNews = newsArticles.filter(article => !article.featured)

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
          <Tabs defaultValue="news" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="news" className="gap-2" data-testid="tab-news">
                <Newspaper className="h-4 w-4" />
                Latest News
              </TabsTrigger>
              <TabsTrigger value="events" className="gap-2" data-testid="tab-events">
                <Calendar className="h-4 w-4" />
                Upcoming Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="news">
              {featuredNews.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Featured Stories</h2>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {featuredNews.slice(0, 2).map((article) => (
                      <Card key={article.id} className="hover-elevate" data-testid={`news-featured-${article.id}`}>
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg" />
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getCategoryColor(article.category)}>
                              {article.category}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{formatDate(article.date)}</span>
                          </div>
                          <CardTitle className="text-xl">{article.title}</CardTitle>
                          <CardDescription>{article.summary}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button variant="link" className="p-0 h-auto gap-1" data-testid={`button-read-more-${article.id}`}>
                            Read More <ChevronRight className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Recent News</h2>
                <div className="grid gap-4">
                  {[...featuredNews.slice(2), ...regularNews].map((article) => (
                    <Card key={article.id} className="hover-elevate" data-testid={`news-item-${article.id}`}>
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          <div className="hidden sm:block w-24 h-24 rounded-lg bg-gradient-to-br from-muted to-muted/50 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge className={getCategoryColor(article.category)}>
                                {article.category}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{formatDate(article.date)}</span>
                            </div>
                            <h3 className="font-semibold text-foreground">{article.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="events">
              <div className="grid gap-6 lg:grid-cols-2">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="hover-elevate" data-testid={`event-item-${event.id}`}>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                      </div>
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription>{event.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-12 text-center">
                <Card className="inline-block bg-muted/50">
                  <CardContent className="py-6 px-8">
                    <Calendar className="h-10 w-10 mx-auto text-primary" />
                    <h3 className="mt-4 font-semibold text-foreground">School Calendar</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                      Download the complete school calendar for the 2024/2025 academic session.
                    </p>
                    <Button className="mt-4 gap-2" data-testid="button-download-calendar">
                      Download Calendar
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Stay Connected</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
            Don&apos;t miss any important updates from Elyon Schools. 
            Follow us on social media or subscribe to our newsletter.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="gap-2" data-testid="button-subscribe">
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
