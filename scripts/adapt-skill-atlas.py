"""Create an embeddable derivative; never edit the collected reference."""
from pathlib import Path
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen

root = Path(__file__).resolve().parent.parent
html = (root / 'docs/portfolio-materials/sources/skill-map/index (6).html').read_text(encoding='utf-8')
if '--fetch-logos' in sys.argv:
    slugs = sorted(set(re.findall(r":'([a-z0-9-]+/[a-z0-9-]+)'", html)))
    logo_dir = root / 'public/atlas/logos'
    logo_dir.mkdir(parents=True, exist_ok=True)
    def download(slug):
        target = logo_dir / (slug.replace('/', '--') + '.svg')
        if target.exists():
            return
        errors = []
        urls = [base + slug + '.svg' for base in ['https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/', 'https://raw.githubusercontent.com/devicons/devicon/master/icons/']]
        if slug in ['huggingface/huggingface-original', 'webgl/webgl-original', 'langchain/langchain-original']:
            urls.append('https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/' + slug.split('/')[0] + '.svg')
        for url in urls:
            try:
                request = Request(url, headers={'User-Agent': 'Portfolio asset preparation'})
                with urlopen(request, timeout=25) as response:
                    data = response.read(300000)
                if b'<svg' not in data:
                    raise ValueError('Not an SVG')
                if 'simple-icons' in url:
                    data = data.replace(b'<svg ', b'<svg fill="#263f36" ', 1)
                target.write_bytes(data)
                return
            except Exception as error:
                errors.append(str(error))
        print('Unavailable:', slug, '; '.join(errors))
    with ThreadPoolExecutor(max_workers=6) as pool:
        list(pool.map(download, slugs))
    print('Local toolkit logos:', len(slugs))
html = html.replace('https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}.svg', './logos/${slug.replaceAll("/","--")}.svg')
html = html.replace("logo.loading='lazy'", "logo.loading='eager'")
html = html.replace('Attic-AI — Competency Constellation', 'Tom Buzon — Capability Atlas').replace('ATTIC / CORE SYSTEM', 'TOM / CAPABILITY ATLAS')
for pattern in [r'<header class="top">.*?</header>', r'<section class="intro">.*?</section>', r'<div class="footer">.*?</div>']:
    html = re.sub(pattern, '', html, flags=re.S)
html = html.replace('</style>', '''
/* Embedding adaptations; all source stations, orbits and toolkit marks retained. */
html,body{background:#0b141b;scroll-behavior:auto}.wrap{max-width:none;padding:0 0 4px}
.stage{min-height:0;height:auto;aspect-ratio:1200/720}.under{margin-top:16px}
.mobile-stations{display:none}select{font:inherit;color:var(--ink);background:#142521;border:1px solid #6c8b79;padding:14px;width:100%}
html[data-paused=true] *,html[data-paused=true] *:before,html[data-paused=true] *:after{animation:none!important;transition:none!important}
@media(max-width:700px), (max-height:380px){.mobile-stations{display:block;margin:10px 0 22px}.mobile-stations label{display:block;margin-bottom:9px;font:11px monospace;color:#b5c7bb}.stage{display:none}.under{grid-template-columns:1fr}.detail,.tools{min-height:0;padding:20px}.line-picker{padding-top:0}.line{flex:1 1 42%;text-align:left}.line:first-child{flex-basis:100%}.line span:last-child{line-height:1.7}}
.mobile-panels{display:none}
/* One viewport: orbit at left, complete station inspector at right. */
html,body{height:100%;overflow:clip}main.wrap{height:100%;display:grid;grid-template-columns:minmax(0,1fr) minmax(290px,31%);grid-template-rows:auto minmax(0,1fr);gap:12px;padding:0;position:relative}
.line-picker{grid-column:1/-1;padding:0 0 3px;gap:6px}.line{padding:10px}.line span:last-child{font-size:12px}
.stage{grid-column:1;grid-row:2;overflow:clip;min-height:0;height:100%;aspect-ratio:auto}.station text{font-size:17px}.corner{font-size:9px}.tr,.bl,.br{display:none}
.under{grid-column:2;grid-row:2;display:flex;flex-direction:column;gap:12px;margin:0;min-height:0}.under .detail,.under .tools{padding:18px;min-height:0;overflow:visible}.under .detail{flex:1}.under .detail h2{font-size:26px}.under .detail p{font-size:14px}.under .tools h3{font-size:20px}.tags{margin-top:14px}.tag{font-size:12px;padding:7px}.toolcaps{margin:12px 0}.tools .note{font-size:11px}
main>.inspect{grid-column:2;grid-row:2;position:relative;inset:auto;width:100%;height:100%;margin:0;padding:18px;transform:none;display:none;overflow:hidden;opacity:1;visibility:visible;box-shadow:inset 2px 0 var(--inspect-color);backdrop-filter:none}main>.inspect.open{display:flex}main:has(>.inspect.open)>.under{visibility:hidden}
.inspect h2{font-size:28px;margin:18px 0 8px}.inspect .sub{font-size:14px}.inspect .sect{margin:16px 0 10px;font-size:11px}.inspect .pills>span{font-size:13px;padding:7px}.inspect .pills.tools{border:0;padding:0;min-height:0;background:none;overflow:visible}.inspect .pills.tools:after{display:none}.inspect .step{font-size:10px;padding-top:14px}
@media(max-width:700px), (max-height:380px){main.wrap{display:flex;flex-direction:column;gap:8px}.line-picker,.stage,main>.inspect.open{display:none}.mobile-stations{display:block;margin:0}.mobile-stations label{font-size:11px;margin:0 0 7px}select{padding:11px;font-size:15px}.under{display:flex;gap:8px;flex:1;min-height:0}main:has(>.inspect.open)>.under{visibility:visible}.under .detail,.under .tools{padding:14px}.under .detail h2{font-size:25px}.under .detail p{font-size:13px;line-height:1.45}.under .tools h3{font-size:20px}.tags{margin-top:11px;gap:5px}.tag{font-size:12px;padding:7px}.toolcaps{margin:10px 0;gap:5px}.tools .note{font-size:10px;line-height:1.4}}
@media(max-height:520px) and (min-width:701px){.inspect .sub,.inspect .step{display:none}.under .tools h3,.under .tools .note{display:none}.inspect h2{font-size:24px;margin:10px 0}.inspect .sect{margin:12px 0 7px}.inspect .pills>span{font-size:12px;padding:6px}.under .detail p{font-size:12px}.under .detail h2{font-size:22px}.under .detail,.under .tools{padding:14px}.tools .note{font-size:10px}.toolcaps{gap:5px}.line{padding:7px}.line span:last-child{font-size:11px}}
@media(max-width:700px), (max-height:380px){.mobile-panels{display:flex;gap:5px}.mobile-panels button{flex:1;padding:11px 8px;background:#11221f;border:1px solid #587768;color:#c4d5ca;font:12px monospace}.mobile-panels button[aria-pressed=true]{background:#314638;color:#f0e6c9}.under{display:block}.under .detail,.under .tools{height:100%;padding:18px}.under .detail h2{font-size:26px}.under .detail p{font-size:15px;line-height:1.6}.under .tag{font-size:14px;padding:9px}.under .detail:has(.tag:nth-child(7)) .tag{font-size:12px;padding:6px}.under .tools{display:none}.under[data-panel=tools] .tools{display:block}.under[data-panel=tools] .detail{display:none}.tools .note{font-size:12px;line-height:1.5}.toolcaps{gap:7px;margin:14px 0}.under .tools h3{font-size:24px}}
/* On a short screen the selected title already appears in the select. Keep every skill and logo, trim repeated labels. */
@media(max-height:460px){.under .detail h2,.under .detail p,.under .tools h3,.under .tools .note{display:none}.under .detail,.under .tools{padding:14px}.under .tags{margin-top:14px;gap:5px}.under .tag,.under .detail:has(.tag:nth-child(7)) .tag{font-size:12px;padding:6px}.under .toolcaps{margin:12px 0 0;gap:6px}}
</style>''')
html = html.replace('<div class="under">', '<div class="mobile-stations"><label for="station-select">Explore a skill / Explorer une compétence</label><select id="station-select"><option value="">Complete atlas / Carte complète</option></select></div><div class="mobile-panels" role="group" aria-label="Skill details"><button type="button" data-panel="skills" aria-pressed="true">Capabilities</button><button type="button" data-panel="tools" aria-pressed="false">Toolkit &amp; logos</button></div><div class="under">')
html = html.replace('</script>', '''
document.querySelector('main').append(document.getElementById('inspect'));
const mobileSelect=document.getElementById('station-select');
const panelButtons=[...document.querySelectorAll('.mobile-panels button')];
panelButtons.forEach(button=>button.addEventListener('click',()=>{document.querySelector('.under').dataset.panel=button.dataset.panel;panelButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)))}));
Object.entries(groups).forEach(([key,group])=>{const optgroup=document.createElement('optgroup');optgroup.label=group.name;group.items.forEach((item,index)=>{const option=document.createElement('option');option.value=key+index;option.textContent=item[0];optgroup.append(option)});mobileSelect.append(optgroup)});
mobileSelect.addEventListener('change',()=>{const value=mobileSelect.value;if(value)choose(value[0],Number(value.slice(1)));else activateCore()});
document.getElementById('map').setAttribute('role','group');
// Make the complete visible label + node a target, including the gap between them.
document.querySelectorAll('.station').forEach(station=>{const box=station.getBBox(),hit=document.createElementNS('http://www.w3.org/2000/svg','rect');hit.setAttribute('x',box.x-5);hit.setAttribute('y',box.y-5);hit.setAttribute('width',box.width+10);hit.setAttribute('height',box.height+10);hit.setAttribute('fill','transparent');station.prepend(hit)});
let lastHeight=0;
new ResizeObserver(()=>{const height=Math.ceil(document.querySelector('main').getBoundingClientRect().height);if(height!==lastHeight){lastHeight=height;parent.postMessage({type:'whoami:atlas-height',height},location.origin)}}).observe(document.querySelector('main'));
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='whoami:atlas-motion')return;const paused=!event.data.enabled;document.documentElement.dataset.paused=String(paused);const svg=document.getElementById('map');if(paused)svg.pauseAnimations();else svg.unpauseAnimations()});
</script>''')
# Responsive geometry lives in the derivative adapter; preserve original data.
html = html.replace('</head>', '<link rel="stylesheet" href="./responsive.css?v=20261010-6c"></head>')
html = html.replace('</body>', '<script src="./responsive.js?v=20261010-6c"></script></body>')
target = root / 'public/atlas/index.html'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(html, encoding='utf-8')
print(target)
