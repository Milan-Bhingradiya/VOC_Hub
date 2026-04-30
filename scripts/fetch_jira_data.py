import requests
from requests.auth import HTTPBasicAuth
import json

BASE_URL = "http://172.16.7.210:8080"
auth = HTTPBasicAuth("shabbir", "12345")

def fetch(endpoint):
    try:
        r = requests.get(f"{BASE_URL}{endpoint}", auth=auth)
        return r.json() if r.ok else {"error": r.status_code}
    except Exception as e:
        return {"error": str(e)}

data = {}

# Users
data['users'] = fetch("/rest/api/2/user/search?username=.")

# Projects
data['projects'] = fetch("/rest/api/2/project")

# Issues with all fields
data['issues'] = fetch("/rest/api/2/search?jql=order by created DESC&maxResults=1000")

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

# Save to file
with open('jira_data.json', 'w') as f:
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
print(f"\nData saved to jira_data.json")
