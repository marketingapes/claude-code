/**
 * Lead Capture & Traffic Recycling System
 *
 * Drop this script on any domain to enable:
 * 1. Hidden email capture fallback (soft popup on scroll/click)
 * 2. GTM retargeting events (view_content, scroll_50, affiliate_click)
 * 3. Abandoned visitor session tracking
 */

(function () {
  'use strict';

  // =========================================================================
  // Configuration
  // =========================================================================
  var CONFIG = {
    softCapture: {
      triggerScrollPercent: 40,       // show popup after 40% scroll
      triggerClickCount: 2,           // or after 2 clicks
      delayAfterTriggerMs: 1500,      // wait 1.5s after trigger before showing
      cookieName: 'sc_captured',      // cookie to suppress popup if already captured
      cookieDays: 90                  // suppress for 90 days after capture
    },
    viewContent: {
      dwellTimeMs: 3000               // fire view_content after 3s on page
    },
    scroll: {
      threshold: 50                   // fire scroll_50 at 50%
    },
    affiliateSelectors: 'a[href*="ref="], a[href*="aff="], a[href*="click_id="], a[data-affiliate], a.affiliate-link, a.cta-link',
    sessionKey: 'rt_session'
  };

  // =========================================================================
  // Utility helpers
  // =========================================================================
  function generateId() {
    return 'rt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  function pushDataLayer(event, params) {
    window.dataLayer = window.dataLayer || [];
    var payload = { event: event };
    if (params) {
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          payload[key] = params[key];
        }
      }
    }
    window.dataLayer.push(payload);
  }

  function getScrollPercent() {
    var doc = document.documentElement;
    var body = document.body;
    var scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
    var scrollHeight = Math.max(
      body.scrollHeight, doc.scrollHeight,
      body.offsetHeight, doc.offsetHeight,
      body.clientHeight, doc.clientHeight
    );
    var clientHeight = doc.clientHeight || body.clientHeight;
    if (scrollHeight <= clientHeight) return 100;
    return Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
  }

  // =========================================================================
  // 1. Session tracking (abandoned visitor sequence)
  // =========================================================================
  var session = (function () {
    var data = null;
    try {
      data = JSON.parse(sessionStorage.getItem(CONFIG.sessionKey));
    } catch (e) { /* ignore */ }

    if (!data) {
      data = {
        id: generateId(),
        startedAt: new Date().toISOString(),
        pageUrl: location.href,
        referrer: document.referrer || '(direct)',
        converted: false,
        events: []
      };
    }
    data.lastActiveAt = new Date().toISOString();

    function save() {
      try {
        sessionStorage.setItem(CONFIG.sessionKey, JSON.stringify(data));
      } catch (e) { /* storage full — degrade gracefully */ }
    }

    function recordEvent(name) {
      data.events.push({ name: name, ts: new Date().toISOString() });
      save();
    }

    function markConverted() {
      data.converted = true;
      save();
    }

    save();
    return { data: data, save: save, recordEvent: recordEvent, markConverted: markConverted };
  })();

  // =========================================================================
  // 2. GTM retargeting events
  // =========================================================================

  // -- view_content: fires after dwell time threshold --
  var viewContentFired = false;
  setTimeout(function () {
    if (!viewContentFired) {
      viewContentFired = true;
      pushDataLayer('view_content', {
        page_url: location.href,
        page_title: document.title,
        session_id: session.data.id
      });
      session.recordEvent('view_content');
    }
  }, CONFIG.viewContent.dwellTimeMs);

  // -- scroll_50: fires when user scrolls past 50% --
  var scroll50Fired = false;
  function onScroll() {
    if (scroll50Fired) return;
    if (getScrollPercent() >= CONFIG.scroll.threshold) {
      scroll50Fired = true;
      pushDataLayer('scroll_50', {
        page_url: location.href,
        session_id: session.data.id
      });
      session.recordEvent('scroll_50');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // -- affiliate_click: fires on affiliate/CTA link clicks --
  document.addEventListener('click', function (e) {
    var link = e.target.closest(CONFIG.affiliateSelectors);
    if (!link) return;
    pushDataLayer('affiliate_click', {
      link_url: link.href,
      link_text: (link.textContent || '').trim().substring(0, 100),
      page_url: location.href,
      session_id: session.data.id
    });
    session.recordEvent('affiliate_click');
    session.markConverted();
  });

  // =========================================================================
  // 3. Soft email capture popup
  // =========================================================================
  var popupShown = false;
  var clickCount = 0;

  function alreadyCaptured() {
    return getCookie(CONFIG.softCapture.cookieName) === '1';
  }

  function buildPopup() {
    var overlay = document.createElement('div');
    overlay.id = 'rt-soft-capture-overlay';
    overlay.setAttribute('style',
      'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);' +
      'z-index:999999;display:flex;align-items:center;justify-content:center;opacity:0;' +
      'transition:opacity 0.3s ease;'
    );

    var box = document.createElement('div');
    box.setAttribute('style',
      'background:#fff;border-radius:12px;padding:32px;max-width:420px;width:90%;' +
      'box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;font-family:-apple-system,BlinkMacSystemFont,sans-serif;'
    );

    box.innerHTML =
      '<div style="font-size:14px;color:#666;margin-bottom:8px;">Before you go...</div>' +
      '<div style="font-size:22px;font-weight:700;color:#111;margin-bottom:12px;">Get exclusive updates</div>' +
      '<div style="font-size:14px;color:#555;margin-bottom:20px;">Join our list for insider tips & special offers. No spam — unsubscribe anytime.</div>' +
      '<form id="rt-capture-form" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">' +
        '<input id="rt-capture-email" type="email" required placeholder="you@example.com" ' +
          'style="flex:1;min-width:200px;padding:12px 16px;border:2px solid #ddd;border-radius:8px;font-size:15px;outline:none;" />' +
        '<button type="submit" style="padding:12px 24px;background:#111;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;">Subscribe</button>' +
      '</form>' +
      '<div id="rt-capture-msg" style="margin-top:12px;font-size:13px;color:#22c55e;display:none;">Thanks! You\'re in.</div>' +
      '<div style="margin-top:16px;cursor:pointer;font-size:13px;color:#999;" id="rt-capture-close">No thanks</div>';

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Fade in
    requestAnimationFrame(function () {
      overlay.style.opacity = '1';
    });

    // Close handler
    function closePopup() {
      overlay.style.opacity = '0';
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 300);
    }

    document.getElementById('rt-capture-close').addEventListener('click', closePopup);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePopup();
    });

    // Form submit
    document.getElementById('rt-capture-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var emailInput = document.getElementById('rt-capture-email');
      var email = emailInput.value.trim();
      if (!email) return;

      // Push GTM event
      pushDataLayer('soft_capture_submit', {
        email: email,
        page_url: location.href,
        session_id: session.data.id
      });
      session.recordEvent('soft_capture_submit');
      session.markConverted();

      // Set suppression cookie
      setCookie(CONFIG.softCapture.cookieName, '1', CONFIG.softCapture.cookieDays);

      // Show confirmation
      document.getElementById('rt-capture-form').style.display = 'none';
      document.getElementById('rt-capture-msg').style.display = 'block';

      setTimeout(closePopup, 2000);
    });
  }

  function tryShowPopup() {
    if (popupShown || alreadyCaptured()) return;
    popupShown = true;
    setTimeout(buildPopup, CONFIG.softCapture.delayAfterTriggerMs);
  }

  // Trigger on scroll past threshold
  function onScrollCapture() {
    if (popupShown) return;
    if (getScrollPercent() >= CONFIG.softCapture.triggerScrollPercent) {
      tryShowPopup();
    }
  }
  window.addEventListener('scroll', onScrollCapture, { passive: true });

  // Trigger on click count
  document.addEventListener('click', function () {
    clickCount++;
    if (clickCount >= CONFIG.softCapture.triggerClickCount) {
      tryShowPopup();
    }
  });

  // =========================================================================
  // 4. Abandoned visitor detection (beforeunload)
  // =========================================================================
  window.addEventListener('beforeunload', function () {
    if (!session.data.converted) {
      pushDataLayer('session_abandon', {
        session_id: session.data.id,
        page_url: location.href,
        time_on_page_ms: Date.now() - new Date(session.data.startedAt).getTime(),
        events_fired: session.data.events.map(function (e) { return e.name; }).join(',')
      });
      session.recordEvent('session_abandon');
    }
  });

})();
