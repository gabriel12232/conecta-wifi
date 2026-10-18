import {getChatGPTUser} from '../../chatgpt-auth';
import {db} from '../../storage';

export const dynamic = 'force-dynamic';
const json = (data: unknown, status = 200) => Response.json(data, {status, headers: {'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return json({error:'Entre para consultar suas estatísticas.'},401);
  try {
    const client = db();
    const [networks, events] = await Promise.all([
      client.from('networks').select('id,ssid,place').eq('owner',user.userId).order('created',{ascending:false}),
      client.rpc('network_analytics',{p_owner:user.userId}),
    ]);
    if (networks.error || events.error) throw new Error('Database unavailable');
    return json({networks:networks.data, events:events.data});
  } catch {
    return json({error:'Não foi possível carregar as estatísticas. Se esta é a primeira configuração, execute a migração 0002_analytics.sql no Supabase.'},503);
  }
}

export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return json({error:'Origem não permitida.'},403);
  try {
    if (Number(request.headers.get('content-length') || 0) > 512) return json({error:'Dados inválidos.'},400);
    const raw = await request.text();
    if (raw.length > 512) return json({error:'Dados inválidos.'},400);
    const {networkId,sessionId,event} = JSON.parse(raw);
    if (typeof networkId !== 'string' || !/^[a-f0-9]{48}$/.test(networkId) || typeof sessionId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(sessionId) || !['view','copy','download','print'].includes(event)) return json({error:'Dados inválidos.'},400);
    const client = db();
    const {data:network,error} = await client.from('networks').select('owner').eq('id',networkId).maybeSingle();
    if(error) return json({error:'Estatísticas indisponíveis.'},503);
    if(!network) return json({error:'Rede não encontrada.'},404);
    const user = await getChatGPTUser();
    if(user?.userId === network.owner) return json({ok:true});
    const result = await client.from('network_events').upsert({network_id:networkId,session_id:sessionId,event},{onConflict:'network_id,session_id,event,day',ignoreDuplicates:true});
    if(result.error) return json({error:'Estatísticas indisponíveis.'},503);
    return json({ok:true});
  } catch {
    return json({error:'Não foi possível registrar a ação.'},400);
  }
}
