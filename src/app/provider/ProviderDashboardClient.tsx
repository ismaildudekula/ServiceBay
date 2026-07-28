"use client"

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'

interface Booking {
  id: string
  service?: { title: string }
  user?: { full_name: string }
  status: string
  booking_date: string
  start_time: string
  end_time: string
}

interface Service {
  id: string
  title: string
  description?: string
  price: number
  duration_minutes: number
}

interface Schedule {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export default function ProviderDashboardClient({ 
  initialBookings, 
  initialServices, 
  initialSchedules, 
  providerId, 
  providerProfile 
}: { 
  initialBookings: Booking[], 
  initialServices: Service[], 
  initialSchedules: Schedule[], 
  providerId: string, 
  providerProfile: { full_name?: string, bio?: string } 
}) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'services' | 'schedule' | 'profile'>('dashboard')
  const [services, setServices] = useState<Service[]>(initialServices)
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules)
  const supabase = createClient()

  // Service State
  const [newService, setNewService] = useState({ title: '', description: '', price: 0, duration_minutes: 30 })
  
  // Schedule State
  const [newSchedule, setNewSchedule] = useState({ day_of_week: 1, start_time: '09:00', end_time: '17:00' })

  // Profile State
  const [profileData, setProfileData] = useState({ full_name: providerProfile?.full_name || '', bio: providerProfile?.bio || '' })

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data } = await supabase.from('services').insert({
      provider_id: providerId,
      ...newService
    }).select()
    if (data) setServices([data[0], ...services])
    setNewService({ title: '', description: '', price: 0, duration_minutes: 30 })
  }

  const handleDeleteService = async (id: string) => {
    await supabase.from('services').delete().eq('id', id)
    setServices(services.filter((s) => s.id !== id))
  }

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data } = await supabase.from('schedules').upsert({
      provider_id: providerId,
      ...newSchedule
    }, { onConflict: 'provider_id,day_of_week' }).select()
    
    if (data) {
      const { data: refreshed } = await supabase.from('schedules').select('*').eq('provider_id', providerId).order('day_of_week', { ascending: true })
      setSchedules(refreshed || [])
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    await supabase.from('schedules').delete().eq('id', id)
    setSchedules(schedules.filter((s) => s.id !== id))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('profiles').update(profileData).eq('id', providerId)
    alert('Profile Updated Successfully')
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard' },
    { id: 'services' as const, label: 'Services' },
    { id: 'schedule' as const, label: 'Schedule' },
    { id: 'profile' as const, label: 'Profile' },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[70vh]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <nav className="flex flex-col space-y-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sticky top-24">
          <div className="pb-4 mb-2 border-b border-zinc-800 px-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Provider Menu</h2>
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-between ${
                activeTab === tab.id 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-transparent'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTabIndicator" className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h2 className="text-2xl font-semibold text-zinc-100">Upcoming Bookings</h2>
                <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm font-medium border border-zinc-700">{initialBookings.length} Total</span>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {initialBookings.map((booking) => (
                  <div key={booking.id} className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6 hover:border-zinc-700 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-xl text-zinc-100">{booking.service?.title}</h3>
                        <p className="text-sm text-zinc-400 mt-1">Client: <span className="text-zinc-300">{booking.user?.full_name}</span></p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-wide">
                        {booking.status}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center">
                        <span className="text-xs text-zinc-500 uppercase font-semibold mb-1">Date</span>
                        <span className="text-zinc-200 font-medium">{booking.booking_date}</span>
                      </div>
                      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center">
                        <span className="text-xs text-zinc-500 uppercase font-semibold mb-1">Time</span>
                        <span className="text-zinc-200 font-medium">{booking.start_time} - {booking.end_time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {initialBookings.length === 0 && (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-700 rounded-2xl">
                    <p className="text-lg">No upcoming bookings found.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="border-b border-zinc-800 pb-4 flex justify-between items-end">
                <h2 className="text-2xl font-semibold text-zinc-100">Manage Services</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-zinc-200 mb-6">Create New Service</h3>
                    <form onSubmit={handleAddService} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Title</label>
                        <input required type="text" className="w-full border border-zinc-700 rounded-xl p-3 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                        <textarea rows={3} className="w-full border border-zinc-700 rounded-xl p-3 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Price ($)</label>
                          <input required type="number" min="0" className="w-full border border-zinc-700 rounded-xl p-3 bg-zinc-900 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" value={newService.price} onChange={e => setNewService({...newService, price: Number(e.target.value)})} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Duration (m)</label>
                          <input required type="number" step="15" min="15" className="w-full border border-zinc-700 rounded-xl p-3 bg-zinc-900 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" value={newService.duration_minutes} onChange={e => setNewService({...newService, duration_minutes: Number(e.target.value)})} />
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-indigo-500 text-white font-medium rounded-xl py-3 hover:bg-indigo-400 transition-colors mt-2">
                        Create Service
                      </motion.button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-8 space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-zinc-700 transition-colors">
                      <div>
                        <h4 className="font-semibold text-lg text-zinc-100">{service.title}</h4>
                        <p className="text-zinc-400 text-sm mt-1">{service.description}</p>
                        <div className="mt-3 flex gap-3 text-sm">
                          <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 font-medium">${service.price}</span>
                          <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 font-medium">{service.duration_minutes} mins</span>
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDeleteService(service.id)} className="shrink-0 bg-red-500/10 text-red-400 border border-red-500/20 font-medium rounded-xl px-4 py-2 hover:bg-red-500 hover:text-white transition-colors">
                        Delete
                      </motion.button>
                    </div>
                  ))}
                  {services.length === 0 && (
                     <div className="py-16 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-700 rounded-2xl">
                      <p>No services added yet.</p>
                     </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
               <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-2xl font-semibold text-zinc-100">Working Hours</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-zinc-200 mb-6">Add Availability</h3>
                    <form onSubmit={handleAddSchedule} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Day of Week</label>
                        <select className="w-full border border-zinc-700 rounded-xl p-3 bg-zinc-900 text-white focus:outline-none focus:border-indigo-500 transition-all" value={newSchedule.day_of_week} onChange={e => setNewSchedule({...newSchedule, day_of_week: Number(e.target.value)})}>
                          {days.map((day, idx) => (
                            <option key={day} value={idx}>{day}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Start Time</label>
                          <input required type="time" className="w-full border border-zinc-700 rounded-xl p-3 bg-zinc-900 text-white focus:outline-none focus:border-indigo-500 transition-all" value={newSchedule.start_time} onChange={e => setNewSchedule({...newSchedule, start_time: e.target.value})} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">End Time</label>
                          <input required type="time" className="w-full border border-zinc-700 rounded-xl p-3 bg-zinc-900 text-white focus:outline-none focus:border-indigo-500 transition-all" value={newSchedule.end_time} onChange={e => setNewSchedule({...newSchedule, end_time: e.target.value})} />
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-indigo-500 text-white font-medium rounded-xl py-3 hover:bg-indigo-400 transition-colors mt-2">
                        Save Schedule
                      </motion.button>
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-8 space-y-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center hover:border-zinc-700 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="w-32">
                          <h4 className="font-semibold text-lg text-zinc-200">{days[schedule.day_of_week]}</h4>
                        </div>
                        <div className="text-sm font-medium bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-300">
                          {schedule.start_time} - {schedule.end_time}
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteSchedule(schedule.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                        ✕
                      </motion.button>
                    </div>
                  ))}
                  {schedules.length === 0 && (
                     <div className="py-16 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-700 rounded-2xl">
                      <p>No working hours set.</p>
                     </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl">
               <div className="border-b border-zinc-800 pb-4 mb-8">
                <h2 className="text-2xl font-semibold text-zinc-100">Public Profile</h2>
                <p className="text-zinc-400 mt-2">Manage how your clients see you on the platform.</p>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Display Name</label>
                  <input required type="text" className="w-full border border-zinc-700 rounded-xl p-4 bg-zinc-950 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" value={profileData.full_name} onChange={e => setProfileData({...profileData, full_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Bio & Specialization</label>
                  <textarea rows={5} className="w-full border border-zinc-700 rounded-xl p-4 bg-zinc-950 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none" value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="bg-emerald-500 text-white font-medium rounded-xl px-8 py-3 hover:bg-emerald-400 transition-colors">
                  Save Changes
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
