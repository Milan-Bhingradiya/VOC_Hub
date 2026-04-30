import requests
from requests.auth import HTTPBasicAuth
import json
from urllib.parse import quote
from pathlib import Path

BASE_URL = "http://confluence.matrixcomsec.org"
auth = HTTPBasicAuth("shabbirhussain.bhaisaheb", "shabbirhussain")

MAX_PAGES_TO_FETCH = 500

def fetch(endpoint):
    try:
        r = requests.get(f"{BASE_URL}{endpoint}", auth=auth)
        return r.json() if r.ok else {"error": r.status_code}
    except:
        return {"error": "failed"}


def fetch_all_content(content_type, expand_fields, max_total=MAX_PAGES_TO_FETCH, batch_size=100):
    results = []
    start = 0
    size = 0

    while len(results) < max_total:
        endpoint = (
            f"/rest/api/content?type={content_type}&start={start}&limit={batch_size}"
            f"&expand={expand_fields}"
        )
        page = fetch(endpoint)
        if "results" not in page:
            return {"error": page.get("error", "Failed to fetch content")}

        batch = page.get("results", [])
        size = page.get("size", 0)
        if not batch:
            break

        results.extend(batch)
        start += len(batch)

        if len(batch) < batch_size:
            break

    return {
        "size": size,
        "fetched": len(results),
        "max_fetched_limit": max_total,
        "results": results[:max_total],
    }

data = {}

# Current User
data['current_user'] = fetch("/rest/api/user/current?expand=status")

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
data['spaces'] = fetch("/rest/api/space?limit=500&expand=description,homepage,metadata.labels,permissions")

# Pages
data['pages'] = fetch_all_content(
    "page",
    "body.storage,version,space,history,metadata.labels,ancestors,children.comment",
)

# Blog Posts
data['blogposts'] = fetch_all_content(
    "blogpost",
    "body.storage,version,space,history,metadata.labels",
)

# Full page details for the requested URL:
# http://confluence.matrixcomsec.org/display/SPS/Safety+Module
safety_title = quote('Safety Module')
data['specific_pages'] = {
    'SPS/Safety Module': fetch(
        f"/rest/api/content?spaceKey=SPS&title={safety_title}&expand=body.storage,body.view,version,space,history,metadata.labels,ancestors,children.comment"
    )
}

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

# Save to file next to this script
output_file = Path(__file__).resolve().parent / 'confluence_data.json'
with open(output_file, 'w') as f:
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
print(f"✓ Specific Pages: {len(data['specific_pages'])}")
print(f"\n✓ Data saved to {output_file}")
