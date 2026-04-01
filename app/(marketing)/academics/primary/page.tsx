import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Calculator, 
  Globe, 
  Microscope, 
  Palette, 
  Dumbbell,
  Languages,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  Users,
  Clock,
  Award
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Primary School - Elyon Schools',
  description: 'Elyon Primary School offers quality education for children in Primary 1-6, building strong foundations in academics, character, and life skills.',
}

const classes = [
  { name: 'Primary 1', ages: '5-6 years', focus: 'Foundation literacy and numeracy' },
  { name: 'Primary 2', ages: '6-7 years', focus: 'Reading fluency and basic operations' },
  { name: 'Primary 3', ages: '7-8 years', focus: 'Independent learning skills' },
  { name: 'Primary 4', ages: '8-9 years', focus: 'Critical thinking development' },
  { name: 'Primary 5', ages: '9-10 years', focus: 'Advanced concepts preparation' },
  { name: 'Primary 6', ages: '10-11 years', focus: 'Common Entrance preparation' },
]

const subjects = [
  { icon: BookOpen, name: 'English Language', description: 'Reading, writing, grammar, and comprehension' },
  { icon: Calculator, name: 'Mathematics', description: 'Arithmetic, geometry, and problem-solving' },
  { icon: Microscope, name: 'Basic Science', description: 'Introduction to scientific concepts and methods' },
  { icon: Globe, name: 'Social Studies', description: 'Nigerian history, geography, and civic education' },
  { icon: Languages, name: 'Nigerian Languages', description: 'Yoruba, Igbo, or Hausa language studies' },
  { icon: Palette, name: 'Creative Arts', description: 'Visual arts, crafts, and creative expression' },
  { icon: Dumbbell, name: 'Physical Education', description: 'Sports, fitness, and healthy living' },
]

const highlights = [
  {
    icon: Award,
    title: 'Academic Excellence',
    description: 'Our students consistently perform well in Common Entrance examinations',
  },
  {
    icon: Users,
    title: 'Qualified Teachers',
    description: 'Experienced educators passionate about child development',
  },
  {
    icon: BookOpen,
    title: 'Modern Curriculum',
    description: 'Following Nigerian Educational Research and Development Council guidelines',
  },
  {
    icon: GraduationCap,
    title: 'Holistic Development',
    description: 'Focus on academics, character, and extracurricular activities',
  },
]

const features = [
  'Well-equipped classrooms',
  'Computer laboratory',
  'Science corner',
  'Library with diverse books',
  'Sports facilities',
  'Regular assessments',
  'Parent-teacher meetings',
  'After-school programs',
]

export default function PrimaryPage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-100">
              <BookOpen className="mr-1 h-3 w-3" />
              Primary 1 - Primary 6
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Primary School
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Building strong foundations for lifelong learning. Our primary program 
              develops well-rounded students prepared for high school and beyond.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admissions/apply">
                <Button size="lg" className="gap-2" data-testid="button-apply-primary">
                  Apply for Admission
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" data-testid="button-schedule-visit">
                  Schedule a Visit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Class Levels</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Six years of progressive learning building towards academic excellence
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <Card key={cls.name} className="hover-elevate" data-testid={`card-class-${cls.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                    <Badge variant="secondary">{cls.ages}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{cls.focus}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Subjects</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              A comprehensive curriculum aligned with national standards
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((subject) => (
              <Card key={subject.name} data-testid={`card-subject-${subject.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="pt-6 text-center">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-primary/10">
                    <subject.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{subject.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{subject.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {highlights.map((highlight) => (
              <Card key={highlight.title} className="hover-elevate" data-testid={`card-highlight-${highlight.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <highlight.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{highlight.title}</h3>
                      <p className="mt-2 text-muted-foreground">{highlight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground">School Facilities</h2>
              <p className="mt-4 text-muted-foreground">
                Our primary school is equipped with modern facilities to support 
                effective teaching and learning. We create an environment where 
                children can explore, discover, and excel.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Clock className="h-10 w-10 mx-auto text-primary" />
                  <h3 className="mt-4 font-semibold text-foreground">School Hours</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Monday - Friday<br />
                    7:30 AM - 2:30 PM
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Users className="h-10 w-10 mx-auto text-primary" />
                  <h3 className="mt-4 font-semibold text-foreground">Class Size</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Maximum 25 students<br />
                    per class
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center sm:col-span-2">
                <CardContent className="pt-6">
                  <GraduationCap className="h-10 w-10 mx-auto text-primary" />
                  <h3 className="mt-4 font-semibold text-foreground">Common Entrance Success</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    95% of our Primary 6 students pass Common Entrance exams
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Enroll Your Child Today</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
            Give your child the strong academic foundation they need to succeed. 
            Admissions are open for all primary levels.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admissions/apply">
              <Button size="lg" variant="secondary" className="gap-2" data-testid="button-apply-now-cta">
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-contact-us">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
