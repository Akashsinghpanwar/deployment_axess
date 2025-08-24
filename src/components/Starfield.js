import React, { useEffect, useRef } from 'react';
import './Starfield.css';

const Starfield = ({ isDarkMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    console.log('Starfield component mounted, dark mode:', isDarkMode);
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      console.log('Canvas resized to:', canvas.width, 'x', canvas.height);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Enhanced star properties with very slow, natural movement
    const stars = [];
    const numStars = isDarkMode ? 250 : 120; // Reduced for better performance
    const shootingStars = [];
    
    console.log('Creating enhanced starfield with', numStars, 'stars, dark mode:', isDarkMode);
    
    // Initialize stars with different types
    for (let i = 0; i < numStars; i++) {
      const starType = Math.random();
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: starType > 0.95 ? Math.random() * 2 + 1 : Math.random() * 1 + 0.2, // Smaller stars
        speed: Math.random() * 0.02 + 0.01, // Very slow movement
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.005 + 0.002, // Very slow twinkling
        twinklePhase: Math.random() * Math.PI * 2,
        color: starType > 0.9 ? (Math.random() > 0.5 ? '#ffd700' : '#ff6b6b') : '#ffffff',
        isBright: starType > 0.98,
        direction: Math.random() * Math.PI * 2 // Random direction for each star
      });
    }

    // Add shooting stars occasionally
    const addShootingStar = () => {
      if (Math.random() < 0.02) { // Very rare
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: 0,
          vx: (Math.random() - 0.5) * 1.5, // Very slow shooting stars
          vy: Math.random() * 1 + 0.5,
          life: 1,
          decay: Math.random() * 0.005 + 0.002
        });
      }
    };

    // Animation loop optimized for smooth performance
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Milky Way band in dark mode
      if (isDarkMode) {
        const gradient = ctx.createRadialGradient(
          canvas.width * 0.3, canvas.height * 0.5, 0,
          canvas.width * 0.3, canvas.height * 0.5, canvas.width * 0.8
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
        gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.01)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw stars with very slow, natural movement
      stars.forEach(star => {
        // Update twinkling
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.15 + 0.85; // Subtle twinkling
        
        // Update position with very slow movement
        star.x += Math.cos(star.direction) * star.speed;
        star.y += Math.sin(star.direction) * star.speed;
        
        // Wrap stars around screen
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;
        
        // Draw star with subtle glow effect
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        
        // Subtle glow effects
        if (isDarkMode) {
          if (star.isBright) {
            ctx.shadowColor = 'rgba(124, 58, 237, 0.6)';
            ctx.shadowBlur = star.size * 2;
          } else {
            ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
            ctx.shadowBlur = star.size * 1;
          }
        } else {
          ctx.shadowColor = 'rgba(255, 215, 0, 0.3)';
          ctx.shadowBlur = star.size * 1;
        }
        
        // Set star color with twinkling
        const alpha = star.opacity * twinkle;
        if (star.color === '#ffffff') {
          ctx.fillStyle = isDarkMode 
            ? `rgba(255, 255, 255, ${alpha})`
            : `rgba(255, 215, 0, ${alpha * 0.6})`;
        } else {
          ctx.fillStyle = `${star.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw shooting stars
      shootingStars.forEach((shootingStar, index) => {
        shootingStar.x += shootingStar.vx;
        shootingStar.y += shootingStar.vy;
        shootingStar.life -= shootingStar.decay;
        
        if (shootingStar.life > 0) {
          ctx.beginPath();
          ctx.moveTo(shootingStar.x, shootingStar.y);
          ctx.lineTo(shootingStar.x - shootingStar.vx * 1.5, shootingStar.y - shootingStar.vy * 1.5);
          ctx.strokeStyle = `rgba(255, 255, 255, ${shootingStar.life})`;
          ctx.lineWidth = 1;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
          ctx.shadowBlur = 4;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          shootingStars.splice(index, 1);
        }
      });

      // Add new shooting stars
      addShootingStar();

      requestAnimationFrame(animate);
    };

    animate();
    console.log('Enhanced animation started');

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      console.log('Starfield component unmounted');
    };
  }, [isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      className={`starfield-canvas ${isDarkMode ? 'dark' : 'light'}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        background: isDarkMode 
          ? 'radial-gradient(ellipse at center, #000000 0%, #0a0a0a 20%, #1a1a2e 50%, #16213e 80%, #0c0c0c 100%)'
          : 'linear-gradient(135deg, #87CEEB 0%, #98D8E8 50%, #B0E0E6 100%)'
      }}
    />
  );
};

export default Starfield;
