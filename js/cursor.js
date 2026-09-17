/* ============================================
   ABUNDIA.IO - Custom Cursor
   Interactive cursor with hover states
   ============================================ */

(function() {
  'use strict';

  // Only enable on devices with fine pointers (mouse/trackpad)
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  if (isTouchDevice) return;

  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  const body = document.body;

  if (!cursor || !follower) return;

  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;

  // Track mouse movement
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Direct update for the small cursor
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  // Smooth follower animation
  const animateFollower = () => {
    const dx = mouseX - followerX;
    const dy = mouseY - followerY;
    
    followerX += dx * 0.15;
    followerY += dy * 0.15;
    
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;
    
    requestAnimationFrame(animateFollower);
  };
  animateFollower();

  // Hover effects for interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .service-card, .project-card, .stat-card, .domain-card, .immuniweb-card, .feature-item, input, textarea, select');

  const addHoverState = () => body.classList.add('cursor-hover');
  const removeHoverState = () => body.classList.remove('cursor-hover');

  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', addHoverState);
    el.addEventListener('mouseleave', removeHoverState);
  });

  // Hide cursor when leaving the window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    follower.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    follower.style.opacity = '1';
  });

})();