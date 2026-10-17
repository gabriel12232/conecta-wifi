import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {PNG} from 'pngjs';
const source=ts.transpile(fs.readFileSync('app/wifi.ts','utf8'),{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022});
const {wifiPayload,validateNetwork}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const cases=[{ssid:'Cafe_Visitantes',password:'bemvindo123',security:'WPA',hidden:false},{ssid:'Café; Sala: "A", \\ Rede',password:'s;en:ha,"\\123',security:'WPA',hidden:true},{ssid:'Rede aberta',password:'',security:'nopass',hidden:false},{ssid:'Rede WEP',password:'abcde',security:'WEP',hidden:true}];
for(const value of cases){validateNetwork({...value,place:''});const payload=wifiPayload(value);const image=PNG.sync.read(await QRCode.toBuffer(payload,{width:1200,margin:4,errorCorrectionLevel:'M'}));const decoded=jsQR(new Uint8ClampedArray(image.data),image.width,image.height);assert.ok(decoded);assert.equal(decoded.data,payload);}
assert.equal(wifiPayload({ssid:'a;b:c,d"e\\f',password:'p;a:s,s"w\\d',security:'WPA',hidden:true}),'WIFI:T:WPA;S:a\\;b\\:c\\,d\\"e\\\\f;P:p\\;a\\:s\\,s\\"w\\\\d;H:true;;');
assert.throws(()=>validateNetwork({ssid:'a'.repeat(33),password:'12345678',security:'WPA',hidden:false,place:''}));
assert.throws(()=>validateNetwork({ssid:'Rede',password:'123',security:'WPA',hidden:false,place:''}));
console.log('PASS: 4 QR PNGs decoded, special-character payload verified, invalid credentials rejected.');
