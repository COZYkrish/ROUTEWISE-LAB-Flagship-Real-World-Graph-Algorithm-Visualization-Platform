import { motion } from 'framer-motion';
import { ChevronDown, MapPin } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export default function HeroSection() {
  return (
    <motion.section
      className="min-h-dvh w-full flex flex-col items-center justify-center relative px-6"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* <motion.div variants={itemVariants} className="absolute top-8 left-8 flex items-center gap-3">
        <div className="w-10 h-10 liquid-glass rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-semibold tracking-tighter text-white drop-shadow-md">RouteWise</span>
      </motion.div> */}

      {/* <motion.div variants={itemVariants} className="text-center max-w-4xl liquid-glass-strong rounded-[3rem] p-10 md:p-16 shadow-2xl border border-white/10 hover:border-white/20 transition-colors duration-500">
        <motion.h1
          className="text-5xl md:text-7xl font-medium tracking-tight text-white mb-6 leading-tight drop-shadow-lg"
          variants={itemVariants}
        >
          Logistics Intelligence <br />
          <span className="text-white/80">for a world that</span> <br />
          <i className="font-serif italic text-white">never stops moving.</i>
        </motion.h1> */}

        <motion.div
          className="flex flex-wrap justify-center gap-3 md:gap-4 mt-8"
          variants={itemVariants}
        >
          {['Real-Time Traversal', 'Interactive Waypoints', 'Algorithmic Comparisons'].map((pill) => (
            <div key={pill} className="liquid-glass px-5 py-2 md:px-6 md:py-2.5 rounded-full text-xs md:text-sm text-white border border-white/20 hover:bg-white/10 hover:scale-105 transition-all duration-300 cursor-default shadow-md backdrop-blur-md">
              {pill}
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-12 flex flex-col items-center gap-4 text-white/70"
        variants={itemVariants}
      >
        <span className="text-xs uppercase tracking-[0.3em] font-medium drop-shadow-sm">Scroll to dive in</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="w-10 h-10 liquid-glass rounded-full flex items-center justify-center shadow-lg hover:bg-white/10 transition-colors">
            <ChevronDown className="w-5 h-5 text-white" />
          </div>
        </motion.div>
      </motion.div>
    </motion.section >
  );
}
