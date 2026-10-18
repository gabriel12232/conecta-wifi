'use client';

// Identificador aleatório por aba. Não envia IP, e-mail, SSID ou senha.
let fallbackSession: string | undefined;
export function track(networkId: string, event: 'view'|'copy'|'download'|'print') {
  try {
    let sessionId: string;
    try {
      sessionId = sessionStorage.getItem('conecta-analytics-session') || crypto.randomUUID();
      sessionStorage.setItem('conecta-analytics-session',sessionId);
    } catch { sessionId = fallbackSession ||= crypto.randomUUID(); }
    void fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({networkId,sessionId,event}),keepalive:true}).catch(()=>{});
  } catch { /* Estatísticas nunca bloqueiam o compartilhamento. */ }
}
