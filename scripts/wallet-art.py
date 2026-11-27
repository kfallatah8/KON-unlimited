# Sizes the rendered artwork into the exact files Apple and Google Wallet expect.
import os
from PIL import Image
d = os.path.join(os.path.dirname(__file__), '..', 'public', 'wallet')
src = lambda n: Image.open(os.path.join(d, n)).convert('RGBA')
def save(im, n): im.save(os.path.join(d, n), optimize=True)
strip = src('_strip.png')
for s, n in ((3, 'strip@3x.png'), (2, 'strip@2x.png'), (1, 'strip.png')):
    save(strip.resize((375 * s, 123 * s), Image.LANCZOS).convert('RGB'), n)
save(src('_hero.png').convert('RGB'), 'google-hero.png')
logo = src('_logo.png'); logo = logo.crop(logo.getbbox())
for s, n in ((3, 'logo@3x.png'), (2, 'logo@2x.png'), (1, 'logo.png')):
    W, H = 160 * s, 50 * s
    im = logo.copy(); im.thumbnail((W, H - 6 * s), Image.LANCZOS)
    save(im, n)
icon = Image.open(os.path.join(d, '..', '..', 'scripts', 'kon-square.png')).convert('RGB')
for s, n in ((3, 'icon@3x.png'), (2, 'icon@2x.png'), (1, 'icon.png')):
    save(icon.resize((29 * s, 29 * s), Image.LANCZOS), n)
save(icon.resize((660, 660), Image.LANCZOS), 'google-logo.png')
for n in ('_strip.png', '_hero.png', '_logo.png'): os.remove(os.path.join(d, n))
print('ok', sorted(os.listdir(d)))
