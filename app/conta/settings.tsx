'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {ArrowLeft,SunMoon,LogOut} from 'lucide-react';
import {useTheme} from 'next-themes';
import '../account.css';

export default function Settings({email,name}:{email:string;name:string}){
  const router=useRouter();
  const [value,setValue]=useState(name),[busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState(false);
  const {resolvedTheme,setTheme}=useTheme();
  async function save(event:React.FormEvent){
    event.preventDefault();setBusy(true);setError('');setSuccess(false);
    try{
      const response=await fetch('/api/account',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:value}),signal:AbortSignal.timeout(15000)});
      const result=await response.json() as {error?:string};
      if(!response.ok)throw new Error(result.error||'Não foi possível salvar.');
      setSuccess(true);
      router.refresh();
    }catch(e){setError(e instanceof DOMException?'O serviço demorou a responder. Tente novamente.':(e as Error).message);}finally{setBusy(false);}
  }
  return <main className="account-settings"><Link className="settings-back" href="/"><ArrowLeft size={17}/>Voltar para minhas redes</Link><h1>Configurações da conta</h1><p>Atualize seu nome e escolha a aparência do Conecta.</p>
    <form className="account-settings-card" onSubmit={save}><h2>Meu perfil</h2><label>Nome de exibição<input value={value} onChange={e=>setValue(e.target.value)} required maxLength={80} autoComplete="name" placeholder="Como você quer ser chamado?"/><small>Este nome aparece no menu da sua conta.</small></label><label>E-mail<input value={email} readOnly type="email"/><small>E-mail utilizado para entrar na conta.</small></label>{error&&<p className="error" role="alert">{error}</p>}{success&&<p className="success" role="status">Nome atualizado com sucesso.</p>}<button className="button primary" disabled={busy}>{busy?'Salvando…':'Salvar alterações'}</button></form>
    <section className="account-settings-card"><h2>Aparência</h2><p className="modal-description">Sua escolha de tema fica salva neste navegador.</p><button className="button secondary" onClick={()=>setTheme(resolvedTheme==='dark'?'light':'dark')}><SunMoon size={18}/>Alternar entre claro e escuro</button></section>
    <section className="account-settings-card"><h2>Sessão</h2><Link className="button secondary" href="/auth/sair"><LogOut size={18}/>Sair da conta</Link></section>
  </main>;
}
