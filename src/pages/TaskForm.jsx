import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Page3D, TiltCard } from '../components/fx.jsx';
import api, { demoTasks } from '../services/api.js';
import { STATUSES, statusLabel, PRIORITIES, normalizeStatus } from '../utils/tasks.js';
import { taskSchema } from '../utils/validators.js';

export default function TaskForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { register, control, handleSubmit, reset, watch, setValue,
    formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '', description: '', priority: 'Medium', startDate: '',
      deadline: searchParams.get('deadline') || '',
      status: searchParams.get('status') || 'TODO', category: '', tags: '', estimatedMinutes: '', notes: '',
      projectId: '', subtasks: []
    }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'subtasks' });
  const [newSub, setNewSub] = useState('');
  const status = watch('status');

  useEffect(() => {
    if (isEdit) {
      api.get(`/tasks/${id}`).then(({ data }) => reset({
        title: data.title || '', description: data.description || '',
        priority: data.priority || 'Medium', startDate: data.startDate || '',
        deadline: data.deadline || '', status: normalizeStatus(data.status),
        category: data.category || '', tags: data.tags || '',
        estimatedMinutes: data.estimatedMinutes || '', notes: data.notes || '',
        projectId: data.projectId || '',
        subtasks: (data.subtasks || []).map((s) => ({ title: s.title, done: s.done }))
      })).catch(() => {
        const dt = demoTasks.find((t) => String(t.id) === String(id));
        if (dt) {
          reset({
            title: dt.title || '', description: dt.description || '',
            priority: dt.priority || 'Medium', startDate: dt.startDate || '',
            deadline: dt.deadline || '', status: normalizeStatus(dt.status),
            category: dt.category || '', tags: dt.tags || '',
            estimatedMinutes: dt.estimatedMinutes || '', notes: dt.notes || '',
            projectId: '',
            subtasks: []
          });
        } else {
          setError('Could not load task (is the backend running?).');
        }
      });
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (f) => {
    setError('');
    const payload = {
      ...f,
      status: normalizeStatus(f.status),
      deadline: f.deadline || null,
      startDate: f.startDate || null,
      estimatedMinutes: f.estimatedMinutes === '' ? null : Number(f.estimatedMinutes),
      projectId: f.projectId === '' ? null : Number(f.projectId),
      category: f.category || null,
    };
    try {
      if (isEdit) await api.put(`/tasks/${id}`, payload);
      else await api.post('/tasks', payload);
      const dt = demoTasks.find((t) => String(t.id) === String(id));
      if (dt) Object.assign(dt, payload);
      navigate('/tasks');
    } catch (err) {
      const dt = demoTasks.find((t) => String(t.id) === String(id));
      if (dt) {
        Object.assign(dt, payload);
        navigate('/tasks');
        return;
      }
      const d = err.response?.data;
      setError(d?.message || (d?.errors ? JSON.stringify(d.errors) : 'Save failed — is the backend running?'));
    }
  };

  return (
    <Page3D>
      <div className="center-wrap">
        <TiltCard className="auth-card wide" glow="#34d399">
          <h1>{isEdit ? 'Edit Task ✨' : 'Create Task 🌟'}</h1>
          <p className="muted">Validated with Zod + React Hook Form.</p>
          {error && <div className="alert error">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <label>Task title *
              <input {...register('title')} placeholder="e.g. Finish 3D dashboard" />
              {errors.title && <small style={{ color: '#f87171' }}>{errors.title.message}</small>}
            </label>
            <label>Description
              <textarea rows="3" {...register('description')} placeholder="Details…" />
            </label>
            <div className="grid2form">
              <label>Priority
                <select {...register('priority')}>
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label>Category
                <input {...register('category')} placeholder="e.g. Work, Personal" />
              </label>
            </div>
            <div className="grid2form">
              <label>Start date
                <input type="date" {...register('startDate')} />
              </label>
              <label>Deadline
                <input type="date" {...register('deadline')} />
                {errors.deadline && <small style={{ color: '#f87171' }}>{errors.deadline.message}</small>}
              </label>
            </div>
            <label>Estimated minutes
              <input type="number" min="0" {...register('estimatedMinutes')} placeholder="e.g. 60" />
            </label>
            <label>Status
              <div className="seg">
                {STATUSES.map((s) => (
                  <button type="button" key={s} className={normalizeStatus(status) === s ? 'on' : ''} onClick={() => setValue('status', s)}>
                    {statusLabel(s)}
                  </button>
                ))}
              </div>
            </label>
            <label>Subtask checklist
              {fields.map((f, i) => (
                <div key={f.id} className="pw-row" style={{ marginTop: 6 }}>
                  <input {...register(`subtasks.${i}.title`)} placeholder="Subtask" />
                  <button type="button" className="btn small danger" onClick={() => remove(i)}>✕</button>
                </div>
              ))}
              <div className="pw-row" style={{ marginTop: 6 }}>
                <input value={newSub} onChange={(e) => setNewSub(e.target.value)} placeholder="Add a subtask…" />
                <button type="button" className="btn small" onClick={() => { if (newSub.trim()) { append({ title: newSub.trim(), done: false }); setNewSub(''); } }}>+ Add</button>
              </div>
            </label>
            <label>Notes
              <textarea rows="2" {...register('notes')} placeholder="Anything extra…" />
            </label>
            <div className="row">
              <Link className="btn ghost" to="/tasks">Cancel</Link>
              <button className="btn primary big" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : isEdit ? 'Update Task' : 'Save Task'}</button>
            </div>
          </form>
        </TiltCard>
      </div>
    </Page3D>
  );
}
