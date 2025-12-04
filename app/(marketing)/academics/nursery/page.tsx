import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Baby, 
  Palette, 
  Music, 
  Users, 
  Clock, 
  BookOpen, 
  Heart, 
  Sparkles,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Nursery School - Elyon Schools',
  description: 'Elyon Nursery School provides a nurturing environment for children ages 2-5 to explore, learn, and grow through play-based education.',
}

const ageGroups = [
  {
    name: 'Creche',
    ages: '6 months - 2 years',
    description: 'Loving care in a safe, stimulating environment',
    color: 'bg-pink-100 dark:bg-pink-900/30',
  },
  {
    name: 'Toddlers',
    ages: '2 - 3 years',
    description: 'Developing motor skills and social awareness',
    color: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    name: 'Pre-Nursery',
    ages: '3 - 4 years',
    description: 'Introduction to structured learning activities',
    color: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    name: 'Nursery',
    ages: '4 - 5 years',
    description: 'Preparing for primary school transition',
    color: 'bg-green-100 dark:bg-green-900/30',
  },
]

const learningAreas = [
  {
    icon: BookOpen,
    title: 'Early Literacy',
    description: 'Phonics, letter recognition, and early reading skills',
  },
  {
    icon: Sparkles,
    title: 'Numeracy',
    description: 'Counting, shapes, patterns, and basic math concepts',
  },
  {
    icon: Palette,
    title: 'Creative Arts',
    description: 'Drawing, painting, crafts, and creative expression',
  },
  {
    icon: Music,
    title: 'Music & Movement',
    description: 'Singing, dancing, and rhythm activities',
  },
  {
    icon: Users,
    title: 'Social Skills',
    description: 'Sharing, cooperation, and emotional development',
  },
  {
    icon: Heart,
    title: 'Physical Development',
    description: 'Gross and fine motor skills through play',
  },
]

const features = [
  'Qualified and caring teachers',
  'Safe and colorful learning environment',
  'Nutritious meals and snacks',
  'Regular parent-teacher communication',
  'Age-appropriate learning materials',
  'Outdoor play area',
  'Health and safety protocols',
  'Small class sizes for individual attention',
]

export default function NurseryPage() {
  return (
    <div className="min-h-screen">
      <section className="relative py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300 hover:bg-pink-100">
              <Baby className="mr-1 h-3 w-3" />
              Ages 6 months - 5 years
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Nursery School
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Where little minds begin their journey of discovery. Our nursery program 
              provides a loving, safe environment where children learn through play and exploration.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admissions/apply">
                <Button size="lg" className="gap-2" data-testid="button-apply-nursery">
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
            <h2 className="text-3xl font-bold text-foreground">Age Groups</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              We offer programs tailored to each developmental stage of your child
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ageGroups.map((group) => (
              <Card key={group.name} className={`${group.color} border-0`} data-testid={`card-age-${group.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardHeader>
                  <CardTitle className="text-xl">{group.name}</CardTitle>
                  <CardDescription className="text-foreground/70 font-medium">
                    {group.ages}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Learning Areas</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Our play-based curriculum covers all areas of early childhood development
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {learningAreas.map((area) => (
              <Card key={area.title} className="hover-elevate" data-testid={`card-learning-${area.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <area.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{area.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{area.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Why Choose Our Nursery?</h2>
              <p className="mt-4 text-muted-foreground">
                At Elyon Nursery School, we believe that every child is unique and deserves 
                the best start in life. Our experienced teachers create a warm, stimulating 
                environment where your child will thrive.
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
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 dark:from-pink-900/40 dark:via-purple-900/40 dark:to-blue-900/40 flex items-center justify-center">
                <div className="text-center p-8">
                  <Baby className="h-24 w-24 mx-auto text-primary/60" />
                  <p className="mt-4 text-lg font-medium text-foreground">Nurturing Young Minds</p>
                  <p className="text-sm text-muted-foreground">Since 1994</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Clock className="h-10 w-10 mx-auto text-primary" />
                <h3 className="mt-4 font-semibold text-foreground">School Hours</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Monday - Friday<br />
                  8:00 AM - 2:00 PM
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Extended care available until 5:00 PM
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-10 w-10 mx-auto text-primary" />
                <h3 className="mt-4 font-semibold text-foreground">Class Size</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Maximum 15 children<br />
                  per class
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  1:5 teacher-to-child ratio
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Heart className="h-10 w-10 mx-auto text-primary" />
                <h3 className="mt-4 font-semibold text-foreground">What to Bring</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Change of clothes<br />
                  Water bottle
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Lunch provided by the school
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold">Ready to Give Your Child the Best Start?</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
            Join our nurturing community and watch your child blossom. 
            Admissions are open for the new academic year.
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
