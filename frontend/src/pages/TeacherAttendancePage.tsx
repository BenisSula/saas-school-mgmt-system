import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DatePicker } from '../components/DatePicker';
import Table from '../components/Table';
import type { TableColumn } from '../components/Table';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { api, type AttendanceMark, type ClassAttendanceSnapshot } from '../lib/api';
import { sanitizeIdentifier } from '../lib/sanitize';

type AttendanceStatus = 'present' | 'absent' | 'late';

interface AttendanceRow {
  id: string;
  status: AttendanceStatus;
}

export function TeacherAttendancePage() {
  const { user } = useAuth();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [classId, setClassId] = useState('');
  const [rows, setRows] = useState<AttendanceRow[]>([{ id: '', status: 'present' }]);
  const [isSaving, setIsSaving] = useState(false);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshot, setSnapshot] = useState<ClassAttendanceSnapshot[]>([]);

  const columns: TableColumn<AttendanceRow>[] = useMemo(
    () => [
      {
        header: 'Student ID',
        render: (row, index) => (
          <input
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40"
            placeholder="uuid-1234..."
            value={row.id}
            onChange={(event) => {
              const value = sanitizeIdentifier(event.target.value);
              setRows((current) =>
                current.map((entry, entryIndex) =>
                  entryIndex === index ? { ...entry, id: value } : entry
                )
              );
            }}
          />
        )
      },
      {
        header: 'Status',
        render: (row, index) => (
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40"
            value={row.status}
            onChange={(event) => {
              const value = event.target.value as AttendanceStatus;
              setRows((current) =>
                current.map((entry, entryIndex) =>
                  entryIndex === index ? { ...entry, status: value } : entry
                )
              );
            }}
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        )
      },
      {
        header: '',
        align: 'right',
        render: (_row, index) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setRows((current) => current.filter((_entry, entryIndex) => entryIndex !== index))
            }
            disabled={rows.length === 1}
          >
            Remove
          </Button>
        )
      }
    ],
    [rows.length]
  );

  const markAll = (status: AttendanceStatus) => {
    setRows((current) => current.map((entry) => ({ ...entry, status })));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be signed in to mark attendance.');
      return;
    }
    if (!classId) {
      toast.error('Provide a class identifier.');
      return;
    }
    const validRows = rows.filter((row) => row.id);
    if (validRows.length === 0) {
      toast.error('Add at least one student record.');
      return;
    }

    const payload: AttendanceMark[] = validRows.map((row) => ({
      studentId: sanitizeIdentifier(row.id),
      classId: sanitizeIdentifier(classId),
      status: row.status,
      markedBy: user.id,
      date
    }));

    setIsSaving(true);
    try {
      await api.markAttendance(payload);
      toast.success(`Attendance saved for ${validRows.length} students.`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const loadSnapshot = async () => {
    if (!classId) {
      toast.error('Provide a class identifier first.');
      return;
    }
    setSnapshotLoading(true);
    try {
      const report = await api.getClassAttendanceSnapshot(sanitizeIdentifier(classId), date);
      setSnapshot(report);
      toast.success('Loaded class attendance snapshot.');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSnapshotLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]/70 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Attendance Marking</h1>
            <p className="text-sm text-slate-300">
              Provide a class identifier, add student UUIDs, and submit daily attendance. Use
              snapshots to verify counts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              className="w-48 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40"
              placeholder="Class ID"
              value={classId}
              onChange={(event) => setClassId(sanitizeIdentifier(event.target.value))}
            />
            <DatePicker value={date} onChange={(event) => setDate(event.target.value)} />
            <select
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40"
              onChange={(event) => markAll(event.target.value as AttendanceStatus)}
            >
              <option value="">Bulk status</option>
              <option value="present">Mark all present</option>
              <option value="absent">Mark all absent</option>
              <option value="late">Mark all late</option>
            </select>
            <Button variant="outline" onClick={loadSnapshot} loading={snapshotLoading}>
              Load snapshot
            </Button>
            <Button onClick={handleSubmit} loading={isSaving}>
              Save Attendance
            </Button>
          </div>
        </div>
      </header>

      <Table columns={columns} data={rows} emptyMessage="Add student identifiers to begin." />

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={() => setRows((current) => [...current, { id: '', status: 'present' }])}
        >
          Add row
        </Button>
        <Button variant="ghost" onClick={() => setRows([{ id: '', status: 'present' }])}>
          Clear all
        </Button>
      </div>

      {snapshot.length > 0 ? (
        <section className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]/70 p-6">
          <h2 className="text-lg font-semibold text-white">Class snapshot for {date}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {snapshot.map((entry) => (
              <div
                key={entry.status}
                className="rounded-lg border border-white/10 bg-white/5 p-4 text-center text-sm text-slate-200"
              >
                <p className="uppercase tracking-wide text-xs text-slate-400">{entry.status}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{entry.count}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default TeacherAttendancePage;
