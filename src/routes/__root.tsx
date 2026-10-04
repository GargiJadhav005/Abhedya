import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { DemoProvider } from '@/lib/demo';
import appCss from '../styles.css?url';
export const Route=createRootRouteWithContext<{queryClient:QueryClient}>()({head:()=>({meta:[{charSet:'utf-8'},{name:'viewport',content:'width=device-width, initial-scale=1'}],links:[{rel:'stylesheet',href:appCss},{rel:'preconnect',href:'https://fonts.googleapis.com'},{rel:'preconnect',href:'https://fonts.gstatic.com',crossOrigin:'anonymous'},{rel:'stylesheet',href:'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap'}]}),shellComponent:({children}:{children:ReactNode})=><html lang="en"><head><HeadContent/></head><body>{children}<Scripts/></body></html>,component:Root,notFoundComponent:()=> <main className="missing"><h1>Signal not found.</h1><p>This page is outside the NEXUS network.</p><Link to="/">Return home →</Link></main>});
function Root(){const {queryClient}=Route.useRouteContext();return <QueryClientProvider client={queryClient}><DemoProvider><Outlet/></DemoProvider></QueryClientProvider>}
