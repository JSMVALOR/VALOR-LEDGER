import { useState } from 'react';
import { Clock, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore } from '../../lib/store';

export function Calendar() {
  const { events, addEvent } = useStore();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', time: '', type: 'Meeting' });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent(formData);
    setOpen(false);
    setFormData({ title: '', time: '', type: 'Meeting' });
  };

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto w-full pb-20 md:pb-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your upcoming schedule and meetings.</p>
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="bg-primary text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90">Add Event</button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-background/90 z-50 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-surface p-6 shadow-2xl rounded-2xl">
              <div className="flex flex-col space-y-2 mb-2">
                <Dialog.Title className="text-xl font-bold tracking-tight text-foreground">New Event</Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  Schedule a new meeting or event.
                </Dialog.Description>
              </div>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Event Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Q3 Review with Acme" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Time (HH:MM AM/PM)</label>
                  <input required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="10:00 AM" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors">
                    <option value="Meeting">Meeting</option>
                    <option value="Call">Call</option>
                    <option value="Review">Review</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <Dialog.Close asChild>
                    <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-background border border-border smooth-transition">Cancel</button>
                  </Dialog.Close>
                  <button type="submit" className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-semibold hover:bg-primary/90 smooth-transition">Save Event</button>
                </div>
              </form>
              <Dialog.Close asChild>
                <button className="absolute right-4 top-4 opacity-50 hover:opacity-100 transition-opacity">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      <div className="bg-surface/30 border border-border rounded-2xl p-6 min-h-[500px]">
        {events.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground py-20 text-sm">
            No events scheduled.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-4 border border-border rounded-xl bg-background hover:border-primary/50 cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-surface flex flex-col items-center justify-center text-primary border border-border">
                  <span className="text-sm font-bold">{event.time.split(' ')[0]}</span>
                  <span className="text-[10px]">{event.time.split(' ')[1]}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{event.title}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {event.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
