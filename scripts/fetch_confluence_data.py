import requests
from requests.auth import HTTPBasicAuth
import json

BASE_URL = "http://172.16.7.210:8081"
auth = HTTPBasicAuth("shabbirhussain.bhaisaheb", "shabbirhussain")

def fetch(endpoint):
    try:
        r = requests.get(f"{BASE_URL}{endpoint}", auth=auth)
        return r.json() if r.ok else {"error": r.status_code}
    except:
        return {"error": "failed"}

data = {}

# Current User
data['current_user'] = fetch("/rest/api/user/current")

# Groups
data['groups'] = fetch("/rest/api/group?limit=100")

# Get users from groups
data['users'] = []
if 'results' in data['groups']:
    for group in data['groups']['results']:
        group_name = group['name']
        members = fetch(f"/rest/api/group/{group_name}/member?limit=100")
        if 'results' in members:
            data['users'].extend(members['results'])

# Spaces
data['spaces'] = fetch("/rest/api/space?limit=100&expand=description,homepage,metadata.labels,permissions")

# Pages
data['pages'] = fetch("/rest/api/content?type=page&limit=1000&expand=body.storage,version,space,history,metadata.labels,ancestors,children.comment")

# Blog Posts
data['blogposts'] = fetch("/rest/api/content?type=blogpost&limit=1000&expand=body.storage,version,space,history,metadata.labels")

# Attachments (if pages exist)
data['attachments'] = []
if 'results' in data['pages']:
    for page in data['pages']['results'][:50]:
        attachments = fetch(f"/rest/api/content/{page['id']}/child/attachment?limit=100&expand=version,metadata")
        if 'results' in attachments:
            data['attachments'].extend(attachments['results'])

# Comments
data['comments'] = []
if 'results' in data['pages']:
    for page in data['pages']['results'][:50]:
        comments = fetch(f"/rest/api/content/{page['id']}/child/comment?limit=100&expand=body.storage,version,history")
        if 'results' in comments:
            data['comments'].extend(comments['results'])

# Labels
data['labels'] = []
if 'results' in data['pages']:
    for page in data['pages']['results']:
        if 'metadata' in page and 'labels' in page['metadata']:
            labels = page['metadata']['labels'].get('results', [])
            data['labels'].extend(labels)

# Content templates
data['templates'] = fetch("/rest/api/template?limit=100")

# Save to file
with open('confluence_data.json', 'w') as f:
    json.dump(data, f, indent=2)

print("=== CONFLUENCE DATA FETCHED ===\n")
print(f"✓ Current User: {data['current_user'].get('displayName', 'N/A')}")
print(f"✓ Groups: {len(data['groups'].get('results', []))}")
print(f"✓ Users: {len(data['users'])}")
print(f"✓ Spaces: {len(data['spaces'].get('results', []))}")
print(f"✓ Pages: {len(data['pages'].get('results', []))}")
print(f"✓ Blog Posts: {len(data['blogposts'].get('results', []))}")
print(f"✓ Attachments: {len(data['attachments'])}")
print(f"✓ Comments: {len(data['comments'])}")
print(f"✓ Labels: {len(data['labels'])}")
print(f"✓ Templates: {len(data['templates'].get('results', []))}")
print(f"\n✓ Data saved to confluence_data.json")
