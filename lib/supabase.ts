import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dylqvqakzmrkuhfjvqdv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5bHF2cWFrem1ya3VoZmp2cWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzY0NjIsImV4cCI6MjA5NjMxMjQ2Mn0.Wr41eRMGyhiT_YFUjzKX9RJWhSYQRrfdSiFHxJHOM_M";

export const supabase = createClient(supabaseUrl, supabaseKey);