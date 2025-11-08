import React, { useState } from 'react';
import Table, { TableColumn } from '../components/Table';
import { DatePicker } from '../components/DatePicker';
import { Button } from '../components/Button';

type GradeRow = {
  studentId: string;
  name: string;
  subject: string;
  score: number;
  remarks?: string;
};

const initialRoster: GradeRow[] = [
  { studentId: 'stu-001', name: 'Ada Lovelace', subject: 'Mathematics', score: 88 },
  { studentId: 'stu-002', name: 'Alan Turing', subject: 'Mathematics', score: 92 },
  { studentId: 'stu-003', name: 'Grace Hopper', subject: 'Mathematics', score: 95 }
];

export function TeacherGradeEntryPage() {
  const [examDate, setExamDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<GradeRow[]>(initialRoster);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const columns: TableColumn<GradeRow>[] = [
    { header: 'Student', key: 'name' },
    { header: 'Subject', key: 'subject' },
    {
      header: 'Score',
      render: (row) => (
        <input
          type="number"
          min={0}
          max={100}
          className="w-24 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-right text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          value={row.score}
          onChange={(event) => {
            const value = Number(event.target.value);
            setRows((current) =>
              current.map((entry) =>
                entry.studentId === row.studentId ? { ...entry, score: value } : entry
              )
            );
          }}
        />
      )
    },
    {
      header: 'Remarks',
      render: (row) => (
        <input
          type="text"
          placeholder="Optional"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          value={row.remarks ?? ''}
          onChange={(event) => {
            const value = event.target.value;
            setRows((current) =>
              current.map((entry) =>
                entry.studentId === row.studentId ? { ...entry, remarks: value } : entry
              )
            );
          }}
        />
      )
    }
  ];

  const handleSave = () => {
    // In the actual app, this will call POST /grades/bulk.
    setStatusMessage(`Saved ${rows.length} grade entries for ${examDate}`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Grade Entry</h1>
            <p className="text-sm text-slate-400">
              Select the scheduled exam date, review the roster, and record marks for each student.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DatePicker label="Exam Date" value={examDate} onChange={(event) => setExamDate(event.target.value)} />
            <Button onClick={handleSave}>Save Grades</Button>
          </div>
        </div>
        {statusMessage ? (
          <p className="mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {statusMessage}
          </p>
        ) : null}
      </header>

      <Table columns={columns} data={rows} emptyMessage="No students assigned to this session yet." />
    </div>
  );
}

export default TeacherGradeEntryPage;

