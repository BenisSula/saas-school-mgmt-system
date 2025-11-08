import React from 'react';
import Table, { TableColumn } from '../components/Table';

interface AttendanceRow {
  date: string;
  status: 'present' | 'absent' | 'late';
  classId?: string;
}

const mockHistory: AttendanceRow[] = [
  { date: '2025-01-10', status: 'present', classId: 'Class-A' },
  { date: '2025-01-11', status: 'absent', classId: 'Class-A' },
  { date: '2025-01-12', status: 'present', classId: 'Class-A' }
];

export function StudentAttendancePage() {
  const attended = mockHistory.filter((entry) => entry.status === 'present').length;
  const percentage = mockHistory.length === 0 ? 0 : Math.round((attended / mockHistory.length) * 100);

  const columns: TableColumn<AttendanceRow>[] = [
    { key: 'date', header: 'Date' },
    { key: 'classId', header: 'Class' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={
            row.status === 'present'
              ? 'rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-300'
              : row.status === 'late'
                ? 'rounded-full bg-yellow-500/20 px-2 py-1 text-xs text-yellow-300'
                : 'rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-300'
          }
        >
          {row.status.toUpperCase()}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-white">Attendance Summary</h1>
        <p className="mt-2 text-sm text-slate-400">
          Your attendance percentage is calculated across the selected period.
        </p>
        <div className="mt-4 flex gap-6 text-sm text-slate-200">
          <div>
            <span className="text-xs uppercase tracking-wide text-slate-400">Total Sessions</span>
            <p className="text-lg font-semibold text-white">{mockHistory.length}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wide text-slate-400">Present</span>
            <p className="text-lg font-semibold text-white">{attended}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wide text-slate-400">Attendance %</span>
            <p className="text-lg font-semibold text-white">{percentage}%</p>
          </div>
        </div>
      </header>

      <Table columns={columns} data={mockHistory} emptyMessage="No attendance records yet." />
    </div>
  );
}

export default StudentAttendancePage;

