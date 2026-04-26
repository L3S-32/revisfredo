/* Écran "Planning" — semaine en cours, ajout/suppression de tests, liste des prochains tests */

const PlanningScreen = ({ dark, pal, tests, onAddTest, onRemoveTest }) => {
  const c = mkC(pal, dark);
  const [selDay, setSelDay]     = useState(new Date().getDay()===0 ? 6 : new Date().getDay()-1);
  const [showForm, setShowForm] = useState(false);
  const [unlocked, setUnlocked] = useState(false);   // verrou session : reset au reload
  const [pwInput, setPwInput]   = useState('');
  const [pwError, setPwError]   = useState(false);
  const [fDate, setFDate]       = useState('');
  const [fMod, setFMod]         = useState(MODULES[0].id);
  const [fLabel, setFLabel]     = useState('');
  const DAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  const PASSWORD = 'picasso32';
  const tryUnlock = (e) => {
    if (e) e.preventDefault();
    if (pwInput === PASSWORD) {
      setUnlocked(true);
      setPwError(false);
      setPwInput('');
    } else {
      setPwError(true);
    }
  };
  const toggleForm = () => {
    if (showForm) { setPwError(false); setPwInput(''); }
    setShowForm(s => !s);
  };

  /* Dates de la semaine en cours (lundi → dimanche) */
  const weekStart = startOfWeek(new Date());
  const weekDates = Array.from({length:7}, (_,i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
  });
  const selDate = weekDates[selDay];
  const monthLabel = `${MONTHS_FR[selDate.getMonth()]} ${selDate.getFullYear()}`;

  const testOnDay = (i) => tests.find(t => dayKey(t.date) === dayKey(weekDates[i]));
  const testToday = testOnDay(selDay);
  const upcoming  = getUpcomingTests(tests, 3);

  const submitTest = () => {
    if (!fDate) return;
    onAddTest({ date: fDate, mod: fMod, label: fLabel.trim() || modLabel(fMod) });
    setFDate(''); setFLabel(''); setShowForm(false);
  };

  return (
    <div className="scr slide-up" style={{ background:c.bg, minHeight:'calc(100vh - 65px)', padding:'28px', position:'relative', overflow:'hidden' }}>
      <Blob color={`${pal.primary}18`} style={{ width:280, height:280, bottom:0, right:-40, filter:'blur(4px)' }} />
      <div style={{ margin:'0 auto', position:'relative', zIndex:1 }}>

        {/* En-tête + bouton d'ajout */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:26 }}>
          <h2 style={{ fontSize:28, fontWeight:800, color:c.text }}>
            Planning
            {unlocked && <span title="Session déverrouillée" style={{ fontSize:14, marginLeft:10, opacity:0.7 }}>🔓</span>}
          </h2>
          <button onClick={toggleForm} style={{ padding:'9px 18px', borderRadius:12, background:showForm?c.cardDk:pal.primary, border:'none', color:showForm?c.cardDkTxt:c.text, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'var(--app-font)' }}>
            {showForm ? 'Annuler' : (unlocked ? '+ Ajouter un test' : '🔒 Ajouter un test')}
          </button>
        </div>

        {/* Étape 1 : verrou par mot de passe (tant que la session n'est pas déverrouillée) */}
        {showForm && !unlocked && (
          <Card bg={c.surf} style={{ padding:24, marginBottom:20, border:`1.5px solid ${c.border}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
              <div style={{ width:44, height:44, borderRadius:13, background:`${pal.primary}1f`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🔒</div>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:c.text }}>Accès protégé</div>
                <div style={{ fontSize:12, color:c.icon, opacity:0.8, marginTop:2 }}>Saisis le mot de passe pour ajouter un test à ton planning.</div>
              </div>
            </div>
            <form onSubmit={tryUnlock} style={{ display:'flex', gap:10 }}>
              <input type="password" autoFocus value={pwInput}
                onChange={e=>{ setPwInput(e.target.value); if (pwError) setPwError(false); }}
                placeholder="Mot de passe…"
                style={{ flex:1, padding:'11px 14px', borderRadius:11, border:`1.5px solid ${pwError?'#e06060':c.border}`, background:dark?`${pal.primary}0a`:'white', color:c.text, fontSize:14, fontFamily:'var(--app-font)', outline:'none', transition:'border-color 0.15s' }} />
              <button type="submit" disabled={!pwInput} style={{ padding:'11px 22px', borderRadius:11, background:pwInput?pal.primary:`${pal.primary}40`, border:'none', color:c.text, fontSize:14, fontWeight:700, cursor:pwInput?'pointer':'not-allowed', fontFamily:'var(--app-font)' }}>
                Déverrouiller
              </button>
            </form>
            {pwError && (
              <div style={{ marginTop:12, fontSize:12, color:'#e06060', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                ⚠️ Mot de passe incorrect
              </div>
            )}
          </Card>
        )}

        {/* Étape 2 : formulaire de saisie (visible uniquement après déverrouillage) */}
        {showForm && unlocked && (
          <Card bg={c.surf} style={{ padding:20, marginBottom:20, border:`1.5px solid ${c.border}` }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:c.icon, marginBottom:5, letterSpacing:'0.08em', textTransform:'uppercase' }}>Date</div>
                <input type="date" value={fDate} onChange={e=>setFDate(e.target.value)}
                  style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:`1.5px solid ${c.border}`, background:dark?`${pal.primary}0a`:'white', color:c.text, fontSize:13, fontFamily:'var(--app-font)', outline:'none' }} />
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:c.icon, marginBottom:5, letterSpacing:'0.08em', textTransform:'uppercase' }}>Module</div>
                <select value={fMod} onChange={e=>setFMod(e.target.value)}
                  style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:`1.5px solid ${c.border}`, background:dark?`${pal.primary}0a`:'white', color:c.text, fontSize:13, fontFamily:'var(--app-font)', outline:'none' }}>
                  {MODULES.map(m => <option key={m.id} value={m.id}>{m.id} — {m.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:c.icon, marginBottom:5, letterSpacing:'0.08em', textTransform:'uppercase' }}>Intitulé (optionnel)</div>
              <input value={fLabel} onChange={e=>setFLabel(e.target.value)} placeholder="Ex. Examen partiel"
                style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:`1.5px solid ${c.border}`, background:dark?`${pal.primary}0a`:'white', color:c.text, fontSize:13, fontFamily:'var(--app-font)', outline:'none' }} />
            </div>
            <button onClick={submitTest} disabled={!fDate} style={{ padding:'10px 20px', borderRadius:11, background:fDate?pal.primary:`${pal.primary}40`, border:'none', color:c.text, fontSize:13, fontWeight:700, cursor:fDate?'pointer':'not-allowed', fontFamily:'var(--app-font)' }}>
              Enregistrer
            </button>
          </Card>
        )}

        {/* Vue semaine */}
        <div className="wk" style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:10, marginBottom:20 }}>
          {DAYS.map((d, i) => {
            const test = testOnDay(i);
            const isSel = selDay === i;
            const isToday = dayKey(weekDates[i]) === dayKey(new Date());
            return (
              <div key={d} onClick={()=>setSelDay(i)} style={{ borderRadius:16, padding:'13px 6px', textAlign:'center', cursor:'pointer', background:isSel?c.cardDk:`${pal.primary}10`, border: isSel ? '1.5px solid transparent' : (isToday ? `1.5px solid ${pal.primary}` : `1.5px solid ${c.border}`), transition:'all 0.2s' }}>
                <div style={{ fontSize:10, fontWeight:600, color:isSel?c.cardDkTxt:c.icon, opacity:0.7, marginBottom:6 }}>{d}</div>
                <div style={{ fontSize:22, fontWeight:800, color:isSel?c.cardDkTxt:c.text, marginBottom:8 }}>{weekDates[i].getDate()}</div>
                {test
                  ? <div style={{ background:isSel?`${pal.primary}40`:pal.primary, borderRadius:8, padding:'3px 2px', fontSize:10, fontWeight:700, color:isSel?c.cardDkTxt:c.text }}>{test.mod}</div>
                  : <div style={{ height:22 }} />}
              </div>
            );
          })}
        </div>

        {/* Carte du jour sélectionné */}
        <Card bg={c.cardDk} style={{ padding:24, marginBottom:20 }}>
          <Blob color={`${pal.primary}10`} style={{ width:200, height:200, bottom:-40, right:-30 }} />
          <div style={{ fontSize:12, color:c.cardDkTxt, opacity:0.55, marginBottom:6, position:'relative', zIndex:1 }}>{DAYS[selDay]} {selDate.getDate()} {monthLabel}</div>
          <div style={{ fontSize:18, fontWeight:700, color:c.cardDkTxt, marginBottom:16, position:'relative', zIndex:1 }}>
            {testToday ? `Test ce jour : ${testToday.label || modLabel(testToday.mod)}` : 'Pas de test — bonne révision !'}
          </div>
          {testToday && (
            <button onClick={()=>onRemoveTest(testToday.id)} style={{ position:'relative', zIndex:1, padding:'8px 14px', borderRadius:10, background:'rgba(220,60,60,0.18)', border:'1.5px solid rgba(220,60,60,0.3)', color:'#ff8080', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--app-font)' }}>
              Supprimer ce test
            </button>
          )}
        </Card>

        {/* Liste des prochains tests */}
        <h3 style={{ fontSize:15, fontWeight:700, color:c.text, marginBottom:12 }}>Prochains tests</h3>
        {upcoming.length === 0 ? (
          <div style={{ background:`${pal.primary}08`, border:`1.5px dashed ${c.border}`, borderRadius:16, padding:'28px 20px', textAlign:'center', color:c.icon, fontSize:13 }}>
            Aucun test prévu — clique sur « + Ajouter un test » pour commencer.
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {upcoming.map(t => {
              const m  = MODULES.find(x => x.id === t.mod);
              const mc = modCol(m ? m.ck : 'sf', c);
              const dj = daysUntil(t.date);
              return (
                <div key={t.id} style={{ display:'flex', alignItems:'center', gap:16, background:`${pal.primary}08`, border:`1.5px solid ${c.border}`, borderRadius:16, padding:'16px 20px' }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:mc.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:mc.txt }}>{t.mod}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:c.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.label || modLabel(t.mod)}</div>
                    <div style={{ fontSize:12, color:c.icon, opacity:0.8, marginTop:2 }}>{formatFrDate(t.date)}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:32, fontWeight:900, color:c.text, lineHeight:1 }}>{dj <= 0 ? "Auj." : `${dj}j`}</div>
                    <div style={{ fontSize:11, color:c.icon, opacity:0.7 }}>{dj <= 0 ? '' : 'restants'}</div>
                  </div>
                  <button onClick={()=>onRemoveTest(t.id)} title="Supprimer" style={{ width:30, height:30, borderRadius:8, background:'transparent', border:`1.5px solid ${c.border}`, color:c.icon, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--app-font)' }}>
                    <Ic n="close" s={13} c={c.icon} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
