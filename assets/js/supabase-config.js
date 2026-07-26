// Central place to configure the Supabase project used for the live
// "confidence rating" interactive moment. Anon key only — RLS on the
// confidence_ratings table restricts it to insert + select, nothing else.
window.SUPABASE_CONFIG = {
  url: "https://fgpsnxdvdtimzowgrbxk.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncHNueGR2ZHRpbXpvd2dyYnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMDAyMTUsImV4cCI6MjA5OTg3NjIxNX0.4EZEmvQj1VvbsalOESA8GBiPQOoip1HKpimhp8BIsl4",
  table: "confidence_ratings"
};
