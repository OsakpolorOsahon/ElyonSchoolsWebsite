import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  GraduationCap, 
  BookOpen,
  Palette,
  Microscope,
  Music,
  Trophy,
  ArrowRight,
  CheckCircle,
  Baby,
  School,
  Library
} from 'lucide-react'

export const metadata = {
  title: 'Academics - Elyon Schools',
  description: 'Explore our comprehensive academic programs from Nursery through High School education at Elyon Schools.',
}

const programs = [
  {
    name: 'Nursery School',
    ages: '18 months – 5 years',
    description: 'Our nursery program provides a safe, nurturing environment where young children develop foundational skills through play-based learning.',
    href: '/academics/nursery',
    color: 'bg-yellow-500',
    features: [
      'Play-based learning approach',
      'Early literacy and numeracy skills',
      'Creative arts and music',
      'Social and emotional development',
      'Physical development activities',
      'Language development',
    ],
    classes: ['Toddlers (18 months – 2 years)', 'Nursery 1 (2-4 years)', 'Nursery 2 (4-5 years)'],
  },
  {
    name: 'Primary School',
    ages: 'Ages 6-11 years',
    description: 'Our primary program builds strong academic foundations while nurturing curiosity, creativity, and a love for learning.',
    href: '/academics/primary',
    color: 'bg-secondary',
    features: [
      'Core subjects: English, Mathematics, Science',
      'Social Studies and Civic Education',
      'Computer Studies and ICT',
      'French Language',
      'Physical and Health Education',
      'Cultural and Creative Arts',
    ],
    classes: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
  },
  {
    name: 'High School',
    ages: 'Ages 10-17 years',
    description: 'Our high school program prepares students for national examinations and future academic pursuits with comprehensive subject offerings.',
    href: '/academics/secondary',
    color: 'bg-primary',
    features: [
      'WAEC and NECO examination preparation',
      'Secondary exams CBT preparation',
      'French natural value education',
      'Science: Physics, Chemistry, Biology',
      'Commercial: Economics, Commerce, Accounting',
      'Career guidance and counseling',
    ],
    classes: ['JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'],
  },
]

const extracurriculars = [
  { name: 'Sports', description: 'Football, Basketball, Athletics, Table Tennis', icon: Trophy },
  { name: 'Music & Drama', description: 'School band, Choir, Drama club, Cultural dance', icon: Music },
  { name: 'Science Club', description: 'Experiments, Science fairs, STEM projects', icon: Microscope },
  { name: 'Literary & Debate', description: 'Debate society, Press club, Creative writing', icon: BookOpen },
  { name: 'Arts & Crafts', description: 'Painting, Drawing, Sculpture, Craft works', icon: Palette },
  { name: 'Leadership', description: 'Student council, Prefect system, Community service', icon: GraduationCap },
]

export default function AcademicsPage() {
  return (
    <div>
      <section className="relative py-20 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Academic Programs
            </h1>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              From nursery through high school, Elyon Schools offers comprehensive 
              academic programs designed to develop well-rounded individuals prepared for 
              success in higher education and life.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="space-y-16">
            {programs.map((program, index) => (
              <div key={program.name} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className={`inline-block px-4 py-1 rounded-full text-sm font-medium text-white mb-4 ${program.color}`}>
                    {program.ages}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
                    {program.name}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    {program.description}
                  </p>
                  
                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-3">Classes Offered:</h3>
                    <div className="flex flex-wrap gap-2">
                      {program.classes.map((cls) => (
                        <span key={cls} className="px-3 py-1 bg-muted rounded-full text-sm">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-3">Program Highlights:</h3>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {program.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={program.href}>
                    <Button className="gap-2" data-testid={`button-learn-more-${program.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className={`relative aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 flex items-center justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  {index === 0 && <Baby className="w-24 h-24 text-yellow-500/60" />}
                  {index === 1 && <School className="w-24 h-24 text-secondary/60" />}
                  {index === 2 && <GraduationCap className="w-24 h-24 text-primary/60" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Extracurricular Activities
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe in holistic development. Our extracurricular programs help students 
              discover and develop their talents beyond the classroom.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
            {extracurriculars.map((activity) => (
              <Card key={activity.name} className="hover-elevate">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <activity.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{activity.name}</h3>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Facilities
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              State-of-the-art facilities to support quality education and holistic development.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Well-equipped classrooms with modern learning aids',
              'Science laboratories (Physics, Chemistry, Biology)',
              'Computer laboratory with internet access',
              'Well-stocked library and reading room',
              'Sports facilities and playground',
              'Assembly hall and multipurpose area',
              'Art and music rooms',
              'Sick bay with qualified nurse',
              'School cafeteria',
            ].map((facility, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">{facility}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Ready to Enroll?
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Give your child the gift of quality education. Apply for admission today 
            and join our community of learners.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/admissions/apply">
              <Button size="lg" variant="secondary" className="gap-2" data-testid="button-academics-apply">
                Start Application
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-academics-contact">
                Contact Admissions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
