import {findNetwork} from '../../storage';
import {notFound} from 'next/navigation';
import SharePage from '../../share';
export const dynamic='force-dynamic';
export default async function PublicPage({params}:{params:Promise<{id:string}>}){const {id}=await params; const network=await findNetwork(id);if(!network)notFound();return <SharePage network={network}/>;}
