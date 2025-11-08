import React from 'react';
import Table, { TableColumn } from '../components/Table';
import { Button } from '../components/Button';

type InvoiceRow = {
  id: string;
  description: string;
  amount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  dueDate: string;
};

const mockInvoices: InvoiceRow[] = [
  {
    id: 'INV-001',
    description: 'Term 1 Tuition',
    amount: 500,
    status: 'pending',
    dueDate: '2025-03-01'
  },
  {
    id: 'INV-002',
    description: 'Laboratory Fee',
    amount: 120,
    status: 'paid',
    dueDate: '2025-01-15'
  },
  {
    id: 'INV-003',
    description: 'Sports Program',
    amount: 80,
    status: 'partial',
    dueDate: '2025-02-20'
  }
];

const statusStyles: Record<InvoiceRow['status'], string> = {
  pending: 'bg-yellow-500/10 text-yellow-300',
  partial: 'bg-blue-500/10 text-blue-300',
  paid: 'bg-emerald-500/10 text-emerald-300',
  overdue: 'bg-red-500/10 text-red-300'
};

export function StudentFeesPage() {
  const outstanding = mockInvoices
    .filter((invoice) => invoice.status !== 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const columns: TableColumn<InvoiceRow>[] = [
    { header: 'Invoice', key: 'id' },
    { header: 'Description', key: 'description' },
    {
      header: 'Amount',
      render: (row) => `$${row.amount.toFixed(2)}`
    },
    {
      header: 'Due Date',
      render: (row) => new Date(row.dueDate).toLocaleDateString()
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[row.status]}`}>
          {row.status.toUpperCase()}
        </span>
      )
    },
    {
      header: 'Action',
      render: (row) =>
        row.status === 'paid' ? (
          <span className="text-xs text-slate-400">Complete</span>
        ) : (
          <Button variant="secondary">Pay Now</Button>
        )
    }
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-slate-800 bg-slate-900/80 p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-white">Fee Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          Review outstanding invoices, track payment status, and complete payments securely.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs uppercase text-slate-400">Outstanding Balance</p>
            <p className="mt-2 text-2xl font-semibold text-white">${outstanding.toFixed(2)}</p>
          </div>
          <div className="rounded-md border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs uppercase text-slate-400">Invoices Paid</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {mockInvoices.filter((invoice) => invoice.status === 'paid').length}
            </p>
          </div>
          <div className="rounded-md border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs uppercase text-slate-400">Next Due Date</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {new Date(mockInvoices[0].dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </header>

      <Table columns={columns} data={mockInvoices} emptyMessage="No invoices issued yet." />
    </div>
  );
}

export default StudentFeesPage;

