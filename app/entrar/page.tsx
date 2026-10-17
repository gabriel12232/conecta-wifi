import LoginForm from './form';
import {authConfigured} from '../../lib/supabase/server';
import {getChatGPTUser} from '../chatgpt-auth';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Login(){if(await getChatGPTUser())redirect('/');return <LoginForm configured={authConfigured()}/>;}
