import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://tlcekvvipnmivoflzjbh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsY2VrdnZpcG5taXZvZmx6amJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMDI2MDQsImV4cCI6MjA5Mjg3ODYwNH0.V7sFCwUJFlytIUNjfJDYMmdnCsnUjxPqZo_hr07Sqks'
)
