'use client';
import {useEffect,useRef,useState} from 'react';
import QRCode from 'qrcode';
import {wifiPayload,type Network} from './wifi';
export default function QR({network,large=false}:{network:Network;large?:boolean}) {
 const canvas=useRef<HTMLCanvasElement>(null); const [error,setError]=useState(false);
 useEffect(()=>{if(canvas.current) QRCode.toCanvas(canvas.current,wifiPayload(network),{width:large?600:240,margin:4,errorCorrectionLevel:'M',color:{dark:'#123d32',light:'#ffffff'}}).catch(()=>setError(true));},[network,large]);
 return error?<p role="alert">Não foi possível gerar o código.</p>:<canvas width={large?600:240} height={large?600:240} ref={canvas} className={large?'qr large':'qr'} role="img" aria-label={'QR Code de conexão à rede '+network.ssid}/>;
}
export async function downloadQR(network:Network) {
 const url=await QRCode.toDataURL(wifiPayload(network),{width:1200,margin:4,errorCorrectionLevel:'M'});
 const a=document.createElement('a');a.href=url;a.download='wifi-'+network.ssid.replace(/[^a-z0-9]/gi,'-')+'.png';a.click();
}
