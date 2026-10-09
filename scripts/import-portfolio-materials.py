"""Copy portfolio evidence without writing to the source directories.

Requires Pillow, markdown-it-py, ffprobe and ffmpeg. Run from the M-IA workspace.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import os
import re
import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from urllib.parse import quote
from zoneinfo import ZoneInfo

from markdown_it import MarkdownIt
from PIL import Image


MARKER = "::tag [ PARTIE A CONSULTER POUR CODEX ]"
BUNDLES = ["OPCL/OPCLPortfolioProject", "technicalRepportSFT", "MnemeMind", "MyAgents"]
LABELS = {
    "fff22004c3a922f4ada3ef3ac21436abd1c1a7de72a0bf5d5d7308baf4ec4433.png": "ClipGenerator — démarrage des services locaux",
    "87590299c6cdc18108476b22b40f1e3efdb9f6a66b4b622673e729bcdc976c83.png": "ClipGenerator — analyse audio",
    "8deb266ef8b83a0ea608e3cc965554d97e5c8a8d5aba2e588ccf3277545cfdde.png": "ClipGenerator — description des scènes par IA",
    "44bc6b5396ecdf0b6e5616caa9df17b0aa8ab7a5a59fa1f6122760ac3fb58dac.png": "ClipGenerator — ajustement et animation des cartes",
    "9e3008ebd11e602bdcec29ef9f4e926cc50644974ef546ca71af616eea4334bf.png": "ClipGenerator — narration en direct",
    "91fa13854ad04267f4aec602d3222f6031599507d71344ff5dfabd6763671653.png": "ClipGenerator — vérification du montage avant export",
    "5a01058c604d5de6681354a4dc6001f545f1a0b5c52b64c6abd39a4fdd653fff.mp4": "Vesper — démarrage réel du jeu",
    "f63cac569549c53d32019db58f633d790ee5f693102e6395f4ff2def725a7a3d.mp4": "Hoplites — démonstration originale",
    "51fc8c089195571647d379c7017e0b8506da02ea4a713e312210d5cf719374a0.mp4": "ClipGenerator — vidéo produite 1",
    "13287319fae0590a118fc67b2a4783cc488f658d4598c15fef24fa150493ba78.mp4": "ClipGenerator — vidéo produite 2",
    "d3cbcb48e8e93e585f8d66173904f353672d2d00063490a8c90c0025620d1f39.png": "MnemeMind — balises Markdown",
    "eb9f4fcae2502070b62fecc0b36ae50c6806bfbc0b3fd85860b6bc3dc1847d77.png": "MnemeMind — calendrier",
    "05afa04e9af9a59cb46549b4ee121c9656e7a857f48eb81e7d6b17a4863b0521.png": "MnemeMind — calendrier, seconde vue",
    "7e0929e251697c1566e729886fd840e46908c8cb395aa14f5e71080942b42ccb.png": "MnemeMind — gestion des tâches",
    "af7506a516add97ba95d6d36d425af1c3c60264d386e7cd8af8b6117f6a6bdf7.png": "MnemeMind — IA locale et représentations des embeddings",
    "7b4019db5517f4f4fa6965d1cc9cb27f8b447b1d3efe0c6fcb135bb3b4bcf76a.png": "MnemeMind — seconde vue de l’IA locale",
    "984f45066a64352ede99073bbf6a37d540fe0b926146d5b4ab93e3d97074ddba.png": "MnemeMind — Excalidraw dans les notes",
    "48ad845e5bbd0da9371258f9c551bf6f2219e5c9bb34d291162fe565c2476633.png": "MnemeMind — Mermaid, audio et transcription",
    "e0d9bfd8a39b61ebf1e4c032c52ed5ad2ada87f5fbbc4f49ddebd3d3d1ae52b3.png": "MnemeMind — mode Explore",
    "f11acca33bb58d7fdbc95b8f27db8561664bd9ffee29bc7a6203114dcbf392fb.png": "MnemeMind — Explore en plein écran",
    "441b3de023d37f329fbd08d5d22b72fd23fa6a50221193d9dc9400a508947909.png": "MnemeMind — clonage de voix",
    "e270db2b7cb8da6200100fc5c416fb8eab2be24458dae7463583ef95192178c8.png": "MnemeMind — import des documents",
    "5a9d65d498d2b4a0a878334e909f29ca4edb07d0b875793b8c67884714c2e87e.png": "AtticAgentWatcher — tableau de bord du POC, activité du jour",
    "a24ecd2d5519b8d560c57a499d649b696b3590031548de17f2e2526202f3a850.png": "AtticAgentWatcher — consommation, cache et tokens de raisonnement",
    "0d993879e3724b401b50279adaefa9f367e3f602ad1039db0c0bf75365f689b7.png": "AtticAgentWatcher — tableau de bord sur sept jours",
    "b1bcfa0fd245609227af312f1628b2385702c2db355dd1696772b484ee3e6f8c.png": "AtticAgentWatcher — monde 2D MyFactory",
    "0d1aa1793b830b2998cb7c31898ebfb5dc06fd503be98cd903ae6c391e55a3d1.png": "AtticAgentWatcher — configuration du harness et suivi des agents",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def copy_verified(source: Path, destination: Path) -> str:
    expected = sha256(source)
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        if sha256(destination) != expected:
            raise FileExistsError(f"Refusing to overwrite a different copy: {destination}")
    else:
        shutil.copy2(source, destination)
    if sha256(destination) != expected or sha256(source) != expected:
        raise RuntimeError(f"Source changed or copy differs: {source}")
    return expected


def video_metadata(path: Path) -> dict:
    output = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries",
         "format=duration,size:stream=index,codec_name,codec_type,width,height,pix_fmt,avg_frame_rate",
         "-of", "json", str(path)],
        check=True, capture_output=True, text=True, encoding="utf-8",
    )
    data = json.loads(output.stdout)
    if not any(stream.get("codec_type") == "video" for stream in data["streams"]):
        raise ValueError(f"No video stream: {path}")
    decoded = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-map", "0:v:0", "-map", "0:a:0?", "-f", "null", "-"],
        check=True, capture_output=True, text=True, encoding="utf-8",
    )
    if decoded.stderr.strip():
        raise ValueError(f"Video decoding errors: {path}: {decoded.stderr}")
    return {"duration_seconds": float(data["format"]["duration"]), "streams": data["streams"], "full_decode_verified": True}


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")


STYLE = """
:root{color-scheme:light;--ink:#202624;--muted:#5b6560;--line:#d9e1dc;--accent:#225e43}
*{box-sizing:border-box}body{margin:0;background:#f4f6f3;color:var(--ink);font:17px/1.7 system-ui,sans-serif}
main{max-width:1120px;margin:0 auto;padding:40px 28px 80px}article{background:white;padding:36px;border:1px solid var(--line);border-radius:16px}
h1{font-size:clamp(1.9rem,4vw,3rem);line-height:1.2}h2{margin-top:2.6rem;line-height:1.3}h3,h4{line-height:1.4}
a{color:var(--accent)}nav{display:flex;flex-wrap:wrap;gap:12px 24px;margin-bottom:24px}.muted{color:var(--muted)}
blockquote{margin:24px 0;padding:8px 24px;border-left:4px solid var(--accent);background:#eef5ee}
code{font-size:.9em;background:#edf1ed;padding:2px 5px;border-radius:4px}pre{overflow:auto;padding:16px;background:#edf1ed}
table{border-collapse:collapse;width:100%;font-size:14px;line-height:1.5}th,td{border:1px solid var(--line);padding:10px 12px;text-align:left;vertical-align:top}
th{background:#eef3ee}.table-scroll{overflow:auto;margin:24px 0}img,video{display:block;max-width:100%;height:auto;background:#111;margin:12px 0}
figure{margin:0 0 28px}figcaption{font-size:15px;color:var(--muted)}.gallery article{margin:24px 0}.gallery img{width:100%}
@media(max-width:640px){main{padding:24px 14px}article{padding:22px 16px}body{font-size:16px}}
@media print{body{background:white;font-size:11pt}main,article{max-width:none;padding:0;border:0}nav{display:none}h2,h3,h4{break-after:avoid}tr{break-inside:avoid}a{color:inherit}}
"""


def document(title: str, body: str, page_class: str = "") -> str:
    return f"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title><style>{STYLE}</style></head>
<body class="{page_class}"><main>{body}</main></body></html>
"""


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--skill-map", type=Path, required=True)
    parser.add_argument("--workspace", type=Path, default=Path.cwd())
    args = parser.parse_args()
    # On Windows, resolving a read-only source directory can require opening
    # its directory handle. Absolute paths suffice for this read/copy operation.
    source_root = Path(os.path.abspath(args.source_root))
    skill_map_source = Path(os.path.abspath(args.skill_map))
    workspace = Path(os.path.abspath(args.workspace))
    materials = workspace / "docs/portfolio-materials"
    public_report = workspace / "public/reports/sft"
    if workspace == source_root or workspace.is_relative_to(source_root):
        raise ValueError("Destination must be outside the source tree")

    entries = []
    snapshots = []
    for bundle in BUNDLES:
        source_bundle = source_root / bundle
        for directory in sorted(p for p in source_bundle.rglob("*") if p.is_dir()):
            (materials / "sources" / directory.relative_to(source_root)).mkdir(parents=True, exist_ok=True)
        for source in sorted(p for p in source_bundle.rglob("*") if p.is_file()):
            relative = source.relative_to(source_root)
            target = materials / "sources" / relative
            digest = copy_verified(source, target)
            snapshots.append((source, target, digest))
            entry = {
                "source": str(source), "local": target.relative_to(workspace).as_posix(),
                "bytes": source.stat().st_size, "sha256": digest, "copy_verified": True,
                "kind": {".md": "document", ".png": "image", ".mp4": "video", ".json": "drawing", ".wav": "audio"}.get(source.suffix, "file"),
                "label": LABELS.get(source.name, source.name),
            }
            if source.suffix == ".png":
                with Image.open(target) as image:
                    image.verify()
                with Image.open(target) as image:
                    image.load()
                    entry["image"] = {"width": image.width, "height": image.height, "format": image.format}
            elif source.suffix == ".mp4":
                entry["video"] = video_metadata(target)
                if source.name.startswith("f63cac"):
                    entry["requested_excerpt"] = {"start_seconds": 43, "end_seconds": 108, "duration_seconds": 65, "prepared": False}
            elif source.suffix == ".json":
                drawing = json.loads(target.read_text(encoding="utf-8-sig"))
                scene = drawing["data"]
                if scene.get("fileMap") or any(e.get("type") == "image" for e in scene["elements"]):
                    raise ValueError(f"Drawing media dependencies need resolution: {source}")
                entry["drawing"] = {"id": drawing["drawingId"], "status": drawing["status"], "elements": len(scene["elements"]), "external_media": []}
            entries.append(entry)

    skill_map_target = materials / "sources/skill-map" / skill_map_source.name
    skill_map_digest = copy_verified(skill_map_source, skill_map_target)
    snapshots.append((skill_map_source, skill_map_target, skill_map_digest))
    skill_map_text = skill_map_target.read_text(encoding="utf-8-sig")
    skill_map_title = re.search(r'<title>(.*?)</title>', skill_map_text, re.DOTALL).group(1)
    local_dependencies = [value for value in re.findall(r'(?:src|href)=["\']([^"\']+)', skill_map_text)
                          if not value.startswith(("http:", "https:", "data:", "#"))]
    if local_dependencies:
        raise ValueError(f"Skill map needs additional local files: {local_dependencies}")
    entries.append({"source": str(skill_map_source), "local": skill_map_target.relative_to(workspace).as_posix(),
                    "bytes": skill_map_source.stat().st_size, "sha256": skill_map_digest, "copy_verified": True,
                    "kind": "skill_map", "label": "Carte interactive des compétences",
                    "html": {"title": skill_map_title, "local_dependencies": [],
                             "remote_dependencies": [
                                 {"url": "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap", "purpose": "Polices Google Fonts", "fallback": "Polices système"},
                                 {"url_template": "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}.svg", "purpose": "Logos des outils", "fallback": "Monogrammes locaux"}]}})

    portfolio = materials / "sources/OPCL/OPCLPortfolioProject/OPCLPortfolioProject.md"
    portfolio_text = portfolio.read_text(encoding="utf-8-sig")
    lines = portfolio_text.splitlines(keepends=True)
    marker_indexes = [i for i, line in enumerate(lines) if MARKER in line]
    if len(marker_indexes) != 1:
        raise ValueError(f"Expected exactly one Codex marker, got {marker_indexes}")
    marker_index = marker_indexes[0]
    section = "".join(lines[marker_index:])
    section = re.sub(r'(\]\(|src=")(images/|video/)', r'\1sources/OPCL/OPCLPortfolioProject/\2', section)
    write_text(materials / "brief-codex.md", section)

    references = []
    for path in [portfolio, materials / "sources/technicalRepportSFT/technicalRepportSFT.md", materials / "sources/MnemeMind/MnemeMind.md", materials / "sources/MyAgents/MyAgents.md", materials / "brief-codex.md"]:
        text = path.read_text(encoding="utf-8-sig")
        for match in re.finditer(r'!\[[^\]]*\]\(([^)]+)\)|<video\b[^>]*\bsrc="([^"]+)"', text):
            relative = match.group(1) or match.group(2)
            target = Path(os.path.abspath(path.parent / relative))
            if not target.is_file():
                raise FileNotFoundError(f"Unresolved reference: {target}")
            if not target.is_relative_to(materials):
                raise ValueError(f"Reference outside the local collection: {relative}")
            references.append({"document": path.relative_to(workspace).as_posix(), "reference": relative, "target": target.relative_to(workspace).as_posix(), "resolved": True})
        for drawing_id in re.findall(r'```excalidraw\s+(excalidraw-[a-z0-9-]+)\s*```', text):
            drawing = next(e for e in entries if e.get("drawing", {}).get("id") == drawing_id)
            references.append({"document": path.relative_to(workspace).as_posix(), "reference": drawing_id, "target": drawing["local"], "resolved": True})

    report = materials / "sources/technicalRepportSFT/technicalRepportSFT.md"
    report_digest = copy_verified(report, public_report / "technicalRepportSFT.md")
    report_text = report.read_text(encoding="utf-8-sig")
    readable = re.sub(r'^::id\s*\[[^\]]*\]\s*$', '', report_text, flags=re.MULTILINE)
    readable = re.sub(r'```excalidraw\s+.*?```', '', readable, flags=re.DOTALL)
    readable = re.sub(r'::(?:link|tag)\s*\[[^\]]*\]', '', readable)
    renderer = MarkdownIt("commonmark", {"html": False}).enable("table")
    report_html = renderer.render(readable)
    report_html = report_html.replace("<table>", '<div class="table-scroll"><table>').replace("</table>", "</table></div>")
    report_title = "Spécialiser un petit LLM : de la preuve de concept à la décision IT"
    write_text(public_report / "index.html", document(report_title,
        '<nav aria-label="Actions du rapport"><a href="technicalRepportSFT.md" download>Télécharger le rapport Markdown original</a></nav>'
        + '<article>' + report_html + '</article>'))

    cards = []
    ordered_media = sorted(entries, key=lambda entry: list(LABELS).index(Path(entry["local"]).name) if Path(entry["local"]).name in LABELS else len(LABELS))
    for entry in ordered_media:
        if entry["kind"] not in ["image", "video"]:
            continue
        relative = Path(entry["local"]).relative_to("docs/portfolio-materials").as_posix()
        url = quote(relative)
        label = html.escape(entry["label"])
        if entry["kind"] == "image":
            metadata = entry["image"]
            media = f'<img src="{url}" alt="{label}" width="{metadata["width"]}" height="{metadata["height"]}" loading="lazy">'
            details = f'{metadata["width"]} × {metadata["height"]} px'
        else:
            metadata = entry["video"]
            media = f'<video controls preload="metadata" playsinline src="{url}"></video>'
            details = f'{metadata["duration_seconds"]:.2f} s — original complet'
            if "requested_excerpt" in entry:
                details += ' — extrait demandé : 00:43 à 01:48 (65 s), à préparer lors de l’intégration'
        cards.append(f'<article><h2>{label}</h2><figure>{media}<figcaption>{details}</figcaption></figure><a href="{url}" download>Ouvrir ou télécharger le fichier original</a></article>')
    write_text(materials / "media-gallery.html", document("Médias pour la mise à jour du portfolio",
        '<h1>Médias pour la mise à jour du portfolio</h1><p>Six captures ClipGenerator, douze captures MnemeMind, cinq captures AtticAgentWatcher et quatre vidéos conservées dans leur format original.</p>'
        '<nav><a href="../../public/reports/sft/index.html">Lire le rapport SFT</a><a href="brief-codex.md">Consulter le brief Codex</a>'
        '<a href="sources/MnemeMind/MnemeMind.md">Lire la présentation MnemeMind</a>'
        '<a href="sources/MyAgents/MyAgents.md">Lire les notes AtticAgentWatcher</a>'
        + f'<a href="{quote(skill_map_target.relative_to(materials).as_posix())}">Ouvrir la carte des compétences</a></nav>'
        + "".join(cards), "gallery"))

    manifest = {
        "schema_version": 1, "imported_at": datetime.now(ZoneInfo("Europe/Amsterdam")).isoformat(),
        "source_root": str(source_root), "additional_sources": [str(skill_map_source)], "workspace": str(workspace), "source_read_only": True,
        "codex_marker": {"text": MARKER, "source_line": marker_index + 1, "content_until_end_of_document": True, "local_excerpt": "docs/portfolio-materials/brief-codex.md", "media_links_rebased": True},
        "files": entries, "references": references,
        "agent_entry_point": "AGENTS.md",
        "naming": {"MnemeMind": "Nouveau nom de Mastermind / MasterMind", "ClipGenerator": "Anciennement FrameForge", "AtticAgentWatcher": "Nouveau nom de MyAgents ; même projet, selon l’utilisateur"},
        "attic_agent_watcher": {"document": "docs/portfolio-materials/sources/MyAgents/MyAgents.md", "images": "docs/portfolio-materials/sources/MyAgents/images", "image_count": 5, "portfolio_status": "POC validé, passage en production en cours", "original_branding_preserved": "MyAgents", "additional_audio": "docs/portfolio-materials/sources/MyAgents/audio/4db9e22e874635feb9a5008ebd865f6c818e0cc26c6ed353a855f0e7de8e18ac.wav", "audio_referenced_in_document": False},
        "skill_map": {"local": skill_map_target.relative_to(workspace).as_posix(), "source_filename": skill_map_source.name,
                      "standalone_html": True, "interactive": True, "domains": ["AI Engineering", "Agentic Systems", "Creative Interfaces", "Product & Strategy"], "station_count": 20},
        "report_publication": {"html": "public/reports/sft/index.html", "markdown": "public/reports/sft/technicalRepportSFT.md", "url": "reports/sft/", "markdown_sha256": report_digest, "body_preserved": True, "application_metadata_and_drawing_marker_removed_from_html_only": True, "portfolio_link_added": False, "deployed": False},
        "logical_document_links": [
            {"reference": "technicalRepportSFT", "target": "docs/portfolio-materials/sources/technicalRepportSFT/technicalRepportSFT.md", "scope": "Codex brief"},
            {"reference": "OPCL/OPCLPortfolioProject/OPCLPortfolioProject", "target": "docs/portfolio-materials/sources/OPCL/OPCLPortfolioProject/OPCLPortfolioProject.md", "scope": "SFT report"},
            {"reference": "myAgents_OPCLNarative", "scope": "before Codex marker", "imported": False, "reason": "Unrelated document outside the requested section"},
            {"reference": "NewProcessAgents", "scope": "MyAgents historical notes", "imported": False, "reason": "Related notes outside the requested bundle"},
            {"reference": "MastermindV2/MastermindV2", "scope": "MyAgents historical notes", "imported": False, "reason": "Historical document link preserved in the original Markdown"},
        ],
        "pending_materials": [
            {"project": "MnemeMind", "required": "Vidéo de démonstration", "reason": "La section Vidéo du document est vide ; les douze images sont importées"},
            {"project": "SFT", "required": "URL du dépôt technique complet si souhaitée", "reason": "Le rapport contient un emplacement à relier, sans URL de dépôt"},
        ],
        "summary": {"copied_original_files": len(entries), "images": sum(e["kind"] == "image" for e in entries), "videos": sum(e["kind"] == "video" for e in entries), "documents": sum(e["kind"] == "document" for e in entries), "drawings": sum(e["kind"] == "drawing" for e in entries), "skill_maps": sum(e["kind"] == "skill_map" for e in entries), "audio_files": sum(e["kind"] == "audio" for e in entries), "original_bytes": sum(e["bytes"] for e in entries), "all_copies_sha256_match": True, "all_media_and_drawing_references_resolved": True},
    }
    # Recheck after generation so no success is reported for a changing source.
    for source, target, digest in snapshots:
        if sha256(source) != digest or sha256(target) != digest:
            raise RuntimeError(f"Integrity verification failed: {source}")
    write_text(materials / "manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(manifest["summary"], ensure_ascii=False, indent=2))
    print(f"Codex section starts at line {marker_index + 1}")
    print(f"Collection: {materials}")
    print(f"Public report prepared: {public_report / 'index.html'}")


if __name__ == "__main__":
    main()
