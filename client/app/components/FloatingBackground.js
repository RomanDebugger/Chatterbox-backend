'use client';
import { useState, useEffect } from 'react';

export default function FloatingBackground() {
  const [particles, setParticles] = useState([]);
  const emojis = ['✉️', '💬', '🗨️', '🔒', '👻', '🎙️', '⚡', '🌟', '💫', '🔮', '🎯', '🚀'];
  
  useEffect(() => {
    const createParticles = () => {
      const newParticles = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 0.8 + Math.random() * 1.2,
        duration: 20 + Math.random() * 30,
        delay: Math.random() * 20,
        rotateSpeed: 0.5 + Math.random() * 2,
        glowIntensity: 0.1 + Math.random() * 0.3
      }));
      setParticles(newParticles);
    };
    
    createParticles();
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-blue-900/5" />
      
      {/* Animated particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute select-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: `${particle.size}rem`,
            animation: `
              float-complex ${particle.duration}s ease-in-out ${particle.delay}s infinite,
              rotate-gentle ${particle.rotateSpeed * 20}s linear infinite,
              pulse-glow ${3 + Math.random() * 4}s ease-in-out infinite alternate
            `,
            filter: `drop-shadow(0 0 ${particle.glowIntensity * 20}px rgba(147, 51, 234, 0.3))`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <span 
            className="block transition-all duration-1000"
            style={{
              background: `linear-gradient(45deg, 
                rgba(147, 51, 234, ${0.6 + particle.glowIntensity}), 
                rgba(59, 130, 246, ${0.4 + particle.glowIntensity}), 
                rgba(16, 185, 129, ${0.3 + particle.glowIntensity}))`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {particle.emoji}
          </span>
        </div>
      ))}
      
      {/* Floating orbs for extra ambiance */}
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${(i * 12.5) % 100}%`,
            top: `${(i * 23) % 100}%`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            background: `radial-gradient(circle, rgba(147, 51, 234, 0.4), transparent)`,
            animation: `
              drift ${25 + i * 3}s linear ${i * 2}s infinite,
              fade-pulse ${4 + i}s ease-in-out infinite alternate
            `
          }}
        />
      ))}

      <style jsx global>{`
        @keyframes float-complex {
          0%, 100% { 
            transform: translate(-50%, -50%) translateY(0px) scale(1);
          }
          25% { 
            transform: translate(-50%, -50%) translateY(-15px) scale(1.05);
          }
          50% { 
            transform: translate(-50%, -50%) translateY(-8px) scale(0.95);
          }
          75% { 
            transform: translate(-50%, -50%) translateY(-20px) scale(1.02);
          }
        }
        
        @keyframes rotate-gentle {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse-glow {
          0% { 
            filter: drop-shadow(0 0 5px rgba(147, 51, 234, 0.2)) brightness(1);
          }
          100% { 
            filter: drop-shadow(0 0 15px rgba(147, 51, 234, 0.6)) brightness(1.2);
          }
        }
        
        @keyframes drift {
          0% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(20px) translateY(-30px); }
          50% { transform: translateX(-15px) translateY(-10px); }
          75% { transform: translateX(25px) translateY(-25px); }
          100% { transform: translateX(0) translateY(0); }
        }
        
        @keyframes fade-pulse {
          0% { opacity: 0.2; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}