/* Composant racine — assemble prefs + données utilisateur, dérive les stats, monte les écrans */

/* Échelle automatique selon la largeur de l'écran (cumulée avec le réglage utilisateur) */
const autoScaleFor = (vw) => {
  if (vw < 1700) return 1.0;
  if (vw < 2400) return 1.10;
  if (vw < 3000) return 1.20;
  return 1.30;
};

const App = () => {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [db, setDB]       = useState(loadDB);
  const [tab, setTab]     = useState('today');
  const [vw, setVw]       = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);
  const dark = prefs.darkMode;
  const pal  = PALETTES[prefs.palIdx] || PALETTES[0];
  const font = FONTS[prefs.fontIdx]   || FONTS[0];
  const c    = mkC(pal, dark);

  useEffect(() => { savePrefs(prefs); }, [prefs]);
  useEffect(() => { saveDB(db); },       [db]);

  /* Police globale exposée via une variable CSS — body et tous les fontFamily inline
     l'utilisent via var(--app-font). Les aperçus du sélecteur peuvent surcharger
     localement avec leur propre fontFamily sans conflit. */
  useEffect(() => {
    document.documentElement.style.setProperty('--app-font', font.stack);
  }, [font.stack]);

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* zoom total = échelle auto (responsive) × préférence utilisateur */
  const totalZoom = autoScaleFor(vw) * prefs.textScale;

  const setPalIdx     = (v) => setPrefs(p => ({ ...p, palIdx: v }));
  const setFontIdx    = (v) => setPrefs(p => ({ ...p, fontIdx: v }));
  const onDarkToggle  = (v) => setPrefs(p => ({ ...p, darkMode: v }));
  const setTextScale  = (v) => setPrefs(p => ({ ...p, textScale: v }));

  const recordAnswer = ({ mod, cardIdx, result }) => {
    setDB(d => ({ ...d, history: [...d.history, { ts: Date.now(), mod, cardIdx, result }] }));
  };
  const addTest = (t) => {
    setDB(d => ({ ...d, tests: [...d.tests, { id: Date.now() + Math.random().toString(36).slice(2,6), ...t }] }));
  };
  const removeTest = (id) => {
    setDB(d => ({ ...d, tests: d.tests.filter(t => t.id !== id) }));
  };
  const setUserName = (v) => setDB(d => ({ ...d, userName: v }));
  const setUserSub  = (v) => setDB(d => ({ ...d, userSub:  v }));

  const stats = {
    streak:        computeStreak(db.history),
    mastered:      computeMastered(db.history),
    weekSuccess:   computeWeekSuccess(db.history),
    monthSuccess:  computeMonthSuccess(db.history),
    weekTime:      computeWeekTime(db.history),
    weekActivity:  computeWeekActivity(db.history),
    modProgress:   computeModuleProgress(db.history),
    nextTest:      getNextTest(db.tests),
  };

  const props = { dark, pal };
  const screens = {
    today:    <TodayScreen    {...props} onNav={setTab} streak={stats.streak} nextTest={stats.nextTest} weekSuccess={stats.weekSuccess} onRecord={recordAnswer} />,
    fiches:   <FichesScreen   {...props} onNav={setTab} />,
    reviser:  <ReviserScreen  {...props} onRecord={recordAnswer} />,
    planning: <PlanningScreen {...props} tests={db.tests} onAddTest={addTest} onRemoveTest={removeTest} />,
    moi:      <MoiScreen      {...props} palIdx={prefs.palIdx} setPalIdx={setPalIdx} onDarkToggle={onDarkToggle}
                              fontIdx={prefs.fontIdx} setFontIdx={setFontIdx}
                              textScale={prefs.textScale} setTextScale={setTextScale}
                              stats={stats} userName={db.userName} userSub={db.userSub}
                              onUserName={setUserName} onUserSub={setUserSub} />,
  };

  /* La var --zoom permet aux écrans qui se calent sur la viewport (Today)
     de diviser leur hauteur pour compenser le zoom rendu. */
  return (
    <div style={{ minHeight:'100vh', background:c.bg, fontFamily:'var(--app-font)', transition:'background 0.4s ease', '--zoom': totalZoom }}>
      <Nav active={tab} onTab={setTab} dark={dark} pal={pal} />
      <div key={tab} className="slide-up" style={{ zoom: totalZoom }}>{screens[tab]}</div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
