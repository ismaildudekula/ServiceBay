import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import UserDashboardClient from './UserDashboardClient'

export default async function UserDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch Services
  const { data: services } = await supabase
    .from('services')
    .select('*, provider:profiles(id, full_name, bio)')
    .eq('is_active', true)

  // Fetch User's upcoming bookings
  // CRITICAL FIX: Disambiguate provider relationship via !provider_id
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, provider:profiles!provider_id(full_name), service:services(title)')
    .eq('user_id', user.id)
    .gte('booking_date', new Date().toISOString().split('T')[0])
    .order('booking_date', { ascending: true })



  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar user={user} role="USER" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Client Portal</h1>
          <p className="text-zinc-400 mt-2">Explore available services and track your upcoming appointments.</p>
        </div>
        
        <UserDashboardClient 
          initialBookings={bookings || []} 
          initialServices={services || []} 
        />
      </div>
    </div>
  )
}
