import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import ProviderDashboardClient from './ProviderDashboardClient'
import { redirect } from 'next/navigation'

export default async function ProviderDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  // Fetch Provider's upcoming bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, user:profiles!user_id(full_name), service:services(title)')
    .eq('provider_id', user.id)
    .gte('booking_date', new Date().toISOString().split('T')[0])
    .order('booking_date', { ascending: true })

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false })

  const { data: schedules } = await supabase
    .from('schedules')
    .select('*')
    .eq('provider_id', user.id)
    .order('day_of_week', { ascending: true })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar user={user} role="PROVIDER" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Provider Portal</h1>
          <p className="text-zinc-400 mt-2">Manage your bookings, services, and availability.</p>
        </div>
        
        <ProviderDashboardClient 
          initialBookings={bookings || []} 
          initialServices={services || []} 
          initialSchedules={schedules || []}
          providerId={user.id}
          providerProfile={profile || {}}
        />
      </div>
    </div>
  )
}
