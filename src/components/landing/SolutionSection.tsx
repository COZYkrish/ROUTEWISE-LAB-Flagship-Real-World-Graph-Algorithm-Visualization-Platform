import { motion, MotionValue, useTransform } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface Props {
  scrollYProgress: MotionValue<number>;
}

export default function SolutionSection({ scrollYProgress }: Props) {
  // Appears between 0.45 and 0.6, fades out by 0.75
  const opacity = useTransform(scrollYProgress, [0.45, 0.55, 0.65, 0.75], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0.45, 0.55, 0.65, 0.75], [100, 0, 0, -100]);
  const scale = useTransform(scrollYProgress, [0.45, 0.55, 0.65, 0.75], [0.95, 1, 1, 1.05]);

  return (
    <motion.section 
      className="min-h-screen w-full flex items-center justify-end px-6 md:px-24 py-24"
      style={{ opacity, y, scale }}
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
