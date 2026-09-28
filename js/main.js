/**
 * HAVALANDIRMA USTASI NURETTİN BIÇAK
 * Ana JavaScript Dosyası (js/main.js)
 * Dinamik Hava Akımı Canvas'ı, Animasyonlu Sayaçlar, Keşif Hesaplayıcı ve Galeri
 */

document.addEventListener('DOMContentLoaded', () => {
  initAirflowCanvas();
  initHeaderScroll();
  initMobileMenu();
  initScrollReveal();
  initStatCounters();
  initQuoteCalculator();
  initLightbox();
  initSmoothScroll();
});

/* ==========================================================================
   1. Dinamik Hava Akımı (Air-flow / Wind) Parçacık Simülasyonu
   ========================================================================== */
function initAirflowCanvas() {
  const canvas = document.getElementById('airflow-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Parçacık & Rüzgar Akımı Yapılandırması
  const particleCount = window.innerWidth < 768 ? 35 : 70;
  const particles = [];

  class AirParticle {
    constructor() {
      this.reset();
      this.x = Math.random() * width;
    }

    reset() {
      this.x = -20;
      this.y = Math.random() * height;
      this.length = Math.random() * 80 + 30; // Hava akım çizgisi uzunluğu
      this.speed = Math.random() * 2.5 + 1.2;
      this.amplitude = Math.random() * 15 + 5; // Dalgalanma boyu
      this.frequency = Math.random() * 0.01 + 0.005;
      this.phase = Math.random() * Math.PI * 2;
      this.alpha = Math.random() * 0.45 + 0.15;
      this.thickness = Math.random() * 1.6 + 0.6;
      // Cyan, Gökyüzü Mavisi ve Sarı/Altın esintileri
      const colors = ['#38bdf8', '#0284c7', '#7dd3fc', '#f59e0b'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.speed;
      this.phase += this.frequency;
      this.y += Math.sin(this.phase) * 0.5;

      if (this.x - this.length > width) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      const grad = ctx.createLinearGradient(
        this.x - this.length,
        this.y,
        this.x,
        this.y
      );
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.7, this.color);
      grad.addColorStop(1, '#ffffff');

      ctx.strokeStyle = grad;
      ctx.lineWidth = this.thickness;
      ctx.lineCap = 'round';
      ctx.globalAlpha = this.alpha;

      // Akış çizgisi eğrisi
      ctx.moveTo(this.x - this.length, this.y);
      ctx.quadraticCurveTo(
        this.x - this.length / 2,
        this.y + Math.sin(this.phase) * this.amplitude,
        this.x,
        this.y
      );
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new AirParticle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    requestAnimationFrame(animate);
  }

  animate();

  // Pencere Boyutu Değişimi
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}

/* ==========================================================================
   2. Header Scroll & Navbar Gölgesi
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   3. Mobil Menü Aç/Kapa
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle-btn');
  const navLinks = document.querySelector('.nav-links');
  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      if (navLinks.classList.contains('open')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    }
  });

  // Menüdeki bağlantıya tıklanınca menüyü kapat
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });
  });
}

/* ==========================================================================
   4. Scroll Reveal (Sayfa Kaydırıldıkça Yumuşak Belirme)
   ========================================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  reveals.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   5. Animasyonlu İstatistik Sayaçları (0'dan Hedefe Yükselme)
   ========================================================================== */
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-count');
  if (!statNumbers.length) return;

  let started = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          statNumbers.forEach((counter) => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Yumuşak geçiş (easeOutQuad)
              const easeProgress = 1 - (1 - progress) * (1 - progress);
              const currentVal = Math.floor(easeProgress * target);

              counter.textContent = currentVal;

              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                counter.textContent = target;
              }
            }

            requestAnimationFrame(updateCounter);
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  const statsSection = document.querySelector('.stats-banner');
  if (statsSection) {
    observer.observe(statsSection);
  }
}

/* ==========================================================================
   6. İnteraktif Keşif & Fiyat Teklif Hesaplayıcı
   ========================================================================== */
function initQuoteCalculator() {
  const spaceSelect = document.getElementById('calc-space');
  const serviceSelect = document.getElementById('calc-service');
  const areaInput = document.getElementById('calc-area');
  const sendBtn = document.getElementById('calc-send-btn');
  const summaryBox = document.getElementById('calc-summary-text');

  if (!spaceSelect || !serviceSelect || !areaInput || !sendBtn) return;

  function updateEstimate() {
    const space = spaceSelect.options[spaceSelect.selectedIndex].text;
    const service = serviceSelect.options[serviceSelect.selectedIndex].text;
    const area = areaInput.value || 100;

    if (summaryBox) {
      summaryBox.innerHTML = `<strong>${space}</strong> için <strong>${service}</strong> (Yaklaşık <strong>${area} m²</strong>) talebiniz için keşif ve teklif mesajınız hazırlandı.`;
    }

    // WhatsApp Mesaj Metni Oluşturma
    const phone = '905342936287';
    const message = `Merhaba Nurettin Usta, Diyarbakır / Ergani bölgesinde yer alan ${space} mekanım (${area} m²) için ${service} havalandırma keşfi ve fiyatı almak istiyorum. Uygun olduğunuzda detayları görüşebilir miyiz?`;
    const encoded = encodeURIComponent(message);
    sendBtn.href = `https://wa.me/${phone}?text=${encoded}`;
  }

  spaceSelect.addEventListener('change', updateEstimate);
  serviceSelect.addEventListener('change', updateEstimate);
  areaInput.addEventListener('input', updateEstimate);

  // İlk çalıştırma
  updateEstimate();
}

/* ==========================================================================
   7. Galeri Görsel Büyütme (Lightbox Modal)
   ========================================================================== */
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');
  const galleryItems = document.querySelectorAll('.gallery-card, .mosaic-img-box');

  if (!modal || !modalImg) return;

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        modalImg.src = img.src;
        modalImg.alt = img.alt || 'Havalandırma Ustası Nurettin Bıçak';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   8. Pürüzsüz Sayfa İçi Kaydırma (Smooth Scroll)
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    });
  });
}
