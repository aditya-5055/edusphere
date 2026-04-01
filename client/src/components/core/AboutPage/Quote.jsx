

import React from 'react';
import { motion } from 'framer-motion';
import { Quote as QuoteIcon } from 'lucide-react';
import HighlightText from '../HomePage/HighlightText';

const Quote = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative mx-auto py-12 px-6 md:px-12 text-center"
    >
      {/* Decorative quote marks */}
      <div className="absolute top-0 left-0 text-8xl font-serif text-yellow-400/20">"</div>
      <div className="absolute bottom-0 right-0 text-8xl font-serif text-yellow-400/20">"</div>
      
      <QuoteIcon className="mx-auto h-12 w-12 text-yellow-400/50 mb-6" />
      
      <div className="text-2xl md:text-4xl font-bold max-w-4xl mx-auto leading-relaxed">
        <span className="text-white">We are passionate about revolutionizing the way we learn. Our</span>
        <span className="mx-2"></span>
        <HighlightText text={"innovative platform"} />
        <span className="text-white"> combines technology, </span>
        <span className="bg-gradient-to-b from-[#FF512F] to-[#F09819] text-transparent bg-clip-text font-bold">
          expertise
        </span>
        <span className="text-white">, and community to create an </span>
        <span className="bg-gradient-to-b from-[#E65C00] to-[#F9D423] text-transparent bg-clip-text font-bold">
          unparalleled educational experience
        </span>
        <span className="text-white">.</span>
      </div>

      {/* Author line (optional) */}
      <div className="mt-8 text-richblack-400">
        <p className="text-sm">— EduSphere Team</p>
      </div>
    </motion.div>
  );
};

export default Quote;