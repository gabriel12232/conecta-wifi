import {requireChatGPTUser} from '../chatgpt-auth';
import Settings from './settings';
export const dynamic='force-dynamic';
export default async function AccountPage(){
  const user=await requireChatGPTUser('/conta');
  return <Settings email={user.email} name={user.displayName===user.email?'':user.displayName}/>;
}
