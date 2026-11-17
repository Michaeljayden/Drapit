# Maakt van bron/*.png de eindbestanden: feed 1080x1350 met logo, story 1080x1920, 1:1 voor 33-40.
from PIL import Image, ImageDraw, ImageFilter, ImageStat, ImageEnhance
import glob, os, re, sys
LOGO = Image.open('../public/email/drapit-logo.png').convert('RGB')
LW = 170; LH = round(LW * LOGO.height / LOGO.width)
logo = LOGO.resize((LW, LH), Image.LANCZOS)
mask = Image.new('L', (LW*4, LH*4), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, LW*4-1, LH*4-1], radius=int(LH*4*0.30), fill=255)
mask = mask.resize((LW, LH), Image.LANCZOS)
M = 40
def place_logo(im):
    W, H = im.size
    spots = {'br': (W-LW-M, H-LH-M), 'bl': (M, H-LH-M), 'tr': (W-LW-M, M)}
    def busy(p):
        reg = im.crop((p[0]-10, p[1]-10, p[0]+LW+10, p[1]+LH+10)).convert('L')
        st = ImageStat.Stat(reg); return st.stddev[0] + st.mean[0]*0.3
    sc = {k: busy(p) for k, p in spots.items()}
    k = 'br' if sc['br'] <= 30 else min(sc, key=sc.get)
    im.paste(logo, spots[k], mask); return k
def pad(im, W, H):
    bg = im.resize((W, round(W*im.height/im.width)) if W/im.width > H/im.height else (round(H*im.width/im.height), H), Image.LANCZOS)
    bg = bg.crop(((bg.width-W)//2, (bg.height-H)//2, (bg.width-W)//2+W, (bg.height-H)//2+H))
    bg = ImageEnhance.Brightness(bg.filter(ImageFilter.GaussianBlur(45))).enhance(0.5)
    s = min(W/im.width, H/im.height)
    fg = im.resize((round(im.width*s), round(im.height*s)), Image.LANCZOS)
    a = Image.new('L', fg.size, 255); d = ImageDraw.Draw(a); F = 70
    for i in range(F):
        v = int(255*i/F)
        if fg.height < H: d.line([(0, i), (fg.width, i)], fill=v); d.line([(0, fg.height-1-i), (fg.width, fg.height-1-i)], fill=v)
        if fg.width < W: d.line([(i, 0), (i, fg.height)], fill=v); d.line([(fg.width-1-i, 0), (fg.width-1-i, fg.height)], fill=v)
    bg.paste(fg, ((W-fg.width)//2, (H-fg.height)//2), a); return bg
for d in ['feed', 'story', 'vierkant', 'en']: os.makedirs(d, exist_ok=True)
only = sys.argv[1:]
for f in sorted(glob.glob('bron/drapit-*.png')):
    key = re.match(r'bron/drapit-(.+)\.png', f).group(1)
    if only and key not in only: continue
    im = Image.open(f).convert('RGB').resize((1080, 1350), Image.LANCZOS)
    k = place_logo(im)
    en = key.startswith('en-'); n = key[-2:]
    feed = f'en/paskamer-en-feed-{n}.jpg' if en else f'feed/paskamer-feed-{n}.jpg'
    story = f'en/paskamer-en-story-{n}.jpg' if en else f'story/paskamer-story-{n}.jpg'
    im.save(feed, quality=90); pad(im, 1080, 1920).save(story, quality=90)
    if not en and 33 <= int(n) <= 40: pad(im, 1080, 1080).save(f'vierkant/paskamer-1x1-{n}.jpg', quality=90)
    print(key, k)
