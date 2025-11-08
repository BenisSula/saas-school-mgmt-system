import React, { useEffect, useMemo, useState } from 'react';
import { api, TenantUser } from '../lib/api';
import { Table } from '../components/Table';
import { Button } from '../components/Button';

const ROLES: TenantUser['role'][] = ['student', 'teacher', 'admin', 'superadmin'];

function AdminRoleManagementPage() {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.listUsers();
        if (active) {
          setUsers(data);
        }
      } catch (error) {
        setMessage((error as Error).message);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const columns = useMemo(
    () => [
      { header: 'Email', key: 'email' },
      { header: 'Role', key: 'role' },
      { header: 'Verified', key: 'is_verified' },
      { header: 'Created', key: 'created_at' },
      { header: 'Actions', key: 'actions' }
    ],
    []
  );

  const data = users.map((user) => ({
    ...user,
    is_verified: user.is_verified ? 'Yes' : 'No',
    actions: (
      <div className="flex items-center gap-2">
        <select
          className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
          value={user.role}
          onChange={async (event) => {
            try {
              setLoading(true);
              setMessage(null);
              const nextRole = event.target.value as TenantUser['role'];
              const updated = await api.updateUserRole(user.id, nextRole);
              setUsers((current) =>
                current.map((entry) => (entry.id === user.id ? { ...entry, role: updated.role } : entry))
              );
              setMessage(`Role updated for ${user.email}`);
            } catch (error) {
              setMessage((error as Error).message);
            } finally {
              setLoading(false);
            }
          }}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
    )
  }));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Role management</h1>
          <p className="text-sm text-slate-300">
            View tenant users and adjust their role assignment. Only admins and superadmins can modify roles.
          </p>
        </div>
        <Button onClick={async () => {
          try {
            setLoading(true);
            setMessage(null);
            const refreshed = await api.listUsers();
            setUsers(refreshed);
          } catch (error) {
            setMessage((error as Error).message);
          } finally {
            setLoading(false);
          }
        }} disabled={loading}>
          Refresh
        </Button>
      </header>

      {message && <div className="rounded bg-slate-800 p-3 text-sm text-slate-100">{message}</div>}

      <Table columns={columns} data={data} />
    </div>
  );
}

export default AdminRoleManagementPage;


