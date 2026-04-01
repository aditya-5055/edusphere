
import React from "react";
import { MessageSquare } from 'lucide-react';
import ContactUsForm from "./ContactUsForm";

const ContactForm = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-richblack-800 to-richblack-900 p-8 lg:p-10 border border-richblack-700 shadow-xl">
      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="flex-shrink-0">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-200">
              <MessageSquare className="h-6 w-6 text-richblack-900" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-richblack-5 mb-2">
              Got an Idea? <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">Let's Collaborate</span>
            </h2>
            <p className="text-richblack-300">
              Tell us more about yourself and what you're got in mind. We'll get back to you within 24 hours.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="mt-8">
          <ContactUsForm />
        </div>
      </div>
    </div>
  );
};

export default ContactForm;