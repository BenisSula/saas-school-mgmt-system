import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import Table from '../components/Table';
import type { TableColumn } from '../components/Table';
import { Button } from '../components/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { api, type StudentResult } from '../lib/api';
import { sanitizeIdentifier } from '../lib/sanitize';

export function StudentResultsPage() {
  const { user } = useAuth();
  const [examId, setExamId] = useState('');
  const [result, setResult] = useState<StudentResult | null>(null);
  const [loading, setLoading] = useState(false);

  const total = result?.overall_score ?? 0;
  const percentage = useMemo(() => {
    if (!result || result.breakdown.length === 0) return 0;
    return Math.round((total / (result.breakdown.length * 100)) * 100);
  }, [result, total]);

  const columns: TableColumn<StudentResult['breakdown'][number]>[] = [
    { header: 'Subject', key: 'subject' },
    { header: 'Score', render: (row) => row.score.toFixed(1) },
    { header: 'Grade', key: 'grade' }
  ];

  const fetchResults = async () => {
    if (!user) {
      toast.error('Sign in to load results.');
      return;
    }
    if (!examId) {
      toast.error('Provide an exam identifier.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.getStudentResult(user.id, sanitizeIdentifier(examId));
      setResult(response);
      toast.success('Results loaded.');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]/70 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">My Exam Results</h1>
            <p className="text-sm text-slate-300">
              Enter an exam identifier to fetch your subject breakdown and overall score.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              label="Exam ID"
              value={examId}
              onChange={(event) => setExamId(sanitizeIdentifier(event.target.value))}
              placeholder="uuid-exam-id"
            />
            <Button onClick={fetchResults} loading={loading}>
              Load results
            </Button>
          </div>
        </div>
        {result ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-md border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-xs uppercase text-slate-400">Total Score</p>
              <p className="text-xl font-semibold text-white">{total.toFixed(1)}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-xs uppercase text-slate-400">Percentage</p>
              <p className="text-xl font-semibold text-white">{percentage}%</p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-xs uppercase text-slate-400">Grade</p>
              <p className="text-xl font-semibold text-white">{result.grade}</p>
            </div>
          </div>
        ) : null}
      </header>

      <Table
        columns={columns}
        data={result?.breakdown ?? []}
        emptyMessage="Load an exam to see per-subject results."
      />
    </div>
  );
}

export default StudentResultsPage;
