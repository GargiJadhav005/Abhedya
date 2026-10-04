import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export const roles = ['Inventory Manager','Demand & Supply Planner','Procurement & Supplier Manager','Transportation & Distribution Manager','Receiving & Consumption Manager','Supply Chain Controller','System Administrator'] as const;
export type Role = typeof roles[number];
export type Audit = { id: number; actor: Role; action: string; ref: string; reason: string; time: string };
export type Proposal = { id: string; item: string; quantity: number; status: 'Pending sourcing' | 'Ready for approval' | 'Approved' | 'Revision requested' | 'Rejected' | 'Received'; creator: Role; source?: string; route?: string; reason?: string };
type Data = { role: Role; stock: number; weather: 'Clear'|'Snow'|'Storm'; route: string; shipment: string; proposals: Proposal[]; audit: Audit[]; notices: string[] };
const initial: Data = { role: 'Demand & Supply Planner', stock: 420, weather: 'Snow', route: 'Valley Corridor', shipment: 'In transit', proposals: [], notices: [], audit: [{id:1,actor:'System Administrator',action:'Demo network initialised',ref:'SYS-001',reason:'Synthetic demonstration dataset',time:'09:00'}] };
type Demo = Data & { setRole: (role: Role) => void; setWeather: (weather: Data['weather']) => void; setRoute: (route: string) => void; setShipment: (status:string) => void; createProposal: (quantity:number) => void; sourceProposal:(id:string,source:string)=>void; proposeRoute:(id:string,route:string)=>void; decide:(id:string,status:'Approved'|'Rejected'|'Revision requested',reason:string)=>void; receive:(id:string,quantity:number)=>void; adjustStock:(amount:number,reason:string)=>void; log:(action:string,ref:string,reason:string)=>void; reset:()=>void; dismiss:(notice:string)=>void };
const Context = createContext<Demo | null>(null);
export function DemoProvider({children}:{children:ReactNode}) {
  const [data,setData] = useState<Data>(initial);
  useEffect(()=>{ try { const saved = localStorage.getItem('nexus-demo-v1'); if(saved) setData({...initial,...JSON.parse(saved)}); } catch {} },[]);
  useEffect(()=>{localStorage.setItem('nexus-demo-v1',JSON.stringify(data))},[data]);
  const update=(patch:Partial<Data>)=>setData(d=>({...d,...patch}));
  const action=(name:string, ref:string, reason:string, change?:(d:Data)=>Partial<Data>)=>setData(d=>({...d,...change?.(d),audit:[{id:Date.now(),actor:d.role,action:name,ref,reason,time:new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})},...d.audit],notices:[`${name} · ${ref}`,...d.notices].slice(0,4)}));
  const modify=(id:string,fn:(p:Proposal)=>Proposal)=>setData(d=>({...d,proposals:d.proposals.map(p=>p.id===id?fn(p):p)}));
  const value:Demo={...data,setRole:role=>update({role}),setWeather:weather=>update({weather}),setRoute:route=>update({route}),setShipment:shipment=>action('Shipment status updated','SHP-204',shipment,()=>({shipment})),createProposal:quantity=>action('Replenishment submitted','REQ-'+(100+data.proposals.length),`${quantity} units of Medical Kits`,d=>({proposals:[...d.proposals,{id:'REQ-'+(100+d.proposals.length),item:'Medical Kits',quantity,status:'Pending sourcing',creator:d.role}]})),sourceProposal:(id,source)=>action('Sourcing option recorded',id,source,d=>({proposals:d.proposals.map(p=>p.id===id?{...p,source,status:'Ready for approval' as const}:p)})),proposeRoute:(id,route)=>action('Route proposed for approval',id,route,d=>({proposals:d.proposals.map(p=>p.id===id?{...p,route,status:'Ready for approval' as const}:p)})),decide:(id,status,reason)=>{ const p=data.proposals.find(x=>x.id===id); if(p?.creator===data.role || data.role!=='Supply Chain Controller') return; action(status==='Approved'?'Proposal approved':status==='Rejected'?'Proposal rejected':'Revision requested',id,reason,d=>({proposals:d.proposals.map(p=>p.id===id?{...p,status,reason}:p),shipment:status==='Approved'?'Scheduled':d.shipment})); },receive:(id,quantity)=>action('Receipt confirmed',id,`${quantity} units received`,d=>({stock:d.stock+quantity,proposals:d.proposals.map(p=>p.id===id?{...p,status:'Received' as const}:p),shipment:'Delivered'})),adjustStock:(amount,reason)=>action(amount>=0?'Stock receipt recorded':'Stock adjustment recorded','INV-001',reason,d=>({stock:Math.max(0,d.stock+amount)})),log:(name,ref,reason)=>action(name,ref,reason),reset:()=>{setData(initial);localStorage.removeItem('nexus-demo-v1')},dismiss:notice=>setData(d=>({...d,notices:d.notices.filter(n=>n!==notice)}))};
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useDemo(){const value=useContext(Context);if(!value) throw new Error('DemoProvider missing');return value;}
export const roleDescriptions:Record<Role,string>={
'Inventory Manager':'Verified inventory & discrepancy intelligence',
'Demand & Supply Planner':'Explainable demand & shortage prediction',
'Procurement & Supplier Manager':'Predictive procurement & supplier risk',
'Transportation & Distribution Manager':'Delivery uncertainty & route intelligence',
'Receiving & Consumption Manager':'Receipt reconciliation & usage feedback',
'Supply Chain Controller':'Constraint-aware decision intelligence',
'System Administrator':'Permission governance & data integrity'};
