import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { InviteRedirect } from '@/components/InviteRedirect'
import { 
  GraduationCap, 
  Users, 
  Trophy, 
  Calendar,
  ArrowRight,
  CheckCircle,
  Star,
  Newspaper
} from 'lucide-react'

export const revalidate = 60

interface EventRow {
  title: string
  start_ts: string
  category: string
  location: string | null
}

interface NewsRow {
  id: string
  title: string
  slug: string | null
  summary: string | null
  published_at: string | null
}

interface GalleryRow {
  id: string
  title: string
  public_url: string
  category: string | null
}

const stats = [
  { id: 1, name: 'Years of Excellence', value: '30+', icon: Trophy },
  { id: 2, name: 'Students Enrolled', value: '1,500+', icon: Users },
  { id: 3, name: 'Qualified Teachers', value: '120+', icon: GraduationCap },
  { id: 4, name: 'Success Rate', value: '98%', icon: Star },
]

const schoolLevels = [
  {
    name: 'Nursery School',
    ages: '18 months – 5 years',
    description: 'A nurturing environment where young minds begin their educational journey through play-based learning and early childhood development.',
    features: ['Play-based learning', 'Early literacy & numeracy', 'Creative arts', 'Social skills development'],
    href: '/academics/nursery',
    color: 'bg-yellow-500',
  },
  {
    name: 'Primary School',
    ages: 'Ages 6-11',
    description: 'Building strong foundations in core subjects while fostering curiosity, creativity, and a love for learning.',
    features: ['Core subjects mastery', 'Science & technology', 'Physical education', 'Character development'],
    href: '/academics/primary',
    color: 'bg-secondary',
  },
  {
    name: 'High School',
    ages: 'Ages 10-17',
    description: 'Preparing students for higher education and future careers with comprehensive academic programs and life skills.',
    features: ['WAEC & NECO preparation', 'Secondary exams CBT', 'French natural value education', 'University prep'],
    href: '/academics/secondary',
    color: 'bg-primary',
  },
]

const whyChooseUs = [
  'Experienced and dedicated teaching staff',
  'Modern facilities and learning resources',
  'Small class sizes for personalized attention',
  'Strong focus on character development',
  'Comprehensive extracurricular activities',
  'Excellent academic track record',
]

const fallbackEvents: EventRow[] = [
  { title: 'Open Day for Prospective Parents', start_ts: '2025-06-15T09:00:00', category: 'Admissions', location: 'School Hall' },
  { title: 'Inter-House Sports Competition', start_ts: '2025-07-20T08:00:00', category: 'Sports', location: 'School Grounds' },
  { title: 'Cultural Day Celebration', start_ts: '2025-08-01T10:00:00', category: 'Cultural', location: 'School Grounds' },
]

const fallbackGallery = [
  { src: '/images/Cultural_Day_Celebration_dad79f7b.png', alt: 'Cultural Day Celebration' },
  { src: '/images/Sports_Day_Event_690fc0d2.png', alt: 'Sports Day Event' },
  { src: '/images/Graduation_Ceremony_965a6757.png', alt: 'Graduation Ceremony' },
  { src: '/images/Campus_Aerial_View_5504009d.png', alt: 'Campus Aerial View' },
  { src: '/images/Science_Lab_Activity_6e9e2453.png', alt: 'Science Lab Activity' },
  { src: '/images/Library_Study_Area_96a8f944.png', alt: 'Library Study Area' },
]

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: liveEvents }, { data: liveNews }, { data: galleryItems }] = await Promise.all([
    supabase
      .from('events')
      .select('title, start_ts, category, location')
      .gte('start_ts', new Date().toISOString())
      .order('start_ts', { ascending: true })
      .limit(3),
    supabase
      .from('news_posts')
      .select('id, title, slug, summary, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3),
    supabase
      .from('gallery_items')
      .select('id, title, public_url, category')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const events: EventRow[] = liveEvents && liveEvents.length > 0 ? (liveEvents as EventRow[]) : fallbackEvents
  const news: NewsRow[] = (liveNews ?? []) as NewsRow[]
  const gallery: GalleryRow[] = (galleryItems ?? []) as GalleryRow[]

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 z-10" />
        <Image
          src="/images/School_Building_Exterior_Hero_4c95b726.png"
          alt="Elyon Schools Campus"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/90 px-4 py-2 text-sm font-medium text-accent-foreground">
              <Star className="h-4 w-4" />
              Celebrating 30 Years of Excellence
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Nurturing Excellence from{' '}
              <span className="text-accent">Nursery to High School</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-200">
              At Elyon Schools, we provide quality education that develops the whole child 
              academically, morally, and socially. Join our community of learners and 
              discover your child&apos;s full potential.
            </p>
            <div className="mt-10 flex items-center gap-4 flex-wrap">
              <Link href="/admissions/apply">
                <Button size="lg" className="gap-2" data-testid="button-hero-apply">
                  Apply for Admission
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20" data-testid="button-hero-learn-more">
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.id} className="text-center hover-elevate">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary" data-testid={`text-stat-${stat.id}`}>{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Education for Every Stage
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From early childhood through high school, we provide age-appropriate 
              learning experiences that prepare students for success.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {schoolLevels.map((level) => (
              <Card key={level.name} className="relative overflow-hidden hover-elevate group">
                <div className={`absolute top-0 left-0 right-0 h-2 ${level.color}`} />
                <CardContent className="pt-8 pb-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground">{level.name}</h3>
                    <p className="text-sm text-primary font-medium">{level.ages}</p>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">{level.description}</p>
                  <ul className="space-y-2 mb-6">
                    {level.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={level.href}>
                    <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors" data-testid={`button-explore-${level.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      Explore Program
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
                Why Choose Elyon Schools?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                For over 30 years, Elyon Schools has been a beacon of educational excellence 
                in Nigeria. Our commitment to holistic development ensures that every child 
                receives the best foundation for their future.
              </p>
              <ul className="space-y-4 mb-8">
                {whyChooseUs.map((reason, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{reason}</span>
                  </li>
                ))}
              </ul>
              <Link href="/about">
                <Button variant="outline" className="gap-2" data-testid="button-about-us">
                  Learn More About Us
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                  <Image
                    src="/images/Classroom_Learning_Scene_15f24cb5.png"
                    alt="Classroom learning"
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src="/images/Science_Lab_Activity_6e9e2453.png"
                    alt="Science laboratory"
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="pt-8">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                  <Image
                    src="/images/Library_Study_Area_96a8f944.png"
                    alt="Library study area"
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Stay connected with our school community through events and activities.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {events.map((event, index) => (
              <Card key={index} className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-accent/20 text-accent-foreground rounded-full mb-2">
                        {event.category}
                      </span>
                      <h3 className="font-semibold text-foreground">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(event.start_ts).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      {event.location && (
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/events">
              <Button variant="outline" className="gap-2" data-testid="button-view-all-events">
                View All Events
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Latest News
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Stay informed with the latest updates and stories from Elyon Schools.
            </p>
          </div>

          {news.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {news.map((post) => (
                <Card key={post.id} className="hover-elevate flex flex-col">
                  <CardContent className="pt-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Newspaper className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
                          : 'School News'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 leading-snug">{post.title}</h3>
                    {post.summary && (
                      <p className="text-sm text-muted-foreground flex-1 line-clamp-3">{post.summary}</p>
                    )}
                    <Link href="/news" className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline" data-testid={`link-news-${post.id}`}>
                      Read More <ArrowRight className="h-3 w-3" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No news published yet</p>
              <p className="text-sm mt-1">Check back soon for updates from Elyon Schools.</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/news">
              <Button variant="outline" className="gap-2" data-testid="button-view-all-news">
                View All News
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              School Gallery
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A glimpse of life at Elyon Schools — our campus, activities, and memorable moments.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {gallery.length > 0 ? (
              gallery.map((item) => (
                <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden group" data-testid={`gallery-item-${item.id}`}>
                  <Image
                    src={item.public_url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end p-3">
                    <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">{item.title}</p>
                  </div>
                </div>
              ))
            ) : (
              fallbackGallery.map((img) => (
                <div key={img.alt} className="relative aspect-square rounded-lg overflow-hidden group">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <Link href="/gallery">
              <Button variant="outline" className="gap-2" data-testid="button-view-gallery">
                View Gallery
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Applications for the 2025/2026 academic session are now open. 
            Give your child the gift of quality education at Elyon Schools.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/admissions/apply">
              <Button size="lg" variant="secondary" className="gap-2" data-testid="button-cta-apply">
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-cta-contact">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    <InviteRedirect />
    </>
  )
}
