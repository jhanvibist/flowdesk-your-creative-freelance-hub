import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WaveBackground } from "@/components/WaveBackground";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "@/components/DashboardPreview";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-freelancer.jpg";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Repeat,
  Bell,
  AlertCircle,
  Mail,
  TrendingUp,
  BarChart3,
  Activity,
  Calculator,
  FolderKanban,
  Flag,
  Users,
  Paperclip,
  Link2,
} from "lucide-react";

const proPillars = [
  {
    num: "01",
    title: "Automation",
    tagline: "Bill on autopilot",
    icon: Repeat,
    items: [
      { icon: Repeat, label: "Recurring invoices" },
      { icon: Bell, label: "Automatic reminders" },
      { icon: Mail, label: "Overdue follow-up emails" },
      { icon: AlertCircle, label: "Auto payment alerts" },
    ],
  },
  {
    num: "02",
    title: "Analytics",
    tagline: "See your money flow",
    icon: BarChart3,
    items: [
      { icon: TrendingUp, label: "Monthly revenue charts" },
      { icon: Users, label: "Client performance" },
      { icon: Activity, label: "Overdue trends" },
      { icon: Calculator, label: "Payment forecasting" },
    ],
  },
  {
    num: "03",
    title: "Advanced project tools",
    tagline: "Run projects end-to-end",
    icon: FolderKanban,
    items: [
      { icon: Flag, label: "Milestones" },
      { icon: Users, label: "Team collaboration" },
      { icon: CheckCircle2, label: "Task assignment" },
      { icon: Paperclip, label: "File attachments" },
      { icon: Link2, label: "Client portal" },
    ],
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

          <div className="mt-16 md:mt-20 grid md:grid-cols-5 gap-6 items-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="md:col-span-3">
              <DashboardPreview />
            </div>
            <div className="md:col-span-2 relative rounded-3xl overflow-hidden shadow-elevated hidden md:block">
              <img src={heroImg} alt="Indian freelancer working on laptop" width={1280} height={896} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-primary-glow/20 mix-blend-multiply" />
            </div>
          </div>
        </div>
      </section>

      {/* PRO / PAID PLAN */}
      <section id="features" className="relative py-24 md:py-32 overflow-hidden">
        <WaveBackground variant="subtle" className="opacity-60" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Pro / Paid Plan
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Everything you need to scale.
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Three pillars of premium features built for freelancers who treat their craft like a business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {proPillars.map((p, i) => (
              <div
                key={p.num}
                className="group relative rounded-3xl bg-card border border-border/60 p-7 md:p-8 shadow-card hover:shadow-elevated transition-flow hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full gradient-wave opacity-20 blur-2xl group-hover:opacity-40 transition-smooth" />

                <div className="flex items-center justify-between mb-6">
                  <div className="text-5xl md:text-6xl font-black gradient-wave-text leading-none">#{p.num}</div>
                  <div className="w-12 h-12 rounded-2xl gradient-wave flex items-center justify-center shadow-soft group-hover:shadow-glow transition-smooth">
                    <p.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{p.tagline}</p>

                <ul className="space-y-3">
                  {p.items.map((item) => (
                    <li key={item.label} className="flex items-center gap-3 text-sm">
                      <div className="w-7 h-7 rounded-lg bg-accent/60 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button variant="wave" size="xl" asChild>
              <Link to="/signup">Start your free trial <ArrowRight className="w-4 h-4" /></Link>
            </Button>
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
