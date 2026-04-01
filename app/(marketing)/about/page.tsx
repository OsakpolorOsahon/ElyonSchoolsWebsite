import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  GraduationCap, 
  Users, 
  Trophy, 
  Target,
  Heart,
  BookOpen,
  ArrowRight,
  Award,
  Calendar,
  Building2,
  User
} from 'lucide-react'

export const metadata = {
  title: 'About Us - Elyon Schools',
  description: 'Learn about Elyon Schools history, mission, vision, and our commitment to excellence in education since 1994.',
}

const values = [
  {
    name: 'Excellence',
    description: 'We strive for the highest standards in everything we do, from academics to character development.',
    icon: Trophy,
  },
  {
    name: 'Integrity',
    description: 'We uphold honesty, transparency, and moral uprightness in all our dealings.',
    icon: Heart,
  },
  {
    name: 'Innovation',
    description: 'We embrace modern teaching methods and technology to enhance learning outcomes.',
    icon: Target,
  },
  {
    name: 'Community',
    description: 'We foster a sense of belonging and partnership among students, parents, and staff.',
    icon: Users,
  },
]

const milestones = [
  { year: '1994', title: 'School Founded', description: 'Elyon Schools was established with just 50 students and a vision for excellence.' },
  { year: '2000', title: 'Primary Section Added', description: 'Expanded to include primary education, growing our student body significantly.' },
  { year: '2005', title: 'High School Launched', description: 'Opened our high school section to provide a complete education journey.' },
  { year: '2010', title: 'New Campus Completed', description: 'Moved to our current modern campus with state-of-the-art facilities.' },
  { year: '2018', title: 'STEM Lab Inaugurated', description: 'Opened our advanced science and technology laboratory.' },
  { year: '2024', title: '30th Anniversary', description: 'Celebrating three decades of educational excellence and thousands of successful alumni.' },
]

const leadership = [
  {
    name: 'Dr. Emmanuel Okafor',
    role: 'Principal',
    bio: 'Dr. Okafor brings over 25 years of educational leadership experience, with a Ph.D. in Educational Administration.',
  },
]

export default function AboutPage() {
  return (
    <div>
      <section className="relative py-20 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/20 px-4 py-2 text-sm font-medium mb-6">
              <Calendar className="h-4 w-4" />
              Established 1994
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              About Elyon Schools
            </h1>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              For over 30 years, Elyon Schools has been committed to providing quality education 
              that nurtures the whole child - academically, socially, and morally. Our journey 
              from a small nursery school to a comprehensive educational institution is a 
              testament to our dedication to excellence.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 flex items-center justify-center">
              <Building2 className="w-24 h-24 text-primary/40" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Elyon Schools was founded in 1994 by a group of visionary educators who 
                  believed in providing quality education that goes beyond textbooks. Starting 
                  with just 50 students in a small building, we have grown into one of the 
                  most respected educational institutions in Nigeria.
                </p>
                <p>
                  Today, Elyon Schools serves over 1,500 students from nursery through 
                  high school. Our modern campus features well-equipped classrooms, 
                  science laboratories, a library, computer labs, sports facilities, and 
                  recreational areas that support holistic development.
                </p>
                <p>
                  Our alumni have gone on to become doctors, engineers, lawyers, entrepreneurs, 
                  and leaders in various fields, carrying with them the values instilled during 
                  their time at Elyon Schools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Our Mission</h3>
                </div>
                <p className="text-muted-foreground">
                  To provide quality education that develops the intellectual, moral, social, 
                  and physical potential of every child, preparing them to become responsible 
                  citizens and leaders who will contribute positively to society.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-secondary">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                    <BookOpen className="h-5 w-5 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Our Vision</h3>
                </div>
                <p className="text-muted-foreground">
                  To be the leading educational institution in Nigeria, recognized for academic 
                  excellence, character development, and producing graduates who are innovative, 
                  ethical, and globally competitive.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Our Motto</h3>
                </div>
                <p className="text-muted-foreground italic text-lg font-medium">
                  &ldquo;Hardwork and Determination&rdquo;
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  The guiding principle that inspires every student, teacher, and staff member 
                  to give their best every day.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Core Values
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              These values guide everything we do at Elyon Schools and shape the character 
              of our students.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {values.map((value) => (
              <Card key={value.name} className="text-center hover-elevate">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.name}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Journey
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Key milestones in our 30-year history of educational excellence.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border hidden md:block" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="flex-1 md:pr-8 md:text-right hidden md:block">
                    {index % 2 === 0 && (
                      <Card className="inline-block">
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold text-primary mb-2">{milestone.year}</div>
                          <h3 className="font-semibold text-foreground mb-1">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex">
                    <div className="h-4 w-4 rounded-full bg-primary border-4 border-background" />
                  </div>
                  <div className="flex-1 md:pl-8">
                    {(index % 2 !== 0 || true) && (
                      <Card className={`${index % 2 === 0 ? 'md:hidden' : ''}`}>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold text-primary mb-2">{milestone.year}</div>
                          <h3 className="font-semibold text-foreground mb-1">{milestone.title}</h3>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              School Leadership
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the dedicated leaders who guide our school community.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {leadership.map((leader) => (
              <Card key={leader.name} className="overflow-hidden">
                <div className="relative aspect-square bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 flex items-center justify-center">
                  <User className="w-24 h-24 text-primary/40" />
                </div>
                <CardContent className="pt-6 text-center">
                  <h3 className="text-xl font-bold text-foreground">{leader.name}</h3>
                  <p className="text-primary font-medium mb-4">{leader.role}</p>
                  <p className="text-sm text-muted-foreground">{leader.bio}</p>
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
              <h2 className="text-3xl font-bold tracking-tight text-foreground mb-6">
                Our Achievements
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">98% WAEC Pass Rate</h3>
                    <p className="text-sm text-muted-foreground">Consistently high performance in national examinations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Multiple State Championships</h3>
                    <p className="text-sm text-muted-foreground">Winners in debates, quiz competitions, and sports events.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">5,000+ Successful Alumni</h3>
                    <p className="text-sm text-muted-foreground">Graduates excelling in universities and careers worldwide.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 flex items-center justify-center">
              <GraduationCap className="w-24 h-24 text-primary/40" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Join Our School Community
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Discover how Elyon Schools can provide your child with the education 
            and values they need to succeed in life.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/admissions/apply">
              <Button size="lg" variant="secondary" className="gap-2" data-testid="button-about-apply">
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-about-contact">
                Schedule a Visit
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
