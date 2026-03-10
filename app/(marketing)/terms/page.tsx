import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'

export const metadata = {
  title: 'Terms of Service - Elyon Schools',
  description: 'Terms and conditions governing use of Elyon Schools services and facilities.',
}

export default function TermsPage() {
  const lastUpdated = 'January 2025'

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-3">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using the Elyon Schools website, portal, or submitting an application, you agree to be bound by these Terms of Service. These terms apply to all visitors, applicants, parents, guardians, and students who access or use our services. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. About Elyon Schools</h2>
            <p className="text-muted-foreground leading-relaxed">
              Elyon Schools is a Nigerian educational institution established in 1994, providing nursery, primary, and secondary education. Our services include academic instruction, extracurricular activities, and related educational support services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Admission Application</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>All information provided in an admission application must be accurate and truthful. Providing false information may result in immediate cancellation of admission.</li>
              <li>Application fees are non-refundable once payment is processed.</li>
              <li>Submission of an application does not guarantee admission. Elyon Schools reserves the right to accept or decline any application.</li>
              <li>Admission is subject to availability of places in the applied class/year group.</li>
              <li>The school may request additional documentation before confirming admission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. School Fees and Payments</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>School fees are due at the beginning of each term as communicated by the school administration.</li>
              <li>Failure to pay fees on time may result in the student being asked to stay home until fees are settled.</li>
              <li>Fee payments made through Paystack are processed securely. The school is not liable for issues arising from the payment gateway.</li>
              <li>Refund requests must be submitted in writing to the school administration and are assessed on a case-by-case basis.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Student Portal and Online Services</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Portal accounts are provided to enrolled students, parents, and school staff only.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You must notify the school immediately if you suspect unauthorised access to your account.</li>
              <li>Portal accounts may not be shared with third parties.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Code of Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              All students, parents, and guardians are expected to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Treat all members of the school community with respect and dignity.</li>
              <li>Comply with the school's rules, policies, and guidelines as communicated from time to time.</li>
              <li>Support the school's educational mission and values.</li>
              <li>Report any concerns or incidents promptly to the school administration.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on this website, including text, images, logos, and documents, is the property of Elyon Schools and is protected by applicable copyright laws. You may not reproduce, distribute, or use any content without prior written permission from the school.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Elyon Schools provides this website and portal on an "as is" basis. We make no warranties, expressed or implied, about the reliability, accuracy, or availability of our online services. The school shall not be liable for any indirect or consequential damages arising from the use of our website or portal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Changes to These Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              Elyon Schools reserves the right to update these Terms of Service at any time. Changes will be posted on this page with an updated date. Continued use of our services after any changes constitutes your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-3 text-muted-foreground space-y-1">
              <p><strong className="text-foreground">Elyon Schools</strong></p>
              <p>123 Education Avenue, Lagos, Nigeria</p>
              <p>Email: info@elyonschools.edu.ng</p>
              <p>Phone: +234 803 123 4567</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
