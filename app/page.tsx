import Navbar from "@/components/Navbar";
import WineExperience from "@/components/WineExperience";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0A0909] text-[#F5F2EB] selection:bg-[#C5A059]/30 selection:text-[#F5F2EB]">
      {/* Luxury Navigation Bar */}
      <Navbar />

      {/* Unified Continuous Hero & Auris Scroll Experience */}
      <main>
        <WineExperience />
      </main>

      {/* Luxury Estate Footer */}
      <Footer />
    </div>
  );
}
