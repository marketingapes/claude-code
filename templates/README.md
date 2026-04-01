# Shopify Landing Page Templates

25 production-ready HTML landing pages that connect to any Shopify store checkout. No Shopify theme editing required — host these anywhere and drive traffic directly to Shopify checkout.

## How It Works

These landing pages use **Shopify's cart permalink system** to redirect visitors directly to your Shopify checkout. No API keys, no SDK, no theme modifications needed for basic usage.

### Integration Methods

1. **Direct Checkout** (`data-shopify-checkout`) — Sends customer straight to checkout with a single product
2. **Cart Permalink** (`data-shopify-cart`) — Adds multiple items (bundles) to cart and redirects
3. **Product Link** (`data-shopify-product`) — Links to a product page on your Shopify store

### Quick Setup (3 Steps)

1. **Set your Shopify domain** in the `<script>` tag at the top of any template:
   ```html
   <script>var SHOPIFY_DOMAIN = 'your-store.myshopify.com';</script>
   ```

2. **Replace variant IDs** — Find `data-variant="00000000000"` and replace with your actual Shopify product variant IDs. Find these in Shopify Admin → Products → Select product → Variants, or via the URL when editing a variant.

3. **Deploy** — Upload the HTML file anywhere (Netlify, Vercel, S3, any web host). No build step needed.

### Finding Your Shopify Variant IDs

- Go to **Shopify Admin → Products → [Your Product]**
- Click on a variant
- The variant ID is in the URL: `admin/products/123/variants/**456789**`
- Or use the Shopify API: `GET /admin/api/2024-01/products/{id}/variants.json`

## Templates Overview

### Template 1: Hero Product (Single Product Focus)
Best for: single hero products, product launches, DTC brands

| Variant | Industry | File |
|---------|----------|------|
| Supplements | Health & Wellness | `hero-product/variant-supplements.html` |
| Electronics | Consumer Tech | `hero-product/variant-electronics.html` |
| Beauty | Skincare & Cosmetics | `hero-product/variant-beauty.html` |
| Fitness | Sports & Wearables | `hero-product/variant-fitness.html` |
| Home | Home & Living | `hero-product/variant-home.html` |

### Template 2: Collection Showcase (Multi-Product Grid)
Best for: stores with multiple products, category pages, seasonal collections

| Variant | Industry | File |
|---------|----------|------|
| Fashion | Apparel & Accessories | `collection-showcase/variant-fashion.html` |
| Food | Gourmet & Specialty | `collection-showcase/variant-food.html` |
| Pets | Pet Supplies | `collection-showcase/variant-pets.html` |
| Outdoor | Camping & Adventure | `collection-showcase/variant-outdoor.html` |
| Kids | Children & Education | `collection-showcase/variant-kids.html` |

### Template 3: Sales & Countdown (Urgency-Driven)
Best for: flash sales, product launches, seasonal events, BOGO promotions

| Variant | Industry | File |
|---------|----------|------|
| Flash Sale | General E-commerce | `sales-countdown/variant-flash-sale.html` |
| BOGO | Apparel & General | `sales-countdown/variant-bogo.html` |
| Clearance | Fashion & General | `sales-countdown/variant-clearance.html` |
| Seasonal | Gifts & Holiday | `sales-countdown/variant-seasonal.html` |
| Launch | Tech & Innovation | `sales-countdown/variant-launch.html` |

### Template 4: Storytelling / Brand (Long-Form Narrative)
Best for: brand building, premium products, mission-driven companies

| Variant | Industry | File |
|---------|----------|------|
| Artisan | Handcrafted Goods | `storytelling-brand/variant-artisan.html` |
| Eco | Sustainable Products | `storytelling-brand/variant-eco.html` |
| Luxury | Premium & High-End | `storytelling-brand/variant-luxury.html` |
| Wellness | Health & Mindfulness | `storytelling-brand/variant-wellness.html` |
| Tech Startup | SaaS & Hardware | `storytelling-brand/variant-tech.html` |

### Template 5: Comparison / Bundle (Multi-Tier Pricing)
Best for: bundle deals, subscription products, tiered pricing

| Variant | Industry | File |
|---------|----------|------|
| Skincare | Beauty Bundles | `comparison-bundle/variant-skincare.html` |
| Coffee | Subscription & Comparison | `comparison-bundle/variant-coffee.html` |
| Gadgets | Tech Accessories | `comparison-bundle/variant-gadgets.html` |
| Fitness | Home Gym Equipment | `comparison-bundle/variant-fitness.html` |
| Cooking | Kitchen & Cookware | `comparison-bundle/variant-cooking.html` |

## Shared Assets

- `shared/base.css` — Complete design system (buttons, cards, grids, typography, animations)
- `shared/shopify-integration.js` — Shopify connector (checkout URLs, countdown timers, sticky bars, analytics)

## Features

Every template includes:
- **Mobile-responsive** design
- **Countdown timers** (configurable end date)
- **Sticky add-to-cart bar** (appears on scroll)
- **Trust badges** and social proof sections
- **Testimonials** section
- **FAQ accordion** (where applicable)
- **Analytics-ready** (GTM dataLayer + Facebook Pixel events)
- **Scroll depth tracking**
- **Conversion event tracking** (checkout clicks, cart clicks, product clicks)

## Customization

### Colors
Each template uses CSS custom properties. Change `--accent` in the `<style>` block:
```css
:root { --accent: #your-color; }
```

### Images
Replace `placehold.co` URLs with your actual product images.

### Countdown Timer
Set your sale end date:
```html
<div data-countdown="2025-12-31T23:59:59"></div>
```

### Analytics
The integration script automatically pushes events to `window.dataLayer` (GTM) and `window.fbq` (Facebook Pixel) if present. No additional configuration needed.

## Hosting Recommendations

These are static HTML files — host them anywhere:
- **Netlify** — drag & drop deploy, free SSL
- **Vercel** — git-connected deploys
- **AWS S3 + CloudFront** — scalable, low-cost
- **GitHub Pages** — free, version-controlled
- **Any web host** — just upload the files
