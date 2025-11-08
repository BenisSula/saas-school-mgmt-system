import React from 'react';
import Table, { TableColumn } from '../components/Table';
import { Button } from '../components/Button';

type ResultRow = {
  subject: string;
  score: number;
  grade: string;
};

const mockResults: ResultRow[] = [
  { subject: 'Mathematics', score: 92, grade: 'A' },
  { subject: 'Science', score: 88, grade: 'A' },
  { subject: 'History', score: 81, grade: 'B' }
];

export function StudentResultsPage() {
  const total = mockResults.reduce((sum, row) => sum + row.score, 0);
  const percentage = Math.round((total / (mockResults.length * 100)) * 100);

  const columns: TableColumn<ResultRow>[] = [
    { header: 'Subject', key: 'subject' },
    { header: 'Score', render: (row) => `${row.score.toFixed(1)}` },
    { header: 'Grade', key: 'grade' }
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">My Exam Results</h1>
            <p className="text-sm text-slate-400">
              Download the official result sheet or review the subject breakdown below.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary">Download CSV</Button>
            <Button>Download PDF</Button>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-4 text-center">
            <p className="text-xs uppercase text-slate-400">Total Score</p>
            <p className="text-xl font-semibold text-white">{total.toFixed(1)}</p>
          </div>
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-4 text-center">
            <p className="text-xs uppercase text-slate-400">Percentage</p>
            <p className="text-xl font-semibold text-white">{percentage}%</p>
          </div>
          <div className="rounded-md border border-slate-800 bg-slate-950/50 p-4 text-center">
            <p className="text-xs uppercase text-slate-400">Class Rank</p>
            <p className="text-xl font-semibold text-white">1 / 28</p>
          </div>
        </div>
      </header>

      <Table columns={columns} data={mockResults} emptyMessage="No exam results available yet." />
    </div>
  );
}

export default StudentResultsPage;

