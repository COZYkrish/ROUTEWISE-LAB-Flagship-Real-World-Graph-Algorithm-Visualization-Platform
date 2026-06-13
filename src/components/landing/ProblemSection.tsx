import { motion } from 'framer-motion';
import { TriangleAlert } from 'lucide-react';

export default function ProblemSection() {
  return (
    <motion.section 
      className="w-full flex items-center justify-start px-6 md:px-24 py-24"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-2xl liquid-glass-strong p-10 md:p-16 rounded-[2.5rem]">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-8 liquid-glass">
          <TriangleAlert className="w-6 h-6 text-white" />
        </div>

        <h2 className="text-sm md:text-base uppercase tracking-[0.3em] text-white/50 font-medium mb-4 flex items-center gap-4">
          <span className="w-8 h-[1px] bg-white/50"></span>
          The Problem
        </h2>
        
        <p className="text-3xl md:text-5xl font-medium leading-tight text-white mb-8">
          Supply chains are <i className="font-serif italic text-white/80">breaking.</i>
        </p>
        
        <div className="space-y-4 text-lg md:text-xl text-white/60 font-light leading-relaxed">
          <p>
            Delivery fleets are lost in the noise. The grid is tangled, and standard tools can't untie the knot. Every extra mile driven is fuel wasted, time lost, and carbon emitted.
          </p>
          <p>
            Traditional routing systems rely on static maps and outdated heuristics. When traffic spikes or roads close, the entire house of cards collapses, leaving dispatchers blind and drivers stranded.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
