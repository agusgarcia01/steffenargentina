// Interacciones del sitio Steffen
(function () {
  document.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Aparición de elementos al hacer scroll */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      var i = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = (i++ * 120) + 'ms';
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* Video de fondo del inicio: si el navegador lo pausó (pestaña en segundo plano, ahorro de
     batería), lo vuelve a reproducir cuando la página está a la vista */
  var heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    var playHero = function () {
      if (document.visibilityState === 'visible' && heroVideo.paused) {
        var p = heroVideo.play();
        if (p && p.catch) p.catch(function () { /* autoplay bloqueado: queda la imagen fija */ });
      }
    };
    document.addEventListener('visibilitychange', playHero);
    heroVideo.addEventListener('canplay', playHero);
    playHero();
  }

  /* Header: se achica y se vuelve translúcido al bajar */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Menú lateral de categorías y menú de arriba: cada botón pasa a texto claro cuando está sobre una sección oscura */
  var catLinks = document.querySelectorAll('.cat-nav a, .main-nav a');
  var darkSections = document.querySelectorAll('.seccion-oscura');
  if (catLinks.length && darkSections.length) {
    var updateCatNav = function () {
      var rects = Array.prototype.map.call(darkSections, function (s) { return s.getBoundingClientRect(); });
      catLinks.forEach(function (a) {
        var r = a.getBoundingClientRect();
        var cy = r.top + r.height / 2;
        var dark = rects.some(function (s) { return cy >= s.top && cy <= s.bottom; });
        a.classList.toggle('sobre-oscuro', dark);
      });
    };
    window.addEventListener('scroll', updateCatNav, { passive: true });
    window.addEventListener('resize', updateCatNav);
    updateCatNav();
  }

  /* Contacto: pestañas distribuidora / salón */
  var cfTabs = document.querySelectorAll('.cf-tab');
  var cfForm = document.getElementById('contact-form');
  var activateTab = function (tab) {
    cfTabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) {
        panel.hidden = !on;
        panel.classList.toggle('active', on);
      }
    });
    if (cfForm) {
      // el formulario indica desde qué pestaña se envió y preselecciona la categoría
      cfForm.elements.consulta.value = tab.textContent.trim();
      cfForm.elements.rubro.value = tab.getAttribute('data-rubro');
    }
  };
  cfTabs.forEach(function (tab) {
    tab.addEventListener('click', function () { activateTab(tab); });
  });
  // "Sumar a mi salón" (index.html#contacto-salon) abre la pestaña de salones y baja hasta el formulario
  var goToSalon = function () {
    if (location.hash !== '#contacto-salon') return;
    var salonTab = document.querySelector('.cf-tab[data-tab="salon"]');
    if (!salonTab) return;
    activateTab(salonTab);
    document.querySelector('.cf-tabs').scrollIntoView({ block: 'start' });
  };
  goToSalon();
  window.addEventListener('hashchange', goToSalon);
  // si ya estamos en el inicio con ese hash, volver a tocar el botón igual tiene que bajar
  document.querySelectorAll('a[href$="#contacto-salon"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (location.pathname.slice(-10) === 'index.html' || location.pathname.slice(-1) === '/') {
        if (location.hash === '#contacto-salon') { e.preventDefault(); goToSalon(); }
      }
    });
  });

  /* Contacto: envío del formulario sin salir de la página (Formspree) */
  if (cfForm) {
    var cfStatus = document.getElementById('form-status');
    cfForm.addEventListener('submit', function (e) {
      e.preventDefault();
      cfStatus.textContent = 'Enviando...';
      cfStatus.style.color = '#555';
      fetch(cfForm.action, {
        method: cfForm.method,
        body: new FormData(cfForm),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          cfStatus.textContent = 'Mensaje enviado correctamente. Gracias por contactarnos.';
          cfStatus.style.color = 'green';
          var consulta = cfForm.elements.consulta.value;
          var rubro = cfForm.elements.rubro.value;
          cfForm.reset();
          cfForm.elements.consulta.value = consulta;
          cfForm.elements.rubro.value = rubro;
        } else {
          cfStatus.textContent = 'Revisa la direccion de Email.';
          cfStatus.style.color = 'red';
        }
      }).catch(function () {
        cfStatus.textContent = 'Error de conexión.';
        cfStatus.style.color = 'red';
      });
    });
  }

  /* Galería elástica de productos: la columna activa se expande */
  document.querySelectorAll('.elastic-gallery').forEach(function (gallery) {
    var items = gallery.querySelectorAll('.eg-item');
    var activate = function (item) {
      items.forEach(function (i) { i.classList.toggle('active', i === item); });
    };
    items.forEach(function (item) {
      item.addEventListener('mouseenter', function () { activate(item); });
      item.addEventListener('focus', function () { activate(item); });
      // en pantallas táctiles el primer toque abre la columna y el segundo entra a la página
      item.addEventListener('click', function (e) {
        if (!item.classList.contains('active')) {
          e.preventDefault();
          activate(item);
        }
      });
    });
  });

  /* Contador: anima de 0 al número cuando aparece en pantalla */
  var counters = document.querySelectorAll('[data-count]');
  var runCounter = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var prefix = el.getAttribute('data-prefix') || '';
    if (reduceMotion) { el.textContent = prefix + target; return; }
    var duration = 4500;
    var start = null;
    var step = function (now) {
      if (start === null) start = now;
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 5); // arranca rápido y frena cada vez más al acercarse al final
      el.textContent = prefix + Math.round(target * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) {
      el.textContent = (el.getAttribute('data-prefix') || '') + '0';
      counterObserver.observe(el);
    });
  }

  /* Tarjetas de productos: inclinación 3D siguiendo el mouse */
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover && !reduceMotion) {
    var MAX_TILT = 12; // grados
    document.querySelectorAll('[data-tilt]').forEach(function (section) {
      var card = section.querySelector('.tilt-card');
      if (!card) return;
      section.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        // posición del mouse relativa al centro de la tarjeta, limitada a [-1, 1]
        var x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2 + 150)));
        var y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2 + 150)));
        card.classList.add('tilting');
        card.style.setProperty('--ry', (x * MAX_TILT) + 'deg');
        card.style.setProperty('--rx', (-y * MAX_TILT) + 'deg');
        card.style.setProperty('--gx', ((x + 1) * 50) + '%');
        card.style.setProperty('--gy', ((y + 1) * 50) + '%');
      });
      section.addEventListener('mouseleave', function () {
        card.classList.remove('tilting');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }
})();
