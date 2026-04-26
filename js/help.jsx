/* Bulle d'aide flottante + modale qui explique apparence & raccourcis clavier.
   La bulle adopte la couleur primaire de la palette active. */

const SHORTCUTS = [
  { key:'F',     desc:'Plein écran (cache la barre du navigateur)' },
  { key:'D',     desc:'Basculer le mode sombre' },
  { key:'1 → 5', desc:"Naviguer entre les onglets (Aujourd'hui, Fiches, Réviser, Planning, Moi)" },
  { key:'?',     desc:'Ouvrir cette aide' },
  { key:'Esc',   desc:"Fermer l'aide / quitter le plein écran" },
];

const HelpOverlay = ({ open, setOpen, pal, dark }) => {
  const c = mkC(pal, dark);
  const close = () => { Sound.modalClose(); setOpen(false); };

  /* Esc ferme la modale (et quitte aussi le plein écran nativement). */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* Bulle flottante */}
      <button
        onClick={() => { Sound.modalOpen(); setOpen(true); }}
        title="Aide & raccourcis (?)"
        aria-label="Aide"
        style={{
          position:'fixed', bottom:24, right:24, zIndex:200,
          width:52, height:52, borderRadius:'50%',
          background:pal.primary, color:c.text,
          border:'none', cursor:'pointer',
          fontSize:24, fontWeight:800, lineHeight:1,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 6px 20px rgba(0,0,0,0.18)',
          fontFamily:'var(--app-font)',
          transition:'transform 0.18s ease, box-shadow 0.18s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 10px 26px rgba(0,0,0,0.24)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)'; }}
      >
        ?
      </button>

      {/* Modale */}
      {open && (
        <div
          onClick={close}
          style={{
            position:'fixed', inset:0, zIndex:300,
            background:'rgba(0,0,0,0.32)',
            backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:24,
            animation:'fadeIn 0.18s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="slide-up"
            style={{
              background:c.bg, color:c.text,
              borderRadius:24, padding:'30px 34px',
              width:'min(560px, 92vw)',
              maxHeight:'82vh', overflowY:'auto',
              boxShadow:'0 16px 48px rgba(0,0,0,0.28)',
              border:`1.5px solid ${c.border}`,
              position:'relative',
            }}
          >
            <button
              onClick={close}
              title="Fermer"
              aria-label="Fermer"
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
              <div style={{ width:40, height:40, borderRadius:12, background:pal.primary, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:c.text, lineHeight:1 }}>?</div>
              <h2 style={{ fontSize:22, fontWeight:800, color:c.text, margin:0 }}>Aide</h2>
            </div>
            <p style={{ fontSize:13, color:c.icon, opacity:0.8, lineHeight:1.5, marginBottom:22 }}>
              Personnalisation et raccourcis pour aller plus vite.
            </p>

            {/* Apparence */}
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.11em', textTransform:'uppercase', color:c.icon, opacity:0.6, marginBottom:10 }}>
              Apparence
            </div>
            <div style={{ background:`${pal.primary}10`, border:`1.5px solid ${c.border}`, borderRadius:14, padding:'14px 16px', marginBottom:22, fontSize:13, color:c.text, lineHeight:1.65 }}>
              Va dans <b>Moi</b> (ou appuie sur <kbd style={kbdInline(c)}>5</kbd>) puis :
              <ul style={{ marginTop:8, paddingLeft:20, marginBottom:0 }}>
                <li><b>Palette</b> — 12 thèmes de couleurs (Pistache, Océan, Cerise…)</li>
                <li><b>Visuel</b> — 7 polices (Inter, JetBrains Mono, Lora…)</li>
                <li><b>Mode sombre</b> et <b>taille du texte</b> dans Profil → Réglages rapides</li>
              </ul>
            </div>

            {/* Raccourcis */}
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.11em', textTransform:'uppercase', color:c.icon, opacity:0.6, marginBottom:10 }}>
              Raccourcis clavier
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {SHORTCUTS.map(s => (
                <div key={s.key} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 14px', borderRadius:12, background:c.surf }}>
                  <kbd style={{ minWidth:62, padding:'6px 10px', borderRadius:8, background:c.cardDk, color:c.cardDkTxt, fontSize:12, fontWeight:700, textAlign:'center', fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace", letterSpacing:'0.02em' }}>{s.key}</kbd>
                  <span style={{ fontSize:13, color:c.text }}>{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* Style inline pour les <kbd> dans le texte courant. */
const kbdInline = (c) => ({
  padding:'1px 7px', borderRadius:6,
  background:c.cardDk, color:c.cardDkTxt,
  fontSize:11, fontWeight:700,
  fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace",
});
