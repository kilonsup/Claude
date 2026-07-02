const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const navbar = document.getElementById('navbar');

navToggle.addEventListener('click', () => {
  const isOpen = navbar.classList.toggle('is-menu-open');
  navToggle.classList.toggle('is-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.navbar__links a').forEach((link) => {
  link.addEventListener('click', () => {
    navbar.classList.remove('is-menu-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== Scroll reveal (fades/slides + image wipe reveals share one observer) =====
const revealItems = document.querySelectorAll('.reveal, .img-reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);
revealItems.forEach((item) => revealObserver.observe(item));

// ===== Animated stat counters =====
const statNums = document.querySelectorAll('.stat__num');
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const isDecimal = String(target).includes('.');
      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = isDecimal ? value.toFixed(1) : Math.round(value);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);
statNums.forEach((el) => statObserver.observe(el));

// ===== Navbar background on scroll =====
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 20 ? '0 4px 20px rgba(0,0,0,0.15)' : 'none';
});

// ===== Contact form (mailto handoff — no backend attached) =====
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  const data = new FormData(contactForm);
  const name = data.get('name');
  const phone = data.get('phone');
  const inquiryType = data.get('inquiryType');
  const message = data.get('message');

  const subject = encodeURIComponent(`${inquiryType} — ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nContact: ${phone}\nInquiry Type: ${inquiryType}\n\nMessage:\n${message}`
  );

  window.location.href = `mailto:gerald.ukor@gmail.com?subject=${subject}&body=${body}`;

  formNote.textContent = 'Opening your email client to send this request...';
  formNote.classList.add('is-success');
  contactForm.reset();
});

// ===== Hero headline word-split reveal =====
const heroHeadline = document.getElementById('heroHeadline');
if (heroHeadline) {
  const words = heroHeadline.textContent.trim().split(/\s+/);
  heroHeadline.innerHTML = words
    .map((word) => `<span class="word"><span>${word}</span></span>`)
    .join(' ');

  heroHeadline.querySelectorAll('.word span').forEach((span, i) => {
    span.style.transitionDelay = prefersReducedMotion ? '0s' : `${0.35 + i * 0.045}s`;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => heroHeadline.classList.add('is-split'));
  });
}

// ===== Scroll progress bar =====
const scrollProgress = document.getElementById('scrollProgress');
function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  scrollProgress.style.width = `${Math.min(pct, 100)}%`;
}

// ===== Parallax on data-parallax elements =====
const parallaxItems = Array.from(document.querySelectorAll('[data-parallax]'));
function updateParallax() {
  const viewportCenter = window.innerHeight / 2;
  parallaxItems.forEach((el) => {
    const factor = parseFloat(el.dataset.parallax) || 0.1;
    const rect = el.getBoundingClientRect();
    const elCenter = rect.top + rect.height / 2;
    const offset = (elCenter - viewportCenter) * factor * -1;
    el.style.transform = `translateY(${offset}px)`;
  });
}

let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateScrollProgress();
      if (!prefersReducedMotion) updateParallax();
      ticking = false;
    });
    ticking = true;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
updateScrollProgress();
if (!prefersReducedMotion) updateParallax();

// ===== Hero cursor-follow glow =====
const heroSection = document.querySelector('.hero');
const heroGlow = document.getElementById('heroGlow');
if (heroSection && heroGlow && !prefersReducedMotion) {
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    heroGlow.style.setProperty('--x', `${x}%`);
    heroGlow.style.setProperty('--y', `${y}%`);
  });
}

// ===== Magnetic buttons =====
if (!prefersReducedMotion) {
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}
