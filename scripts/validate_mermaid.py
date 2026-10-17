import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('README.md', 'r', encoding='utf-8') as f:
    text = f.read()

blocks = re.findall(r'```mermaid(.*?)```', text, re.DOTALL)
print('Total mermaid blocks:', len(blocks))

has_error = False
for i, b in enumerate(blocks, 1):
    print(f'\n=== BLOCK {i} ===')
    for line_no, line in enumerate(b.strip().split('\n'), 1):
        pipes = re.findall(r'\|(.*?)\|', line)
        for p in pipes:
            for bad in ['(', ')', '<', '>', '&', '₹', 'λ', '√', '≥', '≤', '/']:
                if bad in p:
                    print(f'  [WARN] Line {line_no} bad char "{bad}" in |{p}|')
                    has_error = True
        labels = re.findall(r'\[(.*?)\]', line)
        for l in labels:
            if any(c in l for c in ['<', '>']) and not ('<br/>' in l or '<br>' in l):
                print(f'  [WARN] Line {line_no} angle brackets in [{l}]')
                has_error = True

if not has_error:
    print('All Mermaid diagrams are 100% clean and validated!')
else:
    print('Some warnings found!')
