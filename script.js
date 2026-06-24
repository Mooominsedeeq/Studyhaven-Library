/* ═══════════════════════════════════════════════════════════
   STUDY HAVEN – PREMIUM JAVASCRIPT
   Author: Study Haven Interactive
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════
   1. UTILITY HELPERS
═══════════════════════════════════════════ */
const $ = (selector, ctx = document) => ctx.querySelector(selector);
const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];
const on = (el, event, handler, opts) => el && el.addEventListener(event, handler, opts);

/* ═══════════════════════════════════════════
   2. LOADING SCREEN
═══════════════════════════════════════════ */
(function initLoader() {
  const loader = $('#loader');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
    }, 2600);
  });

  document.body.style.overflow = 'hidden';
})();

/* ═══════════════════════════════════════════
   3. CUSTOM CURSOR
═══════════════════════════════════════════ */
(function initCursor() {
  const cursor = $('#cursor');
  const follower = $('#cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Cursor effects on interactive elements
  $$('a, button, .filter-btn, .service-card, .resource-card, .pricing-card, .faq-question, .gallery-placeholder').forEach(el => {
    on(el, 'mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(2)';
      follower.style.width = '60px';
      follower.style.height = '60px';
      follower.style.opacity = '0.4';
    });
    on(el, 'mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      follower.style.width = '36px';
      follower.style.height = '36px';
      follower.style.opacity = '0.6';
    });
  });
})();

/* ═══════════════════════════════════════════
   4. SCROLL PROGRESS INDICATOR
═══════════════════════════════════════════ */
(function initScrollProgress() {
  const bar = $('#scroll-progress');
  if (!bar) return;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(progress, 100)}%`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();

/* ═══════════════════════════════════════════
   5. NAVBAR – SCROLL & MOBILE MENU
═══════════════════════════════════════════ */
(function initNavbar() {
  const navbar = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks = $('#nav-links');
  const navLinkItems = $$('.nav-link');

  // Scroll effect
  function onScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle
  if (hamburger && navLinks) {
    on(hamburger, 'click', () => {
      const isOpen = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen.toString());
    });
  }

  // Close menu on link click
  navLinkItems.forEach(link => {
    on(link, 'click', () => {
      hamburger && hamburger.classList.remove('open');
      navLinks && navLinks.classList.remove('open');
      hamburger && hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Active nav link on scroll
  const sections = $$('section[id]');

  function updateActiveLink() {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinkItems.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();

/* ═══════════════════════════════════════════
   6. DARK / LIGHT THEME TOGGLE
═══════════════════════════════════════════ */
(function initTheme() {
  const toggleBtn = $('#theme-toggle');
  const icon = $('#theme-icon');
  const html = document.documentElement;

  // Check saved preference
  const saved = localStorage.getItem('sh-theme') || 'dark';
  html.setAttribute('data-theme', saved);
  updateIcon(saved);

  on(toggleBtn, 'click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('sh-theme', next);
    updateIcon(next);
  });

  function updateIcon(theme) {
    if (!icon) return;
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
})();

/* ═══════════════════════════════════════════
   7. PARTICLE BACKGROUND (CANVAS)
═══════════════════════════════════════════ */
(function initParticles() {
  const canvas = $('#particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let animFrame;
  let W, H;

  const CONFIG = {
    count: 70,
    maxRadius: 2.5,
    minRadius: 0.5,
    speed: 0.25,
    connectionDistance: 130,
    colors: ['#6c63ff', '#a855f7', '#8b85ff', '#c084fc'],
    opacity: 0.5,
  };

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius);
      this.vx = (Math.random() - 0.5) * CONFIG.speed;
      this.vy = (Math.random() - 0.5) * CONFIG.speed;
      this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      this.opacity = 0.3 + Math.random() * 0.4;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function init() {
    particles = [];
    for (let i = 0; i < CONFIG.count; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectionDistance) {
          const opacity = (1 - dist / CONFIG.connectionDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108, 99, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animFrame = requestAnimationFrame(animate);
  }

  const resizeObserver = new ResizeObserver(() => {
    resize();
    init();
  });
  resizeObserver.observe(canvas.parentElement);

  resize();
  init();
  animate();
})();

/* ═══════════════════════════════════════════
   8. SCROLL REVEAL ANIMATIONS
═══════════════════════════════════════════ */
(function initScrollReveal() {
  const reveals = $$('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
  });

  reveals.forEach(el => observer.observe(el));
})();

/* ═══════════════════════════════════════════
   9. ANIMATED COUNTERS
═══════════════════════════════════════════ */
(function initCounters() {
  const counters = $$('.counter');

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));

  // Hero stats (different elements)
  const heroNums = $$('.hero-stat-num');
  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        const target = parseInt(entry.target.dataset.count, 10);
        const duration = 1800;
        const startTime = performance.now();
        function update(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          entry.target.textContent = Math.floor(eased * target).toLocaleString();
          if (progress < 1) requestAnimationFrame(update);
          else entry.target.textContent = target.toLocaleString();
        }
        requestAnimationFrame(update);
      }
    });
  }, { threshold: 0.5 });

  heroNums.forEach(el => heroObserver.observe(el));
})();

/* ═══════════════════════════════════════════
   10. RESOURCE CATEGORY FILTER
═══════════════════════════════════════════ */
(function initResourceFilter() {
  const filterBtns = $$('.filter-btn');
  const cards = $$('.resource-card');

  filterBtns.forEach(btn => {
    on(btn, 'click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter cards with animation
      cards.forEach((card, i) => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter;

        if (show) {
          card.classList.remove('hidden');
          card.style.animationDelay = `${i * 0.05}s`;
          card.style.animation = 'fadeInScale 0.4s ease forwards';
        } else {
          card.classList.add('hidden');
          card.style.animation = '';
        }
      });
    });
  });

  // Add fadeInScale to CSS dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInScale {
      from { opacity: 0; transform: scale(0.92) translateY(16px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();

/* ═══════════════════════════════════════════
   11. TESTIMONIAL CAROUSEL
═══════════════════════════════════════════ */
(function initCarousel() {
  const track = $('#testimonial-track');
  const dotsContainer = $('#testimonial-dots');
  const prevBtn = $('#prev-testimonial');
  const nextBtn = $('#next-testimonial');
  if (!track || !dotsContainer) return;

  const cards = $$('.testimonial-card', track);
  const total = cards.length;
  let current = 0;
  let autoTimer;
  let cardWidth = 0;
  let gap = 24;

  function getCardWidth() {
    const card = cards[0];
    if (!card) return 380;
    return card.offsetWidth + gap;
  }

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    on(dot, 'click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function updateDots() {
    $$('.testimonial-dot', dotsContainer).forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-selected', active.toString());
    });
  }

  function goTo(index) {
    current = (index + total) % total;
    cardWidth = getCardWidth();
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    updateDots();
    resetAuto();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  on(nextBtn, 'click', next);
  on(prevBtn, 'click', prev);

  function startAuto() {
    autoTimer = setInterval(next, 4500);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  startAuto();

  // Pause on hover
  track.parentElement && on(track.parentElement, 'mouseenter', () => clearInterval(autoTimer));
  track.parentElement && on(track.parentElement, 'mouseleave', startAuto);

  // Touch/swipe support
  let touchStartX = 0;
  on(track, 'touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  on(track, 'touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  });

  // Update on resize
  window.addEventListener('resize', () => {
    cardWidth = getCardWidth();
    track.style.transition = 'none';
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    setTimeout(() => { track.style.transition = ''; }, 100);
  }, { passive: true });
})();

/* ═══════════════════════════════════════════
   12. FAQ ACCORDION
═══════════════════════════════════════════ */
(function initFAQ() {
  const items = $$('.faq-item');

  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    on(question, 'click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      items.forEach(i => {
        i.classList.remove('open');
        const q = i.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* ═══════════════════════════════════════════
   13. BILLING TOGGLE (YEARLY / MONTHLY)
═══════════════════════════════════════════ */
(function initBillingToggle() {
  const toggle = $('#billing-toggle');
  const amounts = $$('.monthly-price');

  const monthlyPrices = [499, 999, 1499];
  const yearlyPrices = [
    Math.floor(499 * 12 * 0.8 / 12),  // 399
    Math.floor(999 * 12 * 0.8 / 12),  // 799
    Math.floor(1499 * 12 * 0.8 / 12), // 1199
  ];

  on(toggle, 'change', () => {
    const isYearly = toggle.checked;
    amounts.forEach((el, i) => {
      el.style.transition = 'all 0.3s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        el.textContent = isYearly ? yearlyPrices[i] : monthlyPrices[i];
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 200);
    });
  });
})();

/* ═══════════════════════════════════════════
   14. CONTACT FORM SUBMISSION
═══════════════════════════════════════════ */
(function initContactForm() {
  const form = $('#contact-form');
  const successMsg = $('#form-success');
  const submitBtn = $('#submit-btn');
  if (!form) return;

  on(form, 'submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name = $('#name');
    const email = $('#email');
    const message = $('#message');
    const subject = $('#subject');
    let valid = true;

    [name, email, message, subject].forEach(field => {
      if (!field || !field.value.trim()) {
        field && field.style.setProperty('border-color', '#f87171');
        valid = false;
      } else {
        field.style.setProperty('border-color', '');
      }
    });

    if (!valid) return;

    // Simulate sending
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      submitBtn.disabled = false;
      if (successMsg) {
        successMsg.classList.add('show');
        setTimeout(() => successMsg.classList.remove('show'), 5000);
      }
    }, 1800);
  });
})();

/* ═══════════════════════════════════════════
   15. NEWSLETTER FORM
═══════════════════════════════════════════ */
(function initNewsletter() {
  const form = $('#newsletter-form');
  if (!form) return;

  on(form, 'submit', (e) => {
    e.preventDefault();
    const input = $('#newsletter-email');
    if (!input || !input.value.includes('@')) {
      input && input.style.setProperty('border-color', '#f87171');
      return;
    }
    const btn = form.querySelector('button');
    if (btn) {
      btn.innerHTML = '<i class="fas fa-check"></i>';
      btn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
      input.value = '';
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-arrow-right"></i>';
        btn.style.background = '';
      }, 3000);
    }
  });
})();

/* ═══════════════════════════════════════════
   16. BACK TO TOP BUTTON
═══════════════════════════════════════════ */
(function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  on(btn, 'click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ═══════════════════════════════════════════
   17. FOOTER COPYRIGHT YEAR
═══════════════════════════════════════════ */
(function setYear() {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

/* ═══════════════════════════════════════════
   18. SMOOTH SCROLL FOR ANCHOR LINKS
═══════════════════════════════════════════ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    on(link, 'click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = $(href);
      if (!target) return;

      e.preventDefault();
      const navHeight = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ═══════════════════════════════════════════
   19. GALLERY LIGHTBOX (Simple overlay)
═══════════════════════════════════════════ */
(function initGallery() {
  const items = $$('.masonry-item');
  if (!items.length) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'gallery-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.9);
    z-index: 9999; display: none; align-items: center; justify-content: center;
    cursor: pointer; backdrop-filter: blur(12px);
    animation: fadeIn 0.3s ease;
  `;

  const overlayInner = document.createElement('div');
  overlayInner.style.cssText = `
    text-align: center; padding: 40px; color: white;
    max-width: 600px;
  `;
  overlayInner.innerHTML = `
    <div id="overlay-icon" style="font-size: 80px; margin-bottom: 24px; opacity: 0.9;"></div>
    <h3 id="overlay-title" style="font-family: Outfit, sans-serif; font-size: 1.8rem; font-weight: 800; margin-bottom: 12px;"></h3>
    <p style="color: rgba(255,255,255,0.6); font-size: 14px;">Click anywhere to close</p>
  `;
  overlay.appendChild(overlayInner);
  document.body.appendChild(overlay);

  items.forEach(item => {
    on(item, 'click', () => {
      const placeholder = item.querySelector('.gallery-placeholder');
      const overlayLabel = item.querySelector('.gallery-overlay span');
      if (!placeholder) return;

      const icon = placeholder.querySelector('i');
      const overlayTitle = $('#overlay-title');
      const overlayIconEl = $('#overlay-icon');

      if (overlayTitle && overlayLabel) overlayTitle.textContent = overlayLabel.textContent;
      if (overlayIconEl && icon) {
        overlayIconEl.innerHTML = icon.outerHTML;
        overlayIconEl.firstChild.style.fontSize = '80px';
        overlayIconEl.firstChild.style.opacity = '0.9';
      }

      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  on(overlay, 'click', () => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  });
})();

/* ═══════════════════════════════════════════
   20. HERO CARD TILT EFFECT
═══════════════════════════════════════════ */
(function initTilt() {
  const cards = $$('.service-card, .pricing-card, .why-card');

  cards.forEach(card => {
    on(card, 'mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const tiltX = ((y - cy) / cy) * 5;
      const tiltY = ((cx - x) / cx) * 5;
      card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
    });

    on(card, 'mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ═══════════════════════════════════════════
   21. MAGNETIC BUTTONS
═══════════════════════════════════════════ */
(function initMagnetic() {
  const btns = $$('.btn-primary, .btn-outline');

  btns.forEach(btn => {
    on(btn, 'mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) translateY(-2px)`;
    });

    on(btn, 'mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ═══════════════════════════════════════════
   22. TYPING ANIMATION FOR HERO SUBTITLE
═══════════════════════════════════════════ */
(function initTyping() {
  const el = document.querySelector('.hero-subtitle');
  if (!el) return;

  const text = el.textContent.trim();
  el.textContent = '';
  el.style.borderRight = '2px solid var(--primary)';

  let i = 0;
  function type() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, 55);
    } else {
      setTimeout(() => {
        el.style.borderRight = 'none';
      }, 800);
    }
  }

  // Start typing after loader
  setTimeout(type, 2800);
})();

/* ═══════════════════════════════════════════
   23. SECTION ENTRANCE STAGGER
═══════════════════════════════════════════ */
(function initStaggerEntrance() {
  function staggerChildren(parentSelector, childSelector, delayStep = 0.1) {
    const parents = $$(parentSelector);
    parents.forEach(parent => {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          $$(childSelector, parent).forEach((child, i) => {
            child.style.transitionDelay = `${i * delayStep}s`;
            child.classList.add('visible');
          });
          observer.disconnect();
        }
      }, { threshold: 0.1 });
      observer.observe(parent);
    });
  }

  staggerChildren('.services-grid', '.service-card', 0.1);
  staggerChildren('.why-grid', '.why-card', 0.12);
  staggerChildren('.stats-grid', '.stat-card', 0.1);
  staggerChildren('.pricing-grid', '.pricing-card', 0.15);
})();

/* ═══════════════════════════════════════════
   24. INPUT RIPPLE EFFECT
═══════════════════════════════════════════ */
(function initInputEffects() {
  $$('.form-group input, .form-group textarea, .form-group select').forEach(input => {
    on(input, 'focus', () => {
      input.parentElement.style.setProperty('--focus-scale', '1');
    });
    on(input, 'blur', () => {
      if (!input.value) {
        input.style.borderColor = '';
      }
    });
  });
})();

/* ═══════════════════════════════════════════
   25. PERFORMANCE: LAZY LOAD IMAGES (if added)
═══════════════════════════════════════════ */
(function initLazyLoad() {
  if ('loading' in HTMLImageElement.prototype) return; // native lazy load
  const images = $$('img[loading="lazy"]');
  if (!images.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => observer.observe(img));
})();

/* ═══════════════════════════════════════════
   26. KEYBOARD ACCESSIBILITY
═══════════════════════════════════════════ */
(function initKeyboardNav() {
  // FAQ keyboard support
  $$('.faq-question').forEach(q => {
    on(q, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        q.click();
      }
    });
  });

  // Filter buttons
  $$('.filter-btn').forEach(btn => {
    on(btn, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
})();

/* ═══════════════════════════════════════════
   27. INIT LOG
═══════════════════════════════════════════ */
console.log(
  '%c📚 Study Haven %c– Premium Website\n%cBuilt with passion for every student.',
  'font-size: 20px; font-weight: bold; color: #6c63ff;',
  'font-size: 14px; color: #a855f7;',
  'font-size: 12px; color: #8892a4;'
);
