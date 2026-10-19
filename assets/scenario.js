/*
 * OptimalLoop — animated Make.com scenario
 * Usage: <div class="scn" data-flow="hiring"></div> (or "email") + <script src="../assets/scenario.js"></script>
 * Modules light up one by one (incl. router branches), with a live caption.
 * Starts when scrolled into view, pauses off-screen, respects reduced motion,
 * and translates captions through window.OptimalLoopI18n when present.
 */
(function () {
  var IC = {
    form: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
    clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    task: 'M4 4h16v16H4zM8 12l3 3 5-6',
    hook: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    tools: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
    mail: 'M3 6h18v12H3zM3 6l9 7 9-7',
    comment: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
    ai: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
    json: 'M8 4c-2 0-3 1-3 3v2c0 1-1 2-2 3 1 1 2 2 2 3v2c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2c0 1 1 2 2 3-1 1-2 2-2 3v2c0 2-1 3-3 3',
    router: 'M4 12h6M10 12l6-6h4M10 12l6 6h4M17 3l3 3-3 3M17 15l3 3-3 3',
    chat: 'M9 3L7 21M17 3l-2 18M4 9h17M3 15h17',
    move: 'M3 7h6l2 2h10v10H3zM12 14h6M15 11l3 3-3 3',
    resume: 'M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4'
  };
  var C = { tally: '#1E1E1E', tools: '#9F7BEA', clickup: '#6155F5', hook: '#C7305F', mail: '#E9546B', openai: '#10A37F', json: '#9F7BEA', router: '#7CB342', slack: '#4A154B' };
  var T = '#64FFDA';

  var FLOWS = {
    hiring: {
      W: 960, H: 500, S: 64, LW: 130,
      done: 'Run complete — from application to interview invite without anyone typing an email.',
      texts: [{ t: 'SCENARIO 1 · New application → ClickUp', x: 36, y: 22 }, { t: 'SCENARIO 2 · Interview 1 → invite email', x: 36, y: 284 }],
      stages: [['Intake', '#E8336E', 4], ['Reviewed', '#7B4BF0', 5], ['Interview 1', '#1846E8', 5], ['Interview 2', '#2E86C1', 99], ['Hired', '#27AE60', 99], ['No Fit', '#E67E22', 99]],
      nodes: [
        { id: 't1', x: 100, y: 110, o: 1, ic: 'form', c: C.tally, app: 'Tally', act: 'Watch new responses', cap: 'A candidate submits the Tally application — the scenario wakes up.' },
        { id: 't2', x: 260, y: 110, o: 2, ic: 'clock', c: C.tools, app: 'Tools', act: 'Sleep', cap: 'A short pause, so Tally has finished saving every answer.', from: ['t1'] },
        { id: 't3', x: 420, y: 110, o: 3, ic: 'form', c: C.tally, app: 'Tally', act: 'List field definitions', cap: 'The form’s fields are read, so every answer maps to the right ClickUp column.', from: ['t2'] },
        { id: 't4', x: 580, y: 110, o: 4, ic: 'task', c: C.clickup, app: 'ClickUp', act: 'Create a task', cap: 'A candidate card appears in ClickUp under Intake — name, email and answers filled in.', from: ['t3'] },
        { id: 'p1', x: 860, y: 110, o: 5, kind: 'pt', from: ['t4'] },
        { id: 'g1', x: 860, y: 250, o: 5, kind: 'gate', c: '#1846E8', app: 'Recruiter moves card → Interview 1', cap: 'The recruiter reviews the card and drags it to Interview 1. That’s the only manual step.', from: ['p1'] },
        { id: 'p2', x: 860, y: 390, o: 6, kind: 'pt', from: ['g1'] },
        { id: 'w1', x: 740, y: 390, o: 6, ic: 'hook', c: C.hook, app: 'Webhooks', act: 'Custom webhook', cap: 'ClickUp fires a webhook the moment the stage changes.', from: ['p2'] },
        { id: 'w2', x: 580, y: 390, o: 7, ic: 'task', c: C.clickup, app: 'ClickUp', act: 'Get a task', cap: 'The full candidate card is fetched from ClickUp.', from: ['w1'] },
        { id: 'w3', x: 420, y: 390, o: 8, ic: 'tools', c: C.tools, app: 'Set Email HTML', act: 'Set variables', cap: 'A personal, branded invitation email is assembled.', from: ['w2'] },
        { id: 'w4', x: 260, y: 390, o: 9, ic: 'mail', c: C.mail, app: 'Email', act: 'Send an email', cap: 'The invite lands in the candidate’s inbox.', from: ['w3'] },
        { id: 'w5', x: 100, y: 390, o: 10, ic: 'comment', c: C.clickup, app: 'ClickUp', act: 'Post a task comment', cap: 'A comment is posted on the card, so the team sees the invite went out.', from: ['w4'] }
      ]
    },
    email: {
      W: 1140, H: 510, S: 52, LW: 104,
      done: 'Run complete — every email followed up the right way.',
      texts: [], stages: [],
      nodes: [
        { id: 'e1', x: 50, y: 260, o: 1, ic: 'mail', c: C.mail, app: 'Email', act: 'Watch emails', cap: 'A new email arrives — the scenario picks it up.' },
        { id: 'e2', x: 155, y: 260, o: 2, ic: 'tools', c: C.tools, app: 'Tools', act: 'Set variables', cap: 'Sender and message details are stored for the next steps.', from: ['e1'] },
        { id: 'e3', x: 260, y: 260, o: 3, ic: 'ai', c: C.openai, app: 'OpenAI', act: 'Get company info', cap: 'AI looks up who the sender’s company is.', from: ['e2'] },
        { id: 'e4', x: 365, y: 260, o: 4, ic: 'json', c: C.json, app: 'JSON', act: 'Parse JSON', cap: 'The answer is parsed into clean data.', from: ['e3'] },
        { id: 'e5', x: 470, y: 260, o: 5, ic: 'ai', c: C.openai, app: 'OpenAI', act: 'Categorize emails', cap: 'AI decides which category the email belongs to.', from: ['e4'] },
        { id: 'e6', x: 575, y: 260, o: 6, ic: 'router', c: C.router, app: 'Router', act: '4 routes', cap: 'The router sends the email down the route for its category.', from: ['e5'] },
        { id: 'r1', x: 690, y: 50, o: 7, ic: 'move', c: C.mail, app: 'Email', act: 'Move an email', cap: 'Route 1: the email is moved to its folder — nobody has to touch it.', from: ['e6'] },
        { id: 'r2a', x: 690, y: 190, o: 8, ic: 'ai', c: C.openai, app: 'OpenAI', act: 'Draft follow-up', cap: 'Route 2: AI prepares the follow-up…', from: ['e6'] },
        { id: 'r2b', x: 795, y: 190, o: 9, ic: 'json', c: C.json, app: 'JSON', act: 'Parse JSON', cap: '…the result is parsed into structured data…', from: ['r2a'] },
        { id: 'r2e', x: 900, y: 290, o: 0, kind: 'err', ic: 'resume', app: 'Resume', act: 'Error handler', from: ['r2b'] },
        { id: 'r2c', x: 900, y: 120, o: 10, ic: 'tools', c: C.tools, app: 'Tools', act: 'Set variables', cap: '…variables are set…', from: ['r2b'] },
        { id: 'r2d', x: 1000, y: 120, o: 11, ic: 'router', c: C.router, app: 'Router', act: '2 routes', cap: '…and a second router decides where it goes.', from: ['r2c'] },
        { id: 'r2f', x: 1085, y: 46, o: 12, ic: 'chat', c: C.slack, app: 'Slack', act: 'Create a message', cap: 'The team is notified in Slack.', from: ['r2d'] },
        { id: 'r2g', x: 1085, y: 196, o: 13, ic: 'move', c: C.mail, app: 'Email', act: 'Move an email', cap: 'The email is filed into the right folder.', from: ['r2d'] },
        { id: 'r3', x: 690, y: 340, o: 14, ic: 'chat', c: C.slack, app: 'Slack', act: 'Create a message', cap: 'Route 3: a Slack message flags it to the team.', from: ['e6'] },
        { id: 'r4a', x: 690, y: 440, o: 15, ic: 'chat', c: C.slack, app: 'Slack', act: 'Create a message', cap: 'Route 4: the team is alerted in Slack…', from: ['e6'] },
        { id: 'r4b', x: 795, y: 440, o: 16, ic: 'ai', c: C.openai, app: 'OpenAI', act: 'Prepare details', cap: '…AI prepares what the follow-up needs…', from: ['r4a'] },
        { id: 'r4c', x: 900, y: 440, o: 17, ic: 'task', c: C.clickup, app: 'ClickUp', act: 'Task', cap: '…the work lands in ClickUp…', from: ['r4b'] },
        { id: 'r4d', x: 1000, y: 440, o: 18, ic: 'task', c: C.clickup, app: 'ClickUp', act: 'Task', cap: '…with everything the team needs…', from: ['r4c'] },
        { id: 'r4e', x: 1085, y: 440, o: 19, ic: 'mail', c: C.mail, app: 'Email', act: 'Follow-up', cap: '…and the email gets its follow-up.', from: ['r4d'] }
      ]
    }
  };

  function tr(s) { return window.OptimalLoopI18n ? window.OptimalLoopI18n.t(s) : s; }
  function el(tag, css, html) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function mount(root) {
    var F = FLOWS[root.getAttribute('data-flow')];
    if (!F) return;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var speed = +root.getAttribute('data-speed') || 650;
    var byId = {}, total = 0;
    F.nodes.forEach(function (n) { byId[n.id] = n; if (n.kind !== 'err') total = Math.max(total, n.o); });

    /* Toolbar */
    var bar = el('div', 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:flex-end;padding:14px 20px;border-bottom:1px solid #233554');
    var status = el('div', 'font-size:14px;font-weight:600;min-width:200px;text-align:right');
    var playBtn = el('button', 'width:44px;height:44px;border-radius:50%;border:1px solid #233554;background:#112240;color:#fff;cursor:pointer');
    playBtn.type = 'button';
    var again = el('button', 'height:44px;padding:0 18px;border-radius:999px;border:none;background:' + T + ';color:#0A192F;font:700 14px Inter,sans-serif;cursor:pointer', 'Run again');
    again.type = 'button';
    bar.appendChild(status); bar.appendChild(playBtn); bar.appendChild(again);

    /* Stage */
    var scroll = el('div', 'overflow-x:auto');
    var stage = el('div', 'position:relative;margin:0 auto;width:' + F.W + 'px;height:' + F.H + 'px;background-image:radial-gradient(#1D3354 1px,transparent 1px);background-size:22px 22px');
    stage.setAttribute('aria-hidden', 'true');
    scroll.appendChild(stage);

    F.texts.forEach(function (t) {
      var tx = el('div', 'position:absolute;left:' + t.x + 'px;top:' + t.y + 'px;font:700 11px Inter,sans-serif;letter-spacing:.14em;color:#8892B0');
      tx.setAttribute('data-t', t.t); stage.appendChild(tx);
    });

    var segs = [];
    F.nodes.forEach(function (n) {
      (n.from || []).forEach(function (pid) {
        var p = byId[pid], dx = n.x - p.x, dy = n.y - p.y;
        var d = el('div', 'position:absolute;left:' + p.x + 'px;top:' + (p.y - 3) + 'px;width:' + Math.sqrt(dx * dx + dy * dy).toFixed(1) + 'px;height:6px;transform-origin:0 50%;transform:rotate(' + Math.atan2(dy, dx).toFixed(4) + 'rad);background-size:11px 6px;background-position:4px 0;transition:filter .5s');
        stage.appendChild(d);
        segs.push({ d: d, n: n });
      });
    });

    var nodes = [];
    F.nodes.forEach(function (n) {
      if (n.kind === 'pt') return;
      if (n.kind === 'gate') {
        var g = el('div', 'position:absolute;left:' + (n.x - 110) + 'px;top:' + (n.y - 22) + 'px;width:220px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;text-align:center;font:700 12px Inter,sans-serif;padding:0 10px;transition:all .5s', esc(tr(n.app)));
        stage.appendChild(g);
        nodes.push({ n: n, gate: g });
        return;
      }
      var size = n.ic === 'router' ? Math.round(F.S * 0.82) : F.S;
      var circ = el('div', 'position:absolute;left:' + (n.x - size / 2) + 'px;top:' + (n.y - size / 2) + 'px;width:' + size + 'px;height:' + size + 'px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all .5s cubic-bezier(.2,.8,.2,1)',
        '<svg width="' + Math.round(size * .42) + '" height="' + Math.round(size * .42) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="' + IC[n.ic] + '"/></svg>');
      var badge = el('div', 'position:absolute;left:' + (n.x + size / 2 - 12) + 'px;top:' + (n.y - size / 2 - 8) + 'px;width:20px;height:20px;border-radius:50%;background:#fff;color:#0A192F;font:800 11px Inter,sans-serif;display:flex;align-items:center;justify-content:center;transition:all .4s;opacity:0', '1');
      var label = el('div', 'position:absolute;left:' + (n.x - F.LW / 2) + 'px;top:' + (n.y + size / 2 + 6) + 'px;width:' + F.LW + 'px;padding:2px 4px;border-radius:6px;background:#0D1F3A;text-align:center;line-height:1.25;font-family:Inter,sans-serif',
        '<div class="nm" style="font-weight:700;font-size:13px">' + esc(n.app) + '</div><div class="ac" style="font-size:11px;color:#8892B0;margin-top:1px"></div>');
      stage.appendChild(circ); stage.appendChild(badge); stage.appendChild(label);
      nodes.push({ n: n, circ: circ, badge: badge, label: label, size: size });
    });

    /* Stage bar (ClickUp stages) + caption */
    var stagesBar = null, stageEls = [];
    if (F.stages.length) {
      stagesBar = el('div', 'border-top:1px solid #233554;padding:16px 24px;display:flex;flex-wrap:wrap;gap:10px;align-items:center',
        '<span class="stg" style="font:700 13px Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#8892B0;margin-right:6px"></span>');
      F.stages.forEach(function (s) {
        var b = el('span', 'font:700 13px Inter,sans-serif;padding:6px 12px;border-radius:8px;transition:all .5s', esc(s[0]));
        stagesBar.appendChild(b); stageEls.push(b);
      });
    }
    var capRow = el('div', 'border-top:1px solid #233554;padding:18px 24px;display:flex;gap:14px;align-items:center');
    var dot = el('span', 'width:10px;height:10px;border-radius:50%;flex:0 0 10px');
    var cap = el('div', 'font-size:16px;line-height:1.5;color:#E6F1FF');
    cap.setAttribute('aria-live', 'polite');
    capRow.appendChild(dot); capRow.appendChild(cap);

    root.appendChild(bar); root.appendChild(scroll);
    if (stagesBar) root.appendChild(stagesBar);
    root.appendChild(capRow);

    var step = reduce ? total + 1 : 0, playing = !reduce, visible = false, timer = null;

    function render() {
      var finished = step > total;
      segs.forEach(function (s) {
        var err = s.n.kind === 'err', lit = !err && s.n.o <= step;
        var col = err ? '#3E5378' : lit ? T : '#2E4468';
        s.d.style.backgroundImage = 'radial-gradient(circle,' + col + ' 2.2px,transparent 2.8px)';
        s.d.style.filter = lit ? 'drop-shadow(0 0 4px rgba(100,255,218,.9))' : 'none';
        s.d.style.opacity = err ? '.7' : '1';
      });
      nodes.forEach(function (x) {
        var n = x.n, lit = n.kind !== 'err' && n.o <= step, now = n.o === step;
        if (x.gate) {
          x.gate.textContent = tr(n.app);
          x.gate.style.cssText += lit
            ? ';background:' + n.c + ';color:#fff;border:2px solid ' + n.c + ';box-shadow:0 0 0 ' + (now ? 8 : 4) + 'px rgba(100,255,218,' + (now ? '.25' : '.1') + ')'
            : ';background:#112240;color:#8892B0;border:2px dashed #3E5378;box-shadow:none';
          return;
        }
        var s = x.circ.style;
        if (n.kind === 'err') { s.background = '#0D1F3A'; s.color = '#5C6F91'; s.border = '2px dashed #3E5378'; }
        else if (lit) {
          s.background = n.c; s.color = '#fff'; s.border = '2px solid rgba(255,255,255,.25)';
          s.boxShadow = '0 0 0 ' + (now ? 8 : 4) + 'px rgba(100,255,218,' + (now ? '.3' : '.14') + '),0 0 28px rgba(100,255,218,.45)';
          s.transform = 'scale(' + (now ? 1.12 : 1) + ')';
        } else { s.background = '#112240'; s.color = '#5C6F91'; s.border = '2px solid #2A3F63'; s.boxShadow = 'none'; s.transform = 'scale(1)'; }
        x.badge.style.opacity = lit && n.ic !== 'router' ? '1' : '0';
        x.label.style.opacity = lit ? '1' : '.8';
        x.label.querySelector('.ac').textContent = tr(n.act);
        x.label.querySelector('.nm').style.color = lit ? '#fff' : '#A8B2D1';
      });
      [].forEach.call(stage.querySelectorAll('[data-t]'), function (e) { e.textContent = tr(e.getAttribute('data-t')); });
      if (stagesBar) stagesBar.querySelector('.stg').textContent = tr('ClickUp stage');
      again.textContent = tr('Run again');
      var cur = -1;
      F.stages.forEach(function (st, k) { if (st[2] <= step) cur = k; });
      stageEls.forEach(function (b, k) {
        var st = F.stages[k];
        b.style.cssText += k === cur ? ';background:' + st[1] + ';color:#fff;border:none;opacity:1;box-shadow:0 0 0 4px rgba(100,255,218,.25)'
          : st[2] <= step ? ';background:' + st[1] + ';color:#fff;border:none;opacity:.55;box-shadow:none'
          : ';background:transparent;color:#8892B0;border:1px solid #2A3F63;opacity:1;box-shadow:none';
      });
      var current = null;
      F.nodes.forEach(function (n) { if (n.o === step && n.cap) current = n; });
      cap.textContent = step === 0 ? tr('Watch a real run, one module at a time.') : finished ? tr(F.done) : current ? tr(current.cap) : '';
      status.textContent = step === 0 ? tr('Waiting for trigger…') : finished ? '✓ ' + tr('Run complete') : tr('Running') + ' · ' + step + ' / ' + total;
      status.style.color = dot.style.background = step === 0 ? '#8892B0' : T;
      playBtn.innerHTML = playing
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 5v14M15 5v14"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M7 5l12 7-12 7z"/></svg>';
      playBtn.setAttribute('aria-label', playing ? tr('Pause') : tr('Play'));
    }
    function tick() { if (!playing || !visible) return; step = step + 1 > total + 4 ? 0 : step + 1; render(); }
    playBtn.addEventListener('click', function () { playing = !playing; render(); });
    again.addEventListener('click', function () { step = 0; playing = true; render(); });
    document.addEventListener('ol:languagechange', render);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: .3 }).observe(root);
    } else { visible = true; }
    timer = setInterval(tick, speed);
    render();
  }

  function init() { [].forEach.call(document.querySelectorAll('.scn[data-flow]'), mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
