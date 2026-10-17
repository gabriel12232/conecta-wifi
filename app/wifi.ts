export type Network = {id:string; ssid:string; place:string; security:string; hidden:boolean; password:string; created:string; updated:string};
export function escapeWifi(value:string) { return value.replace(/([\\;,:" ])/g, (c) => c === ' ' ? c : '\\' + c); }
export function wifiPayload(n: Pick<Network,'ssid'|'password'|'security'|'hidden'>) {
  return `WIFI:T:${n.security};S:${escapeWifi(n.ssid)};P:${n.security === 'nopass' ? '' : escapeWifi(n.password)};H:${n.hidden};;`;
}
export function validateNetwork(v:any) {
  if (!v || typeof v.ssid !== 'string' || !v.ssid.trim() || new TextEncoder().encode(v.ssid).length > 32 || /[\x00-\x1f]/.test(v.ssid)) throw new Error('Informe um nome de rede válido, com até 32 bytes.');
  if (!['WPA','WEP','nopass'].includes(v.security)) throw new Error('Selecione o tipo de segurança.');
  if (typeof v.password !== 'string' || v.password.length > 128 || /[\x00-\x1f]/.test(v.password)) throw new Error('Senha inválida.');
  if (v.security === 'WPA' && !((v.password.length >= 8 && new TextEncoder().encode(v.password).length <= 63) || /^[a-fA-F0-9]{64}$/.test(v.password))) throw new Error('Para WPA, use de 8 a 63 bytes ou uma chave hexadecimal de 64 caracteres.');
  if (v.security === 'WEP' && !([5,13].includes(new TextEncoder().encode(v.password).length) || /^(?:[a-fA-F0-9]{10}|[a-fA-F0-9]{26})$/.test(v.password))) throw new Error('Para WEP, use 5 ou 13 bytes, ou 10 ou 26 dígitos hexadecimais.');
  if (typeof v.place !== 'string' || v.place.length > 100 || typeof v.hidden !== 'boolean') throw new Error('Verifique os dados do local.');
  return {ssid:v.ssid, password:v.security === 'nopass' ? '' : v.password, place:v.place.trim(), security:v.security, hidden:v.hidden};
}
