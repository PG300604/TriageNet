'use client'

import React, { useState } from 'react'
import { CalendarDays, Clock, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, Search, Plus, Filter, CalendarPlus } from 'lucide-react'

interface AppointmentItem {
  id: string
  time: string
  name: string
  condition: string
  status: 'Completed' | 'In Progress' | 'Emergency Alert' | 'Scheduled' | 'Confirmed'
  type: 'Routine' | 'Emergency'
  day: number
  month: number
  year: number
}

export function AppointmentsView() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate())

  // New appointment form state
  const [newPtName, setNewPtName] = useState('')
  const [newCondition, setNewCondition] = useState('')
  const [newTime, setNewTime] = useState('10:00 AM')

  const year = currentDate.getFullYear()
  const monthIndex = currentDate.getMonth()
  const monthName = currentDate.toLocaleString('default', { month: 'long' })

  const isTodaySelected =
    selectedDay === today.getDate() &&
    monthIndex === today.getMonth() &&
    year === today.getFullYear()

  const isFutureDateSelected =
    new Date(year, monthIndex, selectedDay) > new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const [appointments, setAppointments] = useState<AppointmentItem[]>([
    {
      id: 'APT-101',
      time: '07:28 AM',
      name: 'Jordan Rivers',
      condition: 'Migraine / Triage Station 1',
      status: 'Completed',
      type: 'Routine',
      day: today.getDate(),
      month: today.getMonth(),
      year: today.getFullYear(),
    },
    {
      id: 'APT-102',
      time: '11:15 AM',
      name: 'Elena Rostova',
      condition: 'Acute Chest Pain / Tachycardia',
      status: 'In Progress',
      type: 'Emergency',
      day: today.getDate(),
      month: today.getMonth(),
      year: today.getFullYear(),
    },
    {
      id: 'APT-103',
      time: '01:12 PM',
      name: 'Taylor Green',
      condition: 'Emergency Patient / Throbbing Pain',
      status: 'Emergency Alert',
      type: 'Emergency',
      day: today.getDate(),
      month: today.getMonth(),
      year: today.getFullYear(),
    },
    {
      id: 'APT-104',
      time: '10:00 AM',
      name: 'Marcus Vance',
      condition: 'Post-Surgery Follow-up Consultation',
      status: 'Scheduled',
      type: 'Routine',
      day: Math.min(28, today.getDate() + 3),
      month: today.getMonth(),
      year: today.getFullYear(),
    },
    {
      id: 'APT-105',
      time: '02:30 PM',
      name: 'Kavya Nair',
      condition: 'Cardiology Health Checkup',
      status: 'Confirmed',
      type: 'Routine',
      day: Math.min(28, today.getDate() + 7),
      month: today.getMonth(),
      year: today.getFullYear(),
    },
  ])

  const handleBookFutureAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPtName || !newCondition) return

    const newApt: AppointmentItem = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      time: newTime,
      name: newPtName,
      condition: newCondition,
      status: 'Scheduled',
      type: 'Routine',
      day: selectedDay,
      month: monthIndex,
      year: year,
    }

    setAppointments((prev) => [...prev, newApt])
    setNewPtName('')
    setNewCondition('')
  }

  // Days in current month & starting day of week
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const startingDayOffset = (firstDayOfMonth + 6) % 7

  const prevMonth = () => setCurrentDate(new Date(year, monthIndex - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, monthIndex + 1, 1))

  const selectedDayAppointments = appointments.filter(
    (a) => a.day === selectedDay && a.month === monthIndex && a.year === year
  )

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="size-5 text-emerald-600" />
            Appointments & Future Booking Scheduler
          </h2>
          <p className="text-xs text-slate-500">
            Today's real-time intake timeline vs. Future scheduled consultations & follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-300 font-bold">
            {appointments.length} Total Appointments
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Appointments Timeline Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {monthName} {selectedDay}, {year}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isTodaySelected
                    ? "Today's Live Intake & Triage Timeline"
                    : isFutureDateSelected
                    ? 'Future Scheduled Consultations (Pre-Booked)'
                    : 'Past Clinical Intake Log'}
                </p>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                  isTodaySelected
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {isTodaySelected ? 'LIVE TODAY' : isFutureDateSelected ? 'FUTURE BOOKED' : 'HISTORICAL'}
              </span>
            </div>

            {/* List */}
            <div className="space-y-3">
              {selectedDayAppointments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
                  No appointments scheduled for {monthName} {selectedDay}, {year}.
                </div>
              ) : (
                selectedDayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className={`flex items-center justify-between rounded-xl p-4 border transition-all ${
                      apt.status === 'Emergency Alert'
                        ? 'border-red-200 bg-red-50/70'
                        : apt.status === 'In Progress'
                        ? 'border-emerald-200 bg-emerald-50/70'
                        : 'border-slate-200/80 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-bold text-slate-600 w-16">{apt.time}</span>
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">{apt.name}</span>
                        <span className="text-xs text-slate-500 font-medium">{apt.condition}</span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        apt.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : apt.status === 'In Progress'
                          ? 'bg-emerald-600 text-white font-mono'
                          : apt.status === 'Emergency Alert'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Book Future Appointment Form */}
          <div className="mt-6 border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <CalendarPlus className="size-4 text-emerald-600" />
              Schedule Appointment for {monthName} {selectedDay}, {year}
            </h4>

            <form onSubmit={handleBookFutureAppointment} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Patient Full Name"
                value={newPtName}
                onChange={(e) => setNewPtName(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Reason / Consultation"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2 font-mono text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
              >
                Book Future Slot
              </button>
            </form>
          </div>
        </div>

        {/* Dynamic Real-Time Calendar Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Interactive Calendar</h3>
              <p className="text-xs text-slate-500">{monthName} {year}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="font-mono text-xs font-bold text-slate-800">{monthName} {year}</span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-slate-400 mb-2">
            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
          </div>

          {/* Dynamic Days Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-slate-800">
            {Array.from({ length: startingDayOffset }).map((_, i) => (
              <div key={`offset-${i}`} className="p-2 opacity-20" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1
              const isToday = dayNum === today.getDate() && monthIndex === today.getMonth() && year === today.getFullYear()
              const isSelected = dayNum === selectedDay
              const dayApts = appointments.filter((a) => a.day === dayNum && a.month === monthIndex && a.year === year)

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => setSelectedDay(dayNum)}
                  className={`p-2 rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-black shadow-xs border-emerald-600'
                      : isToday
                      ? 'bg-red-100 text-red-900 border-red-300 font-extrabold'
                      : dayApts.length > 0
                      ? 'bg-slate-100 border-slate-300 text-slate-900'
                      : 'bg-slate-50 border-transparent hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {dayNum}
                  {dayApts.length > 0 && (
                    <span className="inline-block size-1.5 rounded-full bg-emerald-500 ml-0.5" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-200/80 flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600">Selected: {monthName} {selectedDay}</span>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              {isTodaySelected ? 'Today Active Intake' : isFutureDateSelected ? 'Future Booked Slot' : 'Past Date'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
