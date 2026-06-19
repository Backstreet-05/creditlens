import { createClient } from "@/lib/supabase/server";
import PredictClient from "@/components/predict/PredictClient";

export const metadata = { title: "New Prediction" };

export default async function PredictPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <PredictClient userId={user?.id ?? null} />;
}
