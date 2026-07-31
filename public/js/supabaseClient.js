// Cliente de Supabase compartido por todas las páginas del panel.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://amhmlutednkmckagmjfd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Kka_XD6km4Eeh6471rNP2g_X_h0_dEi';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
