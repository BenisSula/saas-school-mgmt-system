import React, { useState } from 'react';
import { DatePicker } from '../components/DatePicker';
import Table, { TableColumn } from '../components/Table';
import { Button } from '../components/Button';

type AttendanceStatus = 'present' | 'absent' | 'late';

interface StudentRow {
  id: string;
  name: string;
  status: AttendanceStatus;
}

const mockStudents: StudentRow[] = [
  { id: 'student-1', name: 'Ada Lovelace', status: 'present' },
  { id: 'student-2', name: 'Alan Turing', status: 'present' },
  { id: 'student-3', name: 'Grace Hopper', status: 'absent' }
];

export function TeacherAttendancePage() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>('present');
  const [rows, setRows] = useState<StudentRow[]>(mockStudents);

  const columns: TableColumn<StudentRow>[] = [
    { key: 'name', header: 'Student' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <select
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
          value={row.status}
          onChange={(event) => {
            const value = event.target.value as AttendanceStatus;
            setRows((current) =>
              current.map((student) =>
                student.id === row.id ? { ...student, status: value } : student
              )
            );
          }}
        >
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>
      )
    }
  ];

  const markAll = (status: AttendanceStatus) => {
    setRows((current) => current.map((student) => ({ ...student, status })));
  };

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Attendance Marking</h1>
            <p className="text-sm text-slate-400">
              Select a class, choose a date, and mark attendance in bulk or individually.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DatePicker value={date} onChange={(event) => setDate(event.target.value)} />
            <select
              className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as AttendanceStatus)}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
            <Button variant="secondary" onClick={() => markAll(selectedStatus)}>
              Mark All
            </Button>
            <Button>Save Attendance</Button>
          </div>
        </div>
      </header>

      <Table columns={columns} data={rows} />
    </div>
  );
}

export default TeacherAttendancePage;

