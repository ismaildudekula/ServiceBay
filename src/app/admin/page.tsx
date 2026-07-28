import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar user={user} role="ADMIN" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 flex justify-between items-end border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">System Administration</h1>
            <p className="text-zinc-400 mt-2">Global overview of all registered users and providers.</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-950 text-xs uppercase font-semibold text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-5 tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-5 tracking-wider">Full Name</th>
                  <th scope="col" className="px-6 py-5 tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-5 tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {profiles?.map((profile) => (
                  <tr key={profile.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                      {profile.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-200">
                      {profile.full_name || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        profile.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        profile.role === 'PROVIDER' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}>
                        {profile.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!profiles || profiles.length === 0) && (
              <div className="p-8 text-center text-zinc-500">
                No users found.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
