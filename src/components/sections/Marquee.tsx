'use client'
const EVENTS = ['Quinceañeras','Weddings','Graduations','Birthdays','Baby Showers','Bridal Showers','Corporate Events','Sweet 16s','School Events','Holiday Parties']

export default function Marquee() {
  const doubled = [...EVENTS, ...EVENTS]
  return (
    <div style={{padding:'56px 0', background:'#0D0F0F', overflow:'hidden'}}>
      <p style={{fontFamily:'DM Mono,monospace',fontSize:'10px',color:'rgba(255,255,255,0.28)',letterSpacing:'0.25em',textTransform:'uppercase',textAlign:'center',marginBottom:'28px'}}>
        Events We Style
      </p>
      <div style={{display:'flex',width:'max-content',animation:'scrollLeft 28s linear infinite'}}
        onMouseEnter={e=>(e.currentTarget.style.animationPlayState='paused')}
        onMouseLeave={e=>(e.currentTarget.style.animationPlayState='running')}
      >
        {doubled.map((name,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:'20px',padding:'0 32px',whiteSpace:'nowrap',borderRight:'1px solid rgba(255,255,255,0.06)'}}>
            <span style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:'clamp(1.2rem,2.5vw,1.5rem)',fontWeight:300,fontStyle:'italic',color:'rgba(255,255,255,0.48)',transition:'color 0.3s',cursor:'default'}}
              onMouseEnter={e=>(e.currentTarget.style.color='#5BBFBF')}
              onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.48)')}
            >{name}</span>
            <div style={{width:'4px',height:'4px',borderRadius:'50%',background:'#5BBFBF',opacity:0.35}} />
          </div>
        ))}
      </div>
    </div>
  )
}
