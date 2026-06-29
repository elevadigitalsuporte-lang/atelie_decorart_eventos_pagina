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

    /* ── 4. DYNAMIC GALLERY WITH LIKES SYSTEM ────────────── */
    const GALLERY_IMAGES = [
        // Fotos profissionais
        "DSC06941-275.jpg", "DSC07065-327.jpg", "DSC07293-501.jpg", "DSC07301-510.jpg",
        "DSC07310-519.jpg", "DSC07913-774.jpg", "DSC08507-978.jpg", "DSC08508-979.jpg",
        "DSC08509-980.jpg", "DSC08511-981.jpg", "DSC08513-982.jpg", "DSC08555-998.jpg",
        "DSC08571-1007.jpg", "DSC09773-496.jpg",
        // Novas fotos
        "WhatsApp Image 2026-06-24 at 18.25.43.jpeg",
        "WhatsApp Image 2026-06-24 at 18.25.44 (2).jpeg",
        "WhatsApp Image 2026-06-24 at 18.25.44.jpeg",
        "WhatsApp Image 2026-06-24 at 18.25.45 (1).jpeg",
        "WhatsApp Image 2026-06-24 at 18.25.45.jpeg",
        "WhatsApp Image 2026-06-24 at 18.25.48.jpeg",
        "WhatsApp Image 2026-06-24 at 18.25.49 (1).jpeg",
        "WhatsApp Image 2026-06-24 at 18.25.50 (2).jpeg",
        "WhatsApp Image 2026-06-24 at 18.25.50.jpeg",
        "WhatsApp Image 2026-06-24 at 18.25.58 (1).jpeg",
        "WhatsApp Image 2026-06-24 at 18.25.58.jpeg",
        "WhatsApp Image 2026-06-24 at 18.25.59.jpeg",
        "WhatsApp Image 2026-06-24 at 18.26.00 (1).jpeg",
        "WhatsApp Image 2026-06-24 at 18.26.00 (3).jpeg",
        "WhatsApp Image 2026-06-24 at 18.26.00.jpeg",
        "WhatsApp Image 2026-06-24 at 18.26.01 (1).jpeg",
        "WhatsApp Image 2026-06-24 at 18.26.01 (3).jpeg",
        "WhatsApp Image 2026-06-24 at 18.26.01.jpeg",
        "WhatsApp Image 2026-06-24 at 18.26.02.jpeg",
        "WhatsApp Image 2026-06-24 at 18.26.05 (2).jpeg",
        "WhatsApp Image 2026-06-24 at 18.26.05 (3).jpeg",
        "WhatsApp Image 2026-06-24 at 18.26.06 (1).jpeg",
        "WhatsApp Image 2026-06-24 at 18.26.06 (2).jpeg",
        "WhatsApp Image 2026-06-24 at 18.26.07 (2).jpeg",
        "WhatsApp Image 2026-06-24 at 18.26.08.jpeg"
    ];

    const masonryGrid = document.getElementById('masonry-grid');
    const loadMoreBtn = document.getElementById('btn-load-more');
    const loadMoreContainer = document.getElementById('gallery-load-more-container');
    let likedImages = JSON.parse(localStorage.getItem('decorart_liked_images')) || {};

    const ITEMS_PER_PAGE = 10;
    let renderedCount = 0;

    // Geração de curtidas iniciais persistentes baseadas no nome do arquivo
    function getStableLikes(filename) {
        let hash = 0;
        for (let i = 0; i < filename.length; i++) {
            hash = filename.charCodeAt(i) + ((hash << 5) - hash);
        }
        return 45 + Math.abs(hash % 145); // Entre 45 e 189 curtidas estáveis
    }

    function toggleLike(filename) {
        if (likedImages[filename]) {
            delete likedImages[filename];
        } else {
            likedImages[filename] = true;
        }
        localStorage.setItem('decorart_liked_images', JSON.stringify(likedImages));
        updateLikeUI(filename);
    }

    function updateLikeUI(filename) {
        const isLiked = !!likedImages[filename];
        const baseLikes = getStableLikes(filename);
        const totalLikes = baseLikes + (isLiked ? 1 : 0);

        // Atualiza o botão no card da galeria
        const cardBtn = document.querySelector(`.like-btn[data-filename="${filename}"]`);
        if (cardBtn) {
            cardBtn.classList.toggle('liked', isLiked);
            const icon = cardBtn.querySelector('i');
            if (icon) {
                icon.className = isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            }
            const countSpan = cardBtn.querySelector('.like-count');
            if (countSpan) countSpan.textContent = totalLikes;
        }

        // Atualiza o botão no Lightbox se for a imagem ativa
        if (lightbox && lightbox.classList.contains('open') && activeFilename === filename) {
            const lbBtn = document.getElementById('lightbox-like-btn');
            if (lbBtn) {
                lbBtn.classList.toggle('liked', isLiked);
                const lbIcon = lbBtn.querySelector('i');
                if (lbIcon) {
                    lbIcon.className = isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
                }
                const lbCountSpan = lbBtn.querySelector('.lightbox-like-count');
                if (lbCountSpan) lbCountSpan.textContent = totalLikes;
            }
        }
    }

    // Renderização parcial dos cards da galeria
    function renderGalleryItems(start, count) {
        const end = Math.min(start + count, GALLERY_IMAGES.length);
        for (let i = start; i < end; i++) {
            const filename = GALLERY_IMAGES[i];
            const sizeClass = (i % 3 === 0) ? 'tall' : (i % 7 === 0) ? 'wide' : '';
            const baseLikes = getStableLikes(filename);
            const isLiked = !!likedImages[filename];
            const totalLikes = baseLikes + (isLiked ? 1 : 0);
            const heartClass = isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            const likedBtnClass = isLiked ? 'gallery-action-btn like-btn liked' : 'gallery-action-btn like-btn';

            const item = document.createElement('div');
            item.className = `masonry-item ${sizeClass}`;
            item.dataset.index = i;
            item.dataset.filename = filename;
            item.innerHTML = `
                <img src="public/images/${filename}" alt="Decoração de Casamento de Alto Padrão - Ateliê Decorart" loading="lazy">
                <div class="masonry-overlay">
                    <span>Casamento</span>
                    <div class="gallery-actions">
                        <button class="${likedBtnClass}" data-filename="${filename}" title="Curtir foto">
                            <i class="${heartClass}"></i>
                            <span class="like-count">${totalLikes}</span>
                        </button>
                        <button class="gallery-action-btn zoom-btn" title="Ampliar foto">
                            <i class="fa-solid fa-expand"></i>
                        </button>
                    </div>
                </div>
            `;

            // Clique na imagem (abre o lightbox)
            item.addEventListener('click', (e) => {
                if (e.target.closest('.like-btn')) return;
                openLightbox(i);
            });

            // Clique no botão de curtidas
            const likeBtn = item.querySelector('.like-btn');
            likeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleLike(filename);
            });

            masonryGrid.appendChild(item);
        }
        renderedCount = end;

        // Se renderizou todas as fotos, remove/esconde o botão
        if (renderedCount >= GALLERY_IMAGES.length) {
            if (loadMoreContainer) {
                loadMoreContainer.style.display = 'none';
            }
        }
    }

    if (masonryGrid) {
        masonryGrid.innerHTML = '';
        renderGalleryItems(0, ITEMS_PER_PAGE);

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                // Carrega todas as fotos restantes
                renderGalleryItems(renderedCount, GALLERY_IMAGES.length - renderedCount);
            });
        }
    }

    /* ── 5. LIGHTBOX ────────────────────────────────────── */
    const lightbox     = document.getElementById('lightbox');
    const lightboxImg  = document.getElementById('lightbox-img');
    const lightboxCap  = document.getElementById('lightbox-caption');
    const lbClose      = document.getElementById('lightbox-close');
    const lbPrev       = document.getElementById('lightbox-prev');
    const lbNext       = document.getElementById('lightbox-next');
    const lbLikeBtn    = document.getElementById('lightbox-like-btn');

    let activeIndex    = 0;
    let activeFilename = '';

    function openLightbox(index) {
        activeIndex  = index;
        activeFilename = GALLERY_IMAGES[activeIndex];
        lightboxImg.src = `public/images/${activeFilename}`;
        lightboxImg.alt = "Casamento de Alto Padrão - Ateliê Decorart";
        if (lightboxCap) lightboxCap.textContent = "Casamento - Ateliê Decorart";
        
        updateLikeUI(activeFilename);
        
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(() => { lightboxImg.src = ''; }, 400);
    }

    function navigateLightbox(dir) {
        activeIndex = (activeIndex + dir + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
        activeFilename = GALLERY_IMAGES[activeIndex];
        
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = `translateX(${dir > 0 ? '15px' : '-15px'})`;
        
        setTimeout(() => {
            lightboxImg.src = `public/images/${activeFilename}`;
            if (lightboxCap) lightboxCap.textContent = "Casamento - Ateliê Decorart";
            updateLikeUI(activeFilename);
            lightboxImg.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            lightboxImg.style.opacity   = '1';
            lightboxImg.style.transform = 'translateX(0)';
        }, 250);
    }

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    }
    if (lbPrev) lbPrev.addEventListener('click', () => navigateLightbox(-1));
    if (lbNext) lbNext.addEventListener('click', () => navigateLightbox(1));
    if (lbLikeBtn) {
        lbLikeBtn.addEventListener('click', () => {
            toggleLike(activeFilename);
        });
    }

    document.addEventListener('keydown', e => {
        if (!lightbox || !lightbox.classList.contains('open')) return;
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
