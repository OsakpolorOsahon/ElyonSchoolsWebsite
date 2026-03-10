'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft } from 'lucide-react'

export default function ProspectusPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden bg-muted/30 border-b px-6 py-3 flex items-center justify-between">
        <Link href="/admissions">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Admissions
          </Button>
        </Link>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => typeof window !== 'undefined' && window.print()}
        >
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </Button>
      </div>

      <div className="mx-auto max-w-4xl px-8 py-12 print:py-0">
        <div className="text-center mb-10 border-b-2 border-primary pb-8">
          <div className="text-5xl mb-3">🏫</div>
          <h1 className="text-4xl font-bold text-primary">ELYON SCHOOLS</h1>
          <p className="text-lg text-muted-foreground mt-1">Excellence in Education Since 1994</p>
          <p className="text-sm text-muted-foreground mt-2">
            123 Education Avenue, Ikeja, Lagos, Nigeria<br />
            Tel: +234 803 123 4567 | Email: info@elyonschools.edu.ng
          </p>
        </div>

        <h2 className="text-2xl font-bold text-center mb-8 text-primary">SCHOOL PROSPECTUS 2024/2025</h2>

        <section className="mb-8">
          <h3 className="text-xl font-bold border-l-4 border-primary pl-3 mb-3">Our Vision</h3>
          <p className="text-muted-foreground leading-relaxed">
            To be the foremost institution in Nigeria, nurturing world-class scholars, responsible citizens, and leaders of integrity — grounded in faith, excellence, and character.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-bold border-l-4 border-primary pl-3 mb-3">Our Mission</h3>
          <p className="text-muted-foreground leading-relaxed">
            To provide a conducive learning environment that inspires intellectual curiosity, builds character, and equips every student with the knowledge, skills, and values required to thrive in a rapidly changing world.
          </p>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-bold border-l-4 border-primary pl-3 mb-3">Academic Programmes</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { level: 'Nursery School', ages: 'Ages 2–5', classes: 'Creche, Nursery 1, Nursery 2' },
              { level: 'Primary School', ages: 'Ages 6–11', classes: 'Primary 1 – Primary 6' },
              { level: 'Secondary School', ages: 'Ages 12–17', classes: 'JSS 1–3 & SSS 1–3' },
            ].map(p => (
              <div key={p.level} className="border rounded-lg p-4 text-center">
                <p className="font-semibold text-primary">{p.level}</p>
                <p className="text-sm text-muted-foreground">{p.ages}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.classes}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-bold border-l-4 border-primary pl-3 mb-3">Facilities</h3>
          <ul className="grid grid-cols-2 gap-2 text-muted-foreground">
            {[
              'Modern classrooms with smart boards',
              'Well-equipped science laboratories',
              'Extensive school library',
              'Computer laboratory with internet access',
              'Sports facilities (football, basketball, athletics)',
              'School tuck shop and cafeteria',
              'School bus service',
              'CCTV security surveillance',
            ].map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-primary font-bold">✓</span> {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-bold border-l-4 border-primary pl-3 mb-3">School Fees Structure 2024/2025</h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="text-left p-3 border">Level</th>
                <th className="text-right p-3 border">Tuition (Per Term)</th>
                <th className="text-right p-3 border">Application Fee</th>
              </tr>
            </thead>
            <tbody>
              {[
                { level: 'Nursery', tuition: '₦120,000', app: '₦10,000' },
                { level: 'Primary 1–3', tuition: '₦150,000', app: '₦10,000' },
                { level: 'Primary 4–6', tuition: '₦165,000', app: '₦10,000' },
                { level: 'JSS 1–3', tuition: '₦185,000', app: '₦15,000' },
                { level: 'SSS 1–3', tuition: '₦200,000', app: '₦15,000' },
              ].map((row, i) => (
                <tr key={row.level} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="p-3 border">{row.level}</td>
                  <td className="p-3 border text-right">{row.tuition}</td>
                  <td className="p-3 border text-right">{row.app}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground mt-2">* Fees are subject to annual review. Additional levies may apply.</p>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-bold border-l-4 border-primary pl-3 mb-3">Admission Requirements</h3>
          <ul className="space-y-1 text-muted-foreground">
            <li>✓ Completed online application form</li>
            <li>✓ Birth certificate or age declaration</li>
            <li>✓ 4 recent passport photographs</li>
            <li>✓ Previous school report card (if applicable)</li>
            <li>✓ Transfer certificate (if applicable)</li>
            <li>✓ Parent/Guardian valid ID card</li>
            <li>✓ Immunization records (Nursery applicants)</li>
            <li>✓ Payment of non-refundable application fee</li>
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-bold border-l-4 border-primary pl-3 mb-3">Contact & How to Apply</h3>
          <p className="text-muted-foreground">
            Visit <strong>www.elyonschools.edu.ng/admissions/apply</strong> to start your application online.<br />
            For enquiries, call <strong>+234 803 123 4567</strong> or email <strong>admissions@elyonschools.edu.ng</strong>
          </p>
        </section>

        <div className="text-center text-xs text-muted-foreground border-t pt-4 mt-8 print:fixed print:bottom-0 print:w-full">
          Elyon Schools, 123 Education Avenue, Ikeja, Lagos | Tel: +234 803 123 4567 | © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}
