import re, os
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'index.src.html'), encoding='utf-8').read()
css = open(os.path.join(here, 'style.css'), encoding='utf-8').read()
js = open(os.path.join(here, 'app.js'), encoding='utf-8').read()
out = src.replace('/*CSS*/', css).replace('/*JS*/', js.replace('</script>', '<\\/script>'))
open(os.path.join(here, '..', 'index.html'), 'w', encoding='utf-8').write(out)
print('index.html', len(out) // 1024, 'KB')

# artifact-változat: doctype/html/head/body nélkül (a közzététel maga teszi köré a vázat)
import re as _re
art = out
art = _re.sub(r'<!doctype html>\s*<html lang="hu">\s*<head>\s*', '', art, count=1)
art = art.replace('<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n', '')
art = art.replace('</head>\n<body>\n', '\n', 1)
art = _re.sub(r'</body>\s*</html>\s*$', '', art)
open(os.path.join(here, '..', 'artifact.html'), 'w', encoding='utf-8').write(art)
print('artifact.html', len(art) // 1024, 'KB')
