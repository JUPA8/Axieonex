// Shared AXIEONEX page-transition controller.
// Loaded by every primary page; keeps a single implementation of the
// destination-aware X-mark transition instead of duplicating logic per page.
// Each page still renders its own `.axPageTransition` overlay and
// `.axPageTransitionMark` logo mount (both already page-tinted at rest);
// this controller layers the DESTINATION signature on top via a CSS filter
// on the mark, then performs the navigation.
(function (global) {
  // hue/sat/bri approximate each destination's stated color-and-material signature.
  // hue is a rotation off the mark's native blue-violet-magenta gradient.
  var DEST = {
    'Axieonex Homepage V2 - Revenue in Motion.dc.html': { hue: 0,    sat: 1.15, bri: 1,    label: 'spectral convergence' },
    'Axieonex About.dc.html':                            { hue: 0,    sat: 0.12, bri: 1.3,  label: 'pearl and silver reveal' },
    'Axieonex How We Work.dc.html':                       { hue: 20,   sat: 1.3,  bri: 0.95, label: 'signal paths weaving' },
    'Axieonex Services.dc.html':                          { hue: -15,  sat: 1.2,  bri: 1,    label: 'cobalt modular assembly' },
    'Axieonex Pricing.dc.html':                           { hue: 0,    sat: 0.05, bri: 1.1,  label: 'graphite and platinum' },
    'Axieonex Insights.dc.html':                          { hue: -30,  sat: 1.1,  bri: 1,    label: 'editorial aperture reveal' },
    'Axieonex Article.dc.html':                           { hue: -30,  sat: 1,    bri: 1.05, label: 'typographic line' },
    'Axieonex Contact.dc.html':                           { hue: 15,   sat: 1.15, bri: 1,    label: 'channels routed to one point' },
    'Axieonex Book Strategy Call.dc.html':                { hue: 5,    sat: 1.2,  bri: 1,    label: 'calibrated progression' },
    'Axieonex Privacy Policy.dc.html':                    { hue: -25,  sat: 0.4,  bri: 1.1,  label: 'restrained cyan and pearl' },
    'Axieonex Cookies Policy.dc.html':                     { hue: -25,  sat: 0.4,  bri: 1.1,  label: 'restrained consent layer' },
    'Axieonex Terms of Service.dc.html':                  { hue: 0,    sat: 0.08, bri: 1.1,  label: 'structured platinum line' },
    'Axieonex Cookie Preferences.dc.html':                { hue: -25,  sat: 0.5,  bri: 1.05, label: 'category layers resolving' },
    'Axieonex 404.dc.html':                               { hue: -330, sat: 1.3,  bri: 0.9,  label: 'broken signal resolving' }
  };
  // Service Detail is one shared template keyed by ?slug=; each service gets its own signature.
  var SERVICE_DEST = {
    'lead-generation':      { hue: 0,    sat: 1.2,  bri: 1,   label: 'radar detection and isolation' },
    'appointment-setting':  { hue: -330, sat: 1.15, bri: 1,   label: 'calibrated scheduling alignment' },
    'hybrid-sdr':           { hue: -20,  sat: 1.1,  bri: 1,   label: 'AI and human layers converging' },
    'cold-email':           { hue: -40,  sat: 1.15, bri: 1,   label: 'message path folding through the mark' },
    'linkedin-outreach':    { hue: 0,    sat: 1.1,  bri: 1,   label: 'network nodes resolving' },
    'cold-calling':         { hue: -330, sat: 1.15, bri: 1,   label: 'waveform convergence' },
    'presales-gtm':         { hue: -40,  sat: 1.1,  bri: 1,   label: 'blueprint lines locking into position' }
  };

  function getDest(href) {
    var file = href.split('?')[0];
    if (file.indexOf('Service Detail') !== -1) {
      var m = href.match(/slug=([a-z-]+)/);
      if (m && SERVICE_DEST[m[1]]) return SERVICE_DEST[m[1]];
    }
    return DEST[file] || { hue: 0, sat: 1, bri: 1, label: 'default' };
  }

  function isPlainLeftClick(e) {
    return !(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);
  }

  // Standard internal navigation: destination-tinted X, then navigate.
  // Call from a link's onClick as: onClick={(e) => window.AxTransition.go(e)}
  function go(e) {
    if (!isPlainLeftClick(e)) return; // let modified/middle clicks behave natively
    var a = e.currentTarget;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var overlay = document.querySelector('.axPageTransition');
    var mark = document.querySelector('.axPageTransitionMark');
    var dest = getDest(href);
    e.preventDefault();
    if (!overlay || !mark) { global.location.href = href; return; }
    if (reduced) {
      overlay.classList.add('is-active');
      global.setTimeout(function () { global.location.href = href; }, 120);
      return;
    }
    mark.style.filter = 'hue-rotate(' + dest.hue + 'deg) saturate(' + dest.sat + ') brightness(' + dest.bri + ')';
    overlay.classList.add('is-active');
    global.setTimeout(function () { global.location.href = href; }, 720);
  }

  global.AxTransition = { go: go, getDest: getDest, DEST: DEST, SERVICE_DEST: SERVICE_DEST };
})(window);
