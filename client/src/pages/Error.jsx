import React, { useEffect, useState } from 'react';

const NotFoundPage = () => {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    setMounted(true);
    
    // Generate random stars for background
    const starsArray = Array.from({ length: 50 }).map(() => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      delay: Math.random() * 5
    }));
    setStars(starsArray);
    
    // Star twinkling effect
    const interval = setInterval(() => {
      setStars(prev => prev.map(star => ({
        ...star,
        opacity: Math.random() * 0.7 + 0.3
      })));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 z-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `twinkle 2s infinite ${star.delay}s`
            }}
          />
        ))}
      </div>

      {/* Nebula Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Content Container */}
      <div className={`relative z-10 max-w-2xl w-full bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Glowing Border Effect */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500 rounded-3xl blur opacity-20 animate-glow" />
        </div>

        {/* 404 Number */}
        <div className="relative mb-8">
          <div className="text-[180px] md:text-[220px] font-black leading-none text-center">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              404
            </span>
          </div>
          <div className="text-[180px] md:text-[220px] font-black leading-none text-center absolute top-0 left-0 right-0 text-white/5 blur-sm">
            404
          </div>
        </div>

        {/* Title */}
        <h1 className={`text-3xl md:text-4xl font-bold text-center mb-6 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          Lost in the Digital Void
        </h1>

        {/* Description */}
        <p className={`text-lg md:text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto transition-all duration-700 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          The page you're looking for has drifted into the cosmic abyss. 
          It may have been moved, deleted, or perhaps never existed.
        </p>

        {/* Animated Space Illustration */}
        <div className={`relative h-64 mb-12 flex items-center justify-center transition-all duration-1000 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          
          {/* Black Hole Center */}
          <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-black to-gray-900 flex items-center justify-center shadow-2xl">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 animate-spin-slow" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-900 to-black flex items-center justify-center">
              <i className="fas fa-dharmachakra text-2xl text-cyan-300 animate-spin-slower" />
            </div>
          </div>

          {/* Orbiting Planets */}
          <div className="absolute w-48 h-48">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-orbit-1" />
            </div>
            <div className="absolute bottom-0 left-0 -translate-y-1/2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-orbit-2" />
            </div>
            <div className="absolute bottom-0 right-0 -translate-y-1/2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-orbit-3" />
            </div>
          </div>

          {/* Orbital Rings */}
          <div className="absolute w-48 h-48 rounded-full border border-white/10" />
          <div className="absolute w-64 h-64 rounded-full border border-white/5" />
          <div className="absolute w-80 h-80 rounded-full border border-white/5" />

        </div>

        {/* Single Home Button */}
        <div className={`flex justify-center mb-8 transition-all duration-700 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleGoHome}
            className="group relative px-10 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 active:scale-95"
          >
            {/* Button Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
            
            {/* Button Content */}
            <div className="relative flex items-center justify-center gap-3">
              <i className="fas fa-rocket text-xl group-hover:rotate-45 transition-transform duration-300" />
              <span className="text-lg">Return to Homepage</span>
              <i className="fas fa-arrow-right text-xl -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
            
            {/* Hover Effect Line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </button>
        </div>

        {/* Footer */}
        <div className={`text-center text-gray-400 text-sm transition-all duration-700 delay-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <p>
            <span className="text-cyan-300">{new Date().getFullYear()}</span> • 
            Navigate back to safety
          </p>
        </div>
      </div>

      {/* Custom Animations */}
      <style >{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes orbit-1 {
          0% { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        
        @keyframes orbit-2 {
          0% { transform: rotate(120deg) translateX(120px) rotate(-120deg); }
          100% { transform: rotate(480deg) translateX(120px) rotate(-480deg); }
        }
        
        @keyframes orbit-3 {
          0% { transform: rotate(240deg) translateX(120px) rotate(-240deg); }
          100% { transform: rotate(600deg) translateX(120px) rotate(-600deg); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-slower {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        
        .animate-glow {
          animation: glow 4s ease-in-out infinite;
        }
        
        .animate-orbit-1 {
          animation: orbit-1 20s linear infinite;
        }
        
        .animate-orbit-2 {
          animation: orbit-2 25s linear infinite;
        }
        
        .animate-orbit-3 {
          animation: orbit-3 30s linear infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-slower {
          animation: spin-slower 40s linear infinite;
        }
      `}</style>

      {/* Font Awesome CDN */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
      />
    </div>
  );
};

export default NotFoundPage;
