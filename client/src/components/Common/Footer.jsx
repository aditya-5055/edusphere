
import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

// Logo
import Logo from "../../assets/Logo/logo.png";

// Icons
import {
  FaFacebook,
  FaGoogle,
  FaTwitter,
  FaYoutube,
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaHeart,
  FaArrowUp,
} from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";
import { HiLocationMarker } from "react-icons/hi";

const BottomFooter = ["Privacy Policy", "Cookie Policy", "Terms"];
const Resources = ["Articles", "Blog", "Cheat Sheet", "Code challenges", "Docs", "Projects", "Videos", "Workspaces"];
const Plans = ["Paid memberships", "For students", "Business solutions"];
const Community = ["Forums", "Chapters", "Events"];

const Footer = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigation = (e, path) => {
    e.preventDefault();
    scrollToTop();
    navigate('/');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <footer className="relative bg-gradient-to-b from-richblack-800 to-richblack-900 text-richblack-300 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-400/5 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-400/5 via-transparent to-transparent"></div>
      </div>

      {/* Top wave decoration */}
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg
          className="relative block w-full h-12 text-richblack-800 fill-current"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="relative z-10"
      >
        {/* ================= TOP FOOTER ================= */}
        <div className="w-11/12 max-w-maxContent mx-auto pt-20 pb-10 border-b border-richblack-700">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* ========== LEFT SECTION ========= */}
            <motion.div variants={itemVariants} className="lg:w-[40%] flex flex-col gap-6">
              <Link to="/" onClick={scrollToTop} className="relative group inline-block w-fit">
                <img 
                  src={Logo} 
                  alt="EduSphere Logo" 
                  className="w-48 transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
                />
                <div className="absolute -bottom-2 left-0 w-20 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent rounded-full"></div>
              </Link>

              <p className="text-sm leading-relaxed text-richblack-400 max-w-md">
                EduSphere is a modern learning platform designed to help students
                grow their skills with structured courses, projects, and
                real-world practice.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-richblack-400">
                  <HiLocationMarker className="text-yellow-400 text-lg" />
                  <span>Pune Institute of Computer Technology (PICT), Pune, Maharashtra </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-richblack-400">
                  <MdEmail className="text-yellow-400 text-lg" />
                  <span>noreply.edusphereacademy@gmail.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-richblack-400">
                  <MdPhone className="text-yellow-400 text-lg" />
                  <span>+91 1234567890</span>
                </div>
              </div>

              {/* Social Icons with hover effects - all link to home */}
              <div className="flex gap-4 mt-4">
                {[
                  { icon: FaFacebook, color: "hover:text-blue-500", bg: "hover:bg-blue-500/10" },
                  { icon: FaGoogle, color: "hover:text-red-500", bg: "hover:bg-red-500/10" },
                  { icon: FaTwitter, color: "hover:text-sky-400", bg: "hover:bg-sky-400/10" },
                  { icon: FaYoutube, color: "hover:text-red-600", bg: "hover:bg-red-600/10" },
                  { icon: FaLinkedin, color: "hover:text-blue-600", bg: "hover:bg-blue-600/10" },
                  { icon: FaInstagram, color: "hover:text-pink-500", bg: "hover:bg-pink-500/10" },
                ].map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.button
                      key={index}
                      onClick={() => navigate('/')}
                      whileHover={{ y: -3, scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 rounded-xl bg-richblack-800/50 backdrop-blur-sm border border-richblack-700 ${social.color} ${social.bg} transition-all duration-300 hover:border-current group cursor-pointer`}
                    >
                      <Icon className="text-lg transition-all duration-300 group-hover:scale-110" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* ========== RIGHT SECTION ========= */}
            <div className="lg:w-[60%] grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Company */}
              <motion.div variants={itemVariants}>
                <h3 className="text-richblack-50 font-bold text-lg mb-4 relative inline-block">
                  Company
                  <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {["About", "Careers", "Affiliates"].map((item, i) => (
                    <motion.li
                      key={i}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <button
                        onClick={() => navigate('/')}
                        className="text-sm text-richblack-400 hover:text-yellow-400 transition-colors duration-200 inline-block cursor-pointer"
                      >
                        {item}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Resources */}
              <motion.div variants={itemVariants}>
                <h3 className="text-richblack-50 font-bold text-lg mb-4 relative inline-block">
                  Resources
                  <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {Resources.map((item, i) => (
                    <motion.li
                      key={i}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <button
                        onClick={() => navigate('/')}
                        className="text-sm text-richblack-400 hover:text-yellow-400 transition-colors duration-200 inline-block cursor-pointer"
                      >
                        {item}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Plans */}
              <motion.div variants={itemVariants}>
                <h3 className="text-richblack-50 font-bold text-lg mb-4 relative inline-block">
                  Plans
                  <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {Plans.map((item, i) => (
                    <motion.li
                      key={i}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <button
                        onClick={() => navigate('/')}
                        className="text-sm text-richblack-400 hover:text-yellow-400 transition-colors duration-200 inline-block cursor-pointer"
                      >
                        {item}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Community */}
              <motion.div variants={itemVariants}>
                <h3 className="text-richblack-50 font-bold text-lg mb-4 relative inline-block">
                  Community
                  <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent rounded-full"></div>
                </h3>
                <ul className="space-y-3">
                  {Community.map((item, i) => (
                    <motion.li
                      key={i}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <button
                        onClick={() => navigate('/')}
                        className="text-sm text-richblack-400 hover:text-yellow-400 transition-colors duration-200 inline-block cursor-pointer"
                      >
                        {item}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM FOOTER ================= */}
        <div className="w-11/12 max-w-maxContent mx-auto py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Bottom Links */}
            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-6">
              {BottomFooter.map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate('/')}
                  className="text-sm text-richblack-400 hover:text-yellow-400 transition-colors duration-200 relative group cursor-pointer"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </motion.div>

            {/* Copyright */}
            <motion.div 
              variants={itemVariants}
              className="text-sm text-richblack-500 text-center flex items-center gap-2"
            >
              <span>© 2026 EduSphere.</span>
              <span className="flex items-center gap-1">
                Made with <FaHeart className="text-red-500 animate-pulse" /> for learners
              </span>
            </motion.div>

            {/* Back to Top Button */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-200 text-richblack-900 shadow-lg shadow-yellow-400/30 hover:shadow-xl transition-all duration-300 group"
            >
              <FaArrowUp className="text-sm group-hover:animate-bounce" />
            </motion.button>
          </div>

          {/* Newsletter Signup */}
          <motion.div 
            variants={itemVariants}
            className="mt-8 pt-8 border-t border-richblack-700 text-center"
          >
            <p className="text-sm text-richblack-400">
              Subscribe to our newsletter for updates and exclusive content
            </p>
            <div className="mt-4 flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-richblack-700 border border-richblack-600 rounded-l-lg focus:outline-none focus:border-yellow-400 text-richblack-50 text-sm"
              />
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-200 text-richblack-900 font-medium rounded-r-lg hover:from-yellow-300 hover:to-yellow-100 transition-all duration-300"
              >
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;