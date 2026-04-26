/* Barre de navigation — top (desktop) + bottom (mobile, basculé via CSS @media) */

const Nav = ({ active, onTab, dark, pal }) => {
  const c = mkC(pal, dark);
  const TABS = [
    { id:'today',    l:"Aujourd'hui", ic:'today' },
    { id:'fiches',   l:'Fiches',      ic:'fiches' },
    { id:'reviser',  l:'Réviser',     ic:'reviser' },
    { id:'planning', l:'Planning',    ic:'planning' },
    { id:'moi',      l:'Moi',         ic:'moi' },
  ];
  const navBg = dark ? `${pal.dkBg}f0` : 'rgba(255,255,255,0.92)';
  return (
    <>
      <nav className="top-nav" style={{ position:'sticky', top:0, zIndex:100, background:navBg, borderBottom:`1.5px solid ${c.border}`, padding:'12px 28px', display:'flex', alignItems:'center', gap:4, backdropFilter:'blur(16px)' }}>
        <div style={{ marginRight:'auto', display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:c.cardDk, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h12M4 18h8" stroke={pal.primary} strokeWidth="2.2" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontSize:16, fontWeight:800, color:c.text, letterSpacing:'-0.02em' }}>revisfredo</span>
        </div>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>onTab(t.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', borderRadius:22, border:'none', background:active===t.id?pal.primary:'transparent', color:active===t.id?c.text:c.icon, fontWeight:active===t.id?600:400, fontSize:14, cursor:'pointer', fontFamily:'var(--app-font)', transition:'all 0.2s' }}>
            <Ic n={t.ic} s={15} c={active===t.id?c.text:c.icon} />
            {t.l}
          </button>
        ))}
      </nav>
      <nav className="bot-nav" style={{ display:'none', position:'fixed', bottom:0, left:0, right:0, zIndex:100, background:navBg, borderTop:`1.5px solid ${c.border}`, padding:'8px 0 max(8px,env(safe-area-inset-bottom))', justifyContent:'space-around', backdropFilter:'blur(16px)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>onTab(t.id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'6px 12px', border:'none', background:'transparent', cursor:'pointer', fontFamily:'var(--app-font)' }}>
            <div style={{ width:36, height:36, borderRadius:12, background:active===t.id?pal.primary:'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s' }}>
              <Ic n={t.ic} s={18} c={active===t.id?c.text:c.icon} />
            </div>
            <span style={{ fontSize:10, fontWeight:active===t.id?700:400, color:active===t.id?pal.primary:c.icon }}>{t.l}</span>
          </button>
        ))}
      </nav>
    </>
  );
};
