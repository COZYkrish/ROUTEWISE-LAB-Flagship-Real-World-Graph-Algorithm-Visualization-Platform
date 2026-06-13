import { motion } from 'framer-motion';
import { ChevronDown, MapPin } from 'lucide-react';

export default function HeroSection() {
  return (
    <motion.section 
      className="min-h-dvh w-full flex flex-col items-center justify-center relative px-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div className="w-10 h-10 liquid-glass rounded-full flex items-center justify-center">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-semibold tracking-tighter text-white">RouteWise</span>
      </div>

      <div className="text-center max-w-5xl liquid-glass-strong rounded-[3rem] p-12 md:p-20">
        <motion.h1 
          className="text-6xl md:text-8xl font-medium tracking-tight text-white mb-8 leading-tight"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Logistics Intelligence <br />
          <span className="text-white/80">for a world that</span> <br />
          <i className="font-serif italic text-white">never stops moving.</i>
        </motion.h1>
        
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          {['Real-Time Traversal', 'Interactive Waypoints', 'Algorithmic Comparisons'].map((pill) => (
            <div key={pill} className="liquid-glass px-6 py-2 rounded-full text-sm text-white/80">
              {pill}
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-12 flex flex-col items-center gap-4 text-white/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1, duration: 1 }}
      >
        <span className="text-xs uppercase tracking-[0.3em] font-medium">Scroll to dive in</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="w-10 h-10 liquid-glass rounded-full flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-white/80" />
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
