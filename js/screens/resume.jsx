/* Écran "Résumé" — layout type documentation : sidebar de thèmes + zone d'article.
   Utilise un mini-renderer markdown (titres, listes, tableaux, code, gras, code inline). */

/* ───────── Mini-renderer markdown ───────── */

/* Découpe un texte en parties : { kind:'text'|'code'|'bold', value }.
   Gère `code` (priorité) puis **gras**. */
const parseInline = (text) => {
  const parts = [];
  /* Étape 1 : split sur backticks → alternance text / code */
  const segs = text.split('`');
  segs.forEach((seg, i) => {
    if (i % 2 === 1) {
      parts.push({ kind:'code', value: seg });
    } else {
      /* Étape 2 : sur le segment text, split sur ** pour le gras */
      const subs = seg.split('**');
      subs.forEach((sub, j) => {
        if (sub === '') return;
        parts.push({ kind: j % 2 === 1 ? 'bold' : 'text', value: sub });
      });
    }
  });
  return parts;
};

const InlineSpan = ({ parts, palette, dark }) => (
  <>
    {parts.map((p, i) => {
      if (p.kind === 'code') {
        return (
          <code key={i} style={{
            display:'inline-block',
            padding:'2px 8px',
            margin:'0 1px',
            background: dark ? `${palette.dkPrimary}22` : `${palette.primary}22`,
            color: dark ? palette.dkPrimary : palette.second,
            borderRadius:6,
            fontFamily:"'JetBrains Mono', ui-monospace, monospace",
            fontSize:'0.9em',
            fontWeight:500,
            whiteSpace:'nowrap',
          }}>{p.value}</code>
        );
      }
      if (p.kind === 'bold') {
        return <strong key={i} style={{ fontWeight:700 }}>{p.value}</strong>;
      }
      return <span key={i}>{p.value}</span>;
    })}
  </>
);

/* Parse le summary en blocs typés. */
const parseBlocks = (md) => {
  const lines = md.split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    /* Code block ``` */
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type:'code', lang, text: buf.join('\n') });
      continue;
    }

    /* Heading */
    if (line.startsWith('## ')) {
      blocks.push({ type:'h2', text: line.slice(3) });
      i++; continue;
    }
    if (line.startsWith('# ')) {
      blocks.push({ type:'h1', text: line.slice(2) });
      i++; continue;
    }

    /* Table */
    if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        const cells = lines[i].split('|').slice(1, -1).map(s => s.trim());
        rows.push(cells);
        i++;
      }
      blocks.push({ type:'table', headers: rows[0], rows: rows.slice(1) });
      continue;
    }

    /* Liste */
    if (line.startsWith('• ') || line.startsWith('- ')) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith('• ') || lines[i].startsWith('- '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type:'list', items });
      continue;
    }

    /* Ligne vide → ignore */
    if (line.trim() === '') { i++; continue; }

    /* Paragraphe : agrège les lignes consécutives non spéciales */
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('## ') && !lines[i].startsWith('# ') && !lines[i].startsWith('|') && !lines[i].startsWith('• ') && !lines[i].startsWith('- ') && !lines[i].trim().startsWith('```')) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) blocks.push({ type:'p', text: paraLines.join(' ') });
  }
  return blocks;
};

/* Rendu d'un bloc */
const Block = ({ block, palette, dark, c }) => {
  if (block.type === 'h1') {
    return <h2 style={{ fontFamily:"'Lora', Georgia, serif", fontSize:30, fontWeight:700, color:c.text, margin:'30px 0 14px', lineHeight:1.2 }}>{block.text}</h2>;
  }
  if (block.type === 'h2') {
    return <h3 style={{ fontFamily:"'Lora', Georgia, serif", fontSize:22, fontWeight:700, color:c.text, margin:'28px 0 12px', lineHeight:1.25 }}>{block.text}</h3>;
  }
  if (block.type === 'p') {
    return <p style={{ fontSize:15.5, lineHeight:1.7, color:c.text, margin:'0 0 14px' }}><InlineSpan parts={parseInline(block.text)} palette={palette} dark={dark} /></p>;
  }
  if (block.type === 'list') {
    return (
      <ul style={{ margin:'0 0 16px', paddingLeft:0, listStyle:'none' }}>
        {block.items.map((it, i) => (
          <li key={i} style={{ position:'relative', paddingLeft:22, fontSize:15.5, lineHeight:1.7, color:c.text, marginBottom:6 }}>
            <span style={{ position:'absolute', left:6, top:0, color:palette.primary, fontWeight:700 }}>•</span>
            <InlineSpan parts={parseInline(it)} palette={palette} dark={dark} />
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === 'table') {
    return (
      <div style={{ overflowX:'auto', margin:'4px 0 18px', borderRadius:14, border:`1px solid ${c.border}` }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14, color:c.text, fontFamily:'var(--app-font)' }}>
          <thead>
            <tr>
              {block.headers.map((h, i) => (
                <th key={i} style={{ background: dark ? `${palette.dkPrimary}1c` : palette.cardDk || `${palette.primary}22`, color: dark ? palette.dkPrimary : (palette.text), padding:'12px 16px', textAlign:'left', fontWeight:700, fontSize:13, letterSpacing:'0.02em' }}>
                  <InlineSpan parts={parseInline(h)} palette={palette} dark={dark} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i} style={{ borderTop:`1px solid ${c.border}` }}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding:'12px 16px', verticalAlign:'top', lineHeight:1.55 }}>
                    <InlineSpan parts={parseInline(cell)} palette={palette} dark={dark} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === 'code') {
    return (
      <pre style={{
        margin:'4px 0 18px',
        padding:'16px 18px',
        background: dark ? `${palette.dkSurf}` : '#1f1a14',
        color: '#e8d8c4',
        borderRadius:12,
        fontFamily:"'JetBrains Mono', ui-monospace, monospace",
        fontSize:13.5,
        lineHeight:1.6,
        overflowX:'auto',
        whiteSpace:'pre',
      }}>{block.text}</pre>
    );
  }
  return null;
};

/* ───────── Helpers ───────── */

const readingTime = (text) => {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};

/* Format de date FR : "27 avril 2026" */
const formatDateFr = (d = new Date()) => {
  const months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

/* ───────── Écran principal ───────── */

const ResumeScreen = ({ dark, pal, onNav, examStats }) => {
  const c = mkC(pal, dark);
  const [activeId, setActiveId] = useState('t1');
  const [search, setSearch] = useState('');

  if (typeof M106_CONTENT === 'undefined') {
    return <div style={{ padding:28, color:c.text }}>Contenu non chargé.</div>;
  }

  const themes = M106_CONTENT.themes;
  const active = themes.find(t => t.id === activeId) || themes[0];
  const blocks = parseBlocks(active.summary);
  const minutes = readingTime(active.summary);

  /* Filtre sidebar */
  const q = search.trim().toLowerCase();
  const filtered = q
    ? themes.filter(t => (t.title + ' ' + t.subtitle + ' ' + t.summary).toLowerCase().includes(q))
    : themes;

  /* Stats */
  const statFor = (id) => {
    const s = examStats?.M106?.[id];
    if (!s || !s.attempts) return null;
    const rate = Math.round(((s.attempts - s.missed) / s.attempts) * 100);
    return { rate, attempts: s.attempts };
  };

  const goPrev = () => {
    const idx = themes.findIndex(t => t.id === activeId);
    if (idx > 0) { Sound.click(); setActiveId(themes[idx-1].id); }
  };
  const goNext = () => {
    const idx = themes.findIndex(t => t.id === activeId);
    if (idx < themes.length - 1) { Sound.click(); setActiveId(themes[idx+1].id); }
  };

  return (
    <div className="resume-root" style={{ background:c.bg, minHeight:'calc(100vh - 65px)', position:'relative' }}>
      <style>{`
        .resume-root code::selection, .resume-root strong::selection { background: ${pal.primary}55; }
        @media (max-width: 900px) {
          .resume-grid { grid-template-columns: 1fr !important; }
          .resume-side { position: static !important; max-height: none !important; }
        }
      `}</style>

      {/* Breadcrumb top */}
      <div style={{ padding:'22px 28px 0', maxWidth:1280, margin:'0 auto' }}>
        <button onClick={() => { Sound.click(); onNav('fiches'); }}
          style={{ background:'transparent', border:'none', cursor:'pointer', padding:0, fontFamily:'var(--app-font)', display:'flex', alignItems:'center', gap:10, color: dark ? pal.dkPrimary : pal.second, fontSize:12, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' }}>
          <Ic n="chevL" s={14} c={dark ? pal.dkPrimary : pal.second} />
          M106 · Maintenance BDD
        </button>
      </div>

      <div className="resume-grid" style={{
        display:'grid',
        gridTemplateColumns:'320px 1fr',
        gap:28,
        padding:'22px 28px 60px',
        maxWidth:1280,
        margin:'0 auto',
        alignItems:'start',
      }}>
        {/* ─── Sidebar ─── */}
        <aside className="resume-side" style={{ position:'sticky', top:88, maxHeight:'calc(100vh - 110px)', overflowY:'auto', display:'flex', flexDirection:'column', gap:10 }}>
          {/* Search */}
          <div style={{ position:'relative', marginBottom:6 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              style={{
                width:'100%',
                padding:'12px 14px 12px 40px',
                borderRadius:14,
                border:`1.5px solid ${c.border}`,
                background: dark ? `${pal.dkSurf}` : 'white',
                color:c.text,
                fontSize:14,
                fontFamily:'var(--app-font)',
                outline:'none',
              }}
            />
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', opacity:0.5, color:c.text, fontSize:14 }}>⌕</span>
          </div>

          {/* Theme cards */}
          {filtered.map(t => {
            const isActive = t.id === activeId;
            const m = readingTime(t.summary);
            const s = statFor(t.id);
            return (
              <button key={t.id}
                onClick={() => { Sound.click(); setActiveId(t.id); }}
                style={{
                  textAlign:'left',
                  background: isActive ? (dark ? `${pal.dkPrimary}14` : 'white') : (dark ? `${pal.dkSurf}80` : `${pal.surf}55`),
                  border: `2px solid ${isActive ? pal.primary : 'transparent'}`,
                  borderRadius:16,
                  padding:'14px 16px',
                  cursor:'pointer',
                  fontFamily:'var(--app-font)',
                  transition:'all 0.18s ease',
                  display:'flex',
                  flexDirection:'column',
                  gap:6,
                }}>
                <div style={{ fontSize:15, fontWeight:700, color:c.text, lineHeight:1.3 }}>{t.title}</div>
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:c.icon }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background: pal.primary, display:'inline-block' }}></span>
                  <span>Maintenance BDD</span>
                  <span style={{ opacity:0.5 }}>·</span>
                  <span>{m} min</span>
                  {s && (
                    <span style={{ marginLeft:'auto', background: s.rate < 50 ? `${pal.second}22` : `${pal.primary}22`, color: s.rate < 50 ? pal.second : pal.primary, padding:'2px 7px', borderRadius:6, fontWeight:700, fontSize:11 }}>
                      {s.rate}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Pièges */}
          <div style={{ marginTop:14, padding:'14px 16px', background: dark ? `${pal.dkPrimary}10` : `${pal.primary}12`, borderRadius:14 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', color: dark ? pal.dkPrimary : pal.second, textTransform:'uppercase', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
              <span>🎯</span> 10 pièges
            </div>
            <ol style={{ margin:0, paddingLeft:18 }}>
              {M106_CONTENT.pieges.map((p, i) => (
                <li key={i} style={{ fontSize:12, lineHeight:1.5, color:c.text, marginBottom:5, opacity:0.88 }}>{p}</li>
              ))}
            </ol>
          </div>
        </aside>

        {/* ─── Main article ─── */}
        <article style={{ background: dark ? `${pal.dkSurf}b3` : 'white', borderRadius:22, padding:'30px 36px 40px', minHeight:600, boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)' }}>
          {/* Top bar : badge + nav */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'inline-flex', padding:'7px 14px', borderRadius:10, background:c.cardDk, color:c.cardDkTxt, fontSize:12, fontWeight:700, letterSpacing:'0.05em' }}>
              M106
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <button onClick={() => { Sound.click(); onNav('exam'); }}
                style={{ padding:'8px 14px', borderRadius:10, background:`${pal.primary}1c`, border:`1.5px solid ${pal.primary}`, color: dark ? pal.dkPrimary : pal.second, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'var(--app-font)' }}>
                Mode quiz →
              </button>
              <button onClick={goPrev} title="Précédent"
                style={{ width:36, height:36, borderRadius:10, background:'transparent', border:`1.5px solid ${c.border}`, color:c.text, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Ic n="chevL" s={15} c={c.text} />
              </button>
              <button onClick={goNext} title="Suivant"
                style={{ width:36, height:36, borderRadius:10, background:'transparent', border:`1.5px solid ${c.border}`, color:c.text, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Ic n="chevR" s={15} c={c.text} />
              </button>
            </div>
          </div>

          {/* Title */}
          <h1 style={{ fontFamily:"'Lora', Georgia, serif", fontSize:40, fontWeight:700, color:c.text, lineHeight:1.1, margin:'0 0 10px', letterSpacing:'-0.01em' }}>
            {active.title}
          </h1>
          <div style={{ fontSize:13.5, color:c.icon, marginBottom:24, opacity:0.85 }}>
            Dernière révision · {formatDateFr()} · {minutes} min de lecture
          </div>

          {/* Body — rendu des blocs */}
          <div className="resume-article-body">
            {blocks.map((b, i) => <Block key={i} block={b} palette={pal} dark={dark} c={c} />)}
          </div>

          {/* Emplacement vidéo en bas d'article. Si active.video est défini (URL d'embed YouTube/Vimeo),
              on affiche l'iframe ; sinon on affiche un placeholder cliquable. */}
          <div style={{ marginTop:36, paddingTop:24, borderTop:`1px solid ${c.border}` }}>
            <div style={{ fontFamily:"'Lora', Georgia, serif", fontSize:22, fontWeight:700, color:c.text, marginBottom:14, display:'flex', alignItems:'center', gap:10 }}>
              <span>🎬</span> Vidéo
            </div>
            {active.video ? (
              /\.(mp4|webm|ogg|mov)(\?|$)/i.test(active.video) ? (
                <video
                  src={active.video}
                  controls
                  preload="metadata"
                  style={{ width:'100%', borderRadius:14, background:'black', display:'block' }}
                />
              ) : (
                <div style={{ position:'relative', paddingBottom:'56.25%', height:0, borderRadius:14, overflow:'hidden', background:'black' }}>
                  <iframe
                    src={active.video}
                    title={`Vidéo — ${active.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }}
                  />
                </div>
              )
            ) : (
              <div style={{
                position:'relative',
                paddingBottom:'56.25%',
                height:0,
                borderRadius:14,
                overflow:'hidden',
                background: dark ? `${pal.dkPrimary}14` : `${pal.primary}14`,
                border:`2px dashed ${dark ? pal.dkPrimary : pal.primary}55`,
              }}>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, padding:20, textAlign:'center' }}>
                  <div style={{ width:60, height:60, borderRadius:'50%', background: dark ? pal.dkPrimary : pal.primary, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>
                    ▶
                  </div>
                  <div style={{ fontSize:14, fontWeight:600, color:c.text }}>Vidéo à venir</div>
                  <div style={{ fontSize:12, color:c.icon, opacity:0.7, maxWidth:380 }}>
                    L'enregistrement vidéo de ce thème sera bientôt disponible ici.
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};
