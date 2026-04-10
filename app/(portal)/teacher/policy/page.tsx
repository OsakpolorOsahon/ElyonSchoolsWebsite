import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, Clock, Shield, Star, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Staff Handbook - Elyon Schools',
}

const sections = [
  {
    icon: Clock,
    title: 'Punctuality & Attendance',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    items: [
      'All teaching staff must arrive at school by 7:20 AM, at least 10 minutes before the first period.',
      'Absence must be communicated to the Head Teacher or Admin before 7:00 AM via phone or official channel.',
      'Persistent lateness or unexcused absences will attract disciplinary action.',
      'Relief lessons must be covered promptly when a colleague is absent.',
      'All teachers must sign the attendance register every morning and afternoon.',
    ],
  },
  {
    icon: BookOpen,
    title: 'Lesson Preparation & Delivery',
    color: 'text-green-600',
    bg: 'bg-green-50',
    items: [
      'Lesson plans/notes must be prepared and available for inspection at all times.',
      'Teachers must follow the approved curriculum and scheme of work for their subject.',
      'Assessments and continuous assessment (CA) marks must be recorded promptly.',
      'All written work given to students must be marked and returned within 5 working days.',
      'Innovative and engaging teaching methods are encouraged to improve learning outcomes.',
    ],
  },
  {
    icon: Users,
    title: 'Student Welfare & Discipline',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    items: [
      'Teachers are in loco parentis and must treat all students with care and respect.',
      'No form of corporal punishment, verbal abuse, or humiliation is permitted.',
      'Student misconduct should be reported using the proper disciplinary channel.',
      'Bullying, discrimination, or favouritism will not be tolerated in any form.',
      'Teachers must maintain confidentiality regarding students\' personal and academic records.',
    ],
  },
  {
    icon: Shield,
    title: 'Professionalism & Conduct',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    items: [
      'All staff must dress professionally and modestly at all times on school premises.',
      'Use of personal mobile phones during teaching periods is strictly prohibited.',
      'Staff must not engage in private tutoring of enrolled students for payment without approval.',
      'Confidential school information must not be shared with external parties.',
      'Staff must uphold the values and good image of Elyon Schools at all times.',
    ],
  },
  {
    icon: Star,
    title: 'Meetings & Professional Development',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    items: [
      'Attendance at staff meetings, PTA meetings, and school events is compulsory.',
      'Teachers are encouraged to pursue continuous professional development.',
      'Staff must participate actively in school improvement initiatives.',
      'Performance appraisals are conducted termly; feedback must be acted upon.',
      'New staff must complete the school\'s orientation programme within the first term.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Disciplinary Procedures',
    color: 'text-red-600',
    bg: 'bg-red-50',
    items: [
      'Violations of this handbook may result in a verbal warning, written warning, or suspension.',
      'Gross misconduct (fraud, abuse, criminal behaviour) may lead to immediate dismissal.',
      'Staff have the right to appeal disciplinary decisions through the school management.',
      'All disciplinary proceedings will be documented and kept confidential.',
    ],
  },
]

export default function TeacherPolicyPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader title="Staff Handbook" subtitle="Policies, conduct standards, and professional guidelines" role="teacher" />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">
            This handbook outlines the conduct standards and expectations for all teaching and non-teaching staff at Elyon Schools.
            By continuing employment at Elyon Schools, you agree to uphold these standards. For questions, contact the school administration.
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
            Last updated: January 2025 &bull; Elyon Schools Management &bull; For queries, contact admin@elyonschools.edu.ng
          </p>
        </div>
      </main>
    </div>
  )
}
