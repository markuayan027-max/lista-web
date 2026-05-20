import { Link } from "wouter";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-4xl">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground">Effective Date: May 12, 2026</p>
        </div>

        <section className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed prose-headings:text-foreground">
          <p>
            Lorenz International Skills Training Academy (LISTA) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our enrollment and records system.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">1. Information We Collect</h2>
          <p>
            When you register for an account or enroll in courses, we may collect:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name, email address, and phone number.</li>
            <li>Profile information (avatar URL, preferences).</li>
            <li>Academic and enrollment records.</li>
            <li>OAuth data (if you sign in via Google).</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8">2. How We Use Your Information</h2>
          <p>
            We use your data to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Manage your enrollment and academic progress.</li>
            <li>Authenticate your identity.</li>
            <li>Send important updates and announcements.</li>
            <li>Improve our services and user experience.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8" id="data-deletion">3. User Data Deletion Instructions</h2>
          <p>
            You have the right to request the deletion of your account and personal data. To do so, please follow these steps:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Send an email to <span className="font-bold">admin@lista.com</span> with the subject "Data Deletion Request".</li>
            <li>Include your registered email address and full name.</li>
            <li>Our team will process your request and delete all your personal information within 7 business days.</li>
            <li>Alternatively, if you signed in via Google, you can revoke access to our app from your Google Account settings under Security &gt; Third-party apps with account access.</li>
          </ol>

          <h2 className="text-2xl font-bold text-foreground mt-8">4. Security</h2>
          <p>
            We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            <strong>LISTA Administration</strong>
            <br />
            Gingoog City, 2014
            <br />
            Email: admin@lista.com
          </p>
        </section>

        <div className="pt-8 text-center">
          <Link href="/" className="text-primary font-bold hover:underline">Return to Home</Link>
        </div>
      </div>
    </div>
  );
}
