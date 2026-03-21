import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import TemplatesShowcase from "@/components/landing/TemplatesShowcase";
import Footer from "@/components/landing/Footer";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, loading } = useAuth();
  const authenticated = !loading && !!user;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <TemplatesShowcase authenticated={authenticated} />
      <Footer />
    </div>
  );
};

export default Index;
