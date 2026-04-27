/* Écran "Résumé" — réservé pour l'instant au module M106.
   Affiche les 4 résumés de thèmes (accordéon, texte tel quel),
   un bloc "Difficulté par thème" basé sur les stats d'examen,
   et la liste des 10 pièges les plus probables à l'examen. */

const ResumeScreen = ({ dark, pal, onNav, examStats }) => {
  const c = mkC(pal, dark);
  const [openId, setOpenId] = useState('t1'); // accordéon : un thème ouvert à la fois

  if (typeof M106_CONTENT === 'undefined') {
    return <div style={{ padding:28, color:c.text }}>Contenu non chargé.</div>;
  }

  /* Calcul des taux de réussite par thème pour le bloc "Difficulté" */
  const stats = M106_CONTENT.themes.map(t => {
    const s = examStats?.M106?.[t.id];
    const tot = s?.attempts || 0;
    const missed = s?.missed || 0;
    const rate = tot ? Math.round(((tot - missed) / tot) * 100) : null;
    return { id:t.id, num:t.num, title:t.title, emoji:t.emoji, attempts:tot, missed, rate };
  });

  /* Trie : thèmes les plus difficiles en premier (taux de réussite le plus bas).
     Les thèmes jamais essayés vont en fin. */
  const ranked = [...stats].sort((a, b) => {
    if (a.rate === null && b.rate === null) return a.num - b.num;
    if (a.rate === null) return 1;
    if (b.rate === null) return -1;
    return a.rate - b.rate;
  });

  const toggle = (id) => {
    Sound.click();
    setOpenId(o => o === id ? null : id);
  };

  return (
    <div className="scr slide-up" style={{ background:c.bg, minHeight:'calc(100vh - 65px)', padding:'28px', position:'relative', overflow:'hidden' }}>
      <Blob color={`${pal.primary}18`} style={{ width:300, height:300, top:-90, left:-80, filter:'blur(6px)' }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:820, margin:'0 auto' }}>
        {/* En-tête */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <button onClick={() => { Sound.click(); onNav('fiches'); }} title="Retour"
            style={{ width:40, height:40, borderRadius:12, background:c.surf, border:`1.5px solid ${c.border}`, color:c.text, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Ic n="chevL" s={18} c={c.text} />
          </button>
          <div>
            <h2 style={{ fontSize:26, fontWeight:800, color:c.text, lineHeight:1.1 }}>Résumé</h2>
            <div style={{ fontSize:13, color:c.icon, opacity:0.75, marginTop:3 }}>M106 — Maintenance BDD Oracle</div>
          </div>
        </div>

        {/* Bloc "Difficulté par thème" */}
        <Card bg={c.surf} style={{ padding:'18px 20px 14px', marginBottom:22 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', color:pal.primary, textTransform:'uppercase' }}>Où tu galères</div>
            <div style={{ fontSize:11, color:c.icon, opacity:0.6 }}>thèmes triés du plus difficile au plus maîtrisé</div>
          </div>
          {ranked.every(r => r.rate === null) ? (
            <div style={{ fontSize:13, color:c.icon, opacity:0.7, padding:'8px 0' }}>
              Pas encore de stats — fais quelques sessions de Préparation Exam pour voir tes points faibles ici.
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {ranked.map(r => (
                <div key={r.id} style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:18, width:26, textAlign:'center' }}>{r.emoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:c.text, marginBottom:4 }}>
                      <span style={{ fontWeight:600 }}>T{r.num} — {r.title}</span>
                      <span style={{ color: r.rate === null ? c.icon : (r.rate < 50 ? pal.second : pal.primary), fontWeight:700, opacity: r.rate === null ? 0.5 : 1 }}>
                        {r.rate === null ? '— jamais essayé' : `${r.rate}% · ${r.attempts}q`}
                      </span>
                    </div>
                    <div style={{ height:6, background:`${pal.primary}14`, borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:r.rate === null ? '0%' : `${r.rate}%`, background: r.rate !== null && r.rate < 50 ? pal.second : pal.primary, borderRadius:3, transition:'width 0.4s ease' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Accordéon des thèmes */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:22 }}>
          {M106_CONTENT.themes.map(t => {
            const open = openId === t.id;
            return (
              <Card key={t.id} bg={c.surf} style={{ padding:0, overflow:'hidden' }}>
                <button onClick={() => toggle(t.id)}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 18px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left', fontFamily:'var(--app-font)', color:c.text }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:pal.primary, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                    {t.emoji}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em', color:pal.primary, textTransform:'uppercase' }}>Thème {t.num}</div>
                    <div style={{ fontSize:15, fontWeight:700, color:c.text, lineHeight:1.25 }}>{t.title}</div>
                    <div style={{ fontSize:12, color:c.icon, opacity:0.7, marginTop:2 }}>{t.subtitle}</div>
                  </div>
                  <div style={{ transition:'transform 0.22s ease', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    <Ic n="chevR" s={16} c={c.icon} />
                  </div>
                </button>
                {open && (
                  <div className="slide-up" style={{ padding:'2px 22px 22px', borderTop:`1px solid ${c.border}` }}>
                    <div style={{
                      whiteSpace:'pre-wrap',
                      fontSize:14,
                      lineHeight:1.65,
                      color:c.text,
                      paddingTop:16,
                      fontFamily:'var(--app-font)',
                    }}>
                      {t.summary}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Bloc "10 pièges" */}
        <Card bg={c.cardDk} style={{ padding:'18px 22px 22px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <span style={{ fontSize:18 }}>🎯</span>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', color: pal.primary, textTransform:'uppercase' }}>Les 10 pièges les plus probables</div>
          </div>
          <ol style={{ margin:0, paddingLeft:22, color: c.cardDkTxt }}>
            {M106_CONTENT.pieges.map((p, i) => (
              <li key={i} style={{ fontSize:13, lineHeight:1.55, marginBottom:6, opacity:0.92 }}>{p}</li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
};
