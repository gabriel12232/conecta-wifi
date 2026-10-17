import {NextResponse} from 'next/server';
export function middleware(){const response=NextResponse.next();response.headers.set('Cache-Control','no-store, private');response.headers.set('X-Robots-Tag','noindex, nofollow, noarchive');response.headers.set('Referrer-Policy','no-referrer');response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');return response;}
export const config={matcher:['/','/r/:path*','/api/:path*']};
