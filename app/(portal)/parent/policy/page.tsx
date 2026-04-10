import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, BookOpen, Users, Clock, DollarSign, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Parent Handbook - Elyon Schools',
}

const sections = [
  {
    icon: Clock,
    title: 'School Hours & Attendance',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    items: [
      'School hours are 7:30 AM – 3:00 PM (Monday to Thursday) and 7:30 AM – 1:00 PM (Friday).',
      'Students should be dropped off no earlier than 7:15 AM and picked up promptly at closing time.',
      'Absence must be communicated to the class teacher or front desk before 8:00 AM.',
      'A written note explaining any absence is required upon the student\'s return to school.',
      'Persistent truancy or lateness will be reviewed with parents/guardians.',
    ],
  },
  {
    icon: DollarSign,
    title: 'School Fees & Payments',
    color: 'text-green-600',
    bg: 'bg-green-50',
    items: [
      'School fees are due at the beginning of each term and must be paid within the first two weeks.',
      'Students with outstanding fees may be asked to stay home until payments are made.',
      'Payment plans are available — speak to the school bursar in confidence.',
      'All payments must be made through official school channels (bank transfer, online portal, or cash receipt).',
      'Receipts must be collected and retained for every payment made.',
    ],
  },
  {
    icon: BookOpen,
    title: 'Academic Partnership',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    items: [
      'Parents are expected to monitor their child\'s homework, assignments, and academic progress regularly.',
      'The parent portal provides real-time access to results, attendance, and fee records.',
      'Parent-teacher meetings are held termly; attendance is strongly encouraged.',
      'Report cards are issued at the end of each term and must be signed and returned.',
      'Contact your child\'s class teacher promptly if you notice any decline in performance.',
    ],
  },
  {
    icon: Heart,
    title: 'Student Welfare & Safety',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    items: [
      'Notify the school of any medical conditions, allergies, or special needs your child has.',
      'Authorised pickup persons must be registered with the school in advance.',
      'Visitors and unregistered persons will not be allowed to take children from school premises.',
      'School management will contact parents immediately in case of any emergency.',
      'Students are not permitted to bring mobile phones, toys, or valuables to school.',
    ],
  },
  {
    icon: Users,
    title: 'Parent Conduct & Engagement',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    items: [
      'Parents must treat all school staff with respect and courtesy at all times.',
      'Complaints or concerns must be raised through the proper channel: class teacher → Head Teacher → Admin.',
      'Aggressive behaviour or confrontational conduct on school premises will not be tolerated.',
      'PTA dues and levies must be paid promptly each session.',
      'Parents are encouraged to volunteer and participate in school activities and events.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Disciplinary Matters',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    items: [
      'Parents will be notified of any disciplinary issue involving their child.',
      'Suspension or expulsion decisions involve the Head Teacher and school management.',
      'Parents are expected to cooperate with the school in addressing behavioural concerns.',
      'Students must not engage in fighting, bullying, or any form of harassment.',
      'Persistent misconduct may result in the student\'s removal from the school.',
    ],
  },
]

export default function ParentPolicyPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader title="Parent Handbook" subtitle="Guidelines, policies, and partnership expectations" role="parent" />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">
            Welcome to Elyon Schools. This handbook outlines key information and expectations for parents and guardians.
            A strong school-home partnership is key to your child&apos;s success. Thank you for choosing Elyon Schools.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${section.bg}`}>
                    <section.icon className={`h-5 w-5 ${section.color}`} />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="mt-0.5 h-5 w-5 flex-shrink-0 flex items-center justify-center text-xs p-0">{i + 1}</Badge>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg text-center">
          <p className="text-xs text-muted-foreground">
            Last updated: January 2025 &bull; Elyon Schools Management &bull; Address: 6, Orija Street, Ile-Epo Bus Stop, Ikotun-Idimu, Lagos
          </p>
        </div>
      </main>
    </div>
  )
}
