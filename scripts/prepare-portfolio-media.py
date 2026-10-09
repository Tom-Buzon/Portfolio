"""Build web derivatives from the immutable, hash-checked portfolio collection."""
from pathlib import Path
import hashlib
import json
import subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'docs/portfolio-materials'
OUTPUT = ROOT / 'public/media'
OUTPUT.mkdir(parents=True, exist_ok=True)
MANIFEST = json.loads((SOURCE / 'manifest.json').read_text(encoding='utf-8'))
FILES = {Path(f['local']).stem: f for f in MANIFEST['files']}

IMAGES = {
    'mneme-tags': 'd3cbcb48', 'mneme-explore': 'e0d9bfd8', 'mneme-graph': 'f11acca3',
    'mneme-week': 'eb9f4fca', 'mneme-year': '05afa04e', 'mneme-tasks': '7e0929e2',
    'mneme-drawing': '984f4506', 'mneme-audio': '48ad845e', 'mneme-voice': '441b3de0',
    'mneme-embeddings': 'af7506a5', 'mneme-answer': '7b4019db', 'mneme-import': 'e270db2b',
    'watcher-today': '5a9d65d4', 'watcher-tokens': 'a24ecd2d', 'watcher-week': '0d993879',
    'watcher-factory': 'b1bcfa0f', 'watcher-config': '0d1aa179',
    'clip-services': 'fff22004', 'clip-audio': '87590299', 'clip-scenes': '8deb266e',
    'clip-animation': '44bc6b53', 'clip-narration': '9e3008eb', 'clip-edit': '91fa1385',
}
VIDEOS = {
    'vesper': ('5a01058c', 0, None, 8),
    'hoplites': ('f63cac56', 43, 65, 22),
    'clip-one': ('51fc8c08', 0, None, 12),
    'clip-two': ('13287319', 0, None, 12),
}

def source(prefix):
    record = next(value for key, value in FILES.items() if key.startswith(prefix))
    path = ROOT / record['local']
    if hashlib.sha256(path.read_bytes()).hexdigest() != record['sha256']:
        raise ValueError(f'Source hash mismatch: {path}')
    return path, record

result = {}
for name, prefix in IMAGES.items():
    path, record = source(prefix)
    with Image.open(path) as original:
        im = original.convert('RGB')
        variants = []
        for width in sorted(set([min(480, im.width), min(1280, im.width), im.width])):
            resized = im.resize((width, round(im.height * width / im.width)), Image.Resampling.LANCZOS)
            filename = f'{name}-{width}.webp'
            resized.save(OUTPUT / filename, quality=92 if width == im.width else 86, method=6)
            variants.append({'src': '/media/' + filename, 'width': width})
        result[name] = {'width': im.width, 'height': im.height, 'variants': variants,
                        'source': record['local'], 'sha256': record['sha256']}

for name, (prefix, start, duration, poster_time) in VIDEOS.items():
    path, record = source(prefix)
    target = OUTPUT / f'{name}.mp4'
    if not target.exists():
        args = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(start), '-i', str(path)]
        if duration:
            args += ['-t', str(duration)]
        video_filter="scale='min(1120,iw)':-2,fps=30" if name=='hoplites' else "scale='min(1280,iw)':-2"
        args += ['-vf', video_filter, '-c:v', 'libx264', '-preset', 'medium', '-crf', '26' if name=='hoplites' else '23',
                 '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', str(target)]
        subprocess.run(args, check=True)
    poster = OUTPUT / f'{name}-poster.webp'
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(poster_time),
                    '-i', str(target), '-frames:v', '1', '-vf', "scale='min(960,iw)':-2", str(poster)], check=True)
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries',
        'stream=codec_type,width,height:format=duration', '-of', 'json', str(target)]))
    video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    result[name] = {'src': '/media/' + target.name, 'poster': '/media/' + poster.name,
                    'width': video['width'], 'height': video['height'], 'duration': float(probe['format']['duration']),
                    'source': record['local'], 'sha256': record['sha256'], 'start': start}
    print(name, round(target.stat().st_size / 1048576, 2), 'MiB', flush=True)

(ROOT / 'src/content').mkdir(exist_ok=True)
(ROOT / 'src/content/media.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
print('Prepared', len(IMAGES), 'screenshots and', len(VIDEOS), 'videos; originals unchanged.', flush=True)
