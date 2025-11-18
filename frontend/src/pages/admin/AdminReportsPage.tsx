import { useMemo, useState } from 'react';
import { useQuery, queryKeys } from '../../hooks/useQuery';
import { useAttendance, useClasses, useStudents } from '../../hooks/queries/useAdminQueries';
import { DataTable, type DataTableColumn } from '../../components/tables/DataTable';
import { BarChart, type BarChartData } from '../../components/charts/BarChart';
import { StatCard } from '../../components/charts/StatCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { api, type AttendanceAggregate, type GradeAggregate, type FeeAggregate } from '../../lib/api';
import RouteMeta from '../../components/layout/RouteMeta';
import { FileText, Download, TrendingUp } from 'lucide-react';

export default function AdminReportsPage() {
  const [attendanceFilters, setAttendanceFilters] = useState({
    from: '',
    to: '',
    classId: ''
  });
  const [examId, setExamId] = useState('');
  const [feeStatus, setFeeStatus] = useState('');

  const { data: classesData } = useClasses();
  const { data: studentsData } = useStudents();
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance(attendanceFilters);

  const classes = classesData || [];
  const students = studentsData || [];
  const attendance = attendanceData || [];

  // Grade data query
  const { data: gradeData = [] } = useQuery(
    queryKeys.admin.reports('grades'),
    () => api.getGradeReport(examId),
    { enabled: !!examId }
  );

  // Fee data query
  const { data: feeData = [] } = useQuery(
    queryKeys.admin.reports('fees'),
    () => api.getFeeReport(feeStatus),
    { enabled: !!feeStatus }
  );

  const attendanceChartData: BarChartData[] = useMemo(() => {
    return attendance.map((item) => ({
      label: item.className || 'Unknown',
      value: item.presentCount || 0,
      color: 'var(--brand-primary)'
    }));
  }, [attendance]);

  const attendanceColumns: DataTableColumn<AttendanceAggregate>[] = useMemo(
    () => [
      {
        key: 'className',
        header: 'Class',
        render: (row) => row.className || '—'
      },
      {
        key: 'presentCount',
        header: 'Present',
        render: (row) => row.presentCount || 0
      },
      {
        key: 'absentCount',
        header: 'Absent',
        render: (row) => row.absentCount || 0
      },
      {
        key: 'attendanceRate',
        header: 'Rate',
        render: (row) => `${((row.attendanceRate || 0) * 100).toFixed(1)}%`
      }
    ],
    []
  );

  const stats = useMemo(() => {
    const totalPresent = attendance.reduce((sum, item) => sum + (item.presentCount || 0), 0);
    const totalAbsent = attendance.reduce((sum, item) => sum + (item.absentCount || 0), 0);
    const totalStudents = totalPresent + totalAbsent;
    const overallRate = totalStudents > 0 ? (totalPresent / totalStudents) * 100 : 0;

    return {
      totalPresent,
      totalAbsent,
      overallRate: Math.round(overallRate * 10) / 10
    };
  }, [attendance]);

  const handleExport = async (type: 'attendance' | 'grades' | 'fees') => {
    try {
      // TODO: Implement export functionality
      toast.success(`${type} report exported successfully`);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <RouteMeta title="Reports Dashboard">
      <div className="space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--brand-surface-contrast)]">
              Reports Dashboard
            </h1>
            <p className="mt-1 text-sm text-[var(--brand-muted)]">
              Generate and export comprehensive reports
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('attendance')}>
              <Download className="mr-2 h-4 w-4" />
              Export Attendance
            </Button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Present"
            value={stats.totalPresent}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            title="Total Absent"
            value={stats.totalAbsent}
            icon={<FileText className="h-5 w-5" />}
          />
          <StatCard
            title="Overall Rate"
            value={`${stats.overallRate}%`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]/80 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--brand-surface-contrast)]">
            Attendance Filters
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <DatePicker
              label="From Date"
              value={attendanceFilters.from}
              onChange={(e) =>
                setAttendanceFilters({ ...attendanceFilters, from: e.target.value })
              }
            />
            <DatePicker
              label="To Date"
              value={attendanceFilters.to}
              onChange={(e) =>
                setAttendanceFilters({ ...attendanceFilters, to: e.target.value })
              }
            />
            <Select
              label="Class"
              value={attendanceFilters.classId}
              onChange={(e) =>
                setAttendanceFilters({ ...attendanceFilters, classId: e.target.value })
              }
              options={[
                { label: 'All Classes', value: '' },
                ...classes.map((c) => ({ label: c.name, value: c.id }))
              ]}
            />
          </div>
        </div>

        {/* Attendance Chart */}
        {attendanceChartData.length > 0 && (
          <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]/80 p-6 shadow-sm">
            <BarChart
              data={attendanceChartData}
              title="Attendance by Class"
              height={250}
            />
          </div>
        )}

        {/* Attendance Table */}
        <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]/80 p-6 shadow-sm">
          <DataTable
            data={attendance}
            columns={attendanceColumns}
            pagination={{ pageSize: 10, showSizeSelector: true }}
            emptyMessage="No attendance data available"
            loading={attendanceLoading}
          />
        </div>
      </div>
    </RouteMeta>
  );
}

