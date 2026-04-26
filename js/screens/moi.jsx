/* Écran "Moi" — profil éditable, statistiques, réglages, sélecteur de palette */

const MoiScreen = ({ dark, pal, palIdx, setPalIdx, fontIdx, setFontIdx, onDarkToggle, textScale, setTextScale, stats, userName, userSub, onUserName, onUserSub }) => {
  const c = mkC(pal, dark);
  const [subTab, setSubTab] = useState('profil');
  const [sound, setSound] = useState(true);
  const [body, setBody] = useState(false);

  const weekTime = stats.weekTime;
  const monthSuccess = stats.monthSuccess;
  const STATS = [
    { l:'Streak',        v: stats.streak,                                              u: stats.streak > 1 ? 'jours' : 'jour',    bg:pal.primary, txt:c.text },
    { l:'Maîtrisées',    v: stats.mastered,                                            u:'cartes',                                 bg:c.cardDk,    txt:c.cardDkTxt },
    { l:'Cette semaine', v: weekTime || '—',                                           u: weekTime ? 'de révision' : 'pas encore',  bg:c.surf,     txt:c.text, border:true },
    { l:'Réussite',      v: monthSuccess == null ? '—' : `${monthSuccess}%`,           u: monthSuccess == null ? 'pas encore' : 'ce mois', bg:c.surf, txt:c.text, border:true },
  ];
  const WEEK = stats.weekActivity;
  const maxW = Math.max(1, ...WEEK);
  const DW = ['L','M','M','J','V','S','D'];
  const todayIdx = (() => { const w = new Date().getDay(); return w===0 ? 6 : w-1; })();
  const MATS = stats.modProgress;

  return (
    <div className="scr slide-up" style={{ background:c.bg, minHeight:'calc(100vh - 65px)', padding:'28px', position:'relative', overflow:'hidden' }}>
      <Blob color={`${pal.primary}18`} style={{ width:320, height:320, top:-70, right:-60, filter:'blur(6px)' }} />
      <div style={{ margin:'0 auto', position:'relative', zIndex:1 }}>

        <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24 }}>
          <div style={{ width:66, height:66, borderRadius:20, background:c.cardDk, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>{pal.emoji}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:26, fontWeight:800, color:c.text }}>
              <EditableText value={userName} onChange={onUserName} placeholder="Ton prénom" style={{ fontSize:26, fontWeight:800, color:c.text }} />
            </div>
            <div style={{ fontSize:14, color:c.icon, opacity:0.8, marginTop:2 }}>
              <EditableText value={userSub} onChange={onUserSub} placeholder="Formation, promo…" style={{ fontSize:14, color:c.icon }} />
            </div>
          </div>
          {stats.streak > 0 && (
            <div style={{ fontSize:36, fontWeight:900, color:pal.primary }}>🔥{stats.streak}</div>
          )}
        </div>

        <div style={{ display:'flex', background:`${pal.primary}15`, borderRadius:14, padding:4, gap:2, marginBottom:24, width:'fit-content' }}>
          {[['profil','Profil'],['palette','Palette'],['visuel','Visuel']].map(([id,label]) => (
            <button key={id} onClick={()=>setSubTab(id)} style={{ padding:'9px 22px', borderRadius:11, border:'none', background:subTab===id?pal.primary:'transparent', color:subTab===id?c.text:c.icon, fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'var(--app-font)', transition:'all 0.2s', display:'flex', alignItems:'center', gap:7 }}>
              {id==='palette' && <Ic n="palette" s={15} c={subTab===id?c.text:c.icon} />}
              {id==='visuel'  && <span style={{ fontSize:13, fontWeight:800, lineHeight:1, letterSpacing:'-0.02em' }}>Aa</span>}
              {label}
            </button>
          ))}
        </div>

        {subTab === 'profil' && (
          <>
            <div className="fg4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
              {STATS.map(s => (
                <Card key={s.l} bg={s.bg} style={{ padding:22, border:s.border?`1.5px solid ${c.border}`:'none' }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.11em', textTransform:'uppercase', color:s.txt, opacity:0.6, marginBottom:8 }}>{s.l}</div>
                  <div style={{ fontSize:38, fontWeight:900, color:s.txt, lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:12, color:s.txt, opacity:0.6, marginTop:5 }}>{s.u}</div>
                </Card>
              ))}
            </div>

            <div className="fg2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
              <Card bg={c.cardDk} style={{ padding:26 }}>
                <Blob color={`${pal.primary}10`} style={{ width:200, height:200, bottom:-40, right:-30 }} />
                <div style={{ fontSize:12, fontWeight:700, color:c.cardDkTxt, opacity:0.6, marginBottom:18, position:'relative', zIndex:1 }}>Activité — cette semaine</div>
                <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:110, position:'relative', zIndex:1 }}>
                  {WEEK.map((v,i) => (
                    <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:7 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:pal.primary, opacity:i===todayIdx && v>0 ? 1 : 0 }}>{v}%</div>
                      <div style={{ width:'100%', height:`${(v/maxW)*90}%`, minHeight:v>0?8:2, background:i===todayIdx?pal.primary:`${pal.primary}38`, borderRadius:'6px 6px 0 0', transition:'height 0.6s ease', opacity:v>0?1:0.4 }} />
                      <div style={{ fontSize:11, color:c.cardDkTxt, opacity:i===todayIdx?1:0.5 }}>{DW[i]}</div>
                    </div>
                  ))}
                </div>
                {WEEK.every(v => v === 0) && (
                  <div style={{ position:'relative', zIndex:1, textAlign:'center', marginTop:10, fontSize:11, color:c.cardDkTxt, opacity:0.45 }}>
                    Aucune révision cette semaine.
                  </div>
                )}
              </Card>

              <Card bg={c.surf} style={{ padding:26, border:`1.5px solid ${c.border}` }}>
                <div style={{ fontSize:12, fontWeight:700, color:c.text, opacity:0.8, marginBottom:18 }}>Par matière</div>
                {MATS.length === 0 ? (
                  <div style={{ fontSize:13, color:c.icon, opacity:0.75, lineHeight:1.6 }}>
                    Commence à réviser pour voir ta progression par matière apparaître ici.
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    {MATS.map(m => (
                      <div key={m.id}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                          <span style={{ fontSize:12, fontWeight:600, color:c.text }}>{m.l}</span>
                          <span style={{ fontSize:12, fontWeight:700, color:c.primary }}>{m.p}%</span>
                        </div>
                        <SparkleBar pct={m.p} primary={c.primary} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <Card bg={`${pal.primary}08`} style={{ padding:24, border:`1.5px solid ${c.border}` }}>
              <div style={{ fontSize:14, fontWeight:700, color:c.text, marginBottom:16 }}>Réglages rapides</div>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {[
                  { l:'Dark mode',   d:'Interface sombre',               ic:'moon',  on:dark,  fn:onDarkToggle },
                  { l:'Sons',        d:'Effets sonores de révision',      ic:'sound', on:sound, fn:setSound },
                  { l:'Body double', d:'Mode co-révision silencieuse',    ic:'users', on:body,  fn:setBody },
                ].map(s => (
                  <div key={s.l} style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:38, height:38, borderRadius:11, background:`${pal.primary}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Ic n={s.ic} s={18} c={c.icon} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500, color:c.text }}>{s.l}</div>
                      <div style={{ fontSize:12, color:c.icon, opacity:0.7 }}>{s.d}</div>
                    </div>
                    <Toggle on={s.on} onChange={s.fn} color={pal.primary} />
                  </div>
                ))}

                {/* Taille du texte — multiplicateur appliqué par-dessus l'auto-scale */}
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:38, height:38, borderRadius:11, background:`${pal.primary}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:15, fontWeight:800, color:c.icon, lineHeight:1 }}>A</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, color:c.text }}>Taille du texte</div>
                    <div style={{ fontSize:12, color:c.icon, opacity:0.7 }}>S'ajoute à l'ajustement automatique</div>
                  </div>
                  <div style={{ display:'flex', gap:3, background:`${pal.primary}12`, borderRadius:11, padding:3 }}>
                    {[
                      { v:0.85, l:'A', s:11 },
                      { v:1.00, l:'A', s:13 },
                      { v:1.15, l:'A', s:16 },
                      { v:1.30, l:'A', s:19 },
                    ].map(opt => {
                      const active = Math.abs((textScale||1) - opt.v) < 0.01;
                      return (
                        <button key={opt.v} onClick={()=>setTextScale(opt.v)}
                          style={{ minWidth:34, padding:'4px 8px', borderRadius:9, border:'none',
                            background: active ? pal.primary : 'transparent',
                            color: active ? c.text : c.icon,
                            fontSize:opt.s, fontWeight:800, cursor:'pointer', fontFamily:'var(--app-font)',
                            transition:'all 0.18s', lineHeight:1 }}>
                          {opt.l}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {subTab === 'visuel' && (
          <div>
            <p style={{ fontSize:14, color:c.icon, marginBottom:20, lineHeight:1.6 }}>Choisis la typographie qui te convient. Elle s'applique à toute l'interface — y compris pendant les révisions.</p>

            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.11em', textTransform:'uppercase', color:c.icon, opacity:0.6, marginBottom:12 }}>Police</div>

            <div className="fg2" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
              {FONTS.map((f, i) => {
                const isActive = fontIdx === i;
                return (
                  <div
                    key={f.id}
                    onClick={() => setFontIdx(i)}
                    style={{ background:c.surf, borderRadius:18, padding:'18px 20px', cursor:'pointer', border:`2px solid ${isActive?pal.primary:'transparent'}`, transition:'all 0.2s', position:'relative' }}
                  >
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:c.text, fontFamily:f.stack }}>{f.name}</div>
                      <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:c.icon, opacity:0.7, padding:'3px 8px', borderRadius:6, background:`${pal.primary}15` }}>{f.kind}</div>
                    </div>
                    <div style={{ fontSize:22, fontWeight:600, color:c.text, fontFamily:f.stack, marginBottom:8, lineHeight:1.1, letterSpacing:f.kind==='Mono' ? 0 : '-0.01em' }}>
                      {f.sample}
                    </div>
                    <div style={{ fontSize:12, color:c.icon, opacity:0.75, fontFamily:f.stack }}>{f.desc}</div>
                    {isActive && (
                      <div style={{ position:'absolute', top:12, right:12, width:20, height:20, borderRadius:'50%', background:pal.primary, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Ic n="check" s={11} c={c.text} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {subTab === 'palette' && (
          <div>
            <p style={{ fontSize:14, color:c.icon, marginBottom:20, lineHeight:1.6 }}>Choisis le thème de couleurs qui correspond à ton humeur du jour. La palette s'applique à toute l'application.</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              {PALETTES.map((p, i) => {
                const isActive = palIdx === i;
                return (
                  <div
                    key={p.id}
                    onClick={() => setPalIdx(i)}
                    style={{ background:p.bg, borderRadius:18, padding:'16px', cursor:'pointer', border:`2px solid ${isActive?p.primary:'transparent'}`, transition:'all 0.2s', position:'relative', overflow:'hidden' }}
                  >
                    <div style={{ display:'flex', gap:5, marginBottom:12 }}>
                      <div style={{ width:22, height:22, borderRadius:'50%', background:p.text, flexShrink:0 }} />
                      <div style={{ width:22, height:22, borderRadius:'50%', background:p.primary, flexShrink:0 }} />
                      <div style={{ width:22, height:22, borderRadius:'50%', background:p.surf, border:`1.5px solid ${p.text}20`, flexShrink:0 }} />
                    </div>
                    <div style={{ fontSize:13, fontWeight:700, color:p.text, marginBottom:3 }}>{p.emoji} {p.name}</div>
                    <div style={{ fontSize:11, color:p.second, opacity:0.8 }}>{p.desc}</div>
                    {isActive && (
                      <div style={{ position:'absolute', top:10, right:10, width:20, height:20, borderRadius:'50%', background:p.primary, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Ic n="check" s={11} c={p.text} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
