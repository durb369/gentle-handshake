import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Smartphone, Tag, AlignLeft, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 shrink-0">
      {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
};

const Section = ({
  icon,
  title,
  subtitle,
  content,
  charLimit,
  label,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  content: string;
  charLimit: number;
  label: string;
}) => {
  const charCount = content.length;
  const isOver = charCount > charLimit;

  return (
    <div className="bg-card/40 border border-border/50 rounded-xl p-6 backdrop-blur-sm space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-primary">{icon}</span>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          </div>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono ${isOver ? "text-destructive" : "text-muted-foreground"}`}>
            {charCount} / {charLimit}
          </span>
          <CopyButton text={content} label={label} />
        </div>
      </div>
      <pre className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed font-sans border border-border/30 rounded-lg p-4 bg-background/30">
        {content}
      </pre>
    </div>
  );
};

// ─── Content ────────────────────────────────────────────────────────────────

const APP_TITLE = "Spirit Vision – Ghost & Entity Scanner";

const SHORT_DESCRIPTION = `Scan photos for ghosts, spirits & entities with AI thermal & energy detection.`;

const FULL_DESCRIPTION = `👁️ SPIRIT VISION — THE #1 AI GHOST DETECTOR & SPIRIT SCANNER

Ever felt an unexplainable presence? Spirit Vision is the most advanced ghost detector and paranormal scanner app available. Using AI-powered thermal imaging, energy field analysis, and spectral detection, it reveals ghosts, spirits, entities, and supernatural anomalies hidden in your photos.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔬 HOW IT WORKS

Point your camera or upload any photo. Spirit Vision's AI analyzes every pixel using four powerful scanning modes:

📷 Spirit Glass — Reflection-based filter that reveals entities hiding in glass, mirrors, and reflective surfaces
🔥 Thermal Scan — Detects heat anomalies, cold spots, and energy disturbances like a real thermal camera
🌈 Hyperspectral — Separates light wavelengths to expose hidden spectral signatures
🔬 Polarimetric — Reveals surface stress patterns and hidden structures invisible to the naked eye

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👻 WHAT IT DETECTS

• Ghosts & residual spirits trapped between worlds
• Guardian angels & benevolent light beings
• Shadow entities & dark presences
• Interdimensional visitors & portal activity
• Aura energy fields & spiritual signatures
• Dimensional thinning & paranormal hotspots
• Fog, smoke & mist anomalies enhanced by AI

Each entity is pinpointed on your photo with confidence levels, threat assessment, and spiritual guidance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ POWERFUL FEATURES

🕵️ AI Spirit Scanner — Full paranormal analysis in seconds. Detects entity types, locations, power levels, and intent.

🔥 Thermal & Energy Camera — Real-time filters that highlight fog, smoke, and energy disturbances with a glowing halo effect.

🎨 Entity Sketch Generator — AI transforms detected spirits into haunting hand-drawn Victorian-style illustrations.

📖 Spirit Journal — Track every scan and encounter. Build your personal paranormal investigation log.

📚 Entity Encyclopedia — 50+ entity types documented with behaviors, powers, weaknesses, and protection methods.

🛡️ Protection Guidance — Personalized spiritual defense recommendations based on detected threats.

🔮 Psychic Chat Portal — Consult our AI psychic medium about your encounters and spiritual questions.

🔢 Numerology Chart — Decode the hidden numbers shaping your spiritual destiny.

🃏 Daily Tarot — Receive a daily card pull with deep mystical interpretation.

🖼️ Sketch Gallery — Browse and share all your generated entity portraits.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💎 PLANS & PRICING

🆓 Free — 5 spirit scans, basic entity detection, energy overview
⚡ Boosted ($1/mo) — Unlimited scans, entity sketches, psychic portal, tarot & numerology
✨ Premium ($5/mo) — Everything + priority AI, advanced analysis, ritual guides, early access

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏆 WHY SPIRIT VISION?

✅ Most advanced AI ghost detection technology
✅ 4 unique camera scanning modes
✅ Real disturbance & anomaly enhancement
✅ Beautiful entity sketch artwork
✅ Complete paranormal investigation toolkit
✅ Works with any photo — old or new
✅ No account required — scan instantly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ DISCLAIMER
Spirit Vision is designed for entertainment, spiritual exploration, and personal enrichment. Results are AI-generated interpretations, not scientific measurements.

📧 Support: support@spiritvision.app
🌐 Website: https://gentle-handshake.lovable.app
🔒 Privacy: https://gentle-handshake.lovable.app/privacy-policy`;

const KEYWORDS = `ghost detector, ghost detector app, spirit scanner, paranormal scanner, ghost camera, ghost hunting app, spirit photo analyzer, ghost finder, entity detector, supernatural scanner, ghost tracker, paranormal investigation app, ghost radar, spirit world app, angel detector, shadow entity, demon detector, haunted house detector, EVP detector, ghost hunting equipment, aura reader app, energy scanner, thermal ghost camera, psychic app, tarot reading app, numerology app, spirit communication, paranormal activity detector, ghost sensor, spiritual scanner`;

const CATEGORY_INFO = `Primary Category: Entertainment
Secondary Category: Lifestyle

Content Rating: Apply for "Everyone" or "Teen" rating
• No violence, no adult content
• Supernatural/occult themes (mild)
• In-app purchases present

Tags to select in Play Console:
• Paranormal
• Spiritual
• Entertainment
• Photo & Video
• Lifestyle`;

// ─── Page ───────────────────────────────────────────────────────────────────

const PlayStoreListing = () => {
  return (
    <div className="min-h-screen bg-mystic-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-glow-gradient pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
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
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Google Play Store Listing</h1>
              <p className="text-muted-foreground text-sm">Copy each section directly into your Play Console</p>
            </div>
          </div>
        </div>

        {/* Tip banner */}
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-8 text-sm text-accent-foreground/80">
          💡 <strong>Tip:</strong> In Google Play Console go to <em>Store presence → Main store listing</em> to paste each section below.
        </div>

        <div className="space-y-6">
          {/* App Title */}
          <Section
            icon={<Type className="w-5 h-5" />}
            title="App Title"
            subtitle="Max 50 characters — shown in search results and your store listing"
            content={APP_TITLE}
            charLimit={50}
            label="App Title"
          />

          {/* Short Description */}
          <Section
            icon={<AlignLeft className="w-5 h-5" />}
            title="Short Description"
            subtitle="Max 80 characters — shown below the app title in search results"
            content={SHORT_DESCRIPTION}
            charLimit={80}
            label="Short Description"
          />

          {/* Full Description */}
          <Section
            icon={<AlignLeft className="w-5 h-5" />}
            title="Full Description"
            subtitle="Max 4,000 characters — the main listing body shown on your app page"
            content={FULL_DESCRIPTION}
            charLimit={4000}
            label="Full Description"
          />

          {/* Keywords */}
          <Section
            icon={<Tag className="w-5 h-5" />}
            title="Keyword Targets"
            subtitle="Use these naturally in your description and metadata — Google Play doesn't have a keyword field but these help with indexing"
            content={KEYWORDS}
            charLimit={500}
            label="Keywords"
          />

          {/* Category & Settings */}
          <Section
            icon={<Smartphone className="w-5 h-5" />}
            title="Category & Content Rating Notes"
            subtitle="Reference guide for Play Console settings"
            content={CATEGORY_INFO}
            charLimit={1000}
            label="Category Notes"
          />
        </div>

        {/* Checklist */}
        <div className="mt-10 bg-card/40 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">📋 Play Store Submission Checklist</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
            {[
              "App title (50 chars max)",
              "Short description (80 chars max)",
              "Full description (4,000 chars max)",
              "App icon — 512×512 PNG",
              "Feature graphic — 1024×500 PNG",
              "Screenshots (min 2, up to 8)",
              "Privacy policy URL linked",
              "Content rating questionnaire",
              "Signed AAB uploaded",
              "Pricing & distribution set",
              "In-app products configured",
              "Contact email set",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded border border-border/60 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border/30 text-xs text-muted-foreground space-y-1">
            <p>🔒 Privacy Policy URL: <span className="text-primary">https://gentle-handshake.lovable.app/privacy-policy</span></p>
            <p>🌐 Website URL: <span className="text-primary">https://gentle-handshake.lovable.app</span></p>
            <p>📧 Support Email: <span className="text-primary">support@spiritvision.app</span></p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border/30 text-center text-muted-foreground text-sm">
          <p>Spirit Vision — Google Play Store Listing Reference</p>
        </div>
      </div>
    </div>
  );
};

export default PlayStoreListing;
