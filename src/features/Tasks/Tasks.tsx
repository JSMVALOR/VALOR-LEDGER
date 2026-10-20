import { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Check, 
  Search,
  X
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore, TEAM_MEMBERS, type Task, type Priority } from '../../lib/store';

export function Tasks() {
  const { tasks, addTask, toggleTask, currentUser } = useStore();

  const [activeFilter, setActiveFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [selectedRep, setSelectedRep] = useState('All');
  const [search, setSearch] = useState('');

  // Dialog State
  const [openModal, setOpenModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    due: 'Today at 5:00 PM',
    priority: 'High' as Priority,
    assignedTo: currentUser?.username || 'swaroop',
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesStatus = 
        activeFilter === 'all' 
          ? true 
          : activeFilter === 'pending' 
            ? !t.completed 
            : t.completed;
      const matchesRep = selectedRep === 'All' || (t.assignedTo || 'swaroop') === selectedRep;
      const matchesSearch = (t.title || '').toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesRep && matchesSearch;
    });
  }, [tasks, activeFilter, selectedRep, search]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    addTask({
      title: newTask.title,
      due: newTask.due,
      priority: newTask.priority,
      assignedTo: newTask.assignedTo,
    });

    setOpenModal(false);
    setNewTask({
      title: '',
      due: 'Today at 5:00 PM',
      priority: 'High',
      assignedTo: currentUser?.username || 'swaroop',
    });
  };

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Action Items & Tasks
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {pendingCount} Pending
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational checklist, client demo follow-ups, and sales action items.
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" /> New Action Item
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl self-start">
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'pending' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'completed' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'all' 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({tasks.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium placeholder:text-slate-400"
            />
          </div>

          <select
            value={selectedRep}
            onChange={(e) => setSelectedRep(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none capitalize"
          >
            <option value="All">All Reps</option>
            {TEAM_MEMBERS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List Cards */}
      <div className="space-y-2.5">
        {filteredTasks.map(task => {
          const isHigh = task.priority === 'High';

          return (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 shadow-sm active:scale-[0.99] ${
                task.completed 
                  ? 'bg-slate-50 border-slate-200 opacity-60' 
                  : 'bg-white border-slate-200/80 hover:border-blue-400'
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTask(task.id);
                }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all mt-0.5 ${
                  task.completed 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                    : 'border-slate-300 bg-white hover:border-blue-500'
                }`}
              >
                {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-sm font-bold leading-snug ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </h3>
                  {isHigh && !task.completed && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-0.5 shrink-0">
                      <Flame className="w-2.5 h-2.5 text-amber-500" /> High Priority
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-medium flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {task.due}
                  </span>
                  <span>•</span>
                  <span>
                    Owner: <b className="text-slate-700 capitalize">{task.assignedTo || 'swaroop'}</b>
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-white space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">All Action Items Completed!</p>
            <p className="text-xs">No pending follow-ups in this filter.</p>
          </div>
        )}
      </div>

      {/* New Task Radix Modal Dialog */}
      <Dialog.Root open={openModal} onOpenChange={setOpenModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 p-6 rounded-3xl max-w-md w-[92vw] z-50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-bold text-slate-900">
                Create Action Item
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Action Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call Apex Law regarding proposal terms"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date / Time</label>
                  <input
                    type="text"
                    placeholder="Today at 4:00 PM"
                    value={newTask.due}
                    onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Sales Rep</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
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
                  Add Task
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
export default Tasks;
