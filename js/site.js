/*
 * Forest City Solidarity: menu button + events.
 * Events come from data/events.csv (or a published Google Sheet, see js/config.js).
 * You should not need to edit this file to add or change events.
 */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var CONFIG = window.FCS_CONFIG || {};
  var TZ = 'America/Toronto';

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
  }

  /* ---------- Helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeUrl(u) {
    u = (u || '').trim();
    if (!u) return '';
    if (/^(https?:|mailto:)/i.test(u) || /^[\w\-./#?=&]+$/.test(u)) return u;
    return '';
  }
  function todayISO() {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
    catch (e) { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  }
  function parseDate(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmt(date, opts) { return new Intl.DateTimeFormat('en-CA', opts).format(date); }
  function fmtTime(t) {
    if (!t) return '';
    var m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
    if (!m) return t;
    var h = +m[1], min = m[2], ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return h + (min === '00' ? '' : ':' + min) + ' ' + ap;
  }

  /* CSV parser that copes with quotes, commas and line breaks inside quotes. */
  function parseCSV(text) {
    var rows = [], row = [], field = '', i = 0, q = false;
    text = text.replace(/^﻿/, '');
    while (i < text.length) {
      var c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else { q = false; } }
        else field += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); rows.push(row); row = []; field = '';
      } else field += c;
      i++;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    var head = (rows.shift() || []).map(function (h) { return h.trim().toLowerCase(); });
    return rows.filter(function (r) { return r.join('').trim(); }).map(function (r) {
      var o = {};
      head.forEach(function (h, idx) { o[h] = (r[idx] || '').trim(); });
      return o;
    });
  }

  function clean(list) {
    return list.filter(function (e) {
      return /^\d{4}-\d{2}-\d{2}$/.test(e.date) && e.title && (e.status || '').toLowerCase() !== 'hidden';
    }).sort(function (a, b) {
      return (a.date + (a.start || '99')).localeCompare(b.date + (b.start || '99'));
    });
  }

  function getText(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    });
  }
  function loadEvents() {
    var local = function () { return getText(CONFIG.eventsFile || 'data/events.csv'); };
    var src = CONFIG.eventsSheetCsvUrl ? getText(CONFIG.eventsSheetCsvUrl).catch(local) : local();
    return src.then(function (t) { return clean(parseCSV(t)); });
  }

  /* ---------- Rendering ---------- */
  function cardHTML(e) {
    var d = parseDate(e.date);
    var tbc = (e.status || '').toLowerCase() === 'tbc';
    var cancelled = (e.status || '').toLowerCase() === 'cancelled';
    var time = e.start ? fmtTime(e.start) + (e.end ? ' to ' + fmtTime(e.end) : '') : (tbc ? 'Time to be confirmed' : '');
    var place = [e.venue, e.address && e.address !== e.venue ? e.address : ''].filter(Boolean).join(', ');
    if (!place && tbc) place = 'Place to be confirmed';
    var meta = [fmt(d, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }), time, place].filter(Boolean).join(' · ');
    var link = safeUrl(e.link);
    return '<article class="event' + (tbc ? ' event--tbc' : '') + '">' +
      '<div class="event__date" aria-hidden="true">' +
        '<span class="event__dow">' + esc(fmt(d, { weekday: 'short' })) + '</span>' +
        '<span class="event__day">' + d.getDate() + '</span>' +
        '<span class="event__mon">' + esc(fmt(d, { month: 'short' })) + '</span>' +
      '</div><div class="event__body">' +
        (e.series ? '<p class="event__series">' + esc(e.series) + '</p>' : '') +
        '<h3 class="event__title">' + esc(e.title) +
          (tbc ? ' <span class="badge">Details to come</span>' : '') +
          (cancelled ? ' <span class="badge">Cancelled</span>' : '') + '</h3>' +
        '<p class="event__meta">' + esc(meta) + '</p>' +
        (e.description ? '<p class="event__desc">' + esc(e.description) + '</p>' : '') +
        (link ? '<a class="event__link" href="' + esc(link) + '"' + (/^https?:/i.test(link) ? ' rel="noopener"' : '') + '>' + esc(e.link_label || 'More info') + ' &rarr;</a>' : '') +
      '</div></article>';
  }

  function renderList(el, events, today) {
    var mode = el.getAttribute('data-events');
    var limit = parseInt(el.getAttribute('data-limit') || '0', 10);
    var list;
    if (mode === 'past') {
      list = events.filter(function (e) { return (e.end_date || e.date) < today; }).reverse();
      if (!list.length) { el.innerHTML = '<p class="events-empty">Nothing in the archive yet.</p>'; return; }
      var years = {}, order = [];
      list.forEach(function (e) { var y = e.date.slice(0, 4); if (!years[y]) { years[y] = []; order.push(y); } years[y].push(e); });
      el.innerHTML = order.map(function (y) {
        return '<section class="archive-year"><h3>' + y + '</h3><div class="events">' + years[y].map(cardHTML).join('') + '</div></section>';
      }).join('');
      return;
    }
    list = events.filter(function (e) { return e.date >= today; });
    if (limit) list = list.slice(0, limit);
    var html = list.length
      ? '<div class="events">' + list.map(cardHTML).join('') + '</div>'
      : '<p class="events-empty">No dates posted right now. <a href="get-involved.html#mailing-list">Join the mailing list</a> to hear about the next one.</p>';
    /* data-recent="2": when fewer than 2 upcoming, also show the most recent past events */
    var recent = parseInt(el.getAttribute('data-recent') || '0', 10);
    if (recent && list.length < recent) {
      var past = events.filter(function (e) { return e.date < today; }).reverse().slice(0, recent);
      if (past.length) html += '<p class="kicker recent-label">Recently</p><div class="events events--recent">' + past.map(cardHTML).join('') + '</div>';
    }
    el.innerHTML = html;
  }

  function renderStrip(el, events, today) {
    var up = events.filter(function (e) { return e.date >= today; }).slice(0, 4);
    var items = up.map(function (e) {
      var d = parseDate(e.date);
      var tbc = (e.status || '').toLowerCase() === 'tbc';
      return '<span class="strip__item">' + esc(fmt(d, { weekday: 'short', month: 'short', day: 'numeric' })) + ': ' + esc(e.title) + (tbc ? ' (details to come)' : '') + '</span>';
    });
    items.push('<span class="strip__item"><a href="get-involved.html">Come to a meeting</a></span>');
    items.push('<span class="strip__item"><a href="map.html">Is your group on the solidarity map?</a></span>');
    items.push('<span class="strip__item"><a href="fund.html">Solidarity fund: coming in 2027</a></span>');
    var track = el.querySelector('.strip__track');
    if (!track) return;
    /* Two copies so the scrolling version (theme A) loops smoothly; the copy is hidden from screen readers. */
    track.innerHTML = '<span class="strip__label">Next up</span>' + items.join('') +
      '<span class="strip__copy" aria-hidden="true">' + items.join('') + '</span>';
  }

  function renderCal(el, events, today) {
    var up = events.filter(function (e) { return e.date >= today; });
    var base = parseDate(today);
    var y = base.getFullYear(), m = base.getMonth();
    var first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
    var marked = {};
    events.forEach(function (e) { var d = parseDate(e.date); if (d.getFullYear() === y && d.getMonth() === m) marked[d.getDate()] = e.title; });
    var html = '<p class="cal__title">' + esc(fmt(first, { month: 'long', year: 'numeric' })) + '</p><div class="cal__grid" role="presentation">';
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(function (d) { html += '<span class="cal__dow">' + d + '</span>'; });
    for (var b = 0; b < first.getDay(); b++) html += '<span class="cal__day cal__day--empty"></span>';
    for (var i = 1; i <= days; i++) {
      var cls = 'cal__day' + (marked[i] ? ' cal__day--event' : '') + (i === base.getDate() ? ' cal__day--today' : '');
      html += '<span class="' + cls + '"' + (marked[i] ? ' title="' + esc(marked[i]) + '"' : '') + '>' + i + '</span>';
    }
    el.innerHTML = html + '</div>';
    el.setAttribute('aria-hidden', 'true'); /* the list below carries the same information */
  }

  var dateline = document.querySelector('[data-dateline]');
  if (dateline) dateline.textContent = fmt(parseDate(todayISO()), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  var lists = document.querySelectorAll('[data-events]');
  var strip = document.querySelector('[data-strip]');
  var cal = document.querySelector('[data-cal]');
  if (!lists.length && !strip && !cal) return;

  loadEvents().then(function (events) {
    var today = todayISO();
    Array.prototype.forEach.call(lists, function (el) { renderList(el, events, today); });
    if (strip) renderStrip(strip, events, today);
    if (cal) renderCal(cal, events, today);
  }).catch(function () {
    Array.prototype.forEach.call(lists, function (el) {
      el.innerHTML = '<p class="events-empty">Events could not be loaded just now. Email <a href="mailto:' +
        esc(CONFIG.contactEmail || 'forestcitysolidarity@riseup.net') + '">' + esc(CONFIG.contactEmail || 'forestcitysolidarity@riseup.net') + '</a> or follow us on Instagram.</p>';
    });
  });
})();
