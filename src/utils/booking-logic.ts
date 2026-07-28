export function generateTimeSlots(
  startTimeStr: string, // "HH:mm:ss" or "HH:mm"
  endTimeStr: string,   // "HH:mm:ss" or "HH:mm"
  durationMinutes: number
): string[] {
  const slots: string[] = []
  
  const [startH, startM] = startTimeStr.split(':').map(Number)
  const [endH, endM] = endTimeStr.split(':').map(Number)
  
  let currentMinutes = startH * 60 + startM
  const endTotalMinutes = endH * 60 + endM

  while (currentMinutes + durationMinutes <= endTotalMinutes) {
    const h = Math.floor(currentMinutes / 60)
    const m = currentMinutes % 60
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
    currentMinutes += durationMinutes
  }

  return slots
}

export function isSlotAvailable(
  slotStartTime: string, // "HH:mm"
  durationMinutes: number,
  existingBookings: { start_time: string, end_time: string }[]
): boolean {
  const [slotH, slotM] = slotStartTime.split(':').map(Number)
  const slotStartMins = slotH * 60 + slotM
  const slotEndMins = slotStartMins + durationMinutes

  for (const booking of existingBookings) {
    const [bStartH, bStartM] = booking.start_time.split(':').map(Number)
    const bStartMins = bStartH * 60 + bStartM
    
    const [bEndH, bEndM] = booking.end_time.split(':').map(Number)
    const bEndMins = bEndH * 60 + bEndM

    // If the slot overlaps with an existing booking
    // Overlap condition: max(start1, start2) < min(end1, end2)
    if (Math.max(slotStartMins, bStartMins) < Math.min(slotEndMins, bEndMins)) {
      return false
    }
  }

  return true
}

export function getAvailableSlots(
  scheduleStart: string,
  scheduleEnd: string,
  durationMinutes: number,
  existingBookings: { start_time: string, end_time: string }[]
): string[] {
  const allSlots = generateTimeSlots(scheduleStart, scheduleEnd, durationMinutes)
  return allSlots.filter(slot => isSlotAvailable(slot, durationMinutes, existingBookings))
}
