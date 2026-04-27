/* Écran "Fiches" — grille de modules avec recherche.
   Clic sur une fiche → modale qui propose 3 modes : Flashcards, Préparation Exam, Résumé. */

const STUDY_MODES = [
  { id:'flash',   label:'Flashcards',         desc:"Cartes recto-verso pour mémoriser",                      icon:'reviser', ready:true },
  { id:'exam',    label:"Préparation Exam",   desc:"QCM chronométré façon partiel",                          icon:'planning', ready:false },
  { id:'summary', label:'Résumé',             desc:"Synthèse rapide des points clés du module",              icon:'fiches',   ready:false },
];

const FichesScreen = ({ dark, pal, onNav }) => {
  const [q, setQ] = useState('');
  const [chosen, setChosen] = useState(null); // module sélectionné — null = pas de modale
  const c = mkC(pal, dark);
  const mods = MODULES.filter(m =>
    m.label.toLowerCase().includes(q.toLowerCase()) ||
    m.id.toLowerCase().includes(q.toLowerCase())
  );

  const closeModal = () => { Sound.modalClose(); setChosen(null); };

  /* Esc ferme la modale */
  useEffect(() => {
    if (!chosen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chosen]);

  const pickMode = (m) => {
    if (!m.ready) { Sound.answerHard(); return; }
    Sound.click();
    setChosen(null);
    if (m.id === 'flash') onNav('reviser');
  };

  return (
    <div className="scr slide-up" style={{ background:c.bg, minHeight:'calc(100vh - 65px)', padding:'28px', position:'relative', overflow:'hidden' }}>
      <Blob color={`${pal.primary}18`} style={{ width:300, height:300, top:-80, left:-70, filter:'blur(6px)' }} />
      <div style={{ margin:'0 auto', position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:26 }}>
          <h2 style={{ fontSize:28, fontWeight:800, color:c.text }}>Mes fiches</h2>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher…"
            style={{ padding:'9px 16px', borderRadius:12, border:`1.5px solid ${c.border}`, background:dark?`${pal.primary}0a`:'white', color:c.text, fontSize:14, fontFamily:'var(--app-font)', outline:'none', width:230 }} />
        </div>
        <div className="fg3" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:16 }}>
          {mods.map(mod => {
            const mc = modCol(mod.ck, c);
            const overlay = (mod.ck==='dk' || mod.ck==='sc') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)';
            return (
              <Card key={mod.id} bg={mc.bg} style={{ padding:24, minHeight:196 }} onClick={() => { Sound.modalOpen(); setChosen(mod); }}>
                <Blob color={overlay} style={{ width:170, height:170, bottom:-40, right:-30 }} />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, position:'relative', zIndex:1 }}>
                  <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', color:mc.txt, background:overlay, padding:'4px 9px', borderRadius:7 }}>{mod.id}</span>
                  <div style={{ width:34, height:34, borderRadius:'50%', background:overlay, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Ic n="chevR" s={15} c={mc.txt} />
                  </div>
                </div>
                <div style={{ fontSize:17, fontWeight:700, color:mc.txt, marginBottom:12, lineHeight:1.3, position:'relative', zIndex:1 }}>{mod.label}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, position:'relative', zIndex:1 }}>
                  {mod.topics.slice(0,3).map(t => (
                    <span key={t} style={{ fontSize:11, color:mc.txt, opacity:0.7, background:overlay, padding:'3px 9px', borderRadius:7 }}>{t}</span>
                  ))}
                  {mod.topics.length > 3 && <span style={{ fontSize:11, color:mc.txt, opacity:0.45 }}>+{mod.topics.length-3}</span>}
                </div>
                <div style={{ marginTop:14, fontSize:34, fontWeight:900, color:mc.txt, opacity:0.18, lineHeight:1, position:'relative', zIndex:1 }}>{mod.cards}</div>
                <div style={{ fontSize:10, color:mc.txt, opacity:0.4, marginTop:-2, position:'relative', zIndex:1 }}>cartes</div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modale "comment veux-tu réviser ?" */}
      {chosen && (
        <div
          onClick={closeModal}
          style={{
            position:'fixed', inset:0, zIndex:300,
            background: dark
              ? `radial-gradient(circle at 50% 40%, ${pal.dkSecond}f0 0%, ${pal.dkBg}fa 70%)`
              : `radial-gradient(circle at 50% 40%, ${pal.primary}e8 0%, ${pal.second}f5 70%)`,
            backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:24, animation:'fadeIn 0.18s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="slide-up"
            style={{
              background:c.bg, color:c.text,
              borderRadius:24, padding:'30px 30px 26px',
              width:'min(560px, 94vw)',
              maxHeight:'88vh', overflowY:'auto',
              boxShadow:'0 16px 48px rgba(0,0,0,0.28)',
              border:`1.5px solid ${c.border}`,
              position:'relative',
            }}
          >
            <button
              onClick={closeModal}
              title="Fermer" aria-label="Fermer"
              style={{
                position:'absolute', top:14, right:14,
                width:34, height:34, borderRadius:10,
                background:'transparent', border:`1.5px solid ${c.border}`,
                color:c.icon, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--app-font)',
              }}
            >
              <Ic n="close" s={14} c={c.icon} />
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:pal.primary, background:`${pal.primary}1f`, padding:'4px 10px', borderRadius:8 }}>{chosen.id}</span>
              <h2 style={{ fontSize:20, fontWeight:800, color:c.text, margin:0, lineHeight:1.25 }}>{chosen.label}</h2>
            </div>
            <p style={{ fontSize:13, color:c.icon, opacity:0.8, lineHeight:1.5, margin:'8px 0 20px' }}>
              Comment veux-tu travailler ce module ?
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {STUDY_MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => pickMode(m)}
                  disabled={!m.ready}
                  style={{
                    display:'flex', alignItems:'center', gap:14,
                    padding:'14px 16px', borderRadius:14,
                    background: m.ready ? c.surf : `${c.surf}88`,
                    border:`1.5px solid ${m.ready ? c.border : c.border}`,
                    color:c.text, cursor: m.ready ? 'pointer' : 'not-allowed',
                    textAlign:'left', fontFamily:'var(--app-font)',
                    opacity: m.ready ? 1 : 0.55,
                    transition:'transform 0.15s ease, background 0.15s ease',
                  }}
                  onMouseEnter={e => { if (m.ready) e.currentTarget.style.background = `${pal.primary}14`; }}
                  onMouseLeave={e => { if (m.ready) e.currentTarget.style.background = c.surf; }}
                >
                  <div style={{ width:42, height:42, borderRadius:12, background:pal.primary, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Ic n={m.icon} s={20} c={c.text} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                      <span style={{ fontSize:15, fontWeight:700, color:c.text }}>{m.label}</span>
                      {!m.ready && (
                        <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:c.icon, background:c.cardDk, opacity:0.85, padding:'2px 8px', borderRadius:6 }}>
                          Bientôt
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize:12, color:c.icon, opacity:0.75, lineHeight:1.4 }}>{m.desc}</div>
                  </div>
                  {m.ready && <Ic n="chevR" s={16} c={c.icon} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
