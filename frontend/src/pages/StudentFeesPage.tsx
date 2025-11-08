import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import Table from '../components/Table';
import type { TableColumn } from '../components/Table';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { api, type Invoice } from '../lib/api';

const statusStyles: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-300',
  partial: 'bg-blue-500/10 text-blue-300',
  paid: 'bg-emerald-500/10 text-emerald-300',
  overdue: 'bg-red-500/10 text-red-300',
  refunded: 'bg-purple-500/10 text-purple-300'
};

export function StudentFeesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  const outstanding = useMemo(() => {
    return invoices
      .filter((invoice) => invoice.status !== 'paid')
      .reduce((sum, invoice) => sum + invoice.total_amount - invoice.amount_paid, 0);
  }, [invoices]);

  const paidCount = useMemo(
    () => invoices.filter((invoice) => invoice.status === 'paid').length,
    [invoices]
  );

  const nextDueDate = useMemo(() => {
    const upcoming = invoices
      .filter((invoice) => invoice.status !== 'paid')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    return upcoming[0]?.due_date ?? null;
  }, [invoices]);

  const columns: TableColumn<Invoice>[] = [
    { header: 'Invoice', key: 'id' },
    {
      header: 'Amount',
      render: (row) => `$${row.total_amount.toFixed(2)}`
    },
    {
      header: 'Paid',
      render: (row) => `$${row.amount_paid.toFixed(2)}`
    },
    {
      header: 'Due Date',
      render: (row) => new Date(row.due_date).toLocaleDateString()
    },
    {
      header: 'Status',
      render: (row) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[row.status]}`}
        >
          {row.status.toUpperCase()}
        </span>
      )
    }
  ];

  const loadInvoices = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getStudentInvoices(user.id);
      setInvoices(data);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      void loadInvoices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]/70 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Fee dashboard</h1>
            <p className="text-sm text-slate-300">
              Review outstanding invoices, check payment progress, and stay ahead of due dates.
            </p>
          </div>
          <Button variant="outline" onClick={loadInvoices} loading={loading}>
            Refresh
          </Button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-400">Outstanding balance</p>
            <p className="mt-2 text-2xl font-semibold text-white">${outstanding.toFixed(2)}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-400">Invoices paid</p>
            <p className="mt-2 text-2xl font-semibold text-white">{paidCount}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase text-slate-400">Next due date</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {nextDueDate ? new Date(nextDueDate).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>
      </header>

      <Table columns={columns} data={invoices} emptyMessage="No invoices issued yet." />
    </div>
  );
}

export default StudentFeesPage;
