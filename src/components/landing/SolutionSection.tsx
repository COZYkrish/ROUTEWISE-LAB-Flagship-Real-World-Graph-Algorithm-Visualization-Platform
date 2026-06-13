import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

export default function SolutionSection() {
  return (
    <motion.section 
      className="w-full flex items-center justify-end px-6 md:px-24 py-24"
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-2xl liquid-glass-strong p-10 md:p-16 rounded-[2.5rem] text-right flex flex-col items-end">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-8 liquid-glass">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>

        <h2 className="text-sm md:text-base uppercase tracking-[0.3em] text-white/50 font-medium mb-4 flex items-center justify-end gap-4">
          The Solution
          <span className="w-8 h-[1px] bg-white/50"></span>
        </h2>
        
        <p className="text-3xl md:text-5xl font-medium leading-tight text-white mb-8">
          Algorithmic <i className="font-serif italic text-white/80">Clarity.</i>
        </p>
        
        <div className="space-y-4 text-lg md:text-xl text-white/60 font-light leading-relaxed text-right">
          <p>
            RouteWise transforms chaos into order. By visualizing real-time pathfinding algorithms on live city networks, we turn logistical nightmares into mathematical perfection.
          </p>
          <p>
            We process millions of data points per second to find the most efficient route. No guesswork. No delays. Just absolute clarity powered by advanced machine learning and graph traversal strategies.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
