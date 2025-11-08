import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import Table from '../components/Table';
import type { TableColumn } from '../components/Table';
import { Button } from '../components/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { api, type GradeEntryInput, type GradeAggregate } from '../lib/api';
import { sanitizeIdentifier, sanitizeText } from '../lib/sanitize';

interface GradeRow extends GradeEntryInput {
  id: string;
}

export function TeacherGradeEntryPage() {
  const { user } = useAuth();
  const [examId, setExamId] = useState('');
  const [rows, setRows] = useState<GradeRow[]>([
    { id: 'row-0', studentId: '', subject: '', score: 0 }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [distributionLoading, setDistributionLoading] = useState(false);
  const [distribution, setDistribution] = useState<GradeAggregate[]>([]);

  const columns: TableColumn<GradeRow>[] = useMemo(
    () => [
      {
        header: 'Student ID',
        render: (row, index) => (
          <Input
            value={row.studentId}
            onChange={(event) =>
              setRows((current) =>
                current.map((entry, entryIndex) =>
                  entryIndex === index
                    ? { ...entry, studentId: sanitizeIdentifier(event.target.value) }
                    : entry
                )
              )
            }
            placeholder="uuid-1234..."
          />
        )
      },
      {
        header: 'Subject',
        render: (row, index) => (
          <Input
            value={row.subject}
            onChange={(event) =>
              setRows((current) =>
                current.map((entry, entryIndex) =>
                  entryIndex === index
                    ? { ...entry, subject: sanitizeText(event.target.value) }
                    : entry
                )
              )
            }
            placeholder="Mathematics"
          />
        )
      },
      {
        header: 'Score',
        render: (row, index) => (
          <input
            type="number"
            min={0}
            max={100}
            className="w-24 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-right text-sm text-slate-100 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40"
            value={row.score}
            onChange={(event) => {
              const value = Number(event.target.value);
              setRows((current) =>
                current.map((entry, entryIndex) =>
                  entryIndex === index
                    ? { ...entry, score: Number.isNaN(value) ? 0 : value }
                    : entry
                )
              );
            }}
          />
        )
      },
      {
        header: 'Remarks',
        render: (row, index) => (
          <Input
            value={row.remarks ?? ''}
            onChange={(event) =>
              setRows((current) =>
                current.map((entry, entryIndex) =>
                  entryIndex === index
                    ? { ...entry, remarks: sanitizeText(event.target.value) }
                    : entry
                )
              )
            }
            placeholder="Optional notes"
          />
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

  const handleSave = async () => {
    if (!user) {
      toast.error('Sign in to submit grades.');
      return;
    }
    if (!examId) {
      toast.error('Provide an exam identifier.');
      return;
    }
    const payload: GradeEntryInput[] = rows
      .filter((row) => row.studentId && row.subject)
      .map(({ studentId, subject, score, remarks, classId }) => ({
        studentId: sanitizeIdentifier(studentId),
        subject: sanitizeText(subject),
        score,
        remarks: remarks ? sanitizeText(remarks) : undefined,
        classId: classId ? sanitizeIdentifier(classId) : undefined
      }));

    if (payload.length === 0) {
      toast.error('Add at least one grade entry with a student ID and subject.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.bulkUpsertGrades(examId, payload);
      toast.success(`Saved ${response.saved} grade entries.`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchDistribution = async () => {
    if (!examId) {
      toast.error('Provide an exam identifier first.');
      return;
    }
    setDistributionLoading(true);
    try {
      const report = await api.getGradeReport(sanitizeIdentifier(examId));
      setDistribution(report);
      toast.success('Loaded grade distribution.');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setDistributionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]/70 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Grade Entry</h1>
            <p className="text-sm text-slate-300">
              Enter an exam identifier, capture per-student marks, and sync with the grade service.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              label="Exam ID"
              value={examId}
              onChange={(event) => setExamId(sanitizeIdentifier(event.target.value))}
              placeholder="uuid-exam-id"
            />
            <Button variant="outline" onClick={fetchDistribution} loading={distributionLoading}>
              Load distribution
            </Button>
            <Button onClick={handleSave} loading={isSaving}>
              Save grades
            </Button>
          </div>
        </div>
      </header>

      <Table columns={columns} data={rows} emptyMessage="Add student entries to record grades." />

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={() =>
            setRows((current) => [
              ...current,
              { id: `row-${current.length}`, studentId: '', subject: '', score: 0 }
            ])
          }
        >
          Add row
        </Button>
        <Button
          variant="ghost"
          onClick={() => setRows([{ id: 'row-0', studentId: '', subject: '', score: 0 }])}
        >
          Clear
        </Button>
      </div>

      {distribution.length > 0 ? (
        <section className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]/70 p-6">
          <h2 className="text-lg font-semibold text-white">Grade distribution</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {distribution.map((entry) => (
              <div
                key={`${entry.subject}-${entry.grade}`}
                className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm font-semibold text-white">{entry.subject}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">Grade</p>
                <p className="text-2xl font-bold text-white">{entry.grade}</p>
                <p className="text-sm text-slate-300">
                  {entry.count} entries · avg {entry.average_score.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default TeacherGradeEntryPage;
