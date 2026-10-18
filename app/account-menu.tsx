'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useTheme} from 'next-themes';
import {ChevronsUpDown,UserRound,SunMoon,LogOut} from 'lucide-react';
import './account.css';

export default function AccountMenu({user}:{user:{displayName:string;email:string}|null}) {
  const [open,setOpen]=useState(false);
  const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),first=useRef<HTMLAnchorElement>(null);
  const {resolvedTheme,setTheme}=useTheme();
  useEffect(()=>{
    if(!open)return;
    first.current?.focus();
    function outside(e:PointerEvent){if(!root.current?.contains(e.target as Node))setOpen(false);}
    function escape(e:KeyboardEvent){if(e.key==='Escape'){setOpen(false);trigger.current?.focus();}}
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[open]);
  if(!user)return <div className="account"><div className="avatar">V</div><div><strong>Visitante</strong><small>Entre para começar</small></div></div>;
  const name=user.displayName===user.email?'Minha conta':user.displayName;
  return <div className="account-menu" ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}}>
    {open&&<div className="account-popover" id="account-options" aria-label="Opções da conta">
      <div className="account-identity"><strong>{name}</strong><small>{user.email}</small></div>
      <Link ref={first} href="/conta"><UserRound size={18}/>Configurações da conta</Link>
      <button onClick={()=>{setTheme(resolvedTheme==='dark'?'light':'dark');setOpen(false);trigger.current?.focus();}}><SunMoon size={18}/>Alternar tema</button>
      <Link className="account-signout" href="/auth/sair"><LogOut size={18}/>Sair da conta</Link>
    </div>}
    <button className="account-trigger" ref={trigger} onClick={()=>setOpen(!open)} aria-label="Abrir opções da minha conta" aria-expanded={open} aria-controls={open?'account-options':undefined}>
      <span className="avatar">{name[0]?.toUpperCase()||'C'}</span><span className="account-trigger-text"><strong>{name}</strong><small>{user.email}</small></span><ChevronsUpDown size={16}/>
    </button>
  </div>;
}
