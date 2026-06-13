import { motion, MotionValue, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  scrollYProgress: MotionValue<number>;
}

export default function CTASection({ scrollYProgress }: Props) {
  // Appears from 0.85 onwards
  const opacity = useTransform(scrollYProgress, [0.85, 0.95], [0, 1]);
  const scale = useTransform(scrollYProgress, [0.85, 0.95], [0.9, 1]);
  const navigate = useNavigate();

  return (
    <motion.section 
      className="min-h-screen w-full flex flex-col items-center justify-center relative z-50 px-6 py-24"
      style={{ opacity, scale }}
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
