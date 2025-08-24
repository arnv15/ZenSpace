import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cztbrifwkbfsbmlsgipu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dGJyaWZ3a2Jmc2JtbHNnaXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5OTkzMTQsImV4cCI6MjA3MTU3NTMxNH0.I4MRzjD4E_6rasd60vF65MDGi0LtnWWHvPuWI1PLmqQ";

export const supabase = createClient(supabaseUrl, supabaseKey)