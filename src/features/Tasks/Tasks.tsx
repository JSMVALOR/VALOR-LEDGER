import { useState } from 'react';
import { X, Check } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore, type Priority } from '../../lib/store';

export function Tasks() {
  const { tasks, addTask, toggleTask } = useStore();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', due: '', priority: 'Medium' as Priority });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    addTask(formData);
    setOpen(false);
    setFormData({ title: '', due: '', priority: 'Medium' });
  };
  
  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto w-full pb-20 md:pb-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your follow-ups and action items.</p>
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="bg-primary text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90">New Task</button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-background/90 z-50 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-surface p-6 shadow-2xl rounded-2xl">
              <div className="flex flex-col space-y-2 mb-2">
                <Dialog.Title className="text-xl font-bold tracking-tight text-foreground">New Task</Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  Create a new follow-up or action item.
                </Dialog.Description>
              </div>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Task Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Call John regarding proposal" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Due Date</label>
                  <input required value={formData.due} onChange={e => setFormData({...formData, due: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Tomorrow at 2:00 PM" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Priority</label>
                  <select required value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as Priority})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <Dialog.Close asChild>
                    <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-background border border-border smooth-transition">Cancel</button>
                  </Dialog.Close>
                  <button type="submit" className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-semibold hover:bg-primary/90 smooth-transition">Save Task</button>
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
      <div className="bg-surface/30 border border-border rounded-2xl p-6 min-h-[400px]">
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-muted-foreground text-sm py-10 text-center">No tasks found.</div>
          ) : (
            tasks.map((t) => (
              <div key={t.id} onClick={() => toggleTask(t.id)} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer smooth-transition ${t.completed ? 'bg-surface/50 border-border opacity-60' : 'bg-background border-border hover:border-primary/50'}`}>
                 <div className={`w-5 h-5 rounded border flex items-center justify-center ${t.completed ? 'bg-primary border-primary text-black' : 'border-muted-foreground'}`}>
                   {t.completed && <Check className="w-3.5 h-3.5" />}
                 </div>
                 <div className={`flex-1 text-sm font-medium ${t.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.title}</div>
                 <div className={`text-xs px-2 py-1 rounded ${t.priority === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>{t.priority}</div>
                 <div className="text-xs text-muted-foreground">{t.due}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
