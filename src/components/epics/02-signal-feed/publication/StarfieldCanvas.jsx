import React, { useRef, useEffect } from 'react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
  skyBlue: '#4a90b8',
  goldLight: '#e8d4b8',
};

export default function StarfieldCanvas({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];
    let shootingStars = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 5000);
      for (let i = 0; i < numStars; i++) {
        const isGold = Math.random() > 0.7;
        stars.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          radius: Math.random() * 2 + 0.3,
          alpha: Math.random() * 0.6 + 0.2,
          speed: Math.random() * 0.2 + 0.05,
          twinkleSpeed: Math.random() * 0.015 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
          color: isGold ? brandColors.goldPrestige : brandColors.goldLight,
          glow: Math.random() > 0.9,
        });
      }
    };

    const spawnShootingStar = () => {
      if (Math.random() > 0.995 && shootingStars.length < 3) {
        shootingStars.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight * 0.3,
          length: Math.random() * 80 + 40,
          speed: Math.random() * 8 + 6,
          alpha: 1,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        });
      }
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw stars
      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.35 + 0.65;
        const alpha = star.alpha * twinkle;
        
        // Glow effect for special stars
        if (star.glow) {
          ctx.beginPath();
          const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 4);
          gradient.addColorStop(0, `rgba(201, 168, 124, ${alpha * 0.4})`);
          gradient.addColorStop(1, 'rgba(201, 168, 124, 0)');
          ctx.fillStyle = gradient;
          ctx.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        const [r, g, b] = star.color === brandColors.goldPrestige ? [201, 168, 124] : [232, 212, 184];
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();

        // Slow drift
        star.y += star.speed * 0.08;
        if (star.y > canvas.offsetHeight + 10) {
          star.y = -10;
          star.x = Math.random() * canvas.offsetWidth;
        }
      });

      // Shooting stars
      spawnShootingStar();
      shootingStars = shootingStars.filter((s) => {
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.015;

        if (s.alpha > 0) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(232, 212, 184, ${s.alpha})`;
          ctx.lineWidth = 2;
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - Math.cos(s.angle) * s.length, s.y - Math.sin(s.angle) * s.length);
          ctx.stroke();
          
          // Glow
          ctx.beginPath();
          const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 8);
          gradient.addColorStop(0, `rgba(232, 212, 184, ${s.alpha})`);
          gradient.addColorStop(1, 'rgba(232, 212, 184, 0)');
          ctx.fillStyle = gradient;
          ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
          ctx.fill();
          return true;
        }
        return false;
      });

      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}