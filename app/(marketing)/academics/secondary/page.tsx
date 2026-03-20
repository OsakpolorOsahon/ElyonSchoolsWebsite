import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  GraduationCap, 
  BookOpen, 
  FlaskConical, 
  Calculator,
  Globe,
  Briefcase,
  Palette,
  Languages,
  CheckCircle,
  ArrowRight,
  Users,
  Award,
  Target,
  TrendingUp
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'High School - Elyon Schools',
  description: 'Elyon High School offers quality education from JSS 1 to SSS 3, preparing students for WAEC, NECO, CBT exams, and university admission.',
}

const jssSubjects = [
  'English Language',
  'Mathematics',
  'Basic Science',
  'Basic Technology',
  'Social Studies',
  'Civic Education',
  'Christian Religious Studies',
  'Nigerian Languages',
  'French',
  'Computer Studies',
  'Physical & Health Education',
  'Creative Arts',
  'Home Economics',
  'Agricultural Science',
]

const scienceSubjects = [
  'English Language',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Further Mathematics',
  'Computer Science',
  'Agricultural Science',
]

const commercialSubjects = [
  'English Language',
  'Mathematics',
  'Economics',
  'Commerce',
  'Accounting',
  'Government',
  'Computer Science',
  'Business Studies',
]

const artsSubjects = [
  'English Language',
  'Mathematics',
  'Literature in English',
  'Government',
  'Economics',
  'Christian Religious Studies',
  'History',
  'French',
]

const classLevels = [
  { name: 'JSS 1', description: 'Introduction to secondary education', ages: '10-11 years' },
  { name: 'JSS 2', description: 'Building foundational knowledge', ages: '11-12 years' },
  { name: 'JSS 3', description: 'Junior WAEC/BECE preparation', ages: '12-13 years' },
  { name: 'SSS 1', description: 'Subject specialization begins', ages: '13-14 years' },
  { name: 'SSS 2', description: 'In-depth subject mastery', ages: '14-15 years' },
  { name: 'SSS 3', description: 'WAEC/NECO/JAMB preparation', ages: '15-16 years' },
]

const achievements = [
  { value: '98%', label: 'WAEC Pass Rate' },
  { value: '500+', label: 'University Admissions' },
  { value: '50+', label: 'Awards Won' },
  { value: '30+', label: 'Years of Excellence' },
]

const features = [
  'Qualified graduate teachers',
  'Modern science laboratories',
  'Computer laboratory',
  'Well-stocked library',
  'Sports facilities',
  'Career counseling',
  'JAMB preparation classes',
  'Extracurricular activities',
  'French natural value education',
  'Secondary exams CBT preparation',
]

export default function SecondaryPage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-100">
              <GraduationCap className="mr-1 h-3 w-3" />
              JSS 1 - SSS 3
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              High School
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Shaping future leaders through academic excellence and character development. 
              Our high school program prepares students for success in national examinations 
              and higher education.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admissions/apply">
                <Button size="lg" className="gap-2" data-testid="button-apply-secondary">
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

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((stat) => (
              <Card key={stat.label} className="text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Class Levels</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Six years of comprehensive secondary education
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classLevels.map((level) => (
              <Card key={level.name} className="hover-elevate" data-testid={`card-level-${level.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{level.name}</CardTitle>
                    <Badge variant="secondary">{level.ages}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Curriculum & Subjects</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Comprehensive subject offerings for JSS and SSS levels
            </p>
          </div>
          
          <Tabs defaultValue="jss" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
              <TabsTrigger value="jss" data-testid="tab-jss">Junior Secondary</TabsTrigger>
              <TabsTrigger value="science" data-testid="tab-science">Science</TabsTrigger>
              <TabsTrigger value="commercial" data-testid="tab-commercial">Commercial</TabsTrigger>
              <TabsTrigger value="arts" data-testid="tab-arts">Arts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="jss">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Junior High School (JSS 1-3)
                  </CardTitle>
                  <CardDescription>
                    A broad curriculum covering all foundational subjects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {jssSubjects.map((subject) => (
                      <div key={subject} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm">{subject}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="science">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-primary" />
                    Science Department (SSS 1-3)
                  </CardTitle>
                  <CardDescription>
                    For students pursuing careers in medicine, engineering, and sciences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {scienceSubjects.map((subject) => (
                      <div key={subject} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm">{subject}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="commercial">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Commercial Department (SSS 1-3)
                  </CardTitle>
                  <CardDescription>
                    For students pursuing careers in business, finance, and administration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {commercialSubjects.map((subject) => (
                      <div key={subject} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm">{subject}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="arts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Arts Department (SSS 1-3)
                  </CardTitle>
                  <CardDescription>
                    For students pursuing careers in law, humanities, and social sciences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {artsSubjects.map((subject) => (
                      <div key={subject} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm">{subject}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Why Choose Elyon High School?</h2>
              <p className="mt-4 text-muted-foreground">
                At Elyon High School, we combine rigorous academics with character 
                formation to produce graduates who excel in national examinations and 
                are prepared for university education.
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
              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <Target className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 font-semibold text-foreground">Exam Focus</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Dedicated preparation for WAEC, NECO, and JAMB examinations
                  </p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <Award className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 font-semibold text-foreground">Excellence</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Consistent outstanding performance in external examinations
                  </p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <Users className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 font-semibold text-foreground">Mentorship</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Career guidance and university admission counseling
                  </p>
                </CardContent>
              </Card>
              <Card className="hover-elevate">
                <CardContent className="pt-6">
                  <TrendingUp className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 font-semibold text-foreground">Growth</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Clubs, societies, and leadership opportunities
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Begin Your Journey to Success</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
            Join Elyon High School and get the quality education you need 
            to achieve your academic and career goals.
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
