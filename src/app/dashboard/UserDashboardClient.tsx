"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Booking {
  id: string
  service?: { title: string }
  provider?: { full_name: string }
  status: string
  booking_date: string
  start_time: string
}

interface Service {
  id: string
  title: string
  description?: string
  price: number
  duration_minutes: number
  provider_id: string
  provider?: { full_name: string }
}

export default function UserDashboardClient({ 
  initialBookings, 
  initialServices 
}: { 
  initialBookings: Booking[], 
  initialServices: Service[] 
}) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'services'>('bookings')
  
  const tabs = [
    { id: 'bookings' as const, label: 'My Bookings' },
    { id: 'services' as const, label: 'Available Services' },
  ]

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[70vh]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <nav className="flex flex-col space-y-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sticky top-24">
          <div className="pb-4 mb-2 border-b border-zinc-800 px-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Client Menu</h2>
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center justify-between ${
                activeTab === tab.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-transparent'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="clientActiveTabIndicator" className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          
          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h2 className="text-2xl font-semibold text-zinc-100">Your Upcoming Appointments</h2>
                <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm font-medium border border-zinc-700">{initialBookings.length} Total</span>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {initialBookings.map((booking) => (
                  <div key={booking.id} className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6 hover:border-zinc-700 transition-colors relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-xl text-zinc-100">{booking.service?.title || 'Unknown Service'}</h3>
                        <p className="text-sm text-zinc-400 mt-1">Provider: <span className="text-zinc-300">{booking.provider?.full_name || 'Unknown Provider'}</span></p>
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
                        <span className="text-zinc-200 font-medium">{booking.start_time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {initialBookings.length === 0 && (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-700 rounded-2xl">
                    <p className="text-lg">You have no upcoming bookings.</p>
                    <button onClick={() => setActiveTab('services')} className="mt-4 text-emerald-400 hover:text-emerald-300 font-medium">Browse Services →</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-2xl font-semibold text-zinc-100">Available Services</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {initialServices.map((service) => (
                  <div key={service.id} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <div>
                      <h3 className="text-xl font-semibold text-zinc-100 mb-1">{service.title}</h3>
                      <p className="text-sm font-medium text-indigo-400 mb-4">By {service.provider?.full_name || 'Unnamed Provider'}</p>
                      <p className="text-zinc-400 mb-6 text-sm leading-relaxed">{service.description || 'No description available.'}</p>
                      <div className="flex gap-2 text-sm font-semibold mb-8">
                        <span className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-full px-4 py-1.5">${service.price}</span>
                        <span className="bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-full px-4 py-1.5">{service.duration_minutes} min</span>
                      </div>
                    </div>
                    <Link 
                      href={`/provider/${service.provider_id}`}
                      className="block w-full text-center px-4 py-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium hover:bg-indigo-500 hover:text-white transition-colors"
                    >
                      View & Book
                    </Link>
                  </div>
                ))}
                {initialServices.length === 0 && (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/50">
                    <p className="font-medium">No services available at the moment.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}
