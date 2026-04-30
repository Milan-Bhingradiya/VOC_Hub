import requests
from requests.auth import HTTPBasicAuth
import json
from urllib.parse import quote
from pathlib import Path

BASE_URL = "http://jira.matrixcomsec.org"
auth = HTTPBasicAuth("shabbirhussain.bhaisaheb", "shabbirhussain")

# Keep pagination bounded to avoid creating extremely large JSON files.
MAX_ISSUES_TO_FETCH = 2000
SPECIFIC_ISSUE_KEYS = ["SS2-425"]

def fetch(endpoint):
    try:
        r = requests.get(f"{BASE_URL}{endpoint}", auth=auth)
        return r.json() if r.ok else {"error": r.status_code}
    except Exception as e:
        return {"error": str(e)}


def fetch_all_issues(jql, max_total=MAX_ISSUES_TO_FETCH, batch_size=100):
    issues = []
    total = 0
    start_at = 0

    while start_at < max_total:
        endpoint = (
            f"/rest/api/2/search?jql={quote(jql)}"
            f"&startAt={start_at}&maxResults={batch_size}"
            "&expand=names,schema"
        )
        page = fetch(endpoint)
        if "issues" not in page:
            return {"error": page.get("error", "Failed to fetch issues")}

        if total == 0:
            total = page.get("total", 0)

        batch = page.get("issues", [])
        if not batch:
            break

        issues.extend(batch)
        start_at += len(batch)

        if start_at >= total:
            break

    return {
        "total": total,
        "fetched": len(issues),
        "max_fetched_limit": max_total,
        "issues": issues,
    }

data = {}

# Users
data['users'] = fetch("/rest/api/2/user/search?username=.")

# Projects
data['projects'] = fetch("/rest/api/2/project")

# Issues with pagination
data['issues'] = fetch_all_issues("order by created DESC")

# Issue Types
data['issue_types'] = fetch("/rest/api/2/issuetype")

# Priorities
data['priorities'] = fetch("/rest/api/2/priority")

# Statuses
data['statuses'] = fetch("/rest/api/2/status")

# Workflows
data['workflows'] = fetch("/rest/api/2/workflow")

# Boards (Agile)
data['boards'] = fetch("/rest/agile/1.0/board")

# Sprints from boards
boards = data['boards'].get('values', [])
data['sprints'] = []
for board in boards:
    sprints = fetch(f"/rest/agile/1.0/board/{board['id']}/sprint")
    if 'values' in sprints:
        data['sprints'].extend(sprints['values'])

# Full details for specific issue links the user needs.
data['specific_issues'] = {}
for issue_key in SPECIFIC_ISSUE_KEYS:
    data['specific_issues'][issue_key] = fetch(
        f"/rest/api/2/issue/{issue_key}?expand=renderedFields,changelog,transitions,names,schema"
    )

# Comments, Attachments, Worklogs from issues
data['comments'] = []
data['attachments'] = []
data['worklogs'] = []

for issue in data['issues'].get('issues', [])[:50]:  # First 50 issues
    key = issue['key']
    
    # Comments
    comments = fetch(f"/rest/api/2/issue/{key}/comment")
    if 'comments' in comments:
        data['comments'].extend(comments['comments'])
    
    # Attachments
    if issue['fields'].get('attachment'):
        data['attachments'].extend(issue['fields']['attachment'])
    
    # Worklogs
    worklogs = fetch(f"/rest/api/2/issue/{key}/worklog")
    if 'worklogs' in worklogs:
        data['worklogs'].extend(worklogs['worklogs'])

# Save to file next to this script
output_file = Path(__file__).resolve().parent / 'jira_data.json'
with open(output_file, 'w') as f:
    json.dump(data, f, indent=2)

print(f"✓ Users: {len(data['users'])}")
print(f"✓ Projects: {len(data['projects'])}")
print(f"✓ Issues: {data['issues'].get('total', 0)}")
print(f"✓ Issue Types: {len(data['issue_types'])}")
print(f"✓ Priorities: {len(data['priorities'])}")
print(f"✓ Statuses: {len(data['statuses'])}")
print(f"✓ Workflows: {len(data.get('workflows', []))}")
print(f"✓ Boards: {len(boards)}")
print(f"✓ Sprints: {len(data['sprints'])}")
print(f"✓ Comments: {len(data['comments'])}")
print(f"✓ Attachments: {len(data['attachments'])}")
print(f"✓ Worklogs: {len(data['worklogs'])}")
print(f"✓ Specific Issues: {len(data['specific_issues'])}")
print(f"\nData saved to {output_file}")
