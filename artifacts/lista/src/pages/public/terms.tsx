import { Link } from "wouter";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground">Effective Date: May 12, 2026</p>
        </div>

        <section className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            By accessing and using the Lorenz International Skills Training Academy (LISTA) portal, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">1. Acceptable Use</h2>
          <p>
            You agree to use this portal only for lawful purposes related to your training, enrollment, and records management. You must not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Submit false or misleading information.</li>
            <li>Attempt to gain unauthorized access to other accounts or systems.</li>
            <li>Use the system for any commercial or spamming activities.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8">2. Account Responsibility</h2>
          <p>
            You are responsible for maintaining the confidentiality of your login credentials. Any activity occurring under your account is your responsibility.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">3. Academic Integrity</h2>
          <p>
            All training and certification processes must adhere to the high standards of academic integrity set by Lorenz International Skills Training Academy.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">4. Intellectual Property</h2>
          <p>
            All content, logos, and software provided on this platform are the property of LISTA and are protected by intellectual property laws.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">5. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to the portal if you violate these terms or engage in behavior that harms the institution or its users.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">6. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Your continued use of the portal after such changes constitutes acceptance of the new terms.
          </p>
        </section>

        <div className="pt-8 text-center">
          <Link href="/" className="text-primary font-bold hover:underline">Return to Home</Link>
        </div>
      </div>
    </div>
  );
}
