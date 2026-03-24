import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  ArrowRight,
  Download,
  Calendar,
  Users,
  HelpCircle
} from 'lucide-react'

export const metadata = {
  title: 'Admissions - Elyon Schools',
  description: 'Apply for admission to Elyon Schools. Learn about our admission process, requirements, and fees.',
}

const admissionSteps = [
  {
    step: 1,
    title: 'Complete Application Form',
    description: 'Fill out the online application form with student and guardian information. Upload required documents.',
    icon: FileText,
  },
  {
    step: 2,
    title: 'Pay Application Fee',
    description: 'Submit the non-refundable application fee of ₦10,000 through our secure online payment system.',
    icon: CreditCard,
  },
  {
    step: 3,
    title: 'Entrance Assessment',
    description: 'Students applying for Primary 2 and above will take an entrance assessment to determine appropriate placement.',
    icon: Clock,
  },
  {
    step: 4,
    title: 'Admission Decision',
    description: 'You will receive an admission decision within 5-7 working days. Successful applicants can then complete enrollment.',
    icon: CheckCircle,
  },
]

const requirements = {
  nursery: [
    'Birth Certificate or Age Declaration',
    'Passport photographs (4 copies)',
    'Immunization records',
    'Parent/Guardian ID card',
  ],
  primary: [
    'Birth Certificate or Age Declaration',
    'Passport photographs (4 copies)',
    'Previous school report card (if applicable)',
    'Transfer certificate (if applicable)',
    'Parent/Guardian ID card',
  ],
  secondary: [
    'Birth Certificate or Age Declaration',
    'Passport photographs (4 copies)',
    'Previous school report cards (last 2 years)',
    'Transfer certificate',
    'Testimonial from previous school',
    'Parent/Guardian ID card',
  ],
}

const fees = [
  { level: 'Nursery (Pre-Nursery to Nursery 2)', tuition: '₦150,000', admission: '₦50,000' },
  { level: 'Primary (Primary 1 to Primary 6)', tuition: '₦200,000', admission: '₦75,000' },
  { level: 'Junior High (JSS 1 to JSS 3)', tuition: '₦250,000', admission: '₦100,000' },
  { level: 'Senior High (SSS 1 to SSS 3)', tuition: '₦300,000', admission: '₦125,000' },
]

const faqs = [
  {
    question: 'When does the admission process open?',
    answer: 'Admissions for the next academic session typically open in January and continue until spaces are filled. We recommend applying early to secure a spot.',
  },
  {
    question: 'Is there an entrance examination?',
    answer: 'Students applying for Primary 2 and above are required to take an entrance assessment in English, Mathematics, and General Knowledge. This helps us place students in the appropriate class.',
  },
  {
    question: 'What is the student-to-teacher ratio?',
    answer: 'We maintain a low student-to-teacher ratio of approximately 20:1 for primary and high school, and 15:1 for nursery classes to ensure personalized attention.',
  },
  {
    question: 'Are there scholarship opportunities?',
    answer: 'Yes, we offer merit-based scholarships to outstanding students. Academic scholarships covering up to 50% of tuition are available based on entrance assessment performance.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept bank transfers, online card payments (via Paystack), and cash payments at our school office. Payment plans are available upon request.',
  },
  {
    question: 'Can I visit the school before applying?',
    answer: 'Absolutely! We encourage prospective parents to schedule a campus visit. Contact our admissions office to book a tour.',
  },
]

export default function AdmissionsPage() {
  return (
    <div>
      <section className="relative py-20 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Admissions
            </h1>
            <p className="text-xl text-primary-foreground/90 leading-relaxed mb-8">
              Begin your child&apos;s journey to excellence at Elyon Schools. Our admission 
              process is designed to be simple and straightforward. Apply online and track 
              your application status at every step.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/admissions/apply">
                <Button size="lg" variant="secondary" className="gap-2" data-testid="button-start-application">
                  Start Application
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admissions/status">
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-check-status">
                  Check Application Status
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Admission Process
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Follow these simple steps to apply for admission to Elyon Schools.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 stagger-children">
            {admissionSteps.map((step) => (
              <Card key={step.step} className="relative hover-elevate">
                <CardContent className="pt-6">
                  <div className="absolute -top-3 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {step.step}
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4 mt-2">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
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
              Required Documents
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Please prepare the following documents for your application.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <Users className="h-5 w-5" />
                  Nursery School
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {requirements.nursery.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary">
                  <Users className="h-5 w-5" />
                  Primary School
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {requirements.primary.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Users className="h-5 w-5" />
                  High School
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {requirements.secondary.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Fees Structure
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              2024/2025 Academic Session fees. All fees are per term.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-4 font-semibold">Level</th>
                  <th className="text-left p-4 font-semibold">Tuition (Per Term)</th>
                  <th className="text-left p-4 font-semibold">Admission Fee (One-time)</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="p-4">{fee.level}</td>
                    <td className="p-4 font-semibold text-primary">{fee.tuition}</td>
                    <td className="p-4">{fee.admission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            * Fees are subject to annual review. Additional fees may apply for books, uniforms, and extracurricular activities.
          </p>
        </div>
      </section>

      <section id="faq" className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our admission process.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <HelpCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
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
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Downloadable Resources
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Download and print our school prospectus and academic timetable for your reference.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
            <Card className="hover-elevate text-center">
              <CardContent className="pt-8 pb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">School Prospectus</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Complete information about our school, programmes, fees, and facilities.
                </p>
                <Link href="/downloads/prospectus" target="_blank">
                  <Button className="gap-2 w-full">
                    <Download className="h-4 w-4" /> View & Print Prospectus
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="hover-elevate text-center">
              <CardContent className="pt-8 pb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 mx-auto mb-4">
                  <Calendar className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Academic Timetable</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Primary and high school daily class timetables for the current session.
                </p>
                <Link href="/downloads/timetable" target="_blank">
                  <Button variant="outline" className="gap-2 w-full">
                    <Download className="h-4 w-4" /> View & Print Timetable
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
            Ready to Apply?
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Start your child&apos;s educational journey with Elyon Schools today. 
            Our online application takes just 15 minutes to complete.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/admissions/apply">
              <Button size="lg" variant="secondary" className="gap-2" data-testid="button-cta-apply">
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-cta-questions">
                Have Questions? Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
