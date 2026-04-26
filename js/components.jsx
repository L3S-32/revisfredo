/* Micro-composants UI réutilisables : icônes, blob décoratif, carte, toggle, barre animée, texte éditable */

/* Couleur de fond/texte d'un module selon son code de couleur (dk/pr/sc/sf) */
const modCol = (ck, c) => {
  if (ck === 'dk') return { bg:c.cardDk,  txt:c.cardDkTxt };
  if (ck === 'pr') return { bg:c.primary, txt:c.text };
  if (ck === 'sc') return { bg:c.second,  txt:c.bg };
                   return { bg:c.surf,    txt:c.text };
};

/* Icône SVG par nom — chaque entrée est un chemin (ou plusieurs séparés par " M") */
const Ic = ({ n, s = 20, c = 'currentColor' }) => {
  const paths = {
    today:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    fiches:   "M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z M8 10h8 M8 14h5",
    reviser:  "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
    planning: "M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z",
    moi:      "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
    flame:    "M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 002.5 2.5z",
    clock:    "M12 2a10 10 0 100 20A10 10 0 0012 2z M12 6v6l4 2",
    bolt:     "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    refresh:  "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
    focus:    "M12 9a3 3 0 100 6 3 3 0 000-6z M12 2v3 M12 19v3 M4.22 4.22l2.12 2.12 M17.66 17.66l2.12 2.12 M2 12h3 M19 12h3",
    moon:     "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
    sound:    "M11 5L6 9H2v6h4l5 4V5z M19.07 4.93a10 10 0 010 14.14 M15.54 8.46a5 5 0 010 7.07",
    users:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
    award:    "M12 15a6 6 0 100-12 6 6 0 000 12z M8.21 13.89L7 23l5-3 5 3-1.21-9.12",
    chevR:    "M9 18l6-6-6-6",
    close:    "M18 6L6 18 M6 6l12 12",
    palette:  "M12 2a10 10 0 100 20A10 10 0 0012 2z M12 8a1 1 0 100-2 1 1 0 000 2z M8 12a1 1 0 100-2 1 1 0 000 2z M16 12a1 1 0 100-2 1 1 0 000 2z M12 16a1 1 0 100-2 1 1 0 000 2z",
    check:    "M20 6L9 17l-5-5",
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {(paths[n]||'').split(' M').map((d,i) => <path key={i} d={i===0?d:'M'+d} />)}
    </svg>
  );
};

/* Forme organique en arrière-plan (toujours absolute-positioned) */
const Blob = ({ color, style }) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ position:'absolute', pointerEvents:'none', ...style }}>
    <path fill={color} d="M47.1,-79.2C59.9,-72.4,68.5,-57.6,74.8,-42.4C81.1,-27.2,85.1,-11.6,83.5,3.5C81.8,18.6,74.5,33.2,65.2,45.8C55.9,58.4,44.6,69,31.2,75.7C17.8,82.4,2.3,85.2,-13.4,83.2C-29.1,81.2,-45,74.4,-57.5,63.8C-70,53.2,-79.1,38.8,-82.6,23.2C-86.1,7.6,-84,-9.2,-77.8,-24C-71.6,-38.8,-61.3,-51.6,-48.4,-58.3C-35.5,-65,-20,-65.6,-3.2,-61.5C13.6,-57.4,34.3,-86,47.1,-79.2Z" transform="translate(100 100)" />
  </svg>
);

/* Carte avec hover lift optionnel (si onClick fourni) */
const Card = ({ children, bg, style, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:bg, borderRadius:22, position:'relative', overflow:'hidden', transition:'transform 0.18s ease', transform: hov && onClick ? 'translateY(-2px)' : 'none', cursor: onClick ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  );
};

/* Toggle on/off */
const Toggle = ({ on, onChange, color }) => (
  <div onClick={() => onChange(!on)} style={{ width:46, height:26, borderRadius:13, background:on?(color||'#A8C266'):'rgba(150,150,150,0.22)', cursor:'pointer', position:'relative', transition:'background 0.22s', flexShrink:0 }}>
    <div style={{ position:'absolute', top:3, left:on?23:3, width:20, height:20, borderRadius:'50%', background:'white', transition:'left 0.22s cubic-bezier(0.4,0,0.2,1)', boxShadow:'0 1px 4px rgba(0,0,0,0.22)' }} />
  </div>
);

/* Barre de progression avec étincelles au survol */
const SparkleBar = ({ pct, primary }) => {
  const [sparks, setSparks] = useState([]);
  const handleEnter = () => {
    setSparks(Array.from({length:5}, (_,i) => ({
      id: Date.now()+i,
      left: `${10 + Math.random() * (pct - 15)}%`,
      dur:  0.55 + Math.random() * 0.35,
      delay:Math.random() * 0.25,
      size: 3 + Math.random() * 3,
    })));
    setTimeout(() => setSparks([]), 1200);
  };
  return (
    <div style={{ position:'relative', height:10 }} onMouseEnter={handleEnter}>
      <div style={{ position:'absolute', inset:0, background:`${primary}18`, borderRadius:5 }} />
      <div className="bar-shimmer" style={{ position:'absolute', top:0, left:0, height:'100%', width:`${pct}%`, background:primary, borderRadius:5, transition:'width 0.8s ease' }} />
      {sparks.map(s => (
        <div key={s.id} style={{
          position:'absolute', top:'50%', left:s.left,
          width:s.size, height:s.size, borderRadius:'50%',
          background:primary, pointerEvents:'none',
          animation:`sparkleFall ${s.dur}s ease forwards`,
          animationDelay:`${s.delay}s`, opacity:0,
          animationFillMode:'both',
        }} />
      ))}
    </div>
  );
};

/* Texte cliquable qui se transforme en input. Enter = valider, Escape = annuler */
const EditableText = ({ value, onChange, style, placeholder }) => {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value);
  useEffect(() => { setV(value); }, [value]);
  const commit = () => { setEditing(false); if (v !== value) onChange(v); };
  if (editing) {
    return (
      <input autoFocus value={v} onChange={e=>setV(e.target.value)} onBlur={commit}
        onKeyDown={e => { if (e.key==='Enter') commit(); if (e.key==='Escape') { setV(value); setEditing(false); } }}
        placeholder={placeholder}
        style={{ ...style, padding:'2px 6px', borderRadius:6, border:`1.5px solid ${style.color||'#999'}40`, background:'rgba(255,255,255,0.08)', outline:'none', fontFamily:'Inter,sans-serif' }} />
    );
  }
  return (
    <span onClick={()=>setEditing(true)} style={{ ...style, cursor:'text', borderBottom:'1px dashed transparent' }}
      onMouseEnter={e=>e.currentTarget.style.borderBottomColor=`${style.color||'#999'}40`}
      onMouseLeave={e=>e.currentTarget.style.borderBottomColor='transparent'}
      title="Clique pour modifier">
      {value || placeholder}
    </span>
  );
};
