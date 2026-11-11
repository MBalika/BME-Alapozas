import re, os
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'index.src.html'), encoding='utf-8').read()
css = open(os.path.join(here, 'style.css'), encoding='utf-8').read()
js = open(os.path.join(here, 'app.js'), encoding='utf-8').read()
def assemble(src, css, js):
    return src.replace('/*CSS*/', css).replace('/*JS*/', js.replace('</script>', '<\\/script>'))
out = assemble(src, css, js)
open(os.path.join(here, '..', 'index.html'), 'w', encoding='utf-8').write(out)
print('index.html', len(out) // 1024, 'KB')

# angol változat (en.html → /en): a magyar forrásból a fordítási párokkal; minden kulcsnak meg kell lennie
import sys; sys.dont_write_bytecode = True; sys.path.insert(0, here); import i18n_en as T
def apply(text, pairs, name):
    for a, b in pairs:
        if a not in text: raise SystemExit(f'[{name}] a fordítási kulcs nem található (változott a magyar forrás?): {a[:90]!r}')
        text = text.replace(a, b)
    return text
en = assemble(apply(src, T.HTML, 'html'), apply(css, T.CSS, 'css'), apply(js, T.JS, 'js'))
open(os.path.join(here, '..', 'en.html'), 'w', encoding='utf-8').write(en)
print('en.html', len(en) // 1024, 'KB')

# artifact-változat: doctype/html/head/body nélkül (a közzététel maga teszi köré a vázat)
import re as _re
art = out
art = _re.sub(r'<!doctype html>\s*<html lang="hu">\s*<head>\s*', '', art, count=1)
art = art.replace('<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n', '')
art = art.replace('</head>\n<body>\n', '\n', 1)
art = _re.sub(r'</body>\s*</html>\s*$', '', art)
open(os.path.join(here, '..', 'artifact.html'), 'w', encoding='utf-8').write(art)
print('artifact.html', len(art) // 1024, 'KB')
