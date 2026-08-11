"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HiOutlineChevronDown } from "react-icons/hi2";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Is Playboard free to use for teams and individuals?",
    answer: "Yes! Playboard is completely open and free to use. You can create unlimited rooms, invite collaborators, and brainstorm without any subscription barriers."
  },
  {
    question: "How does real-time canvas synchronization work?",
    answer: "Playboard connects all room participants via high-speed WebSockets. Every stroke, shape drag, text edit, and eraser action is instantly broadcasted to all connected users with sub-millisecond precision."
  },
  {
    question: "Do my collaborators need to sign up to join my room?",
    answer: "Collaborators can instantly join existing rooms using the unique room link. Signing up allows users to manage their room history and save private boards permanently on their dashboard."
  },
  {
    question: "Are my room drawings saved automatically?",
    answer: "Yes! All drawing elements are saved automatically to our backend database in real-time, ensuring you never lose progress even if you reload or close your browser."
  },
  {
    question: "What tools and features are available on the canvas?",
    answer: "Playboard features a versatile whiteboard toolset including freehand pencil, line, rectangle, ellipse, arrow, text notes, pan/zoom, eraser, and element selection/drag capabilities."
  }
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full max-w-4xl mx-auto px-4 py-20 relative z-10">
      <div className="text-center mb-14">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-purple-300 border border-purple-500/30 backdrop-blur-md inline-block mb-4"
        >
          Got Questions?
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-blue-200 tracking-tight"
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 mt-4 text-base md:text-lg"
        >
          Everything you need to know about Playboard and collaborative sketching.
        </motion.p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl bg-gradient-to-b from-[#180854]/40 to-[#0a0229]/60 border border-blue-500/20 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-blue-400/40"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer group"
                aria-expanded={isOpen}
              >
                <span className="text-base md:text-lg font-medium text-white group-hover:text-blue-300 transition-colors pr-4">
                  {faq.question}
                </span>
                <div className={`p-2 rounded-full bg-blue-950/80 border border-blue-800/50 text-blue-400 transition-transform duration-300 flex-none ${isOpen ? "rotate-180 bg-purple-950/80 text-purple-300 border-purple-700/50" : ""}`}>
                  <HiOutlineChevronDown className="w-5 h-5" />
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-sm md:text-base text-gray-300 border-t border-blue-500/10 pt-4 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
