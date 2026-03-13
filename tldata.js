/* ================================================
   TAMPERLINE.US — Shared Dashboard Data Utilities
   tldata.js — included on every dashboard page
   ================================================

   All dashboard data (inventory, batches, bookings)
   is stored in localStorage keyed by logged-in email.
   On first login each new account gets default demo data.
   Demo items are flagged with _demo:true and are hidden
   once the 2-day free trial period has expired.
*/

/* ── Default demo data — flagged with _demo:true ── */
const TL_DEFAULT_INVENTORY = [
    { id: 1, _demo: true, name: 'Cascade Hops', category: 'Hops', sku: 'HOP-001', qty: 12, unit: 'lbs', reorder: 20, status: 'low', cost: 4.50 },
    { id: 2, _demo: true, name: 'Pale Malt', category: 'Grain', sku: 'GRN-002', qty: 340, unit: 'lbs', reorder: 100, status: 'ok', cost: 0.85 },
    { id: 3, _demo: true, name: 'Centennial Hops', category: 'Hops', sku: 'HOP-003', qty: 45, unit: 'lbs', reorder: 20, status: 'ok', cost: 5.20 },
    { id: 4, _demo: true, name: 'Crystal 60L', category: 'Grain', sku: 'GRN-004', qty: 180, unit: 'lbs', reorder: 50, status: 'ok', cost: 1.10 },
    { id: 5, _demo: true, name: 'US-05 Yeast', category: 'Yeast', sku: 'YST-001', qty: 8, unit: 'pkts', reorder: 10, status: 'low', cost: 3.75 },
    { id: 6, _demo: true, name: 'CO2 Cylinders', category: 'Packaging', sku: 'PKG-001', qty: 4, unit: 'ea', reorder: 3, status: 'ok', cost: 45.00 },
    { id: 7, _demo: true, name: '1/6 BBL Kegs', category: 'Packaging', sku: 'PKG-002', qty: 22, unit: 'ea', reorder: 10, status: 'ok', cost: 115.00 },
    { id: 8, _demo: true, name: 'Irish Moss', category: 'Adjunct', sku: 'ADJ-001', qty: 2, unit: 'lbs', reorder: 5, status: 'low', cost: 8.00 },
    { id: 9, _demo: true, name: 'Citra Hops', category: 'Hops', sku: 'HOP-004', qty: 60, unit: 'lbs', reorder: 25, status: 'ok', cost: 6.80 },
    { id: 10, _demo: true, name: 'Bottle Caps', category: 'Packaging', sku: 'PKG-003', qty: 5000, unit: 'ea', reorder: 1000, status: 'ok', cost: 0.02 },
];

const TL_DEFAULT_BATCHES = [
    { id: 48, _demo: true, name: 'West Coast IPA', style: 'IPA', volume: 320, started: 'Feb 18, 2026', estReady: 'Mar 4, 2026', status: 'fermenting', abv: 6.8, ibu: 72, yeast: 'WLP001', notes: 'Dry hop with Citra & Mosaic at day 5.' },
    { id: 47, _demo: true, name: 'Amber Ale', style: 'American Ale', volume: 180, started: 'Feb 10, 2026', estReady: 'Feb 28, 2026', status: 'conditioning', abv: 5.2, ibu: 32, yeast: 'US-05', notes: 'Traditional amber with Crystal 60L.' },
    { id: 46, _demo: true, name: 'Stout Porter', style: 'Porter', volume: 240, started: 'Feb 2, 2026', estReady: 'Feb 20, 2026', status: 'ready', abv: 6.1, ibu: 45, yeast: 'WLP004', notes: 'Rich chocolate and coffee notes.' },
    { id: 45, _demo: true, name: 'Wheat Lager', style: 'Lager', volume: 200, started: 'Jan 28, 2026', estReady: 'Feb 15, 2026', status: 'ready', abv: 4.5, ibu: 18, yeast: 'W-34/70', notes: 'Light and refreshing summer lager.' },
    { id: 44, _demo: true, name: 'Pale Ale', style: 'American Ale', volume: 160, started: 'Jan 20, 2026', estReady: 'Feb 8, 2026', status: 'ready-for-sale', abv: 5.6, ibu: 38, yeast: 'US-05', notes: 'Classic American Pale Ale, Cascade hops.' },
    { id: 43, _demo: true, name: 'Belgian Wit', style: 'Wheat', volume: 280, started: 'Jan 12, 2026', estReady: 'Feb 1, 2026', status: 'ready', abv: 4.9, ibu: 15, yeast: 'WLP400', notes: 'Orange peel and coriander spiced.' },
    { id: 42, _demo: true, name: 'Double IPA', style: 'IPA', volume: 120, started: 'Jan 5, 2026', estReady: 'Jan 28, 2026', status: 'ready', abv: 8.4, ibu: 95, yeast: 'WLP001', notes: 'High gravity DIPA with Simcoe & Centennial.' },
];

const TL_DEFAULT_BOOKINGS = [
    { id: 1, _demo: true, name: 'Henderson Wedding Reception', type: 'Private Event', date: 'Mar 8, 2026', time: '6:00 PM', guests: 80, room: 'Taproom', status: 'confirmed', deposit: 500 },
    { id: 2, _demo: true, name: 'Corporate Happy Hour — Nexio', type: 'Corporate', date: 'Mar 11, 2026', time: '5:00 PM', guests: 40, room: 'Barrel Room', status: 'confirmed', deposit: 300 },
    { id: 3, _demo: true, name: 'Friday Tasting Tour', type: 'Public Event', date: 'Feb 27, 2026', time: '4:00 PM', guests: 25, room: 'Brew Floor', status: 'pending', deposit: 0 },
    { id: 4, _demo: true, name: 'Brewers Association Meeting', type: 'Corporate', date: 'Mar 3, 2026', time: '2:00 PM', guests: 15, room: 'Private Lounge', status: 'confirmed', deposit: 150 },
    { id: 5, _demo: true, name: 'Gallagher Birthday Party', type: 'Private Event', date: 'Mar 15, 2026', time: '7:00 PM', guests: 35, room: 'Taproom', status: 'confirmed', deposit: 250 },
    { id: 6, _demo: true, name: 'Saturday Growler Fill Day', type: 'Public Event', date: 'Mar 1, 2026', time: '11:00 AM', guests: 60, room: 'Taproom', status: 'pending', deposit: 0 },
    { id: 7, _demo: true, name: 'Equipment Rental — Hop Farm', type: 'Rental', date: 'Mar 20, 2026', time: '8:00 AM', guests: 0, room: 'Warehouse', status: 'confirmed', deposit: 800 },
];

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
        nextInventoryId: 11,
        nextBatchId: 49,
        nextBookingId: 8,
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

    /* After the trial ends, filter out demo items so only real user data shows */
    if (!TL_isTrialActive()) {
        data = Object.assign({}, data, {
            inventory: data.inventory.filter(i => !i._demo),
            batches: data.batches.filter(b => !b._demo),
            bookings: data.bookings.filter(b => !b._demo),
        });
    }

    return data;
}

function TL_saveData(data) {
    const key = TL_getDataKey();
    if (key) localStorage.setItem(key, JSON.stringify(data));
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

    const maybeBroken = /[ÃÂð]/;
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, null);
    const edits = [];

    while (walker.nextNode()) {
        const node = walker.currentNode;
        const txt = node.nodeValue || '';
        if (!maybeBroken.test(txt)) continue;
        try {
            const fixed = decodeURIComponent(escape(txt));
            if (fixed && fixed !== txt) edits.push([node, fixed]);
        } catch (_) {
            // Keep original text when decode fails.
        }
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
