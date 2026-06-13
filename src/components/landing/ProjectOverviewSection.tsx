import { motion, MotionValue, useTransform } from 'framer-motion';
import { Activity } from 'lucide-react';

interface Props {
  scrollYProgress: MotionValue<number>;
}

export default function ProjectOverviewSection({ scrollYProgress }: Props) {
  // Appears between 0.1 and 0.25, fades out by 0.35
  const opacity = useTransform(scrollYProgress, [0.05, 0.15, 0.25, 0.35], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0.05, 0.15, 0.25, 0.35], [100, 0, 0, -100]);
  const scale = useTransform(scrollYProgress, [0.05, 0.15, 0.25, 0.35], [0.95, 1, 1, 1.05]);

  return (
    <motion.section 
      className="min-h-screen w-full flex items-center justify-center px-6 md:px-24 py-24"
      style={{ opacity, y, scale }}
    >
      <div className="max-w-4xl w-full liquid-glass-strong rounded-[2.5rem] p-10 md:p-16 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-8 liquid-glass">
          <Activity className="w-6 h-6 text-white" />
        </div>
        
        <h2 className="text-sm md:text-base uppercase tracking-widest text-white/50 font-medium mb-6">
          Project Overview
        </h2>
        
        <h3 className="text-4xl md:text-5xl font-medium text-white mb-8 leading-tight">
          Visualizing <i className="font-serif italic text-white/80">Algorithmic Clarity</i>
        </h3>
        
        <div className="space-y-6 text-lg md:text-xl text-white/60 font-light leading-relaxed max-w-3xl">
          <p>
            RouteWise is an AI-powered logistics intelligence platform designed to transform chaotic supply chains into streamlined, mathematical perfection. We recognized that millions of hours and dollars vanish into inefficient routing every single day.
          </p>
          <p>
            Our mission is to provide unprecedented visibility into the complex networks that keep the world moving. By harnessing the power of advanced pathfinding algorithms, we offer a real-time, interactive ecosystem that adapts to the ever-changing pulse of global logistics.
          </p>
          <p>
            Enter our ecosystem to watch algorithms calculate the absolute best paths in milliseconds, compare different routing strategies, and dynamically adapt to interactive waypoints.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
