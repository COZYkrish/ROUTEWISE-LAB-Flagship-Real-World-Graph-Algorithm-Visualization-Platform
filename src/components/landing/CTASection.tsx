import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <motion.section 
      className="min-h-dvh w-full flex flex-col items-center justify-center relative z-50 px-6 py-24"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="text-center max-w-3xl liquid-glass-strong p-16 rounded-[3rem]">
        <h2 className="text-5xl md:text-7xl font-medium text-white mb-8 leading-tight tracking-tight">
          Stop guessing. <br/>
          <i className="font-serif italic text-white/80">Start knowing.</i>
        </h2>
        
        <p className="text-xl text-white/60 mb-12 font-light">
          Experience the future of logistics routing today.
        </p>

        <button 
          onClick={() => navigate('/app')}
          className="group relative px-8 py-4 liquid-glass-strong hover:scale-105 active:scale-95 rounded-full overflow-hidden transition-all duration-300"
        >
          <span className="relative flex items-center gap-3 text-lg font-medium tracking-wide text-white">
            Launch Simulator
            <div className="w-8 h-8 liquid-glass rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </span>
        </button>
      </div>
    </motion.section>
  );
}
