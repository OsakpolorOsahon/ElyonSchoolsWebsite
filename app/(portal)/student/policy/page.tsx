import { PortalHeader } from '@/components/portal/PortalHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, BookOpen, Users, Shield, Clock, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Student Handbook - Elyon Schools',
}

const sections = [
  {
    icon: Clock,
    title: 'Punctuality & Attendance',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    items: [
      'You must arrive at school before 7:30 AM daily. Lateness will be recorded and reported.',
      'If you are absent, your parent/guardian must notify the school on that same day.',
      'Absence without notice may result in your parents being contacted.',
      'You are expected to attend every lesson unless excused by a teacher or the Head Teacher.',
      'Consistent punctuality is part of your academic character and will be noted in your record.',
    ],
  },
  {
    icon: BookOpen,
    title: 'Academic Responsibilities',
    color: 'text-green-600',
    bg: 'bg-green-50',
    items: [
      'Complete all homework and assignments on time and to the best of your ability.',
      'Bring all required textbooks, materials, and stationery every school day.',
      'Cheating or copying during tests and exams is strictly forbidden and will result in zero marks.',
      'Read your notes regularly — do not wait until exams before studying.',
      'Ask questions when you do not understand; your teachers are here to help you.',
    ],
  },
  {
    icon: Users,
    title: 'Behaviour & Respect',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    items: [
      'Treat all teachers, staff, and fellow students with courtesy and respect.',
      'Bullying, fighting, name-calling, or threatening behaviour will not be tolerated.',
      'Listen attentively in class and do not disrupt lessons.',
      'Raise your hand before speaking in class or during assemblies.',
      'Take care of school property — damage caused by carelessness must be repaired.',
    ],
  },
  {
    icon: Shield,
    title: 'Dress Code & Appearance',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    items: [
      'Wear your complete, neat, and clean school uniform every school day.',
      'Hair must be kept neat and natural — no coloured, unkempt, or braided hair (for boys).',
      'No jewellery, nail polish, or make-up is permitted on school premises.',
      'School shoes must be clean and properly laced at all times.',
      'PE (sports) kit is required on sports days; coming without it is not acceptable.',
    ],
  },
  {
    icon: Star,
    title: 'Values & Character',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    items: [
      'The motto of Elyon Schools is "Hardwork and Determination" — live by it every day.',
      'Be honest in all things: in your schoolwork, dealings with others, and self-assessment.',
      'Take responsibility for your actions rather than making excuses.',
      'Help others when you can — kindness and service are signs of true excellence.',
      'Be proud of your school and represent it positively wherever you go.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Prohibited Items & Activities',
    color: 'text-red-600',
    bg: 'bg-red-50',
    items: [
      'Mobile phones, tablets, and electronic gadgets are strictly prohibited.',
      'Bringing food or drinks into classrooms without permission is not allowed.',
      'Students must not leave the school compound during school hours without permission.',
      'No student should bring any harmful object, weapon, or dangerous item to school.',
      'Vandalism, theft, and dishonesty are serious offences that will attract severe consequences.',
    ],
  },
]

export default function StudentPolicyPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <PortalHeader title="Student Handbook" subtitle="Rules, values, and responsibilities at Elyon Schools" role="student" />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">
            Welcome to Elyon Schools! This handbook tells you what is expected of you as a student.
            Read it carefully, obey the rules, and strive to be the best version of yourself.
            Remember: <strong>Hardwork and Determination</strong> are the keys to success!
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
            Last updated: January 2025 &bull; Elyon Schools Management &bull; Hardwork and Determination
          </p>
        </div>
      </main>
    </div>
  )
}
