import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { TEMPLATE_CATALOG } from "@/lib/templateCatalog";

type TemplatesShowcaseProps = {
  authenticated?: boolean;
};

const TemplatesShowcase = ({ authenticated = false }: TemplatesShowcaseProps) => {
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
          {TEMPLATE_CATALOG.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
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
            <p className="mb-4 text-center font-semibold">{authenticated ? "Try a new look for your portfolio" : "Ready to build yours?"}</p>
            <Button variant="hero" asChild>
              <Link to={authenticated ? "/templates" : "/signup"}>
                {authenticated ? "Choose Template" : "Get Started"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TemplatesShowcase;
