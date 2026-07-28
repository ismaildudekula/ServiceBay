"use client"

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function BookingForm({ providerId, services, schedules, user }: any) {
  const supabase = createClient()
  const router = useRouter()
  const [selectedService, setSelectedService] = useState('')
  const [date, setDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingSlots, setFetchingSlots] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFetchSlots = async () => {
    if (!selectedService || !date) return
    
    setFetchingSlots(true)
    setError('')
    setSuccess('')
    setSelectedSlot('')
    
    try {
      const response = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          serviceId: selectedService,
          date
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setAvailableSlots(data.slots || [])
      if (data.slots?.length === 0) setError('No available slots for this date.')
    } catch (err: any) {
      setError(err.message || 'Failed to fetch slots')
    } finally {
      setFetchingSlots(false)
    }
  }

  const handleBook = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (!selectedService || !date || !selectedSlot) return

    setLoading(true)
    setError('')
    try {
      const service = services.find((s: any) => s.id === selectedService)
      const duration = service.duration_minutes
      
      const [hours, minutes] = selectedSlot.split(':')
      const end = new Date(new Date(`2000-01-01T${selectedSlot}:00`).getTime() + duration * 60000)
      const endTimeString = end.toTimeString().substring(0, 5)

      const { error: bookingError } = await supabase.from('bookings').insert({
        user_id: user.id,
        provider_id: providerId,
        service_id: selectedService,
        booking_date: date,
        start_time: selectedSlot,
        end_time: endTimeString,
        status: 'CONFIRMED'
      })

      if (bookingError) throw bookingError
      
      setSuccess('Booking confirmed successfully!')
      setAvailableSlots([])
      setSelectedService('')
      setDate('')
      setSelectedSlot('')
    } catch (err: any) {
      setError(err.message || 'Failed to complete booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
        <h2 className="text-2xl font-bold text-white tracking-tight">Book Appointment</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Select Service</label>
          <select 
            className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl p-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <option value="">-- Choose a service --</option>
            {services.map((s: any) => (
              <option key={s.id} value={s.id}>{s.title} ({s.duration_minutes} min)</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Select Date</label>
          <input 
            type="date" 
            className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl p-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFetchSlots}
          disabled={!selectedService || !date || fetchingSlots}
          className="w-full bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium rounded-xl p-4 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {fetchingSlots ? 'Finding Slots...' : 'Check Availability'}
        </motion.button>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium text-center">
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium text-center">
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {availableSlots.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 border-t border-zinc-800 pt-6">
            <label className="block text-sm font-medium text-zinc-300 mb-4">Available Times</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedSlot === slot 
                      ? 'bg-indigo-500 border-indigo-400 text-white' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {selectedSlot && (
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBook}
            disabled={loading}
            className="w-full mt-8 bg-indigo-500 text-white font-medium rounded-xl p-4 hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {loading ? 'Confirming...' : `Confirm Booking for ${selectedSlot}`}
          </motion.button>
        )}
      </div>
    </div>
  )
}
