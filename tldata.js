/* ================================================
   TAMPERLINE.US — Shared Dashboard Data Utilities
   tldata.js — included on every dashboard page
   ================================================

   All dashboard data (inventory, batches, bookings)
   is stored in localStorage keyed by logged-in email.
   New accounts start with empty datasets and only see
   data they create themselves.
*/

const TL_DEFAULT_INVENTORY = [];
const TL_DEFAULT_BATCHES = [];
const TL_DEFAULT_BOOKINGS = [];

/* ── Helpers ── */

function TL_getCurrentUser() {
    return localStorage.getItem('tl_current_user') || null;
}

function TL_getTrialStart(email) {
    const userEmail = email || TL_getCurrentUser();
    if (!userEmail) return null;

    const userKey = 'tl_trial_start_' + userEmail;
    const userStart = localStorage.getItem(userKey);
    if (userStart) return userStart;

    // Legacy compatibility: migrate old global trial key for matching account.
    const legacyEmail = localStorage.getItem('tl_trial_email');
    const legacyStart = localStorage.getItem('tl_trial_start');
    if (legacyStart && legacyEmail && legacyEmail === userEmail) {
        localStorage.setItem(userKey, legacyStart);
        localStorage.removeItem('tl_trial_start');
        localStorage.removeItem('tl_trial_email');
        return legacyStart;
    }

    return null;
}

function TL_ensureTrialStart(email) {
    const userEmail = email || TL_getCurrentUser();
    if (!userEmail) return null;
    const userKey = 'tl_trial_start_' + userEmail;
    let start = localStorage.getItem(userKey);
    if (!start) {
        start = Date.now().toString();
        localStorage.setItem(userKey, start);
    }
    return start;
}

function TL_getDataKey() {
    const u = TL_getCurrentUser();
    return u ? 'tl_data_' + u : null;
}

function _TL_defaults() {
    return {
        inventory: JSON.parse(JSON.stringify(TL_DEFAULT_INVENTORY)),
        batches: JSON.parse(JSON.stringify(TL_DEFAULT_BATCHES)),
        bookings: JSON.parse(JSON.stringify(TL_DEFAULT_BOOKINGS)),
        nextInventoryId: 1,
        nextBatchId: 1,
        nextBookingId: 1,
    };
}

/* ── Trial status ── */
function TL_isTrialActive() {
    const start = TL_getTrialStart();
    if (!start) return false;
    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
    return (Date.now() - parseInt(start, 10)) < TWO_DAYS_MS;
}

/* Count only user-created rows (non-demo) for a module */
function TL_countUserCreated(moduleKey, list) {
    const data = TL_getData();
    const source = Array.isArray(list) ? list : ((data && data[moduleKey]) || []);
    return source.filter(item => !item._demo).length;
}

function TL_getData() {
    const key = TL_getDataKey();
    if (!key) return _TL_defaults();
    TL_ensureTrialStart();
    const raw = localStorage.getItem(key);
    let data;
    if (!raw) {
        data = _TL_defaults();
        localStorage.setItem(key, JSON.stringify(data));
    } else {
        data = JSON.parse(raw);
    }

    // Always remove demo rows so only real user-entered data is ever shown.
    const inv = Array.isArray(data.inventory) ? data.inventory.filter(i => !i._demo) : [];
    const bat = Array.isArray(data.batches) ? data.batches.filter(b => !b._demo) : [];
    const bok = Array.isArray(data.bookings) ? data.bookings.filter(b => !b._demo) : [];
    const sanitized = Object.assign({}, data, { inventory: inv, batches: bat, bookings: bok });

    // Persist sanitized data once so old demo rows are fully removed from storage.
    if (key) {
        const needsWriteBack =
            !raw ||
            !Array.isArray(data.inventory) || !Array.isArray(data.batches) || !Array.isArray(data.bookings) ||
            inv.length !== (data.inventory || []).length ||
            bat.length !== (data.batches || []).length ||
            bok.length !== (data.bookings || []).length;
        if (needsWriteBack) localStorage.setItem(key, JSON.stringify(sanitized));
    }

    return sanitized;
}

function TL_saveData(data) {
    const key = TL_getDataKey();
    if (key) {
        localStorage.setItem(key, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('tl-data-updated'));
    }
}

function TL_getUserInfo() {
    const email = TL_getCurrentUser();
    if (!email) return null;
    const raw = localStorage.getItem('tl_user_' + email);
    return raw ? JSON.parse(raw) : null;
}

/* Repair mojibake text nodes produced by prior encoding mismatch saves */
function TL_fixMojibakeText(root) {
    const target = root || document.body;
    if (!target) return;

    const maybeBroken = /[ÃÂâð�]/;
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, null);
    const edits = [];

    while (walker.nextNode()) {
        const node = walker.currentNode;
        const txt = node.nodeValue || '';
        if (!maybeBroken.test(txt)) continue;

        let cur = txt;
        for (let i = 0; i < 3; i += 1) {
            if (!maybeBroken.test(cur)) break;
            try {
                const next = decodeURIComponent(escape(cur));
                if (!next || next === cur) break;
                cur = next;
            } catch (_) {
                break;
            }
        }
        if (cur !== txt) edits.push([node, cur]);
    }

    edits.forEach(([node, fixed]) => { node.nodeValue = fixed; });
}

/* ── Init UI — applies user/company info to every dashboard page ── */
function TL_initUI() {
    TL_fixMojibakeText(document.body);
    const user = TL_getUserInfo();
    if (!user) return;

    const biz = user.business || 'My Brewery';
    const firstName = user.firstName || 'Brewer';
    const initials = ((user.firstName || 'B')[0] + (user.lastName || 'B')[0]).toUpperCase();

    const now = new Date();
    const hr = now.getHours();
    const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

    /* Sidebar brand name */
    document.querySelectorAll('.brand-name').forEach(el => { el.textContent = biz; });

    /* Topbar avatar pill */
    document.querySelectorAll('.avatar-name').forEach(el => { el.textContent = biz; });

    /* Profile dropdown header */
    document.querySelectorAll('.profile-hdr-name').forEach(el => { el.textContent = biz; });

    /* Avatar initials */
    document.querySelectorAll('.avatar').forEach(el => { el.textContent = initials; });

    /* Topbar greeting (dashboard page only) */
    const titleEl = document.querySelector('.topbar-title');
    if (titleEl && titleEl.textContent.includes('Brewer')) {
        titleEl.textContent = greeting + ', ' + firstName + ' 👋';
    }
}

/* ── Fire any pending delivery-day email reminders ── *
   Called automatically on every dashboard page load.
   Requires EmailJS to be initialised on the host page.   */
function TL_fireDeliveryReminders() {
    if (typeof emailjs === 'undefined') return; // EmailJS not loaded on this page
    const EMAILJS_SERVICE_ID = typeof window.EMAILJS_SERVICE_ID !== 'undefined' ? window.EMAILJS_SERVICE_ID : null;
    const EMAILJS_REMINDER_TEMPLATE = typeof window.EMAILJS_REMINDER_TEMPLATE !== 'undefined' ? window.EMAILJS_REMINDER_TEMPLATE : null;
    const EMAILJS_CONFIGURED = typeof window.EMAILJS_CONFIGURED !== 'undefined' ? window.EMAILJS_CONFIGURED : false;
    if (!EMAILJS_CONFIGURED || !EMAILJS_SERVICE_ID || !EMAILJS_REMINDER_TEMPLATE) return;

    const today = new Date().toISOString().slice(0, 10);
    const key = 'tl_pending_reminders';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    let changed = false;
    list.forEach(r => {
        if (!r.sent && r.date === today) {
            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_REMINDER_TEMPLATE, {
                to_email: r.toEmail,
                event_name: r.eventName,
                event_date: r.date
            }).catch(() => { });
            r.sent = true;
            changed = true;
        }
    });
    if (changed) localStorage.setItem(key, JSON.stringify(list));
}

/* ── Export all user data as a downloadable JSON file ── */
function TL_exportData() {
    const user = TL_getUserInfo();
    const data = TL_getData();
    const out = {
        exportedAt: new Date().toISOString(),
        account: { name: (user?.firstName || '') + ' ' + (user?.lastName || ''), business: user?.business, email: user?.email },
        inventory: data.inventory,
        batches: data.batches,
        bookings: data.bookings,
    };
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tamperline-' + (user?.business || 'data').replace(/\s+/g, '-') + '-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 200);
}

/* ── Delete account — removes ALL data for the current user ── */
function TL_deleteAccount(email) {
    localStorage.removeItem('tl_user_' + email);
    localStorage.removeItem('tl_data_' + email);
    localStorage.removeItem('tl_trial_start_' + email);
    // Clear session keys
    if (localStorage.getItem('tl_current_user') === email) {
        localStorage.removeItem('tl_current_user');
    }
    // Clear legacy trial keys if they belong to this user
    if (localStorage.getItem('tl_trial_email') === email) {
        localStorage.removeItem('tl_trial_start');
        localStorage.removeItem('tl_trial_email');
    }
    window.location.href = 'index.html';
}
