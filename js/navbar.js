/* ============================================
   ABUNDIA.IO - Navigation Controller
   Scroll behavior, sticky states & mobile menu
   ============================================ */

(function() {
  'use strict';

  const navbar = document.getElementById('navbar');
  const toggleBtn = document.getElementById('navbar-toggle');
  const mobileMenu = document.getElementById('navbar-mobile-menu');
  const mobileLinks = document.querySelectorAll('.navbar-mobile-link');
  const body = document.body;

  if (!navbar) return;

  // 1. Scroll Behavior (Sticky & Glassmorphism)
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', window.throttle(handleScroll, 16), { passive: true });

  // 2. Mobile Menu Toggle
  const toggleMobileMenu = () => {
    const isOpen = mobileMenu.classList.contains('active');
    
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  const openMobileMenu = () => {
    mobileMenu.classList.add('active');
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden'; // Prevent background scroll
  };

  const closeMobileMenu = () => {
    mobileMenu.classList.remove('active');
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
  };

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', toggleMobileMenu);
  }

  // 3. Close mobile menu when a link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // 4. Close mobile menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // 5. Close mobile menu on resize to desktop
  window.addEventListener('resize', window.debounce(() => {
    if (window.innerWidth >= 1024 && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  }, 250));

})();