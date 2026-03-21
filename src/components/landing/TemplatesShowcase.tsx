import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";
import type { LandingAuthState } from "@/components/landing/types";

type TemplatesShowcaseProps = {
  authState: LandingAuthState;
};

const TemplatesShowcase = ({ authState }: TemplatesShowcaseProps) => {
  const authenticated = authState === "authenticated";
  const isLoading = authState === "loading";

  return (
    <section id="templates" className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            <span className="text-gradient">Premium</span> Templates
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Professionally designed templates that make your portfolio unforgettable.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TEMPLATE_CATALOG.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer overflow-hidden rounded-xl border border-border shadow-card transition-all duration-300 hover:border-primary/20 hover:shadow-glow"
            >
              <div className="h-48 overflow-hidden">{template.preview}</div>
              <div className="bg-card p-4">
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5 p-8"
          >
            <p className="mb-4 text-center font-semibold">
              {authenticated
                ? "Try a new look for your portfolio"
                : isLoading
                  ? "Checking your workspace"
                  : "Ready to build yours?"}
            </p>
            {isLoading ? (
              <Button variant="hero" disabled>
                Loading options...
              </Button>
            ) : (
              <Button variant="hero" asChild>
                <Link to={authenticated ? "/templates" : "/signup"}>
                  {authenticated ? "Choose Template" : "Get Started"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </motion.div>
        </div>

        <motion.div
          id="publishing"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 grid gap-6 rounded-2xl border border-border bg-card/80 p-6 shadow-card md:grid-cols-[1.2fr_0.8fr] md:items-center"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Publish Your Work</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Ship a public portfolio or share a private review link.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              When you are ready, publish to a clean username route for your public portfolio or send an unlisted share link for recruiter feedback before you go fully public.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-xl border border-border bg-background px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Public</div>
              <div className="mt-1 font-mono text-sm text-foreground">/p/username</div>
            </div>
            <div className="rounded-xl border border-border bg-background px-4 py-3">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Unlisted</div>
              <div className="mt-1 font-mono text-sm text-foreground">/share/secure-link</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TemplatesShowcase;
