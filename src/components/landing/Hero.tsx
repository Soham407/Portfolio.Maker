import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Link2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";
import type { LandingAuthState } from "@/components/landing/types";

const floatingCards = [
  {
    icon: "*",
    label: "AI-Polished Bio",
    sub: "Rewrite intros and project blurbs",
    color: "from-violet-500/10 to-purple-500/5 border-violet-200/50",
    pos: "top-[15%] left-[3%] lg:left-[8%]",
  },
  {
    icon: "+",
    label: "GitHub Synced",
    sub: "Pull featured work into your portfolio",
    color: "from-emerald-500/10 to-teal-500/5 border-emerald-200/50",
    pos: "top-[20%] right-[3%] lg:right-[8%]",
  },
  {
    icon: "=",
    label: "Share Ready",
    sub: "Public username pages and unlisted links",
    color: "from-orange-500/10 to-amber-500/5 border-orange-200/50",
    pos: "bottom-[25%] left-[2%] lg:left-[6%]",
  },
];

type HeroProps = {
  authState: LandingAuthState;
};

const Hero = ({ authState }: HeroProps) => {
  const authenticated = authState === "authenticated";
  const isLoading = authState === "loading";
  const badgeLabel = authenticated
    ? "Welcome Back"
    : isLoading
      ? "Portfolio Builder"
      : "AI-Powered Portfolio Builder";
  const headline = authenticated
    ? <>Keep Your <span className="text-gradient">Portfolio Moving</span></>
    : isLoading
      ? <>Build, publish, and share a <span className="text-gradient">portfolio that feels like you</span></>
      : <>Build Your <span className="text-gradient">Dream Portfolio</span> in Minutes</>;
  const description = authenticated
    ? "Jump back into the builder, refresh your template, and publish updates without losing momentum."
    : isLoading
      ? "Shape your story with guided editing, flexible templates, and share options for public launches or private review."
      : "Create a recruiter-ready portfolio with AI-assisted writing, premium templates, and GitHub integration - no coding required.";
  const highlightItems = authenticated
    ? ["Continue editing", "Change templates anytime", "Share when ready"]
    : isLoading
      ? ["AI-assisted writing", "Flexible templates", "Public or unlisted sharing"]
      : ["Free to start", "No credit card required", "Custom URL"];

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-3xl" />

      {floatingCards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + index * 0.15, duration: 0.5 }}
          className={`absolute hidden items-center gap-3 rounded-xl border bg-gradient-to-br px-4 py-3 shadow-card backdrop-blur-sm xl:flex ${card.color} ${card.pos} animate-float`}
          style={{ animationDelay: `${index * 1.5}s` }}
        >
          <span className="text-xl">{card.icon}</span>
          <div>
            <div className="text-sm font-semibold leading-tight">{card.label}</div>
            <div className="text-xs text-muted-foreground">{card.sub}</div>
          </div>
        </motion.div>
      ))}

      <div className="container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {badgeLabel}
          </motion.div>

          <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">{headline}</h1>

          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">{description}</p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            {highlightItems.map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {item}
              </span>
            ))}
          </motion.div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isLoading ? (
              <>
                <Button variant="hero" size="lg" className="h-12 px-8 text-base" asChild>
                  <a href="#templates">Explore Templates</a>
                </Button>
                <Button variant="hero-outline" size="lg" className="h-12 px-8 text-base" asChild>
                  <a href="#how-it-works">See the Workflow</a>
                </Button>
              </>
            ) : authenticated ? (
              <>
                <Button variant="hero" size="lg" className="h-12 px-8 text-base" asChild>
                  <Link to="/builder">
                    Continue Building
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="lg" className="h-12 px-8 text-base" asChild>
                  <Link to="/dashboard">Open Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="hero" size="lg" className="h-12 px-8 text-base" asChild>
                  <Link to="/signup">
                    Start Building Free
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="hero-outline" size="lg" className="h-12 px-8 text-base" asChild>
                  <a href="#templates">View Templates</a>
                </Button>
              </>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            {["Guided builder", "Template switching", "Share links"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur"
              >
                <Link2 className="h-3.5 w-3.5 text-primary" />
                {item}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-8"
          >
            {[
              { value: `${TEMPLATE_CATALOG.length}`, label: "Premium Templates" },
              { value: "/p/username", label: "Public portfolio route" },
              { value: "/share/link", label: "Unlisted review route" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold md:text-3xl">{stat.value}</div>
                <div className="text-sm text-foreground/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
