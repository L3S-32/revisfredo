/* Calculs de statistiques à partir de l'historique des révisions */

/* Nombre de jours consécutifs avec au moins une carte révisée.
   Si aucune révision aujourd'hui, on part d'hier pour ne pas casser le streak en cours de journée. */
const computeStreak = (history) => {
  if (!history.length) return 0;
  const days = new Set(history.map(h => dayKey(h.ts)));
  const today = new Date(); today.setHours(0,0,0,0);
  const startDay = days.has(dayKey(today)) ? 0 : 1;
  let streak = 0;
  for (let i = startDay; i < 3650; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(dayKey(d))) streak++;
    else break;
  }
  return streak;
};

/* Une carte est "maîtrisée" si sa dernière réponse n'est pas 'hard' */
const computeMastered = (history) => {
  const last = new Map();
  history.forEach(h => { last.set(`${h.mod}:${h.cardIdx}`, h.result); });
  let n = 0;
  last.forEach(r => { if (r !== 'hard') n++; });
  return n;
};

const successRate = (history, since) => {
  const recent = history.filter(h => h.ts >= since);
  if (!recent.length) return null;
  const ok = recent.filter(h => h.result !== 'hard').length;
  return Math.round((ok / recent.length) * 100);
};
const computeWeekSuccess  = (h) => successRate(h, Date.now() - 7  * 864e5);
const computeMonthSuccess = (h) => successRate(h, Date.now() - 30 * 864e5);

/* Temps de révision sur la semaine — estimé à ~20s par carte */
const computeWeekTime = (history) => {
  const since = Date.now() - 7 * 864e5;
  const n = history.filter(h => h.ts >= since).length;
  if (!n) return null;
  const secs = n * 20;
  const mins = Math.max(1, Math.floor(secs / 60));
  const h = Math.floor(mins / 60), m = mins - h * 60;
  return h ? `${h}h${String(m).padStart(2,'0')}` : `${m}min`;
};

/* Pourcentage de réussite par jour (lundi → dimanche de la semaine en cours) */
const computeWeekActivity = (history) => {
  const start = startOfWeek(new Date());
  const arr = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = dayKey(d);
    const dayH = history.filter(h => dayKey(h.ts) === key);
    if (!dayH.length) { arr.push(0); continue; }
    const ok = dayH.filter(h => h.result !== 'hard').length;
    arr.push(Math.round((ok / dayH.length) * 100));
  }
  return arr;
};

/* Top 5 matières par % de maîtrise (dernière réponse par carte) */
const computeModuleProgress = (history) => {
  const last = new Map();
  history.forEach(h => { last.set(`${h.mod}:${h.cardIdx}`, h); });
  const perMod = {};
  last.forEach(h => {
    if (!perMod[h.mod]) perMod[h.mod] = { ok:0, n:0 };
    perMod[h.mod].n++;
    if (h.result !== 'hard') perMod[h.mod].ok++;
  });
  return Object.entries(perMod)
    .map(([id, v]) => {
      const m = MODULES.find(x => x.id === id);
      return { id, l: m ? m.label : id, ck: m ? m.ck : 'sf', p: Math.round((v.ok / v.n) * 100) };
    })
    .sort((a,b) => b.p - a.p)
    .slice(0, 5);
};

const getNextTest = (tests) => {
  const today = new Date(); today.setHours(0,0,0,0);
  return tests
    .filter(t => new Date(t.date).getTime() >= today.getTime())
    .sort((a,b) => new Date(a.date) - new Date(b.date))[0] || null;
};

const getUpcomingTests = (tests, limit = 3) => {
  const today = new Date(); today.setHours(0,0,0,0);
  return tests
    .filter(t => new Date(t.date).getTime() >= today.getTime())
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .slice(0, limit);
};
