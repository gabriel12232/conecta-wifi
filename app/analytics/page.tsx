import {requireChatGPTUser} from '../chatgpt-auth';
import Analytics from './panel';
export const dynamic = 'force-dynamic';
export default async function AnalyticsPage() {
  await requireChatGPTUser('/analytics');
  return <Analytics/>;
}
