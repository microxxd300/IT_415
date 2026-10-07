# Kiosk images

Files in this folder are served as-is: `public/assets/logo/logo.png` → `/assets/logo/logo.png`.
If an image is missing, the kiosk falls back to the emoji icon (products) or "CS" (logo).

| File | Size | Format | Used by |
|------|------|--------|---------|
| `logo/logo.png` | 512 × 512 px | PNG, transparent | Header (44 × 44 px) and browser tab icon |
| `menu/coffee.png` | 600 × 600 px | PNG, transparent | Coffee card |
| `menu/sandwich.png` | 600 × 600 px | PNG, transparent | Sandwich card |
| `menu/soda.png` | 600 × 600 px | PNG, transparent | Soft Drink card |
| `menu/cookies.png` | 600 × 600 px | PNG, transparent | Cookies card |
| `menu/water.png` | 600 × 600 px | PNG, transparent | Bottled Water card |
| `menu/chocolate.png` | 600 × 600 px | PNG, transparent | Chocolate card |

The product → file mapping is `PRODUCT_IMAGES` in `src/components/ProductCard.jsx`.
