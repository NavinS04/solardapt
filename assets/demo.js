// Solar Survey Engine demo. Entirely client-side: nothing is sent anywhere.
// Qualification is a fixed points table (rules, not AI): same answers, same score.
(() => {
  const $ = id => document.getElementById(id);
  const INSTALLER = "Brightfield Solar";
  const QUALIFY_AT = 55;

  const QUESTIONS = [
    { key: "type", title: "What type of property is it?", sub: "Helps us plan the survey.",
      opts: [["Detached", 20], ["Semi-detached", 20], ["Terraced", 15], ["Bungalow", 20], ["Flat or maisonette", 0]] },
    { key: "roof", title: "Which way does the main roof face?", sub: "Not sure is fine, the surveyor checks.",
      opts: [["South", 25], ["East or west", 20], ["North", 5], ["Not sure", 12]] },
    { key: "bill", title: "Roughly what's your monthly electricity bill?", sub: "A ballpark is plenty.",
      opts: [["Over £150", 25], ["£75 to £150", 18], ["Under £75", 8]] },
    { key: "when", title: "When are you hoping to install?", sub: "No pressure either way.",
      opts: [["As soon as possible", 30], ["In 1 to 3 months", 25], ["In 3 to 6 months", 15], ["Just researching", 5]] },
  ];

  let s, run = 0;
  const fresh = () => ({ answers: {}, points: {}, sms: [], t0: 0, slot: null, name: "Sam", stages: { new: 0, qualified: 0, booked: 0, attended: 0, filtered: 0 } });

  // ---------- helpers ----------
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) k === "class" ? (n.className = v) : k.startsWith("on") ? n.addEventListener(k.slice(2), v) : n.setAttribute(k, v);
    for (const k of kids) n.append(k instanceof Node ? k : document.createTextNode(k));
    return n;
  };
  const wait = ms => { const my = run; return new Promise((ok, no) => setTimeout(() => (my === run ? ok() : no("reset")), ms)); };
  const screen = (...kids) => { $("screen").replaceChildren(...kids); $("screen").scrollTop = 0; };
  const elapsed = () => {
    const sec = Math.max(0, (Date.now() - s.t0) / 1000);
    return `+${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
  };

  function log(icon, kind, title, detail, t) {
    const tl = $("timeline");
    tl.querySelector(".empty")?.remove();
    tl.append(el("li", {}, el("span", { class: "t" }, t ?? elapsed()), el("span", { class: `ic ${kind}` }, icon),
      el("div", {}, el("b", {}, title), detail ? el("span", { class: "d" }, detail) : "")));
    tl.scrollTop = tl.scrollHeight;
  }

  function stage(name, delta = 1) {
    s.stages[name] += delta;
    const box = document.querySelector(`[data-stage="${name}"]`);
    box.querySelector("b").textContent = s.stages[name];
    box.classList.add("lit");
  }

  function sms(text, fromMe = false, when = "now") {
    s.sms.push({ text, fromMe, when });
    if (!fromMe) {
      $("notif-text").textContent = text.length > 90 ? text.slice(0, 88) + "…" : text;
      $("notif").hidden = false;
      setTimeout(() => { $("notif").hidden = true; }, 3200);
    }
    const thread = document.querySelector(".sms-thread");
    if (thread) renderThread(thread);
  }

  function renderThread(thread) {
    thread.replaceChildren(...s.sms.map(m => el("div", { class: `bubble${m.fromMe ? " me" : ""}` }, m.text, el("small", {}, m.when))));
  }

  const nextWeekdays = n => {
    const out = [], d = new Date();
    d.setDate(d.getDate() + 1);  // start the day after tomorrow, so the day-before reminder is always ahead
    while (out.length < n) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) out.push(new Date(d)); }
    return out;
  };
  const fmtDay = d => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  // ---------- homeowner screens ----------
  function showAd() {
    screen(el("div", { class: "ad" },
      el("div", { class: "ad-top" }, el("div", { class: "av" }, "B"), el("div", {}, el("b", {}, INSTALLER), el("small", {}, "Sponsored"))),
      el("p", {}, "Thinking about solar before the 0% VAT window closes in March 2027? Take our 60-second check to see if your home is suitable. A local, MCS-certified team, no hard sell."),
      el("div", { class: "ad-img", role: "img", "aria-label": "Illustration of a house roof in the sun" }),
      el("div", { class: "ad-cta" }, el("span", {}, "brightfield-solar.example"), el("button", { class: "btn btn-dark", style: "padding:8px 14px;font-size:.82rem", onclick: askOwner }, "Check my home"))));
  }

  const qHead = (step, title, sub) => [
    el("div", { class: "brandline" }, INSTALLER.toUpperCase()),
    el("div", { class: "progress" }, el("i", { style: `width:${(step / 6) * 100}%` })),
    el("h4", {}, title), el("div", { class: "sub" }, sub)];

  function askOwner() {
    screen(el("div", { class: "q" }, ...qHead(1, "Do you own your home?", "Solar needs the homeowner's go-ahead."),
      el("button", { class: "opt", onclick: () => ask(0) }, "Yes, I own it"),
      el("button", { class: "opt", onclick: renter }, "No, I rent")));
  }

  function ask(i) {
    if (i === QUESTIONS.length) return details();
    const q = QUESTIONS[i];
    screen(el("div", { class: "q" }, ...qHead(i + 2, q.title, q.sub),
      ...q.opts.map(([label, pts]) => el("button", { class: "opt", onclick: () => { s.answers[q.key] = label; s.points[q.key] = pts; ask(i + 1); } }, label))));
  }

  function details() {
    const consent = el("input", { type: "checkbox", id: "consent" });
    const go = el("button", { class: "go", disabled: "" }, "See my survey times");
    consent.addEventListener("change", () => { go.disabled = !consent.checked; });
    const name = el("input", { class: "inp", value: "Sam", "aria-label": "First name" });
    go.addEventListener("click", () => { s.name = (name.value.trim() || "Sam").slice(0, 30); submitted(); });
    screen(el("div", { class: "q" }, ...qHead(6, "Last step: where should we send your survey times?", "We'll only use these for this enquiry."),
      name,
      el("input", { class: "inp", value: "WV6 7AA", "aria-label": "Postcode" }),
      el("input", { class: "inp", value: "07700 900123", "aria-label": "Mobile" }),
      el("input", { class: "inp", value: "sam@example.com", "aria-label": "Email" }),
      el("label", { class: "consent", for: "consent" }, consent, `I agree to ${INSTALLER} contacting me about this enquiry by phone, text and email. Reply STOP at any time.`),
      go));
  }

  function renter() {
    screen(el("div", { class: "done" }, el("div", { class: "big-tick", style: "background:#8892a6" }, "i"),
      el("h4", { style: "font:700 1.15rem var(--head)" }, "Thanks for checking"),
      el("p", { style: "font-size:.9rem;color:#555" }, "Solar panels need the homeowner's permission, so we can't book a survey for a rented home. If your landlord's interested, they're welcome to get in touch.")));
    s.t0 = Date.now();
    log("✕", "bad", "Filtered out: not the homeowner", "No survey booked, no contact details taken, no follow-up messages. Your surveyor's day stays free for real buyers.");
    stage("filtered");
  }

  async function submitted() {
    const score = Object.values(s.points).reduce((a, b) => a + b, 0);
    const qualified = score >= QUALIFY_AT;
    s.t0 = Date.now();
    log("●", "", `New enquiry: ${s.name}, WV6`, `${s.answers.type}, ${s.answers.roof.toLowerCase()} roof, bill ${s.answers.bill.toLowerCase()}, ${s.answers.when.toLowerCase()}`);
    stage("new");

    if (qualified) showSlots(); else nurtureScreen();
    s.intro = introSequence(score, qualified);
  }

  async function introSequence(score, qualified) {
    try {
      await wait(700);
      const parts = QUESTIONS.map(q => `${s.answers[q.key].toLowerCase()} ${s.points[q.key]}`).join(" + ");
      if (qualified) {
        log("✓", "ok", `Qualified: score ${score}/100`, `${parts}. A fixed points table, not AI: the same answers always give the same score.`);
        stage("qualified");
      } else {
        log("◐", "", `Not ready yet: score ${score}/100`, `${parts}. Below ${QUALIFY_AT}: they get the guide, but no sales chasing and no survey push.`);
      }
      await wait(900);
      sms(qualified
        ? `Hi ${s.name}, thanks for your enquiry with ${INSTALLER}! Pick a time for your free home survey here: brightfield-solar.example/book. Reply STOP to opt out.`
        : `Hi ${s.name}, thanks for checking with ${INSTALLER}. We've emailed you our solar guide. Reply any time when you're ready to book a free survey. Reply STOP to opt out.`);
      log("✉", "ok", "Text sent to homeowner", "Sent via the installer's own number. Stops automatically if they reply, book or text STOP.");
      $("speed").hidden = false;
      $("speed-v").textContent = `${((Date.now() - s.t0) / 1000).toFixed(1)}s (sped up)`;
      await wait(600);
      log("✉", "ok", "Email sent to homeowner", qualified ? "Booking link, what happens at the survey, who's coming." : "Solar guide. No follow-up sequence.");
      await wait(600);
      showAlert(score, qualified);
      log("🔔", "", "Installer alerted", "Push notification and email to the office, with the homeowner's answers and score.");
    } catch (e) { /* reset */ }
  }

  function showAlert(score, qualified, bookedLine) {
    const a = $("alert");
    a.hidden = false;
    a.replaceChildren(el("h4", {}, qualified ? `New qualified enquiry: ${s.name} (score ${score})` : `Low-priority enquiry: ${s.name} (score ${score})`),
      el("dl", {}, el("dt", {}, "Property"), el("dd", {}, `${s.answers.type}, WV6`), el("dt", {}, "Roof"), el("dd", {}, s.answers.roof),
        el("dt", {}, "Bill"), el("dd", {}, s.answers.bill), el("dt", {}, "Timeframe"), el("dd", {}, s.answers.when),
        el("dt", {}, "Survey"), el("dd", {}, bookedLine || (qualified ? "Choosing a slot…" : "Not booked: guide sent"))));
  }

  function showSlots() {
    const days = nextWeekdays(3);
    screen(el("div", { class: "q" }, el("div", { class: "brandline" }, INSTALLER.toUpperCase()),
      el("h4", {}, `Great news, ${s.name}. Pick your free survey time`), el("div", { class: "sub" }, "About 45 minutes. A surveyor checks the roof, fuse board and your usage."),
      el("div", { class: "days" }, ...days.map(d => el("div", { class: "day" }, el("b", {}, fmtDay(d)),
        el("div", { class: "slots" }, ...["10:00", "13:00", "16:00"].map(t => el("button", { class: "slot", onclick: () => booked(d, t) }, t))))))));
  }

  function nurtureScreen() {
    const thread = el("div", { class: "sms-thread" });
    screen(el("div", { class: "done" }, el("div", { class: "big-tick", style: "background:var(--sun-deep)" }, "✉"),
      el("h4", { style: "font:700 1.15rem var(--head)" }, `Thanks, ${s.name}`),
      el("p", { style: "font-size:.9rem;color:#555" }, "We've emailed you our guide to solar for your home. When you're ready, reply to book a free survey."), thread));
    renderThread(thread);
  }

  async function booked(day, time) {
    s.slot = { day, time, label: `${fmtDay(day)}, ${time}` };
    const thread = el("div", { class: "sms-thread" });
    screen(el("div", { class: "done" }, el("div", { class: "big-tick" }, "✓"),
      el("h4", { style: "font:700 1.15rem var(--head)" }, "You're booked in"),
      el("p", { style: "font-size:.92rem;color:#555" }, `Free solar survey: ${s.slot.label}. We'll text you a reminder the day before.`), el("div", { class: "brandline", style: "margin-top:18px" }, "MESSAGES"), thread));
    renderThread(thread);
    try {
      await s.intro;  // keep the installer timeline in real order even if the homeowner books fast
      await wait(300);
      log("📅", "ok", `Survey booked: ${s.slot.label}`, "Added to the survey calendar. No phone tag.");
      stage("booked");
      showAlert(Object.values(s.points).reduce((a, b) => a + b, 0), true, s.slot.label);
      await wait(700);
      sms(`Confirmed: your free solar survey with ${INSTALLER} is ${s.slot.label}. Reply R to rearrange.`);
      log("✉", "ok", "Confirmation text sent");
      await wait(700);
      const prev = new Date(day); prev.setDate(prev.getDate() - 1);
      log("⏰", "", "Reminders scheduled", `${fmtDay(prev)} 18:00 (day before) and ${fmtDay(day)} 08:30 (morning of). Nothing is sent between 20:00 and 08:00.`);
      $("after").hidden = false;
    } catch (e) { /* reset */ }
  }

  // ---------- after booking ----------
  async function reminderPath() {
    lockAfter();
    const prev = new Date(s.slot.day); prev.setDate(prev.getDate() - 1);
    try {
      sms(`Hi ${s.name}, reminder: your solar survey with ${INSTALLER} is tomorrow at ${s.slot.time}. Reply C to confirm or R to rearrange.`, false, `${fmtDay(prev)} 18:00`);
      log("⏰", "", "Day-before reminder sent", null, `${fmtDay(prev).split(" ")[0]} 18:00`);
      await wait(1300);
      sms("C", true, `${fmtDay(prev)} 18:04`);
      log("✓", "ok", "Homeowner confirmed (replied C)", "Surveyor's route for tomorrow updated.", `${fmtDay(prev).split(" ")[0]} 18:04`);
      await wait(1200);
      log("✓", "ok", "Survey attended", "Surveyor marked it done in one tap. It now counts in the weekly report.", `${fmtDay(s.slot.day).split(" ")[0]} ${s.slot.time}`);
      stage("attended");
    } catch (e) { /* reset */ }
  }

  async function noShowPath() {
    lockAfter();
    const d = fmtDay(s.slot.day).split(" ")[0];
    try {
      log("✕", "bad", "Surveyor marked no-show", null, `${d} ${s.slot.time}`);
      await wait(800);
      sms(`Sorry we missed you today, ${s.name}. No problem: pick a new time here: brightfield-solar.example/book. Reply STOP to opt out.`, false, `${d} ${s.slot.time.replace(":00", ":20")}`);
      log("↻", "", "Rebooking text sent automatically", null, `${d} ${s.slot.time.replace(":00", ":20")}`);
      await wait(800);
      log("☎", "", "Callback task created for the office", `Call ${s.name} today. One more message tomorrow if they haven't rebooked, then it stops: never chased more than twice.`);
      await wait(1400);
      sms("Sorry, got held up at work! Booking Thursday now", true, `${d} 12:41`);
      log("📅", "ok", `${s.name} rebooked`, "The survey is back in the diary. The slot would otherwise have been written off.", `${d} 12:43`);
    } catch (e) { /* reset */ }
  }

  function lockAfter() { $("ff-reminder").disabled = true; $("noshow").disabled = true; }

  // ---------- controls ----------
  function reset() {
    run++;
    s = fresh();
    $("timeline").replaceChildren(el("li", { class: "empty" }, "Press ", el("b", {}, "Start the demo"), ", then answer as the homeowner. Try saying you rent, too."));
    document.querySelectorAll(".stage-box").forEach(b => { b.classList.remove("lit"); b.querySelector("b").textContent = "0"; });
    ["alert", "after", "speed", "report", "notif"].forEach(id => { $(id).hidden = true; });
    $("ff-reminder").disabled = false; $("noshow").disabled = false;
    showAd();
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("clock").textContent = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    $("start").addEventListener("click", () => { reset(); askOwner(); $("phone").scrollIntoView({ behavior: "smooth", block: "center" }); });
    $("reset").addEventListener("click", reset);
    $("ff-reminder").addEventListener("click", reminderPath);
    $("noshow").addEventListener("click", noShowPath);
    $("report-btn").addEventListener("click", () => { $("report").hidden = false; $("report").scrollIntoView({ behavior: "smooth" }); });
    reset();
  });
})();
