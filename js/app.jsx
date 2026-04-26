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
  const [helpOpen, setHelpOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* Toggle plein écran — appelé par le raccourci F et par les boutons "Focus" in-app. */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  /* Synchronise isFullscreen avec l'état réel du navigateur (couvre Esc, F, bouton…) */
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);
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

  /* Raccourcis clavier globaux. Ignore les saisies dans inputs/textareas. */
  useEffect(() => {
    const TAB_BY_NUM = ['today','fiches','reviser','planning','moi'];
    const onKey = (e) => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const k = e.key.toLowerCase();
      if (k === 'f') {
        toggleFullscreen();
        e.preventDefault();
      } else if (k === 'd') {
        setPrefs(p => ({ ...p, darkMode: !p.darkMode }));
        e.preventDefault();
      } else if (e.key >= '1' && e.key <= '5') {
        setTab(TAB_BY_NUM[parseInt(e.key, 10) - 1]);
        e.preventDefault();
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setHelpOpen(true);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
    today:    <TodayScreen    {...props} onNav={setTab} streak={stats.streak} nextTest={stats.nextTest} weekSuccess={stats.weekSuccess} onRecord={recordAnswer} focus={isFullscreen} onToggleFocus={toggleFullscreen} />,
    fiches:   <FichesScreen   {...props} onNav={setTab} />,
    reviser:  <ReviserScreen  {...props} onRecord={recordAnswer} focusMode={isFullscreen} onToggleFocus={toggleFullscreen} />,
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
      <HelpOverlay open={helpOpen} setOpen={setHelpOpen} pal={pal} dark={dark} />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
