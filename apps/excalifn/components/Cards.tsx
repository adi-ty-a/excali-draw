"use client";

import { HiOutlinePencilSquare, HiOutlineTrash, HiOutlineArrowRight } from "react-icons/hi2";
import { motion } from "motion/react";

interface CardProps {
  roomname: string;
  joinfuntion: () => void;
  deleterm: () => void;
}

export const Card = ({ roomname, joinfuntion, deleterm }: CardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group flex items-center justify-between p-4 rounded-xl bg-[#14083a]/50 hover:bg-[#1c0c52]/70 border border-blue-500/20 hover:border-blue-400/40 backdrop-blur-md transition-all duration-200 shadow-sm hover:shadow-blue-500/10"
    >
      <div className="flex items-center gap-3.5 min-w-0 pr-2">
        <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-300 group-hover:scale-105 transition-transform">
          <HiOutlinePencilSquare className="w-5 h-5" />
        </div>
        <div className="truncate">
          <h3 className="text-white font-medium text-sm md:text-base truncate group-hover:text-blue-200 transition-colors">
            {roomname}
          </h3>
          <p className="text-xs text-gray-400 truncate">
            Canvas Room
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-none">
        <button 
          onClick={joinfuntion} 
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-blue-500/30 cursor-pointer"
        >
          <span>Open</span>
          <HiOutlineArrowRight className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={deleterm} 
          title="Delete room"
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
        >
          <HiOutlineTrash className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};