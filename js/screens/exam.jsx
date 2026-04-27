/* Écran "Préparation Examen" — réservé pour l'instant au module M106.
   Flow :
   1. Sélection du thème (4 thèmes + transversal)
   2. Quiz : suite de questions (cours / QCM / exo)
      • cours/exo : zone de saisie + boutons "Je savais" / "Pas su"
      • QCM : 4 options cliquables avec feedback immédiat
   3. Écran de fin avec score + retour aux thèmes.
   Stats par thème enregistrées via onRecordExam (cumulé dans db.examStats). */

const ExamScreen = ({ dark, pal, onNav, onRecordExam, examStats }) => {
  const [themeId, setThemeId] = useState(null);
  const [idx, setIdx] = useState(0);          // index question courante
  const [answer, setAnswer] = useState('');    // saisie utilisateur (cours/exo)
  const [picked, setPicked] = useState(null);  // option choisie (QCM)
  const [revealed, setRevealed] = useState(false); // QCM corrigé / exo en mode "voir l'auto-éval"
  const [score, setScore] = useState({ ok:0, ko:0 });
  const [done, setDone]   = useState(false);

  const c = mkC(pal, dark);

  if (typeof M106_CONTENT === 'undefined') {
    return <div style={{ padding:28, color:c.text }}>Contenu non chargé.</div>;
  }

  const theme = themeId ? M106_CONTENT.themes.find(t => t.id === themeId) : null;
  const question = theme ? theme.questions[idx] : null;
  const total = theme ? theme.questions.length : 0;

  const reset = () => { setIdx(0); setAnswer(''); setPicked(null); setRevealed(false); setScore({ok:0,ko:0}); setDone(false); };

  const startTheme = (id) => {
    Sound.click();
    reset();
    setThemeId(id);
  };

  const backToThemes = () => {
    Sound.click();
    setThemeId(null);
    reset();
  };

  /* Marque la question comme bonne/mauvaise et passe à la suivante */
  const finishQ = (good) => {
    onRecordExam?.({ mod:'M106', theme: themeId, missed: !good });
    setScore(s => good ? { ...s, ok:s.ok+1 } : { ...s, ko:s.ko+1 });
    good ? Sound.answerEasy() : Sound.answerHard();

    if (idx + 1 >= total) {
      setDone(true);
    } else {
      setIdx(i => i + 1);
      setAnswer('');
      setPicked(null);
      setRevealed(false);
    }
  };

  /* QCM : sélection d'une option */
  const pickOption = (i) => {
    if (revealed) return;
    Sound.click();
    setPicked(i);
    setRevealed(true);
    /* Pas de finishQ ici : on attend que l'utilisateur clique "Suivant" pour avoir le temps de lire */
  };

  /* ───────── Étape 1 : sélection du thème ───────── */
  if (!themeId) {
    return (
      <div className="scr slide-up" style={{ background:c.bg, minHeight:'calc(100vh - 65px)', padding:'28px', position:'relative', overflow:'hidden' }}>
        <Blob color={`${pal.primary}18`} style={{ width:300, height:300, top:-80, right:-70, filter:'blur(6px)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
            <button onClick={() => { Sound.click(); onNav('fiches'); }} title="Retour"
              style={{ width:40, height:40, borderRadius:12, background:c.surf, border:`1.5px solid ${c.border}`, color:c.text, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--app-font)' }}>
              <Ic n="chevL" s={18} c={c.text} />
            </button>
            <div>
              <h2 style={{ fontSize:26, fontWeight:800, color:c.text, lineHeight:1.1 }}>Préparation Exam</h2>
              <div style={{ fontSize:13, color:c.icon, opacity:0.75, marginTop:3 }}>M106 — Maintenance BDD Oracle · choisis un thème pour commencer</div>
            </div>
          </div>

          <div className="fg2" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:14 }}>
            {M106_CONTENT.themes.map(t => {
              const stat = examStats?.M106?.[t.id];
              const tot = stat?.attempts || 0;
              const missed = stat?.missed || 0;
              const rate = tot ? Math.round(((tot - missed) / tot) * 100) : null;
              return (
                <Card key={t.id} bg={c.surf} style={{ padding:18 }} onClick={() => startTheme(t.id)}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                    <div style={{ width:46, height:46, borderRadius:14, background:pal.primary, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                      {t.emoji}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', color:pal.primary, textTransform:'uppercase' }}>Thème {t.num}</div>
                      <div style={{ fontSize:15, fontWeight:700, color:c.text, lineHeight:1.25, marginTop:2 }}>{t.title}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:12, color:c.icon, opacity:0.75, marginBottom:10 }}>{t.subtitle}</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:11, color:c.icon }}>
                    <span style={{ opacity:0.7 }}>{t.questions.length} questions</span>
                    {rate !== null && (
                      <span style={{ background:`${pal.primary}1f`, color:pal.primary, padding:'3px 9px', borderRadius:7, fontWeight:700 }}>
                        {rate}% réussite · {tot}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ───────── Étape 3 : écran de fin ───────── */
  if (done) {
    const pct = total ? Math.round((score.ok / total) * 100) : 0;
    return (
      <div className="scr slide-up" style={{ background:c.bg, minHeight:'calc(100vh - 65px)', padding:'28px', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Blob color={`${pal.primary}22`} style={{ width:400, height:400, top:-100, left:-100, filter:'blur(8px)' }} />
        <Card bg={c.surf} style={{ padding:'34px 30px', maxWidth:480, width:'100%', textAlign:'center', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>{theme.emoji}</div>
          <div style={{ fontSize:13, fontWeight:700, letterSpacing:'0.1em', color:pal.primary, textTransform:'uppercase', marginBottom:6 }}>Thème {theme.num} terminé</div>
          <h2 style={{ fontSize:22, fontWeight:800, color:c.text, marginBottom:18 }}>{theme.title}</h2>
          <div style={{ fontSize:64, fontWeight:900, color:pal.primary, lineHeight:1, marginBottom:6, animation:'scoreIn 0.5s ease' }}>{pct}%</div>
          <div style={{ fontSize:14, color:c.icon, marginBottom:22 }}>
            {score.ok} bonnes · {score.ko} ratées · {total} au total
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
            <button onClick={() => { Sound.click(); reset(); }}
              style={{ padding:'11px 20px', borderRadius:12, background:pal.primary, border:'none', color:c.text, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--app-font)' }}>
              Refaire ce thème
            </button>
            <button onClick={backToThemes}
              style={{ padding:'11px 20px', borderRadius:12, background:'transparent', border:`1.5px solid ${c.border}`, color:c.text, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'var(--app-font)' }}>
              Autres thèmes
            </button>
          </div>
        </Card>
      </div>
    );
  }

  /* ───────── Étape 2 : quiz ───────── */
  const progress = ((idx) / total) * 100;

  return (
    <div className="scr slide-up" style={{ background:c.bg, minHeight:'calc(100vh - 65px)', padding:'24px 28px 32px', position:'relative', overflow:'hidden' }}>
      <Blob color={`${pal.primary}18`} style={{ width:280, height:280, top:-90, right:-80, filter:'blur(6px)' }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:760, margin:'0 auto' }}>
        {/* En-tête */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
          <button onClick={backToThemes} title="Retour aux thèmes"
            style={{ width:38, height:38, borderRadius:11, background:c.surf, border:`1.5px solid ${c.border}`, color:c.text, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Ic n="chevL" s={16} c={c.text} />
          </button>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', color:pal.primary, textTransform:'uppercase' }}>Thème {theme.num} · {question.type === 'qcm' ? 'QCM' : question.type === 'exo' ? 'Exercice' : 'Cours'}</div>
            <div style={{ fontSize:15, fontWeight:700, color:c.text, lineHeight:1.2, marginTop:2 }}>{theme.title}</div>
          </div>
          <div style={{ fontSize:12, color:c.icon, fontWeight:700 }}>{idx+1}/{total}</div>
        </div>

        {/* Barre de progression */}
        <div style={{ height:6, background:`${pal.primary}1a`, borderRadius:3, marginBottom:22, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progress}%`, background:pal.primary, borderRadius:3, transition:'width 0.32s ease' }} />
        </div>

        {/* Question */}
        <Card bg={c.surf} style={{ padding:'22px 22px 18px', marginBottom:18 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', color:c.icon, textTransform:'uppercase', marginBottom:10 }}>
            Question {idx+1}
          </div>
          <div style={{ fontSize:17, fontWeight:600, color:c.text, lineHeight:1.45, whiteSpace:'pre-wrap' }}>
            {question.q}
          </div>
        </Card>

        {/* Zone de réponse selon le type */}
        {question.type === 'qcm' ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {question.options.map((opt, i) => {
              const isPicked = picked === i;
              const isCorrect = i === question.correct;
              let bg = c.surf, border = c.border, color = c.text;
              if (revealed) {
                if (isCorrect)        { bg = `${pal.primary}33`; border = pal.primary; }
                else if (isPicked)    { bg = `${pal.second}1f`;  border = pal.second; color = c.text; }
              }
              return (
                <button key={i} onClick={() => pickOption(i)} disabled={revealed}
                  style={{
                    display:'flex', alignItems:'center', gap:14, textAlign:'left',
                    padding:'14px 16px', borderRadius:13,
                    background: bg, border:`1.5px solid ${border}`, color,
                    cursor: revealed ? 'default' : 'pointer',
                    fontFamily:'var(--app-font)', fontSize:14,
                    transition:'background 0.18s ease, border-color 0.18s ease',
                  }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background: revealed && isCorrect ? pal.primary : `${pal.primary}1f`, color: revealed && isCorrect ? c.text : pal.primary, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, flexShrink:0 }}>
                    {revealed && isCorrect ? '✓' : revealed && isPicked && !isCorrect ? '✗' : String.fromCharCode(65 + i)}
                  </div>
                  <span style={{ flex:1, lineHeight:1.4 }}>{opt}</span>
                </button>
              );
            })}

            {revealed && (
              <button onClick={() => finishQ(picked === question.correct)}
                style={{ marginTop:8, padding:'13px 20px', borderRadius:12, background:pal.primary, border:'none', color:c.text, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--app-font)', alignSelf:'flex-end' }}>
                {idx + 1 >= total ? 'Voir le score →' : 'Question suivante →'}
              </button>
            )}
          </div>
        ) : (
          <div>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Tape ta réponse ici… (puis auto-évalue avec les boutons ci-dessous)"
              rows={5}
              style={{
                width:'100%',
                padding:'14px 16px',
                borderRadius:13,
                border:`1.5px solid ${c.border}`,
                background: dark ? `${pal.primary}08` : 'white',
                color:c.text,
                fontSize:14,
                fontFamily:'var(--app-font)',
                lineHeight:1.5,
                resize:'vertical',
                outline:'none',
                marginBottom:14,
              }}
            />
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button onClick={() => finishQ(false)}
                style={{ flex:'1 1 140px', padding:'13px 18px', borderRadius:12, background:`${pal.second}1a`, border:`1.5px solid ${pal.second}55`, color:c.text, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--app-font)' }}>
                ✗ Pas su
              </button>
              <button onClick={() => finishQ(true)}
                style={{ flex:'1 1 140px', padding:'13px 18px', borderRadius:12, background:pal.primary, border:'none', color:c.text, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--app-font)' }}>
                ✓ Je savais
              </button>
            </div>
          </div>
        )}

        {/* Score en cours */}
        <div style={{ marginTop:20, display:'flex', justifyContent:'center', gap:18, fontSize:12, color:c.icon, opacity:0.7 }}>
          <span>✓ {score.ok}</span>
          <span>✗ {score.ko}</span>
        </div>
      </div>
    </div>
  );
};
