"use client";

import { motion } from "motion/react";
import { 
  HiOutlineUsers, 
  HiOutlinePencilSquare, 
  HiOutlineLink, 
  HiOutlineBolt, 
  HiOutlineCloudArrowUp, 
  HiOutlineSparkles 
} from "react-icons/hi2";

const features = [
  {
    icon: HiOutlineUsers,
    title: "Real-time Collaboration",
    description: "Draw, sketch, and brain-dump together with live multiplayer cursor tracking and instant canvas sync.",
    badge: "Multiplayer"
  },
  {
    icon: HiOutlinePencilSquare,
    title: "Intuitive Drawing Suite",
    description: "Freestyle pen, geometric shapes, arrows, text notes, and smart selection tools at your fingertips.",
    badge: "Versatile"
  },
  {
    icon: HiOutlineLink,
    title: "One-Click Room Sharing",
    description: "Generate instant room links to invite team members or friends to your canvas in seconds.",
    badge: "Instant Access"
  },
  {
    icon: HiOutlineBolt,
    title: "Ultra Low-Latency Sync",
    description: "Powered by custom WebSocket backend for smooth 60fps real-time strokes without lag.",
    badge: "High Tech"
  },
  {
    icon: HiOutlineCloudArrowUp,
    title: "Auto-Saved Rooms",
    description: "Never lose a stroke. Your room state is automatically saved so you can resume anytime.",
    badge: "Persistent"
  },
  {
    icon: HiOutlineSparkles,
    title: "Clean & Distraction-Free",
    description: "Sleek dark interface designed to keep focus purely on your team's creative workflow.",
    badge: "Modern UI"
  }
];

export function FeatureSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const }
    }
  };

  return (
    <section id="features" className="w-full max-w-7xl mx-auto px-4 py-20 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 border border-blue-500/30 backdrop-blur-md inline-block mb-4"
        >
          Built for Creative Teams
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-200 tracking-tight"
        >
          Everything You Need to Visualize Ideas
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 mt-4 text-base md:text-lg"
        >
          Engineered for speed, collaboration, and effortless brainstorming without barriers.
        </motion.p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative p-8 rounded-2xl bg-gradient-to-b from-[#180854]/60 to-[#090024]/80 border border-blue-500/20 backdrop-blur-xl hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/10 flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle card glowing background on hover */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all duration-500 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 group-hover:text-purple-200 group-hover:scale-110 transition-all duration-300 shadow-inner">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800/50">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white group-hover:text-blue-200 transition-colors mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
