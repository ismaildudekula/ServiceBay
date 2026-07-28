"use client"

import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Navbar({ user, role }: { user: { id: string; email?: string } | null, role?: string }) {
  const supabase = createClient()
  const router = useRouter()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [displayTitle, setDisplayTitle] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      // Fetch the display name to show in the navbar directly if possible
      supabase.from('profiles').select('full_name').eq('id', user.id).single()
        .then(({ data }) => {
          if (data && data.full_name) {
            setDisplayTitle(data.full_name)
            setFullName(data.full_name)
          }
        })
    }
  }, [user, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const openModal = async () => {
    if (!user) return
    setIsModalOpen(true)
    setLoading(true)
    const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    if (data) {
      setFullName(data.full_name || '')
    }
    setLoading(false)
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
    setDisplayTitle(fullName || user.email || '')
    setSaving(false)
    setIsModalOpen(false)
  }

  return (
    <>
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-sm">SB</span>
                </div>
                ServiceBay
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  <div 
                    onClick={openModal}
                    className="flex items-center gap-3 cursor-pointer hover:bg-zinc-800/60 p-2 pr-4 rounded-full transition-colors border border-transparent hover:border-zinc-700"
                  >
                    <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                      <span className="text-zinc-400 font-bold">{displayTitle?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex flex-col text-left hidden sm:flex">
                      <span className="text-xs text-indigo-400 font-bold tracking-wider uppercase">{role || 'USER'}</span>
                      <span className="text-sm font-semibold text-zinc-200 truncate max-w-[150px]">{displayTitle}</span>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 font-medium hover:bg-zinc-800 hover:text-white transition-colors text-sm"
                  >
                    Sign Out
                  </motion.button>
                </>
              ) : (
                <Link 
                  href="/auth"
                  className="px-6 py-2 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-400 transition-colors text-sm"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 mx-auto flex items-center justify-center mb-4 text-2xl font-bold text-zinc-400">
                  {displayTitle?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                <p className="text-zinc-400 text-sm mt-1">Update your display name</p>
              </div>

              <form onSubmit={saveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Display Name</label>
                  <input 
                    type="text" 
                    className="w-full border border-zinc-700 rounded-xl p-3 bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    placeholder="Enter your name"
                    disabled={loading}
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }} 
                  type="submit" 
                  disabled={loading || saving}
                  className="w-full bg-indigo-500 text-white font-medium rounded-xl py-3 hover:bg-indigo-400 transition-colors mt-2 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
