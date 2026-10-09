import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MedicalCategories from "../components/MedicalCategories";
import VaccineTracking from "../components/VaccineTracking";
import CoreFeatures from "../components/CoreFeatures";
import AboutSection from "../components/AboutSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

export default function HomePage() {
  const navigate = useNavigate();
  const handleAccessClick = () => navigate("/login");

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar onAccessClick={handleAccessClick} />
      <main>
        {/* Section #inicio */}
        <div id="inicio">
          <Hero />
        </div>

        {/* Section #funcionalidades */}
        <MedicalCategories />

        {/* Modulo de vacunas */}
        <VaccineTracking />

        {/* Section #beneficios */}
        <CoreFeatures />

        {/* Section #proyecto */}
        <AboutSection />

        {/* Section #contacto */}
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
