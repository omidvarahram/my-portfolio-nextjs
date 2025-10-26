
## 💻 Common Screen Sizes and Breakpoints (Modern Standard)

| Device Type                                  | Example Devices                 | Width Range (px) | Common Media Query           |
| -------------------------------------------- | ------------------------------- | ---------------- | ---------------------------- |
| **Extra Small (Mobile Portrait)**            | iPhone SE / Galaxy S Mini       | `320–480`        | `@media (max-width: 480px)`  |
| **Small (Mobile Landscape / Large Phones)**  | iPhone 14 Pro Max / Pixel 8 Pro | `481–640`        | `@media (max-width: 640px)`  |
| **Medium (Small Tablets / Phablets)**        | iPad Mini / Fold phones         | `641–768`        | `@media (max-width: 768px)`  |
| **Large (Tablets Portrait / Small Laptops)** | iPad (portrait) / Surface Go    | `769–1024`       | `@media (max-width: 1024px)` |
| **X-Large (Desktop)**                        | Standard laptop / monitor       | `1025–1280`      | `@media (max-width: 1280px)` |
| **2X-Large (Wide Desktop)**                  | 1440p / 2K monitor              | `1281–1536`      | `@media (max-width: 1536px)` |
| **3X-Large (Ultra-Wide / 4K)**               | 4K monitors                     | `1537–1920+`     | `@media (min-width: 1536px)` |

---

## 📱 Common Device Reference (Portrait Widths)

| Device                    | Resolution (px) | CSS Width (px)        | Category    |
| ------------------------- | --------------- | --------------------- | ----------- |
| iPhone SE (1st Gen)       | 640×1136        | **320**               | Extra Small |
| iPhone 14                 | 1170×2532       | **390**               | Small       |
| iPhone 14 Pro Max         | 1290×2796       | **430**               | Small       |
| Google Pixel 8            | 1080×2400       | **412**               | Small       |
| iPad Mini                 | 1536×2048       | **768**               | Medium      |
| iPad Pro 11"              | 1668×2388       | **834**               | Large       |
| iPad Pro 12.9"            | 2048×2732       | **1024**              | Large       |
| MacBook Air 13"           | 2560×1600       | **1280**              | X-Large     |
| Desktop Monitor (Full HD) | 1920×1080       | **1440–1536** typical | 2X-Large    |
| 4K Monitor                | 3840×2160       | **1920**              | 3X-Large    |

---

## 🧩 Recommended Media Query Set (Practical)

```css
/* Mobile (portrait) */
@media (max-width: 480px) { ... }

/* Mobile landscape / small tablets */
@media (max-width: 640px) { ... }

/* Tablets portrait */
@media (max-width: 768px) { ... }

/* Tablets landscape / small laptops */
@media (max-width: 1024px) { ... }

/* Laptops / desktops */
@media (max-width: 1280px) { ... }

/* Large desktops / 2K */
@media (max-width: 1536px) { ... }
```

Or use **min-width** for a mobile-first approach (recommended):

```css
/* Mobile first */
@media (min-width: 480px) { ... }   /* Small phones and up */
@media (min-width: 640px) { ... }   /* Larger phones */
@media (min-width: 768px) { ... }   /* Tablets */
@media (min-width: 1024px) { ... }  /* Laptops */
@media (min-width: 1280px) { ... }  /* Desktops */
@media (min-width: 1536px) { ... }  /* Large desktops */
```

---

## 🧱 Tailwind / Bootstrap Equivalents (for reference)

| Framework        | XS    | SM    | MD    | LG     | XL     | 2XL    |
| ---------------- | ----- | ----- | ----- | ------ | ------ | ------ |
| **Tailwind CSS** | –     | 640px | 768px | 1024px | 1280px | 1536px |
| **Bootstrap 5**  | 576px | 768px | 992px | 1200px | 1400px | –      |

---

## 🎯 Quick Summary

✅ **Key breakpoints you actually need:**

* **480px** — mobile portrait
* **640px** — large mobile / small tablet
* **768px** — tablet portrait
* **1024px** — tablet landscape / small laptop
* **1280px** — desktop
* **1536px** — wide desktop

These six will handle **95%+ of devices** in 2025.
