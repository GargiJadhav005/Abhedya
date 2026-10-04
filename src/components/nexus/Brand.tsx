import { Link } from '@tanstack/react-router';
export function Brand({light=false}:{light?:boolean}) {return <Link to="/" className={`brand ${light?'brand-light':''}`} aria-label="NEXUS home"><span className="brand-mark"><span/><span/><span/><span/></span><span className="brand-type"><strong>NEXUS</strong><small>PREDICTIVE SUPPLY CHAIN INTELLIGENCE</small></span></Link>}
