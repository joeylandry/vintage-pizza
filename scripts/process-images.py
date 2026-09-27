"""Crop/resize source photos into public/ as WebP.

Usage: python scripts/process-images.py <assets_dir>
  <assets_dir>/imgs      site photos downloaded from vintagepizzanh.com (WebP)
  <assets_dir>/pdfimgs   photos cropped from the printed PDF menu
  <assets_dir>/raw-ai    AI placeholders from scripts/generate-ai-images.ts
Requires Pillow.
"""
import os
import sys
from PIL import Image

A = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), "..", "public")
MENU = os.path.join(OUT, "menu")
SITE = os.path.join(OUT, "images")
os.makedirs(MENU, exist_ok=True)
os.makedirs(SITE, exist_ok=True)


def fit(im, ratio=4 / 3, width=960, focus=(0.5, 0.5)):
    """Center-crop to `ratio` around `focus`, then scale to `width`."""
    im = im.convert("RGB")
    w, h = im.size
    if w / h > ratio:
        nw = int(h * ratio)
        x = int((w - nw) * focus[0])
        im = im.crop((x, 0, x + nw, h))
    else:
        nh = int(w / ratio)
        y = int((h - nh) * focus[1])
        im = im.crop((0, y, w, y + nh))
    if im.width > width:
        im = im.resize((width, int(width / ratio)), Image.LANCZOS)
    return im


def save(im, path, q=80):
    im.save(path, "WEBP", quality=q, method=6)


site = lambda n: Image.open(os.path.join(A, "imgs", n + ".webp"))
pdf = lambda n: Image.open(os.path.join(A, "pdfimgs", n + ".jpg"))

# Real menu photos -> public/menu/<item-id>.webp
g21 = site("g21")
w, h = g21.size
sausage = g21.crop((0, int(h * 0.22), int(w * 0.52), int(h * 0.5)))
photos = {
    "original-margherita": (site("g12"), (0.5, 0.5)),
    "sausage-ricotta": (sausage, (0.5, 0.5)),
    "greek-pizza": (pdf("pdf-veggie-pizza"), (0.5, 0.5)),
    "italian-sub": (pdf("pdf-italian-sub"), (0.5, 0.4)),
    "texas-cheeseburger": (pdf("pdf-burger"), (0.5, 0.5)),
    "chicken-tenders": (pdf("pdf-tenders"), (0.5, 0.5)),
    "chicken-tender-dinner": (site("g08"), (0.5, 0.65)),
    "buffalo-tenders": (site("g04"), (0.5, 0.45)),
    "chicken-tender-party-tray": (site("g27"), (0.5, 0.5)),
    "asian-tender-salad": (site("g06"), (0.5, 0.5)),
    "grilled-chicken-greek-salad": (pdf("pdf-greek-salad"), (0.5, 0.5)),
    "garden-salad": (site("g19"), (0.5, 0.6)),
    "sticks-and-stones": (pdf("pdf-appetizers"), (0.5, 0.5)),
    "cannoli": (site("g20"), (0.5, 0.5)),
    "beignets": (site("g01"), (0.5, 0.5)),
}
for item_id, (im, focus) in photos.items():
    save(fit(im, focus=focus), os.path.join(MENU, item_id + ".webp"))

# AI placeholders: drop the watermark strip along the bottom, then crop to 4:3.
raw = os.path.join(A, "raw-ai")
if os.path.isdir(raw):
    for f in sorted(os.listdir(raw)):
        if not f.endswith(".jpg"):
            continue
        im = Image.open(os.path.join(raw, f))
        im = im.crop((0, 0, im.width, int(im.height * 0.92)))
        save(fit(im, focus=(0.5, 0.3)), os.path.join(MENU, f[:-4] + ".webp"))

# Site photography -> public/images
save(fit(site("g21"), ratio=4 / 5, width=1000), os.path.join(SITE, "hero-pizzas.webp"), 82)
save(fit(site("g12"), ratio=16 / 9, width=1920), os.path.join(SITE, "hero-wide.webp"), 78)
save(fit(site("g15"), ratio=4 / 5, width=900, focus=(0.5, 0.4)), os.path.join(SITE, "storefront.webp"))
save(fit(site("g26"), ratio=3 / 2, width=1200), os.path.join(SITE, "team.webp"))
save(fit(site("g11"), ratio=1, width=800), os.path.join(SITE, "broccoli-pie.webp"))
save(fit(site("g13"), ratio=1, width=800, focus=(0.5, 0.4)), os.path.join(SITE, "night-front.webp"))
save(fit(site("g18"), ratio=1, width=800, focus=(0.5, 0.45)), os.path.join(SITE, "sign.webp"))
save(fit(site("g03"), ratio=1, width=800, focus=(0.5, 0.3)), os.path.join(SITE, "founders.webp"))
save(fit(site("g20"), ratio=1, width=800), os.path.join(SITE, "cannoli-tray.webp"))
Image.open(os.path.join(A, "imgs", "logo-white.webp")).save(os.path.join(SITE, "logo-white.webp"), "WEBP", lossless=True)
print("done", len(os.listdir(MENU)), "menu images")
