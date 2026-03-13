import re

files = [
    "F:/collabspacefrontend-main/settings.html",
    "F:/collabspacefrontend-main/bookings.html",
    "F:/collabspacefrontend-main/batches.html",
    "F:/collabspacefrontend-main/inventory.html",
]

# ── 1. Old CSS block to replace (3 single-line rules) ─────────────────────────
OLD_CSS = (
    "        .avatar-wrap { display: flex; align-items: center; gap: 10px; background: var(--bg3); border-radius: 40px; padding: 6px 14px 6px 8px; border: 1px solid var(--border); }\n"
    "        .avatar { width: 30px; height: 30px; background: linear-gradient(135deg, var(--accent), var(--blue)); border-radius: 50%; display: grid; place-items: center; font-size: 13px; font-weight: 700; }\n"
    "        .avatar-name { font-size: 13px; font-weight: 600; }"
)

NEW_CSS = """        .avatar-wrap {
            display: flex;
            align-items: center;
            gap: 10px;
            background: linear-gradient(135deg, rgba(147,51,234,0.14), rgba(99,102,241,0.09));
            border-radius: 12px;
            padding: 8px 14px 8px 8px;
            border: 1px solid rgba(147,51,234,0.32);
            cursor: pointer;
            user-select: none;
            transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
        }

        .avatar-wrap:hover {
            background: linear-gradient(135deg, rgba(147,51,234,0.22), rgba(99,102,241,0.16));
            border-color: rgba(147,51,234,0.55);
            box-shadow: 0 0 18px rgba(147,51,234,0.22);
        }

        .avatar {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, var(--accent), var(--blue));
            border-radius: 10px;
            display: grid;
            place-items: center;
            font-size: 15px;
            font-weight: 800;
            flex-shrink: 0;
            box-shadow: 0 0 12px rgba(147,51,234,0.45);
        }

        .avatar-info {
            display: flex;
            flex-direction: column;
            line-height: 1;
        }

        .avatar-name {
            font-size: 13px;
            font-weight: 600;
            color: var(--txt);
        }

        .avatar-role {
            font-size: 10px;
            color: var(--accent);
            font-weight: 600;
            margin-top: 3px;
            letter-spacing: 0.04em;
        }"""

# ── 2. Duplicate cursor/user-select line to remove ────────────────────────────
# Pattern: optional blank line before, the line itself, optional blank line after
DUPE_CURSOR_PATTERN = re.compile(
    r'\n?[ \t]*\.avatar-wrap \{ cursor:pointer; user-select:none; \}\n?'
)

# ── 3. Old HTML trigger ───────────────────────────────────────────────────────
OLD_HTML_TRIGGER = (
    "                    <div class=\"avatar-wrap\" onclick=\"toggleDropdown('profileDrop','profileWrap')\">\n"
    "                        <div class=\"avatar\">B</div>\n"
    "                        <div class=\"avatar-name\">My Brewery</div>\n"
    "                        <svg class=\"chevron-icon\" viewBox=\"0 0 20 20\" fill=\"currentColor\"><path fill-rule=\"evenodd\" d=\"M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\" clip-rule=\"evenodd\"/></svg>\n"
    "                    </div>"
)

NEW_HTML_TRIGGER = (
    "                    <div class=\"avatar-wrap\" onclick=\"toggleDropdown('profileDrop','profileWrap')\">\n"
    "                        <div class=\"avatar\">B</div>\n"
    "                        <div class=\"avatar-info\">\n"
    "                            <div class=\"avatar-name\">My Brewery</div>\n"
    "                            <div class=\"avatar-role\">✦ Barrel Plan</div>\n"
    "                        </div>\n"
    "                        <svg class=\"chevron-icon\" viewBox=\"0 0 20 20\" fill=\"currentColor\" style=\"width:16px;height:16px;flex-shrink:0;\"><path fill-rule=\"evenodd\" d=\"M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\" clip-rule=\"evenodd\"/></svg>\n"
    "                    </div>"
)

# ── 4. Dropdown header avatar ─────────────────────────────────────────────────
OLD_DROP_AVATAR = '                            <div class="avatar" style="width:38px;height:38px;font-size:16px">B</div>'
NEW_DROP_AVATAR = '                            <div class="avatar" style="width:40px;height:40px;font-size:17px;border-radius:11px;">B</div>'


def process_file(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # Step 1 – replace CSS block
    if OLD_CSS in content:
        content = content.replace(OLD_CSS, NEW_CSS, 1)
    else:
        print(f"  [WARN] CSS block not found in {path}")

    # Step 2 – remove duplicate cursor line
    new_content, count = DUPE_CURSOR_PATTERN.subn("", content)
    if count:
        content = new_content
    else:
        print(f"  [WARN] Duplicate cursor line not found in {path}")

    # Step 3 – replace HTML trigger
    if OLD_HTML_TRIGGER in content:
        content = content.replace(OLD_HTML_TRIGGER, NEW_HTML_TRIGGER, 1)
    else:
        print(f"  [WARN] HTML trigger not found in {path}")

    # Step 4 – replace dropdown header avatar
    if OLD_DROP_AVATAR in content:
        content = content.replace(OLD_DROP_AVATAR, NEW_DROP_AVATAR, 1)
    else:
        print(f"  [WARN] Dropdown avatar not found in {path}")

    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Done: {path.split('/')[-1]}")
    else:
        print(f"  [NO CHANGE] {path.split('/')[-1]}")


updated = 0
for fp in files:
    process_file(fp)
    updated += 1

print(f"\nAll {updated} files processed.")
