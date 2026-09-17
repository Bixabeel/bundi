/* ============================================
   ABUNDIA.IO - Hero Particles
   Lightweight canvas particle system
   ============================================ */

(function() {
  'use strict';

  const canvas = document.createElement('canvas');
  const particlesContainer = document.getElementById('particles');
  
  if (!particlesContainer) return;

  canvas.classList.add('hero-particles-canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;';
  particlesContainer.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  let isVisible = true;

  // Configuration
  const config = {
    particleCount: 40,
    color: '34, 197, 94', // #22c55e in RGB
    maxDistance: 120,
    speed: 0.3
  };

  // Resize canvas
  const resizeCanvas = () => {
    const rect = particlesContainer.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  };

  window.addEventListener('resize', window.debounce(resizeCanvas, 250));
  resizeCanvas();

  // Particle Class
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * config.speed;
      this.vy = (Math.random() - 0.5) * config.speed;
      this.radius = Math.random() * 1.5 + 0.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${config.color}, 0.5)`;
      ctx.fill();
    }
  }

  // Initialize particles
  const initParticles = () => {
    particles = [];
    const count = window.innerWidth < 768 ? config.particleCount / 2 : config.particleCount;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  };

  // Draw connecting lines
  const drawLines = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.maxDistance) {
          const opacity = 1 - (distance / config.maxDistance);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${config.color}, ${opacity * 0.2})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  };

  // Animation Loop
  const animate = () => {
    if (!isVisible) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    drawLines();
    animationId = requestAnimationFrame(animate);
  };

  // Pause animation when hero is not visible (Performance optimization)
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationId) {
          animate();
        }
      });
    }, { threshold: 0.1 });
    
    heroObserver.observe(heroSection);
  }

  // Start
  initParticles();
  animate();

})();