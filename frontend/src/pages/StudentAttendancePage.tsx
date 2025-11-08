import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import Table from '../components/Table';
import type { TableColumn } from '../components/Table';
import { DatePicker } from '../components/DatePicker';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { api, type AttendanceHistoryItem } from '../lib/api';

export function StudentAttendancePage() {
  const { user } = useAuth();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [history, setHistory] = useState<AttendanceHistoryItem[]>([]);
  const [presentCount, setPresentCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadAttendance = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.getStudentAttendance(user.id, { from, to });
      setHistory(response.history);
      setPresentCount(response.summary.present);
      setTotalCount(response.summary.total);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      void loadAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const percentage = useMemo(() => {
    if (!totalCount) return 0;
    return Math.round((presentCount / totalCount) * 100);
  }, [presentCount, totalCount]);

  const columns: TableColumn<AttendanceHistoryItem>[] = [
    { key: 'attendance_date', header: 'Date' },
    { key: 'class_id', header: 'Class' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={
            row.status === 'present'
              ? 'rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300'
              : row.status === 'late'
                ? 'rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-300'
                : 'rounded-full bg-rose-500/20 px-2 py-1 text-xs font-medium text-rose-300'
          }
        >
          {row.status.toUpperCase()}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]/70 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Your attendance</h1>
            <p className="text-sm text-slate-300">
              Query historical attendance and monitor your consistency.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DatePicker
              label="From"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
            <DatePicker label="To" value={to} onChange={(event) => setTo(event.target.value)} />
            <Button variant="outline" onClick={loadAttendance} loading={loading}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">Total sessions</p>
            <p className="mt-2 text-2xl font-semibold text-white">{totalCount}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">Present</p>
            <p className="mt-2 text-2xl font-semibold text-white">{presentCount}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">Attendance %</p>
            <p className="mt-2 text-2xl font-semibold text-white">{percentage}%</p>
          </div>
        </div>
      </header>

      <Table columns={columns} data={history} emptyMessage="No attendance records yet." />
    </div>
  );
}

export default StudentAttendancePage;
