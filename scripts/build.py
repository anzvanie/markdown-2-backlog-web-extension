#!/usr/bin/env python3
import json,zipfile,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
dist=root/'dist';dist.mkdir(exist_ok=True)
for browser in ('chrome','firefox'):
    manifest=root/'platform'/browser/'manifest.json'
    json.loads(manifest.read_text())
    target=dist/f'markdown-to-backlog-{browser}-v2.0.0.zip'
    with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
        z.write(manifest,'manifest.json')
        for p in (root/'src').rglob('*'):
            if p.is_file():z.write(p,p.relative_to(root/'src').as_posix())
    with zipfile.ZipFile(target) as z:
        assert z.testzip() is None
        assert 'manifest.json' in z.namelist()
    print(target)
