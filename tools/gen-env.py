# coding: utf-8
'''
env gen script
'''
import yaml
import json
import typing as t

content: dict[t.Literal['secret', 'org-config', 'repo-config'], dict]

try:
    with open('config.local.yaml', 'r', encoding='utf-8') as f:
        content = yaml.safe_load(f.read())
except:
    with open('config.local.json', 'r', encoding='utf-8') as f:
        content = json.load(f)


generated = ''
if content.get('secret'):
    generated += f'SECRET={content.get('secret')}\n'

if content.get('org-config'):
    org_conf = yaml.safe_dump(content.get('org-config')).replace('\n', '\\n')
    generated += f'ORG_CONFIG={org_conf}\n'

if content.get('repo-config'):
    org_conf = yaml.safe_dump(content.get('repo-config')).replace('\n', '\\n')
    generated += f'REPO_CONFIG={org_conf}\n'

with open('.dev.vars', 'w', encoding='utf-8') as f:
    f.write(generated)
