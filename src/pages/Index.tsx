import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WaveBackground } from "@/components/WaveBackground";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "@/components/DashboardPreview";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Wallet,
  Bell,
  BarChart3,
  Sparkles,
  Zap,
  Shield,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart invoicing",
    desc: "Create beautiful, branded invoices in seconds. Templates that flow with your work.",
  },
  {
    icon: Wallet,
    title: "Payment tracking",
    desc: "Know exactly what's paid, pending, or overdue — at a glance, in real time.",
  },
  {
    icon: Bell,
    title: "Gentle reminders",
    desc: "Automated nudges that get you paid faster — without the awkward follow-ups.",
  },
  {
    icon: BarChart3,
    title: "Income insights",
    desc: "Visualize your earnings flow with calm, clear analytics built for freelancers.",
  },
  {
    icon: Zap,
    title: "Lightning fast",
    desc: "Log work, generate invoice, send. Three taps from billable to billed.",
  },
  {
    icon: Shield,
    title: "Secure by design",
    desc: "Bank-grade encryption keeps your client and payment data quietly protected.",
  },
];

const flowSteps = [
  { step: "01", title: "Log your work", desc: "Track hours and projects effortlessly." },
  { step: "02", title: "Generate invoice", desc: "One click. Professional, on-brand." },
  { step: "03", title: "Get paid", desc: "Track every payment until it lands." },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden pt-16 md:pt-24 pb-24 md:pb-32 gradient-hero">
        <WaveBackground variant="hero" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/60 backdrop-blur-sm border border-primary/10 text-xs font-medium text-primary mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Built for freelancers who value flow
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
              Keep your work flowing.
              <br />
              <span className="gradient-wave-text">Get paid without the chaos.</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              FlowDesk is the smart invoice and payment tracker that turns scattered freelance work
              into one calm, beautiful flow — from logged hour to landed payment.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="wave" size="xl" asChild>
                <Link to="/signup">
                  Start free <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="wave-outline" size="xl" asChild>
                <a href="#features">See how it works</a>
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-status-paid" /> Free 14-day trial</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-status-paid" /> No credit card</div>
            </div>
          </div>

          <div className="mt-16 md:mt-20 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-24 md:py-32">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">Features</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need.
              <br />
              <span className="text-muted-foreground font-medium">Nothing you don't.</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Six quietly powerful tools, one beautifully simple app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group relative rounded-2xl bg-card border border-border/60 p-6 md:p-8 shadow-soft hover:shadow-card transition-smooth hover:-translate-y-1"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-wave flex items-center justify-center mb-5 shadow-soft group-hover:shadow-glow transition-smooth">
                  <f.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveBackground variant="divider" />

      {/* FLOW */}
      <section id="flow" className="relative py-24 md:py-32 bg-gradient-to-b from-accent/20 to-background">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">The flow</div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              From logged work to landed payment.
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Three steps. Zero friction.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Connecting wave line on desktop */}
            <svg
              className="hidden md:block absolute top-12 left-[16%] right-[16%] h-12 pointer-events-none"
              viewBox="0 0 600 40"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0,20 C150,0 300,40 450,20 C525,10 575,25 600,20"
                stroke="hsl(var(--primary) / 0.25)"
                strokeWidth="2"
                strokeDasharray="4 6"
                fill="none"
              />
            </svg>

            {flowSteps.map((s) => (
              <div
                key={s.step}
                className="relative rounded-2xl bg-card border border-border/60 p-8 text-center shadow-soft hover:shadow-card transition-smooth"
              >
                <div className="w-16 h-16 rounded-full gradient-wave mx-auto mb-5 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-glow">
                  {s.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING / CTA */}
      <section id="pricing" className="relative py-24 md:py-32">
        <div className="container">
          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-elevated">
            <div className="absolute inset-0 gradient-wave" />
            <WaveBackground variant="subtle" className="opacity-30" />
            <div className="relative z-10 px-8 md:px-16 py-16 md:py-20 text-center text-primary-foreground">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Ready to find your flow?
              </h2>
              <p className="text-base md:text-lg text-primary-foreground/80 max-w-xl mx-auto mb-8">
                Join thousands of freelancers who've replaced spreadsheet chaos with calm, confident cashflow.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="xl" variant="secondary" asChild className="bg-background text-foreground hover:bg-background/90">
                  <Link to="/signup">Start your 14-day trial <ArrowRight className="w-4 h-4" /></Link>
                </Button>
                <Button size="xl" variant="ghost" asChild className="text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/login">I already have an account</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
