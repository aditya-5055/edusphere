
import React from "react";
import { motion } from "framer-motion";
import { Mail, Send } from 'lucide-react';
import ContactUsForm from "../ContactUsPage/ContactUsForm";

const ContactFormSection = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mx-auto w-full max-w-4xl"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-richblack-800 to-richblack-900 p-8 md:p-12 border border-richblack-700">
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-200 mb-4">
              <Mail className="h-6 w-6 text-richblack-900" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 mb-3">
              Get in Touch
            </h2>
            <p className="text-lg text-richblack-300 max-w-2xl mx-auto">
              We'd love to hear from you. Please fill out this form and we'll get back to you within 24 hours.
            </p>
          </div>

          {/* Form */}
          <div className="max-w-2xl mx-auto">
            <ContactUsForm />
          </div>

          {/* Footer note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-richblack-400 flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />
              We typically respond within 24 hours
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactFormSection;