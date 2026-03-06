from pathlib import Path
p = Path('frontend/react/src/pages/analytics-dashboard.jsx')
s = p.read_text(encoding='utf-8')
print('length', len(s))
for ch in '(){}[]':
    print(ch, s.count(ch))
print('<', s.count('<'), '>', s.count('>'))
print('\nlast80:', repr(s[-160:]))
# naive check for unclosed JSX tags by counting '<' vs '/>' occurrences
print('selfClosing /> count:', s.count('/>'))
print('closing tags </ count:', s.count('</'))
open_tags = s.count('<') - s.count('</') - s.count('/>')
print('approx open tags without closing:', open_tags)
