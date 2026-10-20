import { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Video, 
  Phone, 
  Users, 
  X,
  CheckCircle2,
  Building2
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore, TEAM_MEMBERS } from '../../lib/store';

export function Calendar() {
  const { events, addEvent, leads } = useStore();
  const [openModal, setOpenModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'demos' | 'calls'>('all');

  const [newEvent, setNewEvent] = useState({
    title: '',
    time: 'Today at 3:00 PM',
    type: 'Demo',
    assignedTo: 'swaroop',
  });

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (filterType === 'demos') return e.type.toLowerCase().includes('demo') || e.type.toLowerCase().includes('meeting');
      if (filterType === 'calls') return e.type.toLowerCase().includes('call') || e.type.toLowerCase().includes('review');
      return true;
    });
  }, [events, filterType]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;

    addEvent({
      title: newEvent.title,
      time: newEvent.time,
      type: newEvent.type,
      assignedTo: newEvent.assignedTo,
    });

    setOpenModal(false);
    setNewEvent({
      title: '',
      time: 'Today at 3:00 PM',
      type: 'Demo',
      assignedTo: 'swaroop',
    });
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Meetings & Demos
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {events.length} Scheduled
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Client website presentations, discovery calls, and contract review sessions.
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" /> Schedule Meeting
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl self-start">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterType === 'all' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Schedule ({events.length})
        </button>
        <button
          onClick={() => setFilterType('demos')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterType === 'demos' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Website Demos
        </button>
        <button
          onClick={() => setFilterType('calls')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filterType === 'calls' 
              ? 'bg-blue-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Phone Reviews
        </button>
      </div>

      {/* Agenda Stream Cards */}
      <div className="space-y-3">
        {filteredEvents.map(event => {
          const isDemo = event.type.toLowerCase().includes('demo') || event.type.toLowerCase().includes('meeting');

          return (
            <div 
              key={event.id}
              className="bg-white border border-slate-200/80 hover:border-blue-400 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold text-xs shrink-0 border ${
                  isDemo ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                  <CalendarIcon className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px] leading-none uppercase">{isDemo ? 'Demo' : 'Call'}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-base leading-snug truncate">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {event.time}
                    </span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {event.type}
                    </span>
                    <span>•</span>
                    <span className="text-[11px] text-slate-400">
                      Rep: <b className="text-slate-700 capitalize">{event.assignedTo || 'swaroop'}</b>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                </span>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="py-16 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-3xl space-y-2">
            <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">No Meetings Scheduled</p>
            <p className="text-xs">Schedule a website demo or client consultation above.</p>
          </div>
        )}
      </div>

      {/* Schedule Meeting Dialog */}
      <Dialog.Root open={openModal} onOpenChange={setOpenModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 p-6 rounded-3xl max-w-md w-[92vw] z-50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-bold text-slate-900">
                Schedule Client Meeting / Demo
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting / Demo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Mockup Demo with Apex Legal"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot / Date</label>
                  <input
                    type="text"
                    placeholder="Tomorrow at 11:00 AM"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="Demo">Website Demo</option>
                    <option value="Meeting">In-Person Meeting</option>
                    <option value="Call">Discovery Call</option>
                    <option value="Review">Contract Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Sales Rep</label>
                <select
                  value={newEvent.assignedTo}
                  onChange={(e) => setNewEvent({ ...newEvent, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none capitalize font-semibold text-slate-800"
                >
                  {TEAM_MEMBERS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Dialog.Close asChild>
                  <button type="button" className="px-4 py-2 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 text-slate-600">
                    Cancel
                  </button>
                </Dialog.Close>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 active:scale-[0.98]">
                  Save to Schedule
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
export default Calendar;
