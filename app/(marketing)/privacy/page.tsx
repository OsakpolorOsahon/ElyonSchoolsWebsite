import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'

export const metadata = {
  title: 'Privacy Policy - Elyon Schools',
  description: 'How Elyon Schools collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  const lastUpdated = 'January 2025'

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Elyon Schools ("we", "our", or "us") is committed to protecting the privacy of our students, parents, guardians, and website visitors. This Privacy Policy explains how we collect, use, store, and protect your personal information in accordance with the Nigeria Data Protection Regulation (NDPR) and applicable Nigerian law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We may collect the following types of personal information:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Student Information:</strong> Full name, date of birth, gender, nationality, state of origin, and academic records.</li>
              <li><strong className="text-foreground">Guardian/Parent Information:</strong> Full name, email address, phone number, home address, relationship to student, and occupation.</li>
              <li><strong className="text-foreground">Application Data:</strong> Information submitted as part of the admission application process.</li>
              <li><strong className="text-foreground">Payment Information:</strong> Payment references and transaction details (we do not store card numbers; all payments are processed securely by Paystack).</li>
              <li><strong className="text-foreground">Portal Usage:</strong> Login activity, pages visited, and actions performed within the school portal.</li>
              <li><strong className="text-foreground">Contact Form Submissions:</strong> Name, email, and message content when you contact us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We use your personal information to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Process and manage admission applications.</li>
              <li>Maintain student academic records, results, and attendance.</li>
              <li>Communicate important school updates, fee reminders, and announcements.</li>
              <li>Process fee payments and generate payment receipts.</li>
              <li>Provide access to the student and parent portals.</li>
              <li>Comply with our legal and regulatory obligations.</li>
              <li>Improve our website and educational services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Legal Basis for Processing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We process your personal information on the following legal bases: the performance of a contract (provision of educational services), compliance with legal obligations, and our legitimate interests in operating and improving our school. Where required, we will obtain your consent before processing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We do not sell your personal information. We may share it only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Service Providers:</strong> We use Supabase for secure data storage and Paystack for payment processing. These providers are bound by their own privacy and security commitments.</li>
              <li><strong className="text-foreground">Legal Requirements:</strong> We may disclose information if required by law, court order, or a government authority.</li>
              <li><strong className="text-foreground">Safety:</strong> We may share information to protect the safety and welfare of students and staff.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, loss, or disclosure. Our portal uses industry-standard encryption, row-level security on our database, and secure authentication. However, no system is completely secure and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain student records for the duration of enrolment and for a reasonable period thereafter as required by Nigerian educational regulations. Application data for unsuccessful applicants is retained for one academic year. You may request deletion of your data by contacting us, subject to our legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Your Rights (NDPR)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Under the Nigeria Data Protection Regulation, you have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access the personal information we hold about you or your child.</li>
              <li>Request correction of inaccurate or incomplete information.</li>
              <li>Request deletion of your data (where no legal obligation requires retention).</li>
              <li>Object to certain types of processing.</li>
              <li>Withdraw consent where processing is based on consent.</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              To exercise any of these rights, please contact our administration office.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information about children as part of our educational services. This information is collected from parents and guardians, not directly from children. Portal accounts for students are managed in conjunction with their parents or guardians.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify registered users of significant changes by email or through the school portal. Continued use of our services after any changes indicates your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or the handling of your personal data, please contact us:
            </p>
            <div className="mt-3 text-muted-foreground space-y-1">
              <p><strong className="text-foreground">Data Protection Officer — Elyon Schools</strong></p>
              <p>123 Education Avenue, Lagos, Nigeria</p>
              <p>Email: privacy@elyonschools.edu.ng</p>
              <p>Phone: +234 803 123 4567</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
