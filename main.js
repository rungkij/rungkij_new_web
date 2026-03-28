/* ============================================
   RUNGKIJ Website — Main JavaScript
   Smooth Animations · Video Slider · Mobile
   ============================================ */

// ============================================
// ---- PAGE LOAD TRANSITION ----
// ============================================
document.documentElement.classList.add('page-loading');

window.addEventListener('load', () => {
  // Slight delay so the first paint settles
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.documentElement.classList.remove('page-loading');
      document.documentElement.classList.add('page-loaded');
    }, 80);
  });

  // Trigger reveals already in viewport
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.98) {
      el.classList.add('visible');
    }
  });
});


// ============================================
// ---- NAVBAR SCROLL EFFECT ----
// ============================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;
let ticking = false;

window.addEventListener('scroll', () => {
  lastScroll = window.pageYOffset;
  if (!ticking) {
    requestAnimationFrame(() => {
      if (lastScroll > 60) {
        navbar.classList.add('scrolled');
      } else {
        if (!document.querySelector('.page-header')) {
          navbar.classList.remove('scrolled');
        }
      }
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });


// ============================================
// ---- MOBILE MENU TOGGLE ----
// ============================================
function toggleMenu() {
  const navMenu = document.getElementById('navMenu');
  const hamburger = document.getElementById('hamburger');
  const isOpen = navMenu.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.remove('open');
    document.getElementById('hamburger').classList.remove('active');
    document.body.style.overflow = '';
  });
});

// Close menu on backdrop click
document.addEventListener('click', (e) => {
  const navMenu = document.getElementById('navMenu');
  const hamburger = document.getElementById('hamburger');
  if (navMenu && navMenu.classList.contains('open')) {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      navMenu.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
});


// ============================================
// ---- VIDEO HERO SLIDER ----
// ============================================
const videoSlides = document.querySelectorAll('.hero-video-slide');
const navItems   = document.querySelectorAll('.slider-nav-item');
let currentVideoSlide = 0;
let videoSliderTimer  = null;
let preloadTimer      = null;
let isMuted           = true;
let isTransitioning   = false;
const SLIDE_DURATION  = 9000;   // 9 s visible time
const CROSSFADE_MS    = 2400;   // crossfade overlap

function initVideoSlider() {
  if (videoSlides.length === 0) return;

  // Set progress animation duration for slides 2+
  document.querySelectorAll('.slider-nav-fill').forEach(fill => {
    fill.style.animationDuration = SLIDE_DURATION + 'ms';
  });

  // Load & play first video
  const first = videoSlides[0].querySelector('video');
  if (first) {
    first.muted = true;
    first.currentTime = 0;
    first.play().catch(() => {});

    // ---- HSB: Slide up after 5 seconds of video playback ----
    var hsbRevealed = false;
    first.addEventListener('timeupdate', function hsbReveal() {
      if (!hsbRevealed && first.currentTime >= 5) {
        hsbRevealed = true;
        first.removeEventListener('timeupdate', hsbReveal);
        var hsb = document.querySelector('.hsb');
        if (hsb) hsb.classList.add('hsb--visible');
      }
    });
  }

  // Slide 0: wait for video to finish naturally (ended event handles it).
  // No fixed timer here — let the video play to completion.
  // Safety fallback: advance after 3 minutes max in case ended never fires.
  videoSliderTimer = setTimeout(nextVideoSlide, 180000);

  // Kick off first progress bar — animate over actual video duration once metadata loads
  if (navItems[0]) {
    const fill = navItems[0].querySelector('.slider-nav-fill');
    if (fill && first) {
      const setFillAnim = () => {
        const dur = (first.duration && isFinite(first.duration))
          ? first.duration * 1000
          : SLIDE_DURATION;
        fill.style.animation = `sliderProgress ${dur}ms linear forwards`;
      };
      if (first.readyState >= 1) {
        setFillAnim();
      } else {
        first.addEventListener('loadedmetadata', setFillAnim, { once: true });
      }
    }
  }
}

function startVideoSliderTimer() {
  clearTimeout(videoSliderTimer);
  clearTimeout(preloadTimer);

  // Lazy-inject <source> for next slide and start buffering ~3 s before it's due
  const nextIndex = (currentVideoSlide + 1) % videoSlides.length;
  preloadTimer = setTimeout(() => {
    const nextVid = videoSlides[nextIndex]?.querySelector('video');
    if (!nextVid) return;
    // Inject source from data-src if not yet loaded
    if (!nextVid.querySelector('source') && nextVid.dataset.src) {
      const src = document.createElement('source');
      src.src  = nextVid.dataset.src;
      src.type = 'video/mp4';
      nextVid.appendChild(src);
      nextVid.load();
    }
    nextVid.muted = true;
    nextVid.currentTime = 0;
    nextVid.play().catch(() => {});
    nextVid.pause();
  }, Math.max(0, SLIDE_DURATION - 3000));

  videoSliderTimer = setTimeout(nextVideoSlide, SLIDE_DURATION);
}

function goToVideoSlide(index) {
  if (videoSlides.length === 0) return;
  if (index === currentVideoSlide) return;
  if (isTransitioning) return;

  isTransitioning = true;

  const prevIndex = currentVideoSlide;
  currentVideoSlide = index;

  // Update nav bar
  if (navItems[prevIndex]) {
    navItems[prevIndex].classList.remove('active');
    const oldFill = navItems[prevIndex].querySelector('.slider-nav-fill');
    if (oldFill) {
      oldFill.style.animation = 'none';
      oldFill.offsetHeight;
      oldFill.style.width = '0%';
    }
  }
  if (navItems[index]) {
    navItems[index].classList.add('active');
    const newFill = navItems[index].querySelector('.slider-nav-fill');
    if (newFill) {
      newFill.style.animation = 'none';
      newFill.offsetHeight;
      newFill.style.animation = `sliderProgress ${SLIDE_DURATION}ms linear forwards`;
    }
  }

  // NEW slide enters (starts fading in via CSS .entering)
  videoSlides[index].classList.add('entering');

  // Ensure source injected, then play
  const newVideo = videoSlides[index].querySelector('video');
  if (newVideo) {
    if (!newVideo.querySelector('source') && newVideo.dataset.src) {
      const src = document.createElement('source');
      src.src  = newVideo.dataset.src;
      src.type = 'video/mp4';
      newVideo.appendChild(src);
      newVideo.load();
    }
    newVideo.currentTime = 0;
    newVideo.muted = isMuted;
    newVideo.play().catch(() => {});
  }

  // After one frame, flip .active so CSS crossfade kicks in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      videoSlides[prevIndex].classList.remove('active');
      videoSlides[prevIndex].classList.add('leaving');
      videoSlides[index].classList.remove('entering');
      videoSlides[index].classList.add('active');
    });
  });

  // Clean up old slide after crossfade completes
  setTimeout(() => {
    videoSlides[prevIndex].classList.remove('leaving');
    const oldVideo = videoSlides[prevIndex].querySelector('video');
    if (oldVideo) { oldVideo.pause(); oldVideo.currentTime = 0; }
    isTransitioning = false;
  }, CROSSFADE_MS + 100);

  startVideoSliderTimer();
}

function nextVideoSlide() {
  goToVideoSlide((currentVideoSlide + 1) % videoSlides.length);
}


// Auto-advance when video naturally ends (primary trigger for slide 0)
videoSlides.forEach((slide, i) => {
  const v = slide.querySelector('video');
  if (v) {
    v.addEventListener('ended', () => {
      if (i === currentVideoSlide) {
        clearTimeout(videoSliderTimer);   // cancel any running timer
        clearTimeout(preloadTimer);
        nextVideoSlide();
      }
    });
  }
});

if (videoSlides.length > 0) {
  window.addEventListener('load', initVideoSlider, { once: true });
}


// ============================================
// ---- SCROLL REVEAL with STAGGER ----
// ============================================
const revealElements = document.querySelectorAll('.reveal');

// Add stagger delay to sibling reveal elements
function addStaggerDelays() {
  const groups = {};
  revealElements.forEach(el => {
    const parent = el.parentElement;
    const key = parent ? parent.dataset.staggerId || (parent.dataset.staggerId = Math.random().toString(36).slice(2)) : 'root';
    groups[key] = groups[key] || [];
    groups[key].push(el);
  });
  Object.values(groups).forEach(siblings => {
    if (siblings.length > 1) {
      siblings.forEach((el, i) => {
        if (!el.style.transitionDelay) {
          el.style.transitionDelay = (i * 90) + 'ms';
        }
      });
    }
  });
}
addStaggerDelays();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.08,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));


// ============================================
// ---- SMOOTH SCROLL (anchor links) ----
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


// ============================================
// ---- COUNTER ANIMATION ----
// ============================================
function animateCounters() {
  document.querySelectorAll('.stat-number').forEach(counter => {
    const target = counter.getAttribute('data-target');
    if (!target) return;
    const end = parseInt(target);
    const duration = 1800;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.floor(eased * end).toLocaleString() + '+';
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

const statsSection = document.querySelector('.stats-bar');
if (statsSection) {
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounters(); }
    });
  }, { threshold: 0.4 }).observe(statsSection);
}


// ============================================
// ---- FILTER BUTTONS ----
// ============================================
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    this.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});


// ============================================
// ---- BACK TO TOP ----
// ============================================
const backToTop = document.createElement('button');
backToTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
backToTop.setAttribute('aria-label', 'Back to top');
backToTop.style.cssText = `
  position: fixed;
  bottom: 28px;
  right: 24px;
  width: 46px;
  height: 46px;
  background: linear-gradient(135deg, #b99a5b, #a3863e);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transform: translateY(12px);
  transition: opacity 0.4s ease, transform 0.4s ease, box-shadow 0.3s ease;
  z-index: 999;
  font-size: 0.82rem;
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(185,154,91,0.35);
`;
document.body.appendChild(backToTop);

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
backToTop.addEventListener('mouseenter', () => {
  backToTop.style.boxShadow = '0 8px 30px rgba(185,154,91,0.55)';
  backToTop.style.transform = 'translateY(0) scale(1.05)';
});
backToTop.addEventListener('mouseleave', () => {
  backToTop.style.boxShadow = '0 4px 20px rgba(185,154,91,0.35)';
  backToTop.style.transform = 'translateY(0) scale(1)';
});

window.addEventListener('scroll', () => {
  const show = window.pageYOffset > 500;
  backToTop.style.opacity       = show ? '1' : '0';
  backToTop.style.pointerEvents = show ? 'auto' : 'none';
  backToTop.style.transform     = show ? 'translateY(0)' : 'translateY(12px)';
}, { passive: true });


// ============================================
// ---- FLOATING SOCIAL SIDEBAR ----
// ============================================
(function() {
  const links = [
    { href: 'https://www.facebook.com/rungkijcorp/', icon: 'fab fa-facebook-f', label: 'Facebook', target: '_blank' },
    { href: 'https://www.instagram.com/rungkij_official', icon: 'fab fa-instagram', label: 'Instagram', target: '_blank' },
    { href: '#', icon: 'fab fa-line', label: 'LINE', target: '_self' },
    { href: '#', icon: 'fab fa-tiktok', label: 'TikTok', target: '_blank' },
    { href: '#', icon: 'fab fa-youtube', label: 'YouTube', target: '_blank' },
    { divider: true },
    { href: 'tel:+6625407999', icon: 'fas fa-phone', label: 'Call Us', target: '_self', isPhone: true },
  ];

  const sidebar = document.createElement('div');
  sidebar.setAttribute('aria-label', 'Social media & contact');
  sidebar.style.cssText = `
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 997;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 13px 9px;
    background: rgba(10, 7, 2, 0.44);
    backdrop-filter: blur(20px) saturate(155%) brightness(0.78);
    -webkit-backdrop-filter: blur(20px) saturate(155%) brightness(0.78);
    border: 1px solid rgba(185, 154, 91, 0.28);
    border-right: none;
    border-radius: 14px 0 0 14px;
    box-shadow: -3px 0 22px rgba(0,0,0,0.20), inset 1px 0 0 rgba(185,154,91,0.12);
    transition: opacity 0.5s ease, transform 0.5s ease;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-50%) translateX(12px);
  `;

  links.forEach(function(item) {
    if (item.divider) {
      const div = document.createElement('div');
      div.style.cssText = 'width:20px; height:1px; background:rgba(185,154,91,0.25); margin:5px 0;';
      sidebar.appendChild(div);
      return;
    }
    const a = document.createElement('a');
    a.href = item.href;
    a.title = item.label;
    a.setAttribute('aria-label', item.label);
    if (item.target === '_blank') {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    a.style.cssText = `
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${item.isPhone ? 'rgba(240,208,120,0.88)' : 'rgba(210,178,110,0.68)'};
      font-size: ${item.isPhone ? '0.80rem' : '0.86rem'};
      border-radius: 50%;
      text-decoration: none;
      transition: color 0.25s ease, background 0.25s ease, transform 0.25s ease;
    `;
    const icon = document.createElement('i');
    icon.className = item.icon;
    a.appendChild(icon);

    a.addEventListener('mouseenter', function() {
      this.style.color = '#f5e090';
      this.style.background = 'rgba(185,154,91,0.20)';
      this.style.transform = 'scale(1.18) translateX(-2px)';
    });
    a.addEventListener('mouseleave', function() {
      this.style.color = item.isPhone ? 'rgba(240,208,120,0.88)' : 'rgba(210,178,110,0.68)';
      this.style.background = 'transparent';
      this.style.transform = 'scale(1) translateX(0)';
    });

    sidebar.appendChild(a);
  });

  document.body.appendChild(sidebar);

  /* Show sidebar after scrolling past 300px */
  function handleSidebarScroll() {
    if (window.scrollY > 300) {
      sidebar.style.opacity = '1';
      sidebar.style.pointerEvents = 'auto';
      sidebar.style.transform = 'translateY(-50%) translateX(0)';
    } else {
      sidebar.style.opacity = '0';
      sidebar.style.pointerEvents = 'none';
      sidebar.style.transform = 'translateY(-50%) translateX(12px)';
    }
  }
  window.addEventListener('scroll', handleSidebarScroll, { passive: true });
})();


// ============================================
// ---- FLOATING STICKY ACTION BAR ----
// Show after scrolling past first viewport
// ============================================
(function() {
  var bar = document.getElementById('stickyBar');
  if (!bar) return;

  var SHOW_AFTER = 420;   // px scrolled before bar appears
  var visible    = false;
  var ticking    = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function() {
        var y = window.pageYOffset || document.documentElement.scrollTop;
        if (y > SHOW_AFTER && !visible) {
          bar.classList.add('visible');
          visible = true;
        } else if (y <= SHOW_AFTER && visible) {
          bar.classList.remove('visible');
          visible = false;
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


// ============================================
// ---- HERO SEARCH BAR  (Live Search) ----
// ============================================
(function () {
  var input   = document.getElementById('hsbInput');
  var btn     = document.getElementById('hsbSearchBtn');
  var results = document.getElementById('hsbResults');
  if (!input || !btn || !results) return;

  // Debounce helper
  var debounceTimer;
  function debounce(fn, ms) {
    return function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(fn, ms);
    };
  }

  // Normalize Thai text for search (remove spaces, lowercase)
  function norm(str) {
    return (str || '').toLowerCase().replace(/\s+/g, '');
  }

  // Search projects from projects-data.js
  function searchProjects(query) {
    if (typeof RK_PROJECTS === 'undefined') return [];
    var q = norm(query);
    if (!q) return [];

    return RK_PROJECTS.filter(function (p) {
      if (p.status === 'sold') return false; // เฉพาะเปิดขาย
      // match: name, type, location, district, nearby[]
      if (norm(p.name).indexOf(q) !== -1) return true;
      if (norm(p.type).indexOf(q) !== -1) return true;
      if (norm(p.location).indexOf(q) !== -1) return true;
      if (norm(p.district).indexOf(q) !== -1) return true;
      for (var i = 0; i < p.nearby.length; i++) {
        if (norm(p.nearby[i]).indexOf(q) !== -1) return true;
      }
      return false;
    });
  }

  // Render results
  function renderResults(items) {
    if (items.length === 0) {
      results.innerHTML = '<div class="hsb-result-empty">ไม่พบโครงการที่ตรงกัน</div>';
      results.classList.add('active');
      return;
    }

    var html = '';
    items.forEach(function (p) {
      var badgeHtml = p.badge
        ? '<span class="hsb-result-badge">' + p.badge + '</span>'
        : '';
      html += ''
        + '<a href="' + p.url + '" class="hsb-result-item">'
        +   '<img class="hsb-result-thumb" src="' + p.image + '" alt="' + p.name + '">'
        +   '<div class="hsb-result-info">'
        +     '<p class="hsb-result-name">' + p.name + badgeHtml + '</p>'
        +     '<p class="hsb-result-loc"><i class="fas fa-map-marker-alt"></i>' + p.location + '</p>'
        +     '<div class="hsb-result-meta">'
        +       '<span class="hsb-result-type">' + p.type + '</span>'
        +       '<span class="hsb-result-price">' + p.price + '</span>'
        +     '</div>'
        +   '</div>'
        + '</a>';
    });

    results.innerHTML = html;
    results.classList.add('active');
  }

  // Hide results
  function hideResults() {
    results.classList.remove('active');
  }

  // Live search on input
  var onInput = debounce(function () {
    var q = input.value.trim();
    if (q.length === 0) {
      hideResults();
      return;
    }
    var items = searchProjects(q);
    renderResults(items);
  }, 200);

  input.addEventListener('input', onInput);

  // Enter → go to projects page
  function doSearch() {
    var q = input.value.trim();
    if (q.length > 0) {
      window.location.href = 'projects.html?q=' + encodeURIComponent(q);
    }
  }
  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doSearch();
  });

  // Click outside → close
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.hsb-search')) {
      hideResults();
    }
  });

  // Re-show on focus if has text
  input.addEventListener('focus', function () {
    if (input.value.trim().length > 0) {
      onInput();
    }
  });

  // AI Chat button
  var aiBtn = document.getElementById('hsbAiBtn');
  if (aiBtn) {
    aiBtn.addEventListener('click', function () {
      if (typeof AiChat !== 'undefined') {
        AiChat.open();
      }
    });
  }
})();

