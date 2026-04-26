/* Formatage des dates en français + helpers de calcul de jours/semaines */

const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const DAYS_FR_LONG = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

const modLabel = (id) => {
  const m = MODULES.find(x => x.id === id);
  return m ? `${id} — ${m.label}` : id;
};

const dayKey = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
};

const startOfWeek = (d) => {
  const dt = new Date(d);
  const wd = dt.getDay();              // 0 = dimanche, 1 = lundi, …
  const diff = (wd === 0 ? 6 : wd - 1);
  dt.setDate(dt.getDate() - diff);
  dt.setHours(0,0,0,0);
  return dt;
};

const formatFrDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${cap(DAYS_FR_LONG[d.getDay()])} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
};

const daysUntil = (dateStr) => {
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  const t = new Date();        t.setHours(0,0,0,0);
  return Math.round((d - t) / 864e5);
};
