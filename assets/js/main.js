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

// ===== Scroll reveal =====
const revealItems = document.querySelectorAll('.reveal');
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
  const propertyType = data.get('propertyType');
  const message = data.get('message');

  const subject = encodeURIComponent(`Facility Management Quote Request — ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nPhone: ${phone}\nProperty Type: ${propertyType}\n\nMessage:\n${message}`
  );

  window.location.href = `mailto:gerald.ukor@gmail.com?subject=${subject}&body=${body}`;

  formNote.textContent = 'Opening your email client to send this request...';
  formNote.classList.add('is-success');
  contactForm.reset();
});
