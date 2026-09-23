/* =========================================================================
   Mizarstvo Matjaž Pesjak s.p. — interakcije in animacije
   Brez zunanjih knjižnic. Vse gibanje upošteva prefers-reduced-motion.
   ========================================================================= */
(function () {
  'use strict';

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = motionQuery.matches;
  motionQuery.addEventListener('change', function (e) { reduced = e.matches; });

  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };


  /* ---------------------------------------------------------------------
     0. Vstopni zaslon
        Znak se izriše potezo za potezo, nato se zaslon dvigne in odkrije
        naslovnico. Prikaže se enkrat na sejo — ob vsakem kliku po strani
        bi bil samo še zavora. Pri zmanjšanem gibanju ga CSS skrije, zato
        tu poskrbimo le, da se stran takoj odklene.
     --------------------------------------------------------------------- */
  var html = document.documentElement;
  var pre = $('#preloader');
  var preLogo = $('#preloader-logo');

  function endIntro() {
    html.classList.remove('pl-wait');
    document.body.classList.remove('pl-lock');
    if (pre && !pre.hasAttribute('data-done')) pre.setAttribute('data-done', '');
  }

  if (!pre || reduced || !html.classList.contains('pl-wait')) {
    endIntro();
  } else {
    // Varovalka gre prva: tudi če karkoli spodaj vrže napako, se stran odklene.
    window.setTimeout(endIntro, 3500);

    document.body.classList.add('pl-lock');
    try { sessionStorage.setItem('mp-uvod', '1'); } catch (e) { /* zasebno okno */ }
    if (preLogo) preLogo.classList.add('play');

    var zacetek = Date.now();
    var najmanj = 1400;            // toliko traja izris znaka
    var koncaj = function () {
      window.setTimeout(endIntro, Math.max(0, najmanj - (Date.now() - zacetek)));
    };
    if (document.readyState === 'complete') koncaj();
    else window.addEventListener('load', koncaj);
  }

  /* ---------------------------------------------------------------------
     1. Letnica v nogi
     --------------------------------------------------------------------- */
  var leto = $('#leto');
  if (leto) leto.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------------------
     2. Glava: stanje ob drsenju + gumb "nazaj na vrh" + klicna vrstica
     Spremeni se samo barva ozadja in senca (brez preračuna postavitve).
     --------------------------------------------------------------------- */
  var header = $('#header');
  var toTop  = $('#to-top');
  var callBar = $('#call-bar');
  var ticking = false;

  var lastSweep = 0;

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var now = Date.now();

    if (header) header.toggleAttribute('data-scrolled', y > 24);
    if (toTop)  toTop.toggleAttribute('data-show', y > 640);
    if (callBar) callBar.toggleAttribute('data-show', y > 420);

    updateParallax(y);
    updateProcess();
    // Pometanje preskočenih razdelkov bere postavitev, zato ga izvedemo
    // največ petkrat na sekundo, ne ob vsakem okvirju.
    if (pendingReveals.length && now - lastSweep > 200) { lastSweep = now; revealSkipped(); }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------------------
     3. Paralaksa hero slike — ena plast, majhen odmik, izklopljena pri
        zmanjšanem gibanju in na ozkih zaslonih (tam ni prostora zanjo).
     --------------------------------------------------------------------- */
  var parallaxEls = $$('[data-parallax]');

  function updateParallax(y) {
    if (reduced || window.innerWidth < 760) return;
    for (var i = 0; i < parallaxEls.length; i++) {
      var el = parallaxEls[i];
      var factor = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      var offset = Math.min(y, window.innerHeight) * factor;
      el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
    }
  }

  /* ---------------------------------------------------------------------
     4. Razkritje ob drsenju — enkratno. Marketinška stran, zato je gibanje
        dovoljeno; ponovno proženje bi bilo boj z bralcem.
     --------------------------------------------------------------------- */
  var revealTargets = $$('.reveal, .gallery__item, .card');
  var pendingReveals = revealTargets.slice();

  function markRevealed(el) {
    el.setAttribute('data-visible', '');
    var i = pendingReveals.indexOf(el);
    if (i > -1) pendingReveals.splice(i, 1);
  }

  // Skok na sidro (npr. /#kontakt) preskoči cele razdelke, ki jih opazovalec
  // nikoli ne vidi vstopiti. Karkoli ostane nad vidnim poljem, razkrijemo takoj.
  function revealSkipped() {
    for (var i = pendingReveals.length - 1; i >= 0; i--) {
      if (pendingReveals[i].getBoundingClientRect().bottom < 0) markRevealed(pendingReveals[i]);
    }
  }

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        markRevealed(entry.target);
        obs.unobserve(entry.target);
      });
      // Prag mora biti 0: pri odstotnem pragu se visok element (npr. mreža
      // enajstih kartic) na nizkem oknu nikoli ne razkrije, ker v vidno polje
      // nikoli ne pride dovolj velik delež njegove višine.
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(markRevealed);
  }

  /* ---------------------------------------------------------------------
     5. Števci — preštejejo enkrat, ko pridejo v vidno polje.
        Pri zmanjšanem gibanju se takoj izpiše končna vrednost.
     --------------------------------------------------------------------- */
  function formatNum(value, decimals) {
    return decimals
      ? value.toFixed(decimals).replace('.', ',')
      : String(Math.round(value));
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);

    if (reduced || target === 0) { el.textContent = formatNum(target, decimals); return; }

    var duration = 1200;
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);              // ease-out cubic
      el.textContent = formatNum(target * eased, decimals);
      if (p < 1) window.requestAnimationFrame(frame);
      else el.textContent = formatNum(target, decimals);
    }
    window.requestAnimationFrame(frame);
  }

  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = formatNum(parseFloat(el.getAttribute('data-count')),
                                 parseInt(el.getAttribute('data-decimals') || '0', 10));
    });
  }

  /* ---------------------------------------------------------------------
     6. Časovnica postopka — napredek črte sledi drsenju (scaleY),
        koraki se prižgejo, ko gredo mimo sredine zaslona.
     --------------------------------------------------------------------- */
  var track = $('#process-track');
  var progress = $('#process-progress');
  var steps = $$('[data-step]');

  function updateProcess() {
    if (!track || !progress) return;

    var rect = track.getBoundingClientRect();
    // Zunaj vidnega polja ni česa računati – prihranimo šest meritev na okvir.
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
    var mid = window.innerHeight * 0.62;
    var p = (mid - rect.top) / rect.height;
    p = Math.max(0, Math.min(1, p));
    progress.style.setProperty('--p', reduced ? 1 : p.toFixed(3));

    for (var i = 0; i < steps.length; i++) {
      var dot = steps[i].getBoundingClientRect();
      steps[i].toggleAttribute('data-active', dot.top < mid);
    }
  }

  /* ---------------------------------------------------------------------
     7. Trak z materiali — podvojimo vsebino, da je vrtenje brezšivno.
     --------------------------------------------------------------------- */
  var marqueeTrack = $('#marquee-track');
  if (marqueeTrack && !reduced) {
    marqueeTrack.innerHTML += marqueeTrack.innerHTML;
  }

  /* ---------------------------------------------------------------------
     8. Mobilni predal — z zaklepom fokusa, tipko Esc in zaklepom drsenja.
     --------------------------------------------------------------------- */
  var burger = $('#burger');
  var drawer = $('#drawer');
  var lastFocused = null;

  function focusablesIn(root) {
    return $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', root)
      .filter(function (el) { return el.offsetParent !== null; });
  }

  function trapFocus(e, root) {
    if (e.key !== 'Tab') return;
    var items = focusablesIn(root);
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function openDrawer() {
    if (!drawer || !burger) return;
    lastFocused = document.activeElement;
    drawer.hidden = false;
    // Sprožimo prehod v naslednjem okvirju, da brskalnik ujame začetno stanje
    window.requestAnimationFrame(function () {
      drawer.setAttribute('data-open', '');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Zapri meni');
      document.body.style.overflow = 'hidden';
    });
    // Fokus prestavimo, ko je predal že viden — element z visibility: hidden
    // fokusa ne sprejme
    window.setTimeout(function () {
      if (!drawer.hasAttribute('data-open')) return;
      var first = focusablesIn(drawer)[0];
      if (first) first.focus();
    }, 80);
  }

  function closeDrawer() {
    if (!drawer || !burger) return;
    drawer.removeAttribute('data-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Odpri meni');
    document.body.style.overflow = '';
    window.setTimeout(function () { if (!drawer.hasAttribute('data-open')) drawer.hidden = true; }, 360);
    if (lastFocused) lastFocused.focus();
  }

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      if (drawer.hasAttribute('data-open')) closeDrawer(); else openDrawer();
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeDrawer();
    });
    drawer.addEventListener('keydown', function (e) { trapFocus(e, drawer); });

    // Esc lovimo na dokumentu: fokus je lahko še na gumbu za meni, ne v predalu
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.hasAttribute('data-open')) {
        e.preventDefault();
        closeDrawer();
      }
    });

    // Klik na glavo (edini del zaslona zunaj predala) prav tako zapre meni
    if (header) {
      header.addEventListener('click', function (e) {
        if (drawer.hasAttribute('data-open') && !e.target.closest('#burger')) closeDrawer();
      });
    }
  }

  /* ---------------------------------------------------------------------
     9. Označevanje aktivne povezave v navigaciji (scroll spy)
     --------------------------------------------------------------------- */
  var navLinks = $$('.nav__link');
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + entry.target.id;
          if (on) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------------------------------
     10. Galerija: filtriranje + svetlobna škatla
     --------------------------------------------------------------------- */
  var gallery = $('#gallery');
  var items = $$('.gallery__item', gallery || document);
  var filters = $$('.filter');
  var status = $('#galerija-stanje');
  var visibleItems = items.slice();

  function applyFilter(cat) {
    visibleItems = [];
    items.forEach(function (item) {
      var match = cat === 'vse' || item.getAttribute('data-cat') === cat;
      item.hidden = !match;
      if (match) visibleItems.push(item);
    });
    if (status) {
      status.textContent = 'Prikazanih ' + visibleItems.length +
        (visibleItems.length === 1 ? ' fotografija.' : ' fotografij.');
    }
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  var lightbox   = $('#lightbox');
  var lbImg      = $('#lb-img');
  var lbCaption  = $('#lb-caption');
  var lbCounter  = $('#lb-counter');
  var lbClose    = $('#lb-close');
  var lbPrev     = $('#lb-prev');
  var lbNext     = $('#lb-next');
  var lbIndex    = 0;
  var lbOpener   = null;

  function showAt(index) {
    if (!visibleItems.length) return;
    lbIndex = (index + visibleItems.length) % visibleItems.length;
    var item = visibleItems[lbIndex];
    var thumb = $('img', item);
    lbImg.src = item.getAttribute('data-full');
    lbImg.alt = thumb ? thumb.alt : '';
    lbCaption.textContent = item.getAttribute('data-caption') || '';
    lbCounter.textContent = '(' + (lbIndex + 1) + ' / ' + visibleItems.length + ')';
  }

  function openLightbox(item) {
    if (!lightbox) return;
    lbOpener = item;
    lightbox.hidden = false;
    showAt(visibleItems.indexOf(item));
    window.requestAnimationFrame(function () {
      lightbox.setAttribute('data-open', '');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.removeAttribute('data-open');
    document.body.style.overflow = '';
    window.setTimeout(function () {
      if (!lightbox.hasAttribute('data-open')) { lightbox.hidden = true; lbImg.src = ''; }
    }, 260);
    if (lbOpener) lbOpener.focus();
  }

  items.forEach(function (item) {
    item.addEventListener('click', function () { openLightbox(item); });
  });

  if (lightbox) {
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { showAt(lbIndex - 1); });
    lbNext.addEventListener('click', function () { showAt(lbIndex + 1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape')     { e.preventDefault(); closeLightbox(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); showAt(lbIndex - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); showAt(lbIndex + 1); }
      trapFocus(e, lightbox);
    });

    // Podrsljaj na dotičnih zaslonih
    var touchX = null;
    lightbox.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 56) showAt(lbIndex + (dx < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     11. Pogosta vprašanja — višino izmerimo, ne animiramo proti "auto".
     --------------------------------------------------------------------- */
  $$('.faq__q').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    var item = btn.closest('.faq__item');
    if (!panel || !item) return;

    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';

      if (open) {
        panel.style.height = panel.scrollHeight + 'px';
        window.requestAnimationFrame(function () {
          panel.style.height = '0px';
          panel.style.opacity = '0';
        });
        btn.setAttribute('aria-expanded', 'false');
        item.removeAttribute('data-open');
      } else {
        panel.style.height = panel.scrollHeight + 'px';
        panel.style.opacity = '1';
        btn.setAttribute('aria-expanded', 'true');
        item.setAttribute('data-open', '');
        panel.addEventListener('transitionend', function once(e) {
          if (e.propertyName !== 'height') return;
          panel.removeEventListener('transitionend', once);
          if (btn.getAttribute('aria-expanded') === 'true') panel.style.height = 'auto';
        });
      }
    });
  });

  // Ob spremembi širine zaslona odprti odgovor ohrani pravo višino
  window.addEventListener('resize', function () {
    $$('.faq__item[data-open] .faq__a').forEach(function (p) { p.style.height = 'auto'; });
  });

  /* ---------------------------------------------------------------------
     12. Video iz delavnice — predvajanje na zahtevo (brez samodejnega
         zagona: manj prenesenih podatkov in brez nepričakovanega gibanja).
     --------------------------------------------------------------------- */
  var video = $('#video-delavnica');
  var videoBtn = $('#video-delavnica-toggle');

  if (video && videoBtn) {
    var playIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.1v13.8a1 1 0 0 0 1.5.9l11-6.9a1 1 0 0 0 0-1.7l-11-6.9a1 1 0 0 0-1.5.8z"/></svg>';
    var pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>';

    videoBtn.addEventListener('click', function () {
      if (video.paused) {
        video.play();
        videoBtn.innerHTML = pauseIcon;
        videoBtn.setAttribute('aria-label', 'Ustavi posnetek iz delavnice');
        videoBtn.setAttribute('aria-pressed', 'true');
      } else {
        video.pause();
        videoBtn.innerHTML = playIcon;
        videoBtn.setAttribute('aria-label', 'Predvajaj posnetek iz delavnice');
        videoBtn.setAttribute('aria-pressed', 'false');
      }
    });

    // Ustavimo predvajanje, ko video zapusti vidno polje — brez tihega porabljanja podatkov
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting && !video.paused) videoBtn.click();
        });
      }, { threshold: 0.15 }).observe(video);
    }
  }

  /* ---------------------------------------------------------------------
     13. Privolitev za piškotke
         Stran sama ne uporablja piškotkov za sledenje. Shranimo le izbiro,
         ki odklene zemljevid Google Zemljevidov (piškotki tretje osebe).
     --------------------------------------------------------------------- */
  var KEY = 'mp-piskotki';
  var cookieBar = $('#cookie');
  var mapBox = $('#map-box');
  var mapPlaceholder = $('#map-placeholder');

  function readConsent() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function writeConsent(value) {
    try { window.localStorage.setItem(KEY, value); } catch (e) { /* zasebno okno */ }
  }

  function loadMap() {
    if (!mapBox || $('iframe', mapBox)) return;
    if (mapPlaceholder) mapPlaceholder.remove();
    var iframe = document.createElement('iframe');
    iframe.src = 'https://maps.google.com/maps?q=46.4161242,15.2695052&hl=sl&z=16&output=embed';
    iframe.title = 'Zemljevid: Paka 44, 3205 Vitanje';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.setAttribute('allowfullscreen', '');
    mapBox.appendChild(iframe);
  }

  function showCookieBar() {
    if (!cookieBar) return;
    cookieBar.hidden = false;
    window.requestAnimationFrame(function () { cookieBar.setAttribute('data-open', ''); });
  }
  function hideCookieBar() {
    if (!cookieBar) return;
    cookieBar.removeAttribute('data-open');
    window.setTimeout(function () {
      if (!cookieBar.hasAttribute('data-open')) cookieBar.hidden = true;
    }, 360);
  }

  var consent = readConsent();
  if (consent === 'vse') loadMap();
  if (!consent) window.setTimeout(showCookieBar, 1200);

  var accept = $('#cookie-accept');
  var reject = $('#cookie-reject');
  var reopen = $('#cookie-reopen');
  var mapConsentBtn = $('#map-consent');

  if (accept) accept.addEventListener('click', function () { writeConsent('vse'); loadMap(); hideCookieBar(); });
  if (reject) reject.addEventListener('click', function () { writeConsent('nujni'); hideCookieBar(); });
  if (reopen) reopen.addEventListener('click', function () { showCookieBar(); });
  if (mapConsentBtn) mapConsentBtn.addEventListener('click', function () { writeConsent('vse'); loadMap(); hideCookieBar(); });

  /* ---------------------------------------------------------------------
     14. Obrazec za povpraševanje
         Brez strežnika: po preverjanju sestavimo e-poštno sporočilo.
         Napake se izpišejo ob polju in v povzetku na vrhu obrazca.
     --------------------------------------------------------------------- */
  // DEPLOY STEP: vpiši pravi e-naslov naročnika (isti kot v razdelku Kontakt).
  var PREJEMNIK = 'matjaz.mizarstvo@gmail.com';

  var form = $('#povprasevanje');

  if (form) {
    var summary = $('#form-summary');
    var summaryList = $('#form-summary-list');
    var okBox = $('#form-ok');

    var rules = [
      { id: 'ime',       label: 'Ime in priimek', test: function (v) { return v.trim().length >= 2; } },
      { id: 'telefon',   label: 'Telefon',        test: function (v) { return (v.replace(/\D/g, '').length >= 8); } },
      { id: 'email',     label: 'E-pošta',        test: function (v) { return v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); } },
      { id: 'sporocilo', label: 'Opis projekta',  test: function (v) { return v.trim().length >= 10; } },
      { id: 'soglasje',  label: 'Soglasje',       test: function (v, el) { return el.checked; } }
    ];

    function setFieldState(el, valid) {
      var field = el.closest('.field');
      if (!field) return;
      if (valid) field.removeAttribute('data-invalid');
      else field.setAttribute('data-invalid', '');
      el.setAttribute('aria-invalid', valid ? 'false' : 'true');
    }

    // Sprotno preverjanje šele potem, ko je polje že enkrat javilo napako
    rules.forEach(function (rule) {
      var el = document.getElementById(rule.id);
      if (!el) return;
      el.addEventListener('input', function () {
        var field = el.closest('.field');
        if (field && field.hasAttribute('data-invalid')) setFieldState(el, rule.test(el.value, el));
      });
      el.addEventListener('change', function () {
        var field = el.closest('.field');
        if (field && field.hasAttribute('data-invalid')) setFieldState(el, rule.test(el.value, el));
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Past za robote: če je skrito polje izpolnjeno, tiho ne naredimo nič
      var honeypot = $('#spletna-stran');
      if (honeypot && honeypot.value) return;

      var napake = [];

      rules.forEach(function (rule) {
        var el = document.getElementById(rule.id);
        if (!el) return;
        var valid = rule.test(el.value, el);
        setFieldState(el, valid);
        if (!valid) napake.push({ label: rule.label, id: rule.id });
      });

      if (napake.length) {
        if (summaryList) {
          summaryList.innerHTML = '';
          napake.forEach(function (n) {
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.href = '#' + n.id;
            a.textContent = n.label;
            a.style.color = 'inherit';
            a.addEventListener('click', function (ev) {
              ev.preventDefault();
              var t = document.getElementById(n.id);
              if (t) t.focus();
            });
            li.appendChild(a);
            summaryList.appendChild(li);
          });
        }
        if (summary) { summary.setAttribute('data-show', ''); summary.focus(); }
        if (okBox) okBox.removeAttribute('data-show');
        return;
      }

      if (summary) summary.removeAttribute('data-show');

      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };

      var zadeva = 'Povpraševanje s spletne strani — ' + v('storitev');
      var telo = [
        'Ime in priimek: ' + v('ime'),
        'Telefon: ' + v('telefon'),
        'E-pošta: ' + (v('email') || '—'),
        'Kraj objekta: ' + (v('kraj') || '—'),
        'Storitev: ' + v('storitev'),
        '',
        'Opis projekta:',
        v('sporocilo'),
        '',
        '— poslano z www.mizarstvo-pesjak.si'
      ].join('\n');

      window.location.href = 'mailto:' + PREJEMNIK +
        '?subject=' + encodeURIComponent(zadeva) +
        '&body=' + encodeURIComponent(telo);

      if (okBox) okBox.setAttribute('data-show', '');
    });
  }

  /* ---------------------------------------------------------------------
     15. Prvi izris
     --------------------------------------------------------------------- */
  onScroll();
  applyFilter('vse');
})();
