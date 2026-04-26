/* Écran "Fiches" — grille de modules avec recherche, clic ouvre la révision */

const FichesScreen = ({ dark, pal, onNav }) => {
  const [q, setQ] = useState('');
  const c = mkC(pal, dark);
  const mods = MODULES.filter(m =>
    m.label.toLowerCase().includes(q.toLowerCase()) ||
    m.id.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="scr slide-up" style={{ background:c.bg, minHeight:'calc(100vh - 65px)', padding:'28px', position:'relative', overflow:'hidden' }}>
      <Blob color={`${pal.primary}18`} style={{ width:300, height:300, top:-80, left:-70, filter:'blur(6px)' }} />
      <div style={{ margin:'0 auto', position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:26 }}>
          <h2 style={{ fontSize:28, fontWeight:800, color:c.text }}>Mes fiches</h2>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher…"
            style={{ padding:'9px 16px', borderRadius:12, border:`1.5px solid ${c.border}`, background:dark?`${pal.primary}0a`:'white', color:c.text, fontSize:14, fontFamily:'var(--app-font)', outline:'none', width:230 }} />
        </div>
        <div className="fg3" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:16 }}>
          {mods.map(mod => {
            const mc = modCol(mod.ck, c);
            const overlay = (mod.ck==='dk' || mod.ck==='sc') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)';
            return (
              <Card key={mod.id} bg={mc.bg} style={{ padding:24, minHeight:196 }} onClick={() => onNav('reviser')}>
                <Blob color={overlay} style={{ width:170, height:170, bottom:-40, right:-30 }} />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, position:'relative', zIndex:1 }}>
                  <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', color:mc.txt, background:overlay, padding:'4px 9px', borderRadius:7 }}>{mod.id}</span>
                  <div style={{ width:34, height:34, borderRadius:'50%', background:overlay, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Ic n="chevR" s={15} c={mc.txt} />
                  </div>
                </div>
                <div style={{ fontSize:17, fontWeight:700, color:mc.txt, marginBottom:12, lineHeight:1.3, position:'relative', zIndex:1 }}>{mod.label}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, position:'relative', zIndex:1 }}>
                  {mod.topics.slice(0,3).map(t => (
                    <span key={t} style={{ fontSize:11, color:mc.txt, opacity:0.7, background:overlay, padding:'3px 9px', borderRadius:7 }}>{t}</span>
                  ))}
                  {mod.topics.length > 3 && <span style={{ fontSize:11, color:mc.txt, opacity:0.45 }}>+{mod.topics.length-3}</span>}
                </div>
                <div style={{ marginTop:14, fontSize:34, fontWeight:900, color:mc.txt, opacity:0.18, lineHeight:1, position:'relative', zIndex:1 }}>{mod.cards}</div>
                <div style={{ fontSize:10, color:mc.txt, opacity:0.4, marginTop:-2, position:'relative', zIndex:1 }}>cartes</div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
