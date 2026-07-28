import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import BookingForm from '@/components/BookingForm'
import { notFound } from 'next/navigation'

export default async function ProviderProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: provider } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .eq('role', 'PROVIDER')
    .single()

  if (!provider) notFound()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', params.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const { data: schedules } = await supabase
    .from('schedules')
    .select('*')
    .eq('provider_id', params.id)

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar user={user} role={user ? "USER" : undefined} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 mb-6 flex items-center justify-center text-3xl font-bold text-white shadow-inner">
                {provider.full_name?.charAt(0) || 'P'}
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">{provider.full_name || 'Unnamed Provider'}</h1>
              <p className="text-zinc-400 leading-relaxed text-sm mb-6">{provider.bio || 'This provider has not added a bio yet.'}</p>
              
              <div className="border-t border-zinc-800 pt-6">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">Availability</h3>
                <div className="space-y-3 text-sm">
                  {schedules && schedules.length > 0 ? schedules.map((sch) => (
                    <div key={sch.id} className="flex justify-between items-center text-zinc-400">
                      <span className="font-medium text-zinc-300">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][sch.day_of_week]}</span>
                      <span className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1">{sch.start_time} - {sch.end_time}</span>
                    </div>
                  )) : (
                    <p className="text-zinc-500 italic">No schedule posted.</p>
                  )}
                </div>
              </div>
            </div>

            {services && services.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-zinc-200">Offered Services</h2>
                {services.map((service) => (
                  <div key={service.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="font-semibold text-lg text-white mb-2">{service.title}</h3>
                    <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{service.description}</p>
                    <div className="flex gap-2">
                      <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full">${service.price}</span>
                      <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold px-3 py-1 rounded-full">{service.duration_minutes} mins</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-7">
            <div className="sticky top-24">
              <BookingForm 
                providerId={params.id} 
                services={services || []} 
                user={user}
              />
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}
