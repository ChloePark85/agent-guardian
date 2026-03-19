import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Profile {
  id: string
  email: string | null
  plan: string
  scans_used_this_month: number
  scan_limit: number
  lemonsqueezy_customer_id: string | null
  created_at: string
}

export interface Scan {
  id: string
  user_id: string
  skill_name: string
  source: string | null
  risk_score: number
  risk_level: 'SAFE' | 'CAUTION' | 'DANGEROUS'
  findings_count: number
  findings: Finding[]
  urls: { url: string; is_safe: boolean }[]
  files_scanned: number
  lines_scanned: number
  framework: string | null
  scan_duration_ms: number
  created_at: string
}

export interface Finding {
  file_path: string
  line_number: number
  pattern_name: string
  category: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  weight: number
  description: string
  code_snippet: string
}
