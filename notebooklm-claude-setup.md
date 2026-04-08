# NotebookLM + Claude Code — Portable Setup Guide

Everything needed to connect Claude Code to Google NotebookLM via cookie-based auth in any repo/codespace.

---

## 1. Install NotebookLM CLI

```bash
pip install notebooklm-py
notebooklm skill install   # installs the base NotebookLM skill into ~/.claude/skills/
```

## 2. Authenticate (Cookie Method)

NotebookLM uses Google account auth via Playwright browser cookies. Since codespaces have no browser, we export cookies from your real browser.

### One-time setup

1. Open `https://notebooklm.google.com` in your browser (logged into Google)
2. Install the **Cookie-Editor** browser extension
3. Click Cookie-Editor icon → **Export** → **JSON**
4. Copy the JSON to clipboard

### Inject cookies into codespace

Save this script as `scripts/refresh_notebooklm_auth.py`:

```python
#!/usr/bin/env python3
"""
NotebookLM cookie refresh.
Usage:
  python3 scripts/refresh_notebooklm_auth.py
  Paste Cookie Editor JSON, then Ctrl+D

Or pipe: pbpaste | python3 scripts/refresh_notebooklm_auth.py
"""
import json, sys, os, subprocess
from pathlib import Path

STORAGE_PATH = Path.home() / ".notebooklm" / "storage_state.json"
# Change this to YOUR notebook ID (first 6 chars work too):
NOTEBOOK_ID = "5242a5"

def convert_cookie(c):
    pw = {"name": c["name"], "value": c["value"], "domain": c["domain"],
          "path": c.get("path", "/"), "secure": c.get("secure", False),
          "httpOnly": c.get("httpOnly", False)}
    ss = c.get("sameSite", "")
    pw["sameSite"] = "Lax" if ss == "lax" else ("Strict" if ss == "strict" else "None")
    if c.get("expirationDate"): pw["expires"] = c["expirationDate"]
    return pw

def main():
    if sys.stdin.isatty():
        print("Paste Cookie Editor JSON, then Ctrl+D:")
    raw = sys.stdin.read().strip()
    cookies = json.loads(raw)
    pw_cookies = [convert_cookie(c) for c in cookies]

    STORAGE_PATH.parent.mkdir(parents=True, exist_ok=True)
    if STORAGE_PATH.exists():
        STORAGE_PATH.rename(STORAGE_PATH.with_suffix(".backup.json"))
    STORAGE_PATH.write_text(json.dumps({"cookies": pw_cookies, "origins": []}, indent=2))
    print(f"Wrote {len(pw_cookies)} cookies to {STORAGE_PATH}")

    # Validate
    try:
        r = subprocess.run(["notebooklm", "auth", "check"], capture_output=True, text=True, timeout=15)
        if r.returncode == 0 and "pass" in r.stdout.lower():
            print("AUTH VALID")
            subprocess.run(["notebooklm", "use", NOTEBOOK_ID], capture_output=True, text=True, timeout=15)
            print(f"Notebook selected: {NOTEBOOK_ID}")
        else:
            print("AUTH FAILED — cookies may be expired")
    except Exception as e:
        print(f"Auth check error: {e}")

if __name__ == "__main__":
    main()
```

### Key cookies needed

These must be present in the export (Cookie-Editor captures them automatically):
- `SID`, `HSID`, `APISID`, `SAPISID` (from `.google.com`)
- `__Secure-1PSID`, `__Secure-3PSID` (from `.google.com`)
- `OSID`, `__Secure-OSID` (from `notebooklm.google.com`)

**Cookie lifetime**: ~24-48 hours for session cookies. Long-lived cookies (SID, HSID, APISID) last ~1 year.

### Quick inline refresh (no script needed)

```python
python3 -c "
import json, os
cookies = json.load(open('/tmp/nbcookies.json'))  # save your export here
pw = [{'name':c['name'],'value':c['value'],'domain':c['domain'],'path':c['path'],
       'secure':c.get('secure',False),'httpOnly':c.get('httpOnly',False),
       'sameSite':'Lax' if c.get('sameSite')=='lax' else 'None',
       **({'expires':c['expirationDate']} if c.get('expirationDate') else {})}
      for c in cookies]
os.makedirs(os.path.expanduser('~/.notebooklm'), exist_ok=True)
json.dump({'cookies':pw,'origins':[]}, open(os.path.expanduser('~/.notebooklm/storage_state.json'),'w'), indent=2)
print(f'Wrote {len(pw)} cookies')
"
```

## 3. Select Your Notebook

```bash
notebooklm list                    # see all notebooks
notebooklm use <id-or-prefix>      # select one (first 6 chars work)
notebooklm status                  # confirm selection
```

## 4. Query NotebookLM from Claude Code

### Direct CLI usage
```bash
notebooklm ask "What is the differential for a ring-enhancing lesion?" --json
```

### From Python scripts
```python
import subprocess, json

def query_notebooklm(prompt):
    result = subprocess.run(
        ["notebooklm", "ask", prompt, "--json"],
        capture_output=True, text=True, timeout=120
    )
    if result.returncode != 0:
        raise Exception(f"Error: {result.stderr}")
    data = json.loads(result.stdout)
    return data["answer"]
```

### Via MCP tools (from Claude Code conversation)
The `mcp__notebooklm__ask_question` tool is available after `notebooklm skill install`.

## 5. Auth Check in Batch Scripts

```python
def check_auth():
    try:
        result = subprocess.run(
            ["notebooklm", "auth", "check"],
            capture_output=True, text=True, timeout=15
        )
        return result.returncode == 0 and "pass" in result.stdout.lower()
    except Exception:
        return False

def wait_for_auth():
    print("AUTH EXPIRED — refresh cookies:")
    print("  python3 scripts/refresh_notebooklm_auth.py")
    input("Press Enter after refreshing (or 'q' to quit): ")
    return check_auth()
```

## 6. Install Custom Skills

Copy these directories into `~/.claude/skills/` in your target codespace:

### Skill: `claude-notebooklm` (YJL2B case enrichment)
Location: `~/.claude/skills/claude-notebooklm/SKILL.md`
Triggers: "enrich YJL2B", "NotebookLM pipeline", "discriminator enrichment"

### Skill: `claude-notebooklm-cleanup` (discriminator quality improvement)
Location: `~/.claude/skills/claude-notebooklm-cleanup/SKILL.md`
Triggers: "improve discriminators", "clean up discriminators", "high yield cleanup"

### Skill: `claude-notebooklm-viva` (FRCR 2B viva ideal answers)
Location: `~/.claude/skills/claude-notebooklm-viva/SKILL.md`
Triggers: "generate viva answers", "viva ideal answer", "FRCR phrase framework"

### Skill: `notebooklm` (base CLI skill — installed by `notebooklm skill install`)
Location: `~/.claude/skills/notebooklm/SKILL.md`
Triggers: `/notebooklm`, "create a podcast about X"

To transfer skills between codespaces, copy the entire `~/.claude/skills/` directory:

```bash
# From source codespace — tar up skills
tar czf /tmp/claude-skills.tar.gz -C ~/.claude skills/

# Transfer to target codespace (via git, gist, or direct copy)
# Then in target:
tar xzf claude-skills.tar.gz -C ~/.claude/
```

## 7. Troubleshooting

| Problem | Solution |
|---------|----------|
| `notebooklm: command not found` | `pip install notebooklm-py` |
| Auth expired / redirect to signin | Re-export cookies from browser, run refresh script |
| Wrong notebook selected | `notebooklm use <id>` |
| MCP tools not available | `notebooklm skill install` then restart Claude Code |
| Rate limited by Google | Wait 2-3 minutes, add longer delays between queries |
| `storage_state.json` not found | Run `mkdir -p ~/.notebooklm` then refresh script |

## 8. Architecture Summary

```
Browser (logged into Google)
  → Cookie-Editor extension (export JSON)
    → refresh_notebooklm_auth.py (converts to Playwright format)
      → ~/.notebooklm/storage_state.json
        → notebooklm CLI (uses Playwright to authenticate)
          → NotebookLM API (queries your notebook's sources)
            → Claude Code skills / Python scripts (process responses)
              → Convex database (store structured results)
```

