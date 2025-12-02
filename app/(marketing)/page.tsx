import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  GraduationCap, 
  Users, 
  Trophy, 
  BookOpen,
  Calendar,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react'
import heroImage from '@assets/generated_images/School_Building_Exterior_Hero_4c95b726.png'
import classroomImage from '@assets/generated_images/Classroom_Learning_Scene_15f24cb5.png'
import labImage from '@assets/generated_images/Science_Lab_Activity_6e9e2453.png'
import libraryImage from '@assets/generated_images/Library_Study_Area_96a8f944.png'

const stats = [
  { id: 1, name: 'Years of Excellence', value: '30+', icon: Trophy },
  { id: 2, name: 'Students Enrolled', value: '1,500+', icon: Users },
  { id: 3, name: 'Qualified Teachers', value: '120+', icon: GraduationCap },
  { id: 4, name: 'Success Rate', value: '98%', icon: Star },
]

const schoolLevels = [
  {
    name: 'Nursery School',
    ages: 'Ages 2-5',
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
    name: 'Secondary School',
    ages: 'Ages 12-17',
    description: 'Preparing students for higher education and future careers with comprehensive academic programs and life skills.',
    features: ['WAEC & NECO preparation', 'Career guidance', 'Leadership programs', 'University prep'],
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

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 z-10" />
        <Image
          src={heroImage}
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
              <span className="text-accent">Nursery to Secondary</span>
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
              From early childhood through secondary education, we provide age-appropriate 
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
                    src={classroomImage}
                    alt="Classroom learning"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={labImage}
                    alt="Science laboratory"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="pt-8">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                  <Image
                    src={libraryImage}
                    alt="Library study area"
                    fill
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
            {[
              {
                title: 'Open Day for Prospective Parents',
                date: 'December 15, 2024',
                time: '9:00 AM - 2:00 PM',
                type: 'Admissions',
              },
              {
                title: 'Inter-House Sports Competition',
                date: 'January 20, 2025',
                time: '8:00 AM - 4:00 PM',
                type: 'Sports',
              },
              {
                title: 'Cultural Day Celebration',
                date: 'February 10, 2025',
                time: '10:00 AM - 3:00 PM',
                type: 'Cultural',
              },
            ].map((event, index) => (
              <Card key={index} className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-accent/20 text-accent-foreground rounded-full mb-2">
                        {event.type}
                      </span>
                      <h3 className="font-semibold text-foreground">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{event.date}</p>
                      <p className="text-sm text-muted-foreground">{event.time}</p>
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
                Start Application
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
    </div>
  )
}
