/**
 * Shopify Landing Page Integration Module
 * ========================================
 * Connects standalone HTML landing pages to any Shopify store checkout.
 *
 * SETUP:
 *   1. Set your Shopify store domain in the landing page:
 *      <script> var SHOPIFY_DOMAIN = 'your-store.myshopify.com'; </script>
 *
 *   2. For Buy Button SDK (optional, enables embedded cart):
 *      Get a Storefront Access Token from Shopify Admin > Apps > Manage private apps
 *      var SHOPIFY_STOREFRONT_TOKEN = 'your-token-here';
 *
 * INTEGRATION METHODS:
 *   A) Direct Checkout URL — simplest, no SDK needed
 *   B) Cart Permalink — add to cart then redirect
 *   C) Buy Button SDK — embedded cart experience
 */

(function () {
  'use strict';

  var ShopifyLander = {
    domain: '',
    storefrontToken: '',

    init: function (config) {
      this.domain = config.domain || window.SHOPIFY_DOMAIN || '';
      this.storefrontToken = config.storefrontToken || window.SHOPIFY_STOREFRONT_TOKEN || '';

      if (!this.domain) {
        console.warn('[ShopifyLander] No SHOPIFY_DOMAIN set. Buttons will not work.');
        return;
      }

      this.domain = this.domain.replace(/\/$/, '');
      if (this.domain.indexOf('http') !== 0) {
        this.domain = 'https://' + this.domain;
      }

      this.bindButtons();
      this.initCountdownTimers();
      this.initStickyBars();
      this.trackEvents();
    },

    // METHOD A: Direct checkout URL
    // Usage: <a data-shopify-checkout data-variant="VARIANT_ID" data-qty="1">Buy</a>
    getCheckoutUrl: function (variantId, qty) {
      qty = qty || 1;
      return this.domain + '/cart/' + variantId + ':' + qty;
    },

    // METHOD B: Cart permalink (multiple items)
    // Usage: <a data-shopify-cart data-items="VARIANT1:QTY,VARIANT2:QTY">Buy Bundle</a>
    getCartUrl: function (items) {
      // items = "variant_id:qty,variant_id:qty"
      return this.domain + '/cart/' + items;
    },

    // METHOD C: Product page redirect
    // Usage: <a data-shopify-product data-handle="product-handle">View</a>
    getProductUrl: function (handle) {
      return this.domain + '/products/' + handle;
    },

    // Bind all data-attribute buttons
    bindButtons: function () {
      var self = this;

      // Direct checkout buttons
      document.querySelectorAll('[data-shopify-checkout]').forEach(function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          var variantId = el.getAttribute('data-variant') || '';
          var qty = el.getAttribute('data-qty') || '1';
          if (!variantId) {
            console.warn('[ShopifyLander] Missing data-variant on checkout button');
            return;
          }
          self.trackConversion('checkout_click', variantId);
          window.location.href = self.getCheckoutUrl(variantId, qty);
        });
      });

      // Cart permalink buttons (bundles)
      document.querySelectorAll('[data-shopify-cart]').forEach(function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          var items = el.getAttribute('data-items') || '';
          if (!items) {
            console.warn('[ShopifyLander] Missing data-items on cart button');
            return;
          }
          self.trackConversion('cart_click', items);
          window.location.href = self.getCartUrl(items);
        });
      });

      // Product page buttons
      document.querySelectorAll('[data-shopify-product]').forEach(function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          var handle = el.getAttribute('data-handle') || '';
          if (!handle) {
            console.warn('[ShopifyLander] Missing data-handle on product button');
            return;
          }
          self.trackConversion('product_click', handle);
          window.location.href = self.getProductUrl(handle);
        });
      });
    },

    // Countdown timers
    // Usage: <span data-countdown="2025-12-31T23:59:59"></span>
    initCountdownTimers: function () {
      document.querySelectorAll('[data-countdown]').forEach(function (el) {
        var endDate = new Date(el.getAttribute('data-countdown')).getTime();

        function updateTimer() {
          var now = new Date().getTime();
          var diff = endDate - now;
          if (diff <= 0) {
            el.innerHTML = '<span class="countdown-expired">Offer Expired</span>';
            return;
          }
          var days = Math.floor(diff / 86400000);
          var hours = Math.floor((diff % 86400000) / 3600000);
          var mins = Math.floor((diff % 3600000) / 60000);
          var secs = Math.floor((diff % 60000) / 1000);

          el.innerHTML =
            '<span class="cd-block"><span class="cd-num">' + days + '</span><span class="cd-label">Days</span></span>' +
            '<span class="cd-block"><span class="cd-num">' + hours + '</span><span class="cd-label">Hrs</span></span>' +
            '<span class="cd-block"><span class="cd-num">' + mins + '</span><span class="cd-label">Min</span></span>' +
            '<span class="cd-block"><span class="cd-num">' + secs + '</span><span class="cd-label">Sec</span></span>';
        }

        updateTimer();
        setInterval(updateTimer, 1000);
      });
    },

    // Sticky add-to-cart bar
    initStickyBars: function () {
      var stickyBar = document.querySelector('[data-sticky-bar]');
      if (!stickyBar) return;

      var triggerEl = document.querySelector('[data-sticky-trigger]');
      var triggerOffset = triggerEl ? triggerEl.offsetTop + triggerEl.offsetHeight : 600;

      window.addEventListener('scroll', function () {
        if (window.scrollY > triggerOffset) {
          stickyBar.classList.add('sticky-visible');
        } else {
          stickyBar.classList.remove('sticky-visible');
        }
      });
    },

    // Conversion tracking (sends to dataLayer if GTM present)
    trackConversion: function (action, label) {
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'shopify_lander',
          action: action,
          label: label
        });
      }
      if (window.fbq) {
        window.fbq('track', 'InitiateCheckout', { content_ids: [label] });
      }
    },

    trackEvents: function () {
      // Track page view
      if (window.dataLayer) {
        window.dataLayer.push({ event: 'lander_pageview' });
      }
      // Track scroll depth
      var depths = [25, 50, 75, 100];
      var tracked = {};
      window.addEventListener('scroll', function () {
        var scrollPct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        depths.forEach(function (d) {
          if (scrollPct >= d && !tracked[d]) {
            tracked[d] = true;
            if (window.dataLayer) {
              window.dataLayer.push({ event: 'scroll_depth', depth: d });
            }
          }
        });
      });
    }
  };

  // Expose globally
  window.ShopifyLander = ShopifyLander;

  // Auto-init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    ShopifyLander.init({
      domain: window.SHOPIFY_DOMAIN || '',
      storefrontToken: window.SHOPIFY_STOREFRONT_TOKEN || ''
    });
  });
})();
