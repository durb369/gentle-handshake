import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const lastUpdated = "February 20, 2026";
  const appName = "Spirit Vision™";
  const contactEmail = "support@spiritvision.app";

  return (
    <div className="min-h-screen bg-mystic-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground text-sm">Last updated: {lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          <div className="bg-card/40 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
            <p className="text-foreground leading-relaxed">
              Welcome to <strong>{appName}</strong>. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services. Please read this policy carefully. If you disagree with its terms, please discontinue use of the application.
            </p>
          </div>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">1</span>
              Information We Collect
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed pl-9">
              <div>
                <h3 className="text-foreground font-medium mb-1">Images You Upload</h3>
                <p>When you use the spirit scan feature, you may upload photos or take pictures using your device camera. These images are temporarily processed to provide our AI analysis service and may be stored to display your results. We do not sell or share your images with third parties.</p>
              </div>
              <div>
                <h3 className="text-foreground font-medium mb-1">Device Identifier</h3>
                <p>We generate and store a unique anonymous device identifier (Device ID) to manage your scan limits, subscription status, and personalized features. This ID does not contain any personally identifiable information.</p>
              </div>
              <div>
                <h3 className="text-foreground font-medium mb-1">Usage Data</h3>
                <p>We automatically collect certain information when you use the app, including your scan history, feature interactions, and general usage patterns. This helps us improve our services.</p>
              </div>
              <div>
                <h3 className="text-foreground font-medium mb-1">Payment Information</h3>
                <p>If you purchase a subscription, payment information is processed by Stripe, our third-party payment processor. We do not store your full credit card details. We only receive a customer ID and subscription status from Stripe.</p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">2</span>
              How We Use Your Information
            </h2>
            <ul className="space-y-2 text-muted-foreground pl-9 list-disc">
              <li>To provide, operate, and maintain the {appName} application and its features</li>
              <li>To perform AI-powered spiritual entity analysis on images you submit</li>
              <li>To manage your subscription and access to premium features</li>
              <li>To enforce scan limits and prevent abuse of our free tier</li>
              <li>To generate entity sketches and other personalized content</li>
              <li>To improve, personalize, and expand our services</li>
              <li>To understand and analyze how you use our application</li>
              <li>To respond to support requests and inquiries</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">3</span>
              Permissions We Request
            </h2>
            <div className="space-y-3 text-muted-foreground pl-9">
              <div>
                <h3 className="text-foreground font-medium mb-1">Camera</h3>
                <p>Used to take photos for spirit scanning. Camera access is only active when you initiate a scan.</p>
              </div>
              <div>
                <h3 className="text-foreground font-medium mb-1">Photo Library / Storage</h3>
                <p>Used to allow you to upload existing photos from your device for scanning. We only access photos you explicitly select.</p>
              </div>
              <div>
                <h3 className="text-foreground font-medium mb-1">Internet Access</h3>
                <p>Required to send images to our servers for AI analysis and to sync your subscription status.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">4</span>
              Data Sharing and Disclosure
            </h2>
            <div className="space-y-3 text-muted-foreground pl-9">
              <p>We do not sell, trade, or rent your personal information. We may share data in the following limited circumstances:</p>
              <ul className="list-disc space-y-2 pl-4">
                <li><strong className="text-foreground">Service Providers:</strong> We use Stripe for payment processing and Google/OpenAI AI models for image analysis. These providers have their own privacy policies and data handling practices.</li>
                <li><strong className="text-foreground">Legal Requirements:</strong> We may disclose information if required by law or in response to valid requests by public authorities.</li>
                <li><strong className="text-foreground">Business Transfers:</strong> In the event of a merger or acquisition, your information may be transferred as part of that transaction.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">5</span>
              Data Retention
            </h2>
            <p className="text-muted-foreground pl-9 leading-relaxed">
              We retain your scan images and results for as long as necessary to provide our services. Your device ID and associated data are retained for the duration of your use of the app. You may request deletion of your data by contacting us at <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a>.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">6</span>
              Children's Privacy
            </h2>
            <p className="text-muted-foreground pl-9 leading-relaxed">
              {appName} is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately at <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a> and we will take steps to delete it.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">7</span>
              Security
            </h2>
            <p className="text-muted-foreground pl-9 leading-relaxed">
              We use industry-standard security measures to protect your information, including encrypted data transmission (HTTPS/TLS) and secure cloud storage. However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">8</span>
              Your Rights
            </h2>
            <div className="space-y-2 text-muted-foreground pl-9">
              <p>Depending on your location, you may have the following rights regarding your personal data:</p>
              <ul className="list-disc space-y-1 pl-4">
                <li>The right to access the data we hold about you</li>
                <li>The right to request correction of inaccurate data</li>
                <li>The right to request deletion of your data</li>
                <li>The right to opt out of certain data processing activities</li>
              </ul>
              <p className="mt-2">To exercise any of these rights, please contact us at <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a>.</p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">9</span>
              Changes to This Policy
            </h2>
            <p className="text-muted-foreground pl-9 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this page. Your continued use of the application after any changes constitutes your acceptance of the new Privacy Policy.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">10</span>
              Contact Us
            </h2>
            <div className="bg-card/40 border border-border/50 rounded-xl p-6 backdrop-blur-sm ml-9">
              <p className="text-muted-foreground mb-3">If you have any questions about this Privacy Policy, please contact us:</p>
              <div className="space-y-1 text-foreground">
                <p><strong>App:</strong> {appName}</p>
                <p><strong>Email:</strong> <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a></p>
                <p><strong>Website:</strong> <a href="https://gentle-handshake.lovable.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">gentle-handshake.lovable.app</a></p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border/30 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} {appName}. All rights reserved.</p>
          <p className="mt-1">
            <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">{contactEmail}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
