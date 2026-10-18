'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';

type Event = {network_id:string;day:string;event:string;count:number};

export function useDailyViews(enabled:boolean) {
  const [counts,setCounts] = useState<Record<string,number>|null>(null);
  const [failed,setFailed] = useState(false);
  useEffect(()=>{
    if(!enabled)return;
    const controller = new AbortController();
    let pending = false;
    async function refresh() {
      if(pending || document.visibilityState==='hidden')return;
      pending=true;
      try {
        const response=await fetch('/api/analytics',{cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])});
        if(!response.ok)throw new Error('Analytics unavailable');
        const data=await response.json() as {events:Event[]};
        const today=new Date().toISOString().slice(0,10);
        const next:Record<string,number>={};
        for(const event of data.events)if(event.event==='view'&&event.day===today)next[event.network_id]=(next[event.network_id]||0)+event.count;
        if(!controller.signal.aborted){setCounts(next);setFailed(false);}
      }catch{if(!controller.signal.aborted)setFailed(true);}finally{pending=false;}
    }
    void refresh();
    const interval=setInterval(refresh,60000);
    window.addEventListener('focus',refresh);
    document.addEventListener('visibilitychange',refresh);
    return ()=>{controller.abort();clearInterval(interval);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
  },[enabled]);
  return {counts,failed};
}

export function DailyViews({count,failed}:{count:number|undefined;failed:boolean}) {
  return <Link className="daily-views" href="/analytics" title="Visualizações de hoje (UTC). Atualizado a cada minuto. Visitas do proprietário logado não são contadas.">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
    <span>{failed?'Visualizações indisponíveis':count===undefined?'Carregando visualizações…':<><strong>{count.toLocaleString('pt-BR')}</strong> {count===1?'visualização hoje':'visualizações hoje'}<small>UTC</small></>}</span>
  </Link>;
}
