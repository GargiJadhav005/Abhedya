import { Link } from '@tanstack/react-router';
export function Brand({light=false}:{light?:boolean}) {return <Link to="/" className={`brand ${light?'brand-light':''}`} aria-label="Abhedya home"><img src="/Abhedya Network Logo.jpeg" alt="Abhedya" className="brand-logo" /><span className="brand-type"><strong>Abhedya</strong><small>PREDICTIVE SUPPLY CHAIN INTELLIGENCE</small></span></Link>}
