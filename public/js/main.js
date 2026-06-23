/* =========================================================
   Ateliê Decorart Eventos — main.js v2.0
   Navbar · Reveal · Gallery Filter · Lightbox ·
   Testimonials Carousel · FAQ Accordion · Parallax
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* ── 1. NAVBAR SCROLL ───────────────────────────────── */
    const navbar   = document.getElementById('navbar');
    const navLinks = document.getElementById('nav-links');
    const navToggle = document.getElementById('nav-toggle');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    });

    /* Mobile menu toggle */
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            const isOpen = navLinks.classList.contains('open');
            navToggle.setAttribute('aria-expanded', isOpen);
        });
        /* Fecha ao clicar em um link */
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => navLinks.classList.remove('open'));
        });
    }

    /* ── 2. SMOOTH SCROLL ───────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navH = navbar.offsetHeight;
                const top  = target.getBoundingClientRect().top + window.scrollY - navH;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* ── 3. SCROLL REVEAL ───────────────────────────────── */
    const revealEls = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    /* ── 4. GALLERY FILTER ──────────────────────────────── */
    const filterBtns  = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.masonry-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            galleryItems.forEach(item => {
                const cat = item.dataset.category;
                const shouldShow = (filter === 'all' || cat === filter);

                if (shouldShow) {
                    item.classList.remove('hidden');
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(14px)';
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            item.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
                            item.style.opacity    = '1';
                            item.style.transform  = 'translateY(0)';
                        });
                    });
                } else {
                    item.style.transition = 'opacity 0.35s ease';
                    item.style.opacity    = '0';
                    setTimeout(() => item.classList.add('hidden'), 350);
                }
            });
        });
    });

    /* ── 5. LIGHTBOX ────────────────────────────────────── */
    const lightbox     = document.getElementById('lightbox');
    const lightboxImg  = document.getElementById('lightbox-img');
    const lightboxCap  = document.getElementById('lightbox-caption');
    const lbClose      = document.getElementById('lightbox-close');
    const lbPrev       = document.getElementById('lightbox-prev');
    const lbNext       = document.getElementById('lightbox-next');

    let activeIndex    = 0;
    let visibleItems   = [];

    function openLightbox(index) {
        visibleItems = [...document.querySelectorAll('.masonry-item:not(.hidden)')];
        activeIndex  = index;
        const item   = visibleItems[activeIndex];
        const img    = item.querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCap.textContent = item.querySelector('.masonry-overlay span')?.textContent || '';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(() => { lightboxImg.src = ''; }, 400);
    }

    function navigateLightbox(dir) {
        activeIndex = (activeIndex + dir + visibleItems.length) % visibleItems.length;
        const item  = visibleItems[activeIndex];
        const img   = item.querySelector('img');
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = `translateX(${dir > 0 ? '15px' : '-15px'})`;
        setTimeout(() => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCap.textContent = item.querySelector('.masonry-overlay span')?.textContent || '';
            lightboxImg.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            lightboxImg.style.opacity   = '1';
            lightboxImg.style.transform = 'translateX(0)';
        }, 250);
    }

    galleryItems.forEach((item, i) => {
        item.addEventListener('click', () => openLightbox(i));
    });

    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    lbPrev.addEventListener('click', () => navigateLightbox(-1));
    lbNext.addEventListener('click', () => navigateLightbox(1));

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape')    closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    /* ── 6. TESTIMONIALS CAROUSEL ───────────────────────── */
    const track    = document.getElementById('testimonials-track');
    const dotsWrap = document.getElementById('carousel-dots');
    const prevBtn  = document.getElementById('carousel-prev');
    const nextBtn  = document.getElementById('carousel-next');
    const cards    = track ? [...track.children] : [];

    let currentSlide = 0;
    let slidesPerView = window.innerWidth > 768 ? 2 : 1;
    let autoplayTimer = null;

    function buildDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = '';
        const totalSlides = Math.ceil(cards.length / slidesPerView);
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.id = `dot-${i}`;
            dot.addEventListener('click', () => goToSlide(i));
            dotsWrap.appendChild(dot);
        }
    }

    function goToSlide(index) {
        const totalSlides = Math.ceil(cards.length / slidesPerView);
        currentSlide = Math.max(0, Math.min(index, totalSlides - 1));

        const cardWidth = cards[0]?.offsetWidth || 0;
        const gap       = 24; // 1.5rem
        const offset    = currentSlide * (cardWidth + gap) * slidesPerView;

        if (track) track.style.transform = `translateX(-${offset}px)`;

        dotsWrap?.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
    }

    function nextSlide() {
        const totalSlides = Math.ceil(cards.length / slidesPerView);
        goToSlide((currentSlide + 1) % totalSlides);
    }
    function prevSlide() {
        const totalSlides = Math.ceil(cards.length / slidesPerView);
        goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
    }

    function startAutoplay() {
        clearInterval(autoplayTimer);
        autoplayTimer = setInterval(nextSlide, 5500);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoplay(); });

    /* Touch / swipe support */
    let touchStartX = 0;
    if (track) {
        track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        track.addEventListener('touchend',   e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) { diff > 0 ? nextSlide() : prevSlide(); startAutoplay(); }
        });
    }

    window.addEventListener('resize', () => {
        slidesPerView = window.innerWidth > 768 ? 2 : 1;
        buildDots();
        goToSlide(0);
    });

    buildDots();
    startAutoplay();

    /* ── 7. FAQ ACCORDION ───────────────────────────────── */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const btn    = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (!btn || !answer) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            /* Fecha todos */
            faqItems.forEach(i => {
                i.classList.remove('open');
                const a = i.querySelector('.faq-answer');
                if (a) a.classList.remove('open');
                const b = i.querySelector('.faq-question');
                if (b) b.setAttribute('aria-expanded', 'false');
            });

            /* Abre o clicado (se estava fechado) */
            if (!isOpen) {
                item.classList.add('open');
                answer.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ── 8. PARALLAX (Seção Sobre) ──────────────────────── */
    const parallaxWrap = document.getElementById('parallax-wrap');
    const parallaxImg  = document.getElementById('parallax-img');

    function applyParallax() {
        if (!parallaxWrap || !parallaxImg || window.innerWidth < 768) return;
        const rect   = parallaxWrap.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const viewH  = window.innerHeight;
        const ratio  = (center - viewH / 2) / viewH; /* -0.5 a 0.5 */
        const shift  = ratio * 50; /* px de deslocamento */
        parallaxImg.style.transform = `translateY(${shift}px)`;
    }

    window.addEventListener('scroll', applyParallax, { passive: true });
    applyParallax();

});
