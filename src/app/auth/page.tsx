"use client"

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          router.push('/')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 z-10"
      >
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-black">SB</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Welcome back</h1>
          <p className="text-zinc-400 mt-2 text-sm">Sign in or create a new account to continue</p>
        </div>
        
        <div className="bg-zinc-950 rounded-2xl p-6 border border-zinc-800">
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#6366f1',
                    brandAccent: '#818cf8',
                    defaultButtonBackground: '#18181b',
                    defaultButtonBackgroundHover: '#27272a',
                    defaultButtonBorder: '#27272a',
                    inputBackground: '#18181b',
                    inputBorder: '#27272a',
                    inputBorderFocus: '#6366f1',
                    inputBorderHover: '#3f3f46',
                    inputText: '#fafafa',
                    messageText: '#a1a1aa',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '12px',
                    buttonBorderRadius: '12px',
                    inputBorderRadius: '12px',
                  },
                  space: {
                    inputPadding: '12px',
                    buttonPadding: '12px',
                  }
                }
              }
            }}
            providers={[]}
          />
        </div>
      </motion.div>
    </div>
  )
}
