/* Écran "Aujourd'hui" — vue d'ensemble : carte du jour, streak, prochain test, micro-session, taux de réussite */

const TodayScreen = ({ dark, pal, onNav, streak, nextTest, weekSuccess, onRecord }) => {
  const [flipped, setFlipped] = useState(false);
  const [cIdx, setCIdx]       = useState(0);
  const [focus, setFocus]     = useState(false);
  const c = mkC(pal, dark);
  const card = CARDS[cIdx % CARDS.length];

  const answer = r => {
    onRecord && onRecord({ mod: card.mod, cardIdx: cIdx % CARDS.length, result: r });
    setFlipped(false);
    setTimeout(() => setCIdx(p => p + 1), 260);
  };

  return (
    <div className="scr scr-fit slide-up" style={{ background:c.bg, height:'calc((100vh - 65px) / var(--zoom, 1))', padding:'28px', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <Blob color={`${pal.primary}30`} style={{ width:380, height:380, top:-100, right:-80, filter:'blur(4px)' }} />
      <Blob color={`${pal.surf}aa`}   style={{ width:260, height:260, bottom:20, left:-60, filter:'blur(6px)' }} />

      {/* Cerveau décoratif en haut à droite */}
      <svg width="50" height="64" style={{ position:'absolute', top:20, right:28, opacity:dark?0.15:0.28, pointerEvents:'none', animation:'floatY 5s ease-in-out infinite' }} viewBox="0 0 50 64">
        <path d="M25 4C37 4 46 15 46 29C46 43 37 56 25 62C13 56 4 43 4 29C4 15 13 4 25 4Z" fill="none" stroke={pal.primary} strokeWidth="1.5"/>
        <line x1="25" y1="4" x2="25" y2="62" stroke={pal.primary} strokeWidth="1" opacity="0.5"/>
        <path d="M25 21C18 26 14 34 17 41" fill="none" stroke={pal.primary} strokeWidth="1" opacity="0.4"/>
        <path d="M25 21C32 26 36 34 33 41" fill="none" stroke={pal.primary} strokeWidth="1" opacity="0.4"/>
      </svg>

      <div className="bento" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gridTemplateRows:'1fr 1fr 1fr', gap:16, flex:1, minHeight:0, width:'100%', margin:'0 auto', position:'relative', zIndex:1 }}>

        {/* Grande carte : flashcard interactive */}
        <Card bg={c.cardDk} style={{ gridColumn:'1/span 3', gridRow:'1/span 2', padding:32, display:'flex', flexDirection:'column', minHeight:0 }}>
          <Blob color={`${pal.primary}18`} style={{ width:260, height:260, bottom:-50, right:-40 }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, position:'relative', zIndex:1 }}>
            <div>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.14em', color:pal.primary, textTransform:'uppercase', marginBottom:5 }}>Révise ça maintenant</div>
              <span style={{ fontSize:12, background:`${pal.primary}25`, color:c.cardDkTxt, padding:'3px 10px', borderRadius:7, fontWeight:600, opacity:0.85 }}>{card.mod}</span>
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <span style={{ fontSize:12, color:c.cardDkTxt, opacity:0.4 }}>{(cIdx%CARDS.length)+1}/{CARDS.length}</span>
              <button onClick={() => { setFlipped(false); setCIdx(p=>p+1); }} style={{ width:38, height:38, borderRadius:'50%', background:`${pal.primary}25`, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <Ic n="refresh" s={16} c={pal.primary} />
              </button>
            </div>
          </div>

          <div className="flip-container" style={{ flex:1, minHeight:0, position:'relative', zIndex:1 }} onClick={() => setFlipped(f=>!f)}>
            <div className={`flip-face${flipped?' hidden':''}`} style={{ background:`${pal.primary}18`, borderRadius:16, padding:28, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <p style={{ fontSize:21, fontWeight:600, color:c.cardDkTxt, textAlign:'center', lineHeight:1.5, textWrap:'pretty' }}>{card.q}</p>
              <div style={{ marginTop:14, fontSize:11, color:c.cardDkTxt, opacity:0.35 }}>Cliquer pour retourner</div>
            </div>
            <div className={`flip-back${flipped?' visible':''}`} style={{ background:`${pal.primary}28`, borderRadius:16, padding:28, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <p style={{ fontSize:16, color:c.cardDkTxt, textAlign:'center', lineHeight:1.75, textWrap:'pretty' }}>{card.a}</p>
            </div>
          </div>

          <div style={{ display:'flex', gap:10, marginTop:18, position:'relative', zIndex:1, opacity:flipped?1:0.28, transition:'opacity 0.3s', pointerEvents:flipped?'auto':'none' }}>
            <button onClick={() => answer('hard')} style={{ flex:1, padding:'12px', background:'rgba(220,60,60,0.2)', border:'1.5px solid rgba(220,60,60,0.35)', borderRadius:14, color:'#ff8080', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>😅 Difficile</button>
            <button onClick={() => answer('ok')}   style={{ flex:1, padding:'12px', background:`${pal.primary}28`, border:`1.5px solid ${pal.primary}`, borderRadius:14, color:pal.primary, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>👍 OK</button>
            <button onClick={() => answer('easy')} style={{ flex:1, padding:'12px', background:pal.primary, border:'none', borderRadius:14, color:c.text, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>⚡ Facile</button>
          </div>
        </Card>

        {/* Streak */}
        <Card bg={pal.primary} style={{ gridColumn:'4', gridRow:'1', padding:24 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:c.text, opacity:0.6, marginBottom:10 }}>Streak</div>
          <div style={{ fontSize:58, fontWeight:900, color:c.text, lineHeight:1 }}>{streak}</div>
          <div style={{ fontSize:13, color:c.text, opacity:0.6, marginTop:5 }}>{streak > 1 ? 'jours de suite' : streak === 1 ? 'jour' : 'commence aujourd\u2019hui'}</div>
          <div style={{ position:'absolute', bottom:18, right:20 }}><Ic n="flame" s={28} c={c.text} /></div>
        </Card>

        {/* Prochain test (depuis la BDD utilisateur) */}
        <Card bg={c.surf} style={{ gridColumn:'4', gridRow:'2', padding:24, border:`1.5px solid ${c.border}` }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:c.icon, marginBottom:10 }}>Prochain test</div>
          {nextTest ? (() => {
            const dj = daysUntil(nextTest.date);
            return (<>
              <div style={{ fontSize:42, fontWeight:900, color:c.text, lineHeight:1 }}>{dj <= 0 ? "Auj." : `${dj}j`}</div>
              <div style={{ fontSize:13, color:c.icon, opacity:0.85, marginTop:6 }}>{modLabel(nextTest.mod)}</div>
            </>);
          })() : (<>
            <div style={{ fontSize:30, fontWeight:900, color:c.text, lineHeight:1, marginTop:4 }}>—</div>
            <div style={{ fontSize:13, color:c.icon, opacity:0.85, marginTop:6 }}>Aucun test prévu</div>
          </>)}
          <div style={{ position:'absolute', bottom:18, right:20 }}><Ic n="clock" s={22} c={c.icon} /></div>
        </Card>

        {/* Micro-session : raccourci vers Réviser */}
        <Card bg={c.surf} style={{ gridColumn:'1/span 2', gridRow:'3', padding:24, display:'flex', alignItems:'center', gap:20, border:`1.5px solid ${c.border}` }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:c.icon, marginBottom:8 }}>Micro-session</div>
            <div style={{ fontSize:30, fontWeight:800, color:c.text, lineHeight:1 }}>5 minutes</div>
            <div style={{ fontSize:13, color:c.icon, opacity:0.8, marginTop:6 }}>Juste 5 cartes — tu peux le faire.</div>
          </div>
          <button onClick={() => onNav('reviser')} style={{ width:54, height:54, borderRadius:'50%', background:c.cardDk, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
            <Ic n="bolt" s={22} c={pal.primary} />
          </button>
        </Card>

        {/* Taux de réussite hebdo */}
        <Card bg={c.cardDk} style={{ gridColumn:'3/span 2', gridRow:'3', padding:24 }}>
          <Blob color={`${pal.primary}12`} style={{ width:180, height:180, bottom:-40, right:-30 }} />
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:c.cardDkTxt, opacity:0.55, marginBottom:10, position:'relative', zIndex:1 }}>Cette semaine</div>
          <div style={{ fontSize:52, fontWeight:900, color:c.cardDkTxt, lineHeight:1, position:'relative', zIndex:1 }}>{weekSuccess == null ? '—' : `${weekSuccess}%`}</div>
          <div style={{ fontSize:13, color:c.cardDkTxt, opacity:0.6, marginTop:5, position:'relative', zIndex:1 }}>{weekSuccess == null ? 'aucune révision cette semaine' : 'taux de réussite'}</div>
          <div style={{ marginTop:14, height:6, background:`${pal.primary}25`, borderRadius:3, position:'relative', zIndex:1 }}>
            <div style={{ height:'100%', width:`${weekSuccess||0}%`, background:pal.primary, borderRadius:3, transition:'width 0.8s ease' }} />
          </div>
        </Card>
      </div>

      {/* Bouton Mode Focus */}
      <div style={{ margin:'16px auto 0', position:'relative', zIndex:1 }}>
        <button onClick={() => setFocus(f=>!f)} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 20px', background:focus?pal.primary:`${pal.primary}10`, border:`1.5px solid ${focus?pal.primary:c.border}`, borderRadius:14, cursor:'pointer', fontSize:14, fontWeight:500, color:focus?c.text:c.icon, fontFamily:'Inter,sans-serif', transition:'all 0.25s' }}>
          <Ic n="focus" s={17} c={focus?c.text:c.icon} />
          {focus ? '✓ Mode Focus activé — bonne concentration !' : 'Activer le Mode Focus'}
        </button>
      </div>
    </div>
  );
};
