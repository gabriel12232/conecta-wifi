'use client';
import {useCallback, useEffect, useState} from 'react';
import Link from 'next/link';
import {BarChart3, Eye, Copy, Download, Printer, ArrowLeft, RefreshCw} from 'lucide-react';
import './style.css';

type Network = {id:string;ssid:string;place:string};
type Event = {network_id:string;day:string;event:'view'|'copy'|'download'|'print';count:number};
type Data = {networks:Network[];events:Event[]};
const metrics = [
  {key:'view',label:'Visualizações',icon:Eye},
  {key:'copy',label:'Senhas copiadas',icon:Copy},
  {key:'download',label:'Downloads do QR',icon:Download},
  {key:'print',label:'Pedidos de impressão',icon:Printer},
] as const;
const number = (n:number) => n.toLocaleString('pt-BR');
const dayLabel = (s:string) => new Date(s+'T12:00:00Z').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',timeZone:'UTC'});

async function fetchAnalytics(signal?:AbortSignal) {
  const response = await fetch('/api/analytics',{cache:'no-store',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(15000)]):AbortSignal.timeout(15000)});
  const result = await response.json() as Data & {error?:string};
  if(!response.ok) throw new Error(result.error || 'Não foi possível carregar as estatísticas.');
  return result;
}

export default function Analytics() {
  const [data,setData] = useState<Data>({networks:[],events:[]});
  const [loading,setLoading] = useState(true), [error,setError] = useState('');
  const [period,setPeriod] = useState(30), [network,setNetwork] = useState('all');
  const load = useCallback((signal?:AbortSignal) => fetchAnalytics(signal)
    .then(result=>{if(!signal?.aborted)setData(result);})
    .catch(e=>{if(!signal?.aborted)setError(e instanceof DOMException?'A requisição demorou demais. Tente novamente.':(e as Error).message);})
    .finally(()=>{if(!signal?.aborted)setLoading(false);}),[]);
  function refresh() {
    setLoading(true);setError('');void load();
  }
  useEffect(()=>{const controller=new AbortController();void load(controller.signal);return ()=>controller.abort();},[load]);
  const days = Array.from({length:period},(_,i)=>{
    const date = new Date();date.setUTCDate(date.getUTCDate()-period+1+i);return date.toISOString().slice(0,10);
  });
  const events = data.events.filter(e=>e.day>=days[0] && (network==='all'||e.network_id===network));
  const total = (key:Event['event'],id?:string) => events.filter(e=>e.event===key&&(!id||e.network_id===id)).reduce((sum,e)=>sum+e.count,0);
  const chart = days.map(day=>({day,count:events.filter(e=>e.day===day&&e.event==='view').reduce((sum,e)=>sum+e.count,0)}));
  const max = Math.max(1,...chart.map(d=>d.count));
  const networks = data.networks.filter(n=>network==='all'||n.id===network).sort((a,b)=>total('view',b.id)-total('view',a.id));
  return <main className="analytics-page">
    <Link className="analytics-back" href="/"><ArrowLeft size={17}/>Voltar para minhas redes</Link>
    <header className="analytics-heading"><div><p className="eyebrow">ENTENDA SEU COMPARTILHAMENTO</p><h1><BarChart3 size={29}/>Estatísticas das redes</h1><p>Acompanhe como as pessoas usam suas páginas de Wi-Fi.</p></div><button className="button secondary" onClick={refresh} disabled={loading}><RefreshCw size={16}/>Atualizar</button></header>
    <div className="analytics-filters"><label>Período<select value={period} onChange={e=>setPeriod(Number(e.target.value))}><option value={7}>Últimos 7 dias</option><option value={30}>Últimos 30 dias</option></select></label><label>Rede<select value={network} onChange={e=>setNetwork(e.target.value)}><option value="all">Todas as minhas redes</option>{data.networks.map(n=><option key={n.id} value={n.id}>{n.ssid}{n.place?' · '+n.place:''}</option>)}</select></label></div>
    {error?<div className="analytics-state" role="alert"><p>{error}</p><button className="button secondary" onClick={refresh}>Tentar novamente</button></div>:loading?<div className="analytics-state" role="status"><span className="spinner"/>Carregando estatísticas…</div>:<>
      <section className="analytics-metrics" aria-label="Resumo do período">{metrics.map(m=><article key={m.key}><m.icon size={21}/><strong>{number(total(m.key))}</strong><h2>{m.label}</h2></article>)}</section>
      <section className="analytics-chart"><h2>Visualizações por dia</h2><p>De {dayLabel(days[0])} a {dayLabel(days[days.length-1])} · horário UTC</p>
        {total('view')===0&&<p className="analytics-no-activity">Ainda não há visualizações neste período. Compartilhe o link de uma rede para começar.</p>}
        <div className="analytics-bars" role="img" aria-label={chart.map(d=>`${dayLabel(d.day)}: ${number(d.count)} visualizações`).join('; ')}>{chart.map(d=><div key={d.day} title={`${dayLabel(d.day)}: ${number(d.count)} visualizações`}><span style={{height:`${d.count/max*100}%`}}/></div>)}</div><div className="analytics-axis"><span>{dayLabel(days[0])}</span><span>{dayLabel(days[Math.floor(period/2)])}</span><span>{dayLabel(days[period-1])}</span></div>
        <details className="analytics-daily"><summary>Ver valores por dia</summary><div>{chart.map(d=><p key={d.day}><span>{dayLabel(d.day)}</span><strong>{number(d.count)}</strong></p>)}</div></details>
      </section>
      <section className="analytics-networks"><h2>Resultados por rede</h2>{!networks.length?<div className="analytics-state"><p>Você ainda não cadastrou redes.</p><Link className="button primary" href="/">Cadastrar minha primeira rede</Link></div>:<div className="analytics-table-wrap"><table><caption className="sr-only">Ações por rede no período selecionado</caption><thead><tr><th scope="col">Rede</th>{metrics.map(m=><th scope="col" key={m.key}>{m.label}</th>)}<th scope="col">Página</th></tr></thead><tbody>{networks.map(n=><tr key={n.id}><th scope="row">{n.ssid}<small>{n.place||'Local não informado'}</small></th>{metrics.map(m=><td key={m.key}>{number(total(m.key,n.id))}</td>)}<td><a href={'/r/'+n.id} target="_blank" rel="noreferrer">Visualizar<span className="sr-only"> {n.ssid}</span> ↗</a></td></tr>)}</tbody></table></div>}</section>
    </>}
    <aside className="notice analytics-note"><p><strong>O que esses números representam?</strong>Cada ação é contada uma vez por rede, aba e dia (UTC), evitando duplicações ao atualizar a página. Visitas do proprietário autenticado não são contadas. Impressões registram a abertura do diálogo, mesmo se cancelado. A coleta começa após a ativação das estatísticas; não há dados retroativos. Estes números são estimativas de uso da página, não de pessoas únicas ou conexões ao Wi-Fi. Leituras de QR Codes impressos não podem ser medidas pelo site. Não armazenamos IP, e-mail ou senha nos eventos.</p></aside>
  </main>;
}
