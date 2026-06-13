import { useRef } from 'react';
import HeroSection from '../components/landing/HeroSection';
import ProjectOverviewSection from '../components/landing/ProjectOverviewSection';
import ProblemSection from '../components/landing/ProblemSection';
import SolutionSection from '../components/landing/SolutionSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import CTASection from '../components/landing/CTASection';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef} 
      className="w-screen h-dvh overflow-y-auto overflow-x-hidden bg-black text-white font-sans relative hide-scrollbar overscroll-none"
    >
      {/* Fixed Video Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4" type="video/mp4" />
        </video>
        {/* Overlay to ensure text remains readable */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Scrollable Content Overlays */}
      <div className="relative z-10 flex flex-col items-center">
        <HeroSection />
        <ProjectOverviewSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <CTASection />
      </div>
    </div>
  );
}
