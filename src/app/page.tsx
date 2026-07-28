import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col selection:bg-indigo-500/30">
      <Navbar user={user} />
      
      <main className="flex-grow flex items-center relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 py-20 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm text-sm font-medium text-indigo-400">
            Now in Public Beta
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            Discover & Book <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Premium Local Services</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with top-rated clinics and service providers in your area. Experience seamless scheduling and unparalleled quality, all in one sleek platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href={user ? "/dashboard" : "/auth"} 
              className="px-8 py-4 bg-indigo-500 text-white font-medium rounded-full text-lg hover:bg-indigo-400 transition-colors w-full sm:w-auto text-center"
            >
              {user ? 'Go to Dashboard' : 'Get Started Now'}
            </Link>
            <Link 
              href="/auth" 
              className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium rounded-full text-lg hover:bg-zinc-800 hover:text-white transition-colors w-full sm:w-auto text-center"
            >
              Join as a Provider
            </Link>
          </div>

          <div className="mt-20 pt-10 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 text-xl font-bold border border-indigo-500/20">1</div>
              <h3 className="text-xl font-semibold text-zinc-200 mb-2">Find a Service</h3>
              <p className="text-zinc-400">Browse through our curated list of professional services and clinics.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4 text-xl font-bold border border-purple-500/20">2</div>
              <h3 className="text-xl font-semibold text-zinc-200 mb-2">Book Instantly</h3>
              <p className="text-zinc-400">Select a convenient time slot from real-time provider availability.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 text-xl font-bold border border-emerald-500/20">3</div>
              <h3 className="text-xl font-semibold text-zinc-200 mb-2">Get Served</h3>
              <p className="text-zinc-400">Show up to your appointment and experience top-tier service.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
