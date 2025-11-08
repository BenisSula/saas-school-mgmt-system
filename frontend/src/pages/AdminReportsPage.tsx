import React, { useMemo, useState } from 'react';
import {
  api,
  AttendanceAggregate,
  FeeAggregate,
  GradeAggregate
} from '../lib/api';
import { Button } from '../components/Button';
import { Table } from '../components/Table';

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function AdminReportsPage() {
  const [attendanceFilters, setAttendanceFilters] = useState({
    from: '',
    to: '',
    classId: ''
  });
  const [examId, setExamId] = useState('');
  const [feeStatus, setFeeStatus] = useState('');
  const [attendanceData, setAttendanceData] = useState<AttendanceAggregate[]>([]);
  const [gradeData, setGradeData] = useState<GradeAggregate[]>([]);
  const [feeData, setFeeData] = useState<FeeAggregate[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const attendanceColumns = useMemo(
    () => [
      { header: 'Date', key: 'attendance_date' },
      { header: 'Class', key: 'class_id' },
      { header: 'Status', key: 'status' },
      { header: 'Count', key: 'count' }
    ],
    []
  );

  const gradeColumns = useMemo(
    () => [
      { header: 'Subject', key: 'subject' },
      { header: 'Grade', key: 'grade' },
      { header: 'Count', key: 'count' },
      { header: 'Average score', key: 'average_score' }
    ],
    []
  );

  const feeColumns = useMemo(
    () => [
      { header: 'Status', key: 'status' },
      { header: 'Invoices', key: 'invoice_count' },
      { header: 'Total amount', key: 'total_amount' },
      { header: 'Total paid', key: 'total_paid' }
    ],
    []
  );

  async function runAttendanceReport() {
    try {
      setLoading(true);
      setMessage(null);
      const data = await api.getAttendanceReport({
        from: attendanceFilters.from || undefined,
        to: attendanceFilters.to || undefined,
        classId: attendanceFilters.classId || undefined
      });
      setAttendanceData(data);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function runGradeReport() {
    if (!examId) {
      setMessage('Provide an exam ID to fetch grade distribution.');
      return;
    }
    try {
      setLoading(true);
      setMessage(null);
      const data = await api.getGradeReport(examId);
      setGradeData(data);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function runFeeReport() {
    try {
      setLoading(true);
      setMessage(null);
      const data = await api.getFeeReport(feeStatus || undefined);
      setFeeData(data);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Reports & Exports</h1>
        <p className="text-sm text-slate-300">
          Run cross-cutting reports across attendance, exams, and finance for the current tenant.
        </p>
      </header>

      {message && <div className="rounded bg-slate-800 p-3 text-sm text-slate-100">{message}</div>}

      <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-6">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Attendance summary</h2>
            <p className="text-sm text-slate-400">
              Aggregated attendance counts grouped by date, status, and class.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={runAttendanceReport} disabled={loading}>
              Run report
            </Button>
            <Button
              variant="secondary"
              onClick={() => downloadJson('attendance-report.json', attendanceData)}
              disabled={attendanceData.length === 0}
            >
              Download JSON
            </Button>
          </div>
        </header>
        <div className="grid gap-4 sm:grid-cols-4">
          <input
            type="date"
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            placeholder="From date"
            value={attendanceFilters.from}
            onChange={(event) =>
              setAttendanceFilters((state) => ({ ...state, from: event.target.value }))
            }
          />
          <input
            type="date"
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            placeholder="To date"
            value={attendanceFilters.to}
            onChange={(event) =>
              setAttendanceFilters((state) => ({ ...state, to: event.target.value }))
            }
          />
          <input
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            placeholder="Class ID"
            value={attendanceFilters.classId}
            onChange={(event) =>
              setAttendanceFilters((state) => ({ ...state, classId: event.target.value }))
            }
          />
        </div>
        <div className="mt-4">
          <Table columns={attendanceColumns} data={attendanceData} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-6">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Exam grade distribution</h2>
            <p className="text-sm text-slate-400">
              Visualise grade distribution per subject for a selected exam.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={runGradeReport} disabled={loading}>
              Run report
            </Button>
            <Button
              variant="secondary"
              onClick={() => downloadJson('grades-report.json', gradeData)}
              disabled={gradeData.length === 0}
            >
              Download JSON
            </Button>
          </div>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            placeholder="Exam ID"
            value={examId}
            onChange={(event) => setExamId(event.target.value)}
          />
          <p className="text-xs text-slate-400">
            Use the exam ID from the examinations module. Future iterations will provide a picker.
          </p>
        </div>
        <div className="mt-4">
          <Table columns={gradeColumns} data={gradeData} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-6">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Fee reconciliation</h2>
            <p className="text-sm text-slate-400">
              Track outstanding invoices and payments processed by the payment gateway.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={runFeeReport} disabled={loading}>
              Run report
            </Button>
            <Button
              variant="secondary"
              onClick={() => downloadJson('fees-report.json', feeData)}
              disabled={feeData.length === 0}
            >
              Download JSON
            </Button>
          </div>
        </header>
        <div className="grid gap-4 sm:grid-cols-3">
          <select
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            value={feeStatus}
            onChange={(event) => setFeeStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div className="mt-4">
          <Table columns={feeColumns} data={feeData} />
        </div>
      </section>
    </div>
  );
}

export default AdminReportsPage;


