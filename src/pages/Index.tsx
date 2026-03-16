import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CatalogSection from "@/components/CatalogSection";
import CustomOrderSection from "@/components/CustomOrderSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CartSection from "@/components/CartSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ShippingPopover from "@/components/ShippingPopover";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ShippingPopover />
      <HeroSection />
      <CatalogSection />
      <CustomOrderSection />
      <HowItWorksSection />
      <CartSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
