import { motion } from 'framer-motion';
import { Activity, MapPin, Zap } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="w-5 h-5 text-white" />,
      title: "A* Search Optimization",
      desc: "By employing heuristic-driven A* search, we ensure the fastest path is found instantly, factoring in real-world constraints like traffic density and road hierarchy.",
      delay: 0
    },
    {
      icon: <MapPin className="w-5 h-5 text-white" />,
      title: "Dynamic Dijkstra",
      desc: "Our adapted Dijkstra's algorithm recalculates the entire network graph on the fly when new waypoints are added, guaranteeing mathematical completeness without sacrificing speed.",
      delay: 0.1
    },
    {
      icon: <Activity className="w-5 h-5 text-white" />,
      title: "Evolutionary Routing",
      desc: "For complex multi-stop delivery fleets, we utilize genetic algorithms that simulate evolutionary optimization to find the ultimate route combination among billions of possibilities.",
      delay: 0.2
    }
  ];

  return (
    <motion.section 
      className="w-full flex flex-col items-center justify-center px-6 py-24"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-6xl w-full text-center mb-16">
        <h2 className="text-sm md:text-base uppercase tracking-[0.3em] text-white/50 font-medium mb-4">
          Advanced Pathfinding
        </h2>
        <p className="text-3xl md:text-5xl font-medium text-white">
          The <i className="font-serif italic text-white/80">Algorithms</i> Under The Hood
        </p>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feat, i) => (
          <motion.div 
            key={i}
            className="liquid-glass p-10 rounded-[2.5rem] hover:scale-105 transition-transform duration-500 group flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: feat.delay, duration: 0.6 }}
          >
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-8 liquid-glass-strong">
              {feat.icon}
            </div>
            
            <h3 className="text-2xl font-medium text-white mb-4">{feat.title}</h3>
            <p className="text-white/60 font-light leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
