/* Écran "Réviser" — session immersive plein écran, raccourcis clavier, écran de fin animé */

const ReviserScreen = ({ dark, pal, onRecord }) => {
  const [idx, setIdx]                   = useState(0);
  const [flipped, setFlipped]           = useState(false);
  const [results, setResults]           = useState([]);
  const [secs, setSecs]                 = useState(0);
  const [focusMode, setFocusMode]       = useState(false);
  const [showEnd, setShowEnd]           = useState(false);
  const [scoreVisible, setScoreVisible] = useState(false);
  const flippedRef = useRef(false);
  const answerRef  = useRef(null);   // évite la closure stale dans le handler keydown
  const c = mkC(pal, dark);
  const card = CARDS[idx % CARDS.length];

  useEffect(() => { flippedRef.current = flipped; }, [flipped]);

  /* Chronomètre de session */
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const answer = r => {
    const cur = CARDS[idx % CARDS.length];
    onRecord && onRecord({ mod: cur.mod, cardIdx: idx % CARDS.length, result: r });
    setResults(p => [...p, r]);
    setFlipped(false);
    setTimeout(() => setIdx(p => p + 1), 300);
  };
  answerRef.current = answer;

  /* Raccourcis clavier : Espace = retourner, 1/2/3 = difficulté */
  useEffect(() => {
    const handler = e => {
      if (e.code === 'Space') { e.preventDefault(); setFlipped(f => !f); }
      if (e.key === '1' && flippedRef.current) answerRef.current('hard');
      if (e.key === '2' && flippedRef.current) answerRef.current('ok');
      if (e.key === '3' && flippedRef.current) answerRef.current('easy');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* Déclenche l'écran de fin une fois toutes les cartes vues */
  useEffect(() => {
    if (results.length > 0 && results.length === CARDS.length) {
      setTimeout(() => { setShowEnd(true); setTimeout(() => setScoreVisible(true), 900); }, 300);
    }
  }, [results.length]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const isVictory = results.filter(r => r !== 'hard').length >= CARDS.length * 0.5;
  const score     = results.length ? Math.round(results.filter(r => r !== 'hard').length / results.length * 100) : 0;
  const waveColor = isVictory ? c.victory : c.defeat;

  return (
    <div className="scr slide-up" style={{ background:c.bg, minHeight:'calc(100vh - 65px)', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      <Blob color={`${pal.primary}30`} style={{ width:500, height:500, top:'50%', left:'50%', transform:'translate(-50%,-50%)', filter:'blur(50px)', pointerEvents:'none' }} />

      {/* Barre de progression */}
      <div style={{ height:4, background:`${pal.primary}20` }}>
        <div style={{ height:'100%', width:`${(results.length/CARDS.length)*100}%`, background:pal.primary, borderRadius:2, transition:'width 0.5s ease' }} />
      </div>

      {/* Top bar — module, compteur, chrono, focus */}
      {!focusMode && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 28px', position:'relative', zIndex:2 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ background:pal.primary, color:c.text, fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:8 }}>{card.mod}</span>
            <span style={{ fontSize:13, color:c.icon, opacity:0.8 }}>{(idx%CARDS.length)+1} / {CARDS.length}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ fontSize:14, fontWeight:600, color:c.icon, display:'flex', alignItems:'center', gap:6 }}>
              <Ic n="clock" s={15} c={c.icon} />{fmt(secs)}
            </div>
            <button onClick={()=>setFocusMode(true)} style={{ padding:'7px 14px', borderRadius:10, background:'transparent', border:`1.5px solid ${c.border}`, color:c.icon, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'var(--app-font)', display:'flex', alignItems:'center', gap:6 }}>
              <Ic n="focus" s={13} c={c.icon} />Focus
            </button>
          </div>
        </div>
      )}
      {focusMode && (
        <div style={{ display:'flex', justifyContent:'flex-end', padding:'14px 28px', position:'relative', zIndex:2 }}>
          <button onClick={()=>setFocusMode(false)} style={{ padding:'7px 14px', borderRadius:10, background:pal.primary, border:'none', color:c.text, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--app-font)', display:'flex', alignItems:'center', gap:6 }}>
            <Ic n="close" s={13} c={c.text} />Quitter Focus
          </button>
        </div>
      )}

      {/* Zone centrale : carte + boutons + raccourcis */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px 28px', position:'relative', zIndex:2 }}>
        <div className="flip-container" style={{ width:'100%', maxWidth:'min(100%, 1100px)', height:300 }} onClick={()=>setFlipped(f=>!f)}>
          <div className={`flip-face${flipped?' hidden':''}`} style={{ background:dark?c.cardDk:'white', borderRadius:22, padding:40, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:`1.5px solid ${c.border}`, cursor:'pointer' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:pal.primary, marginBottom:22 }}>Question</div>
            <p style={{ fontSize:23, fontWeight:600, color:dark?c.cardDkTxt:c.text, textAlign:'center', lineHeight:1.55, textWrap:'pretty' }}>{card.q}</p>
            <div style={{ marginTop:22, fontSize:11, color:c.icon, opacity:0.4 }}>Cliquer pour voir la réponse</div>
          </div>
          <div className={`flip-back${flipped?' visible':''}`} style={{ background:c.cardDk, borderRadius:22, padding:40, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:pal.primary, marginBottom:22 }}>Réponse</div>
            <p style={{ fontSize:17, color:c.cardDkTxt, textAlign:'center', lineHeight:1.75, textWrap:'pretty' }}>{card.a}</p>
          </div>
        </div>

        <div style={{ display:'flex', gap:12, marginTop:20, width:'100%', maxWidth:'min(100%, 1100px)', opacity:flipped?1:0.25, transition:'opacity 0.3s', pointerEvents:flipped?'auto':'none' }}>
          <button onClick={()=>answer('hard')} style={{ flex:1, padding:'15px', background:'rgba(220,60,60,0.1)', border:'1.5px solid rgba(220,60,60,0.3)', borderRadius:16, color:'#e06060', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'var(--app-font)' }}>Difficile</button>
          <button onClick={()=>answer('ok')}   style={{ flex:1, padding:'15px', background:`${pal.primary}18`, border:`1.5px solid ${pal.primary}`, borderRadius:16, color:dark?pal.primary:c.second, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'var(--app-font)' }}>OK</button>
          <button onClick={()=>answer('easy')} style={{ flex:1, padding:'15px', background:pal.primary, border:'none', borderRadius:16, color:c.text, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'var(--app-font)' }}>Facile ⚡</button>
        </div>

        {results.length > 0 && !showEnd && (
          <div style={{ marginTop:16, display:'flex', gap:20, fontSize:14 }}>
            <span style={{ color:'#e06060', fontWeight:600 }}>😅 {results.filter(r=>r==='hard').length}</span>
            <span style={{ color:c.primary, fontWeight:600 }}>👍 {results.filter(r=>r==='ok').length}</span>
            <span style={{ color:c.primary, fontWeight:600 }}>⚡ {results.filter(r=>r==='easy').length}</span>
          </div>
        )}

        {!showEnd && (
          <div style={{ marginTop:18, display:'flex', gap:12, opacity:0.38 }}>
            {[['Espace','Retourner'],['1','Difficile'],['2','OK'],['3','Facile']].map(([k,l]) => (
              <div key={k} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:c.text }}>
                <span style={{ background:c.cardDk, color:c.cardDkTxt, padding:'2px 8px', borderRadius:6, fontWeight:600, fontFamily:'monospace' }}>{k}</span>
                {l}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Écran de fin — vague de couleur + score animé */}
      {showEnd && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents: scoreVisible ? 'auto' : 'none' }}>
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            width:'200vw', height:'200vw', borderRadius:'50%',
            background: waveColor,
            animation: 'waveExpand 1.5s ease-out forwards',
          }} />
          {scoreVisible && (
            <div style={{ position:'relative', zIndex:1, textAlign:'center', animation:'scoreIn 0.5s cubic-bezier(0.2,1.3,0.4,1) forwards' }}>
              <div style={{ fontSize:110, fontWeight:700, color:c.text, lineHeight:1 }}>{score}%</div>
              <div style={{ fontSize:20, fontWeight:600, color:c.text, opacity:0.75, marginTop:8 }}>
                {isVictory ? 'Bien joué ! 🎉' : 'Continue — tu progresseras !'}
              </div>
              <div style={{ marginTop:6, fontSize:14, color:c.text, opacity:0.55 }}>
                {results.filter(r=>r==='easy').length} facile · {results.filter(r=>r==='ok').length} OK · {results.filter(r=>r==='hard').length} difficile
              </div>
              <button
                onClick={() => { setShowEnd(false); setScoreVisible(false); setResults([]); setIdx(0); setFlipped(false); setSecs(0); }}
                style={{ marginTop:28, padding:'14px 32px', background:c.cardDk, border:'none', borderRadius:16, color:c.cardDkTxt, fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:'var(--app-font)' }}
              >
                Recommencer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
