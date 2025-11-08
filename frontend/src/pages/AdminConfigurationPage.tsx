import React, { useEffect, useMemo, useState } from 'react';
import { api, AcademicTerm, BrandingConfig, SchoolClass } from '../lib/api';
import { Button } from '../components/Button';
import { Table } from '../components/Table';

interface BrandingFormState {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  themeFlags: Record<string, boolean>;
}

const defaultBranding: BrandingFormState = {
  logoUrl: '',
  primaryColor: '#1d4ed8',
  secondaryColor: '#0f172a',
  themeFlags: {}
};

function AdminConfigurationPage() {
  const [branding, setBranding] = useState<BrandingFormState>(defaultBranding);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [termForm, setTermForm] = useState({ name: '', startsOn: '', endsOn: '' });
  const [classForm, setClassForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [brandingResponse, termsResponse, classesResponse] = await Promise.all([
          api.getBranding(),
          api.listTerms(),
          api.listClasses()
        ]);
        if (!isMounted) return;

        if (brandingResponse) {
          setBranding({
            logoUrl: brandingResponse.logo_url ?? '',
            primaryColor: brandingResponse.primary_color ?? '',
            secondaryColor: brandingResponse.secondary_color ?? '',
            themeFlags: (brandingResponse.theme_flags as Record<string, boolean> | null) ?? {}
          });
        }
        setTerms(termsResponse);
        setClasses(classesResponse);
      } catch (error) {
        setMessage((error as Error).message);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const brandingColumns = useMemo(
    () => [
      { header: 'Key', key: 'key' },
      { header: 'Value', key: 'value' }
    ],
    []
  );

  const termColumns = useMemo(
    () => [
      { header: 'Term', key: 'name' },
      { header: 'Starts', key: 'starts_on' },
      { header: 'Ends', key: 'ends_on' }
    ],
    []
  );

  const classColumns = useMemo(
    () => [
      { header: 'Class', key: 'name' },
      { header: 'Description', key: 'description' }
    ],
    []
  );

  const brandingData = useMemo(
    () => [
      { key: 'Logo URL', value: branding.logoUrl || 'Not set' },
      { key: 'Primary Color', value: branding.primaryColor || 'Not set' },
      { key: 'Secondary Color', value: branding.secondaryColor || 'Not set' },
      {
        key: 'Theme Flags',
        value: Object.entries(branding.themeFlags)
          .map(([flag, enabled]) => `${flag}: ${enabled ? 'on' : 'off'}`)
          .join(', ') || 'Not set'
      }
    ],
    [branding]
  );

  async function handleBrandingSave() {
    try {
      setLoading(true);
      setMessage(null);
      const payload: Partial<BrandingConfig> = {
        logo_url: branding.logoUrl,
        primary_color: branding.primaryColor,
        secondary_color: branding.secondaryColor,
        theme_flags: branding.themeFlags
      };
      await api.updateBranding(payload);
      setMessage('Branding saved.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTerm(event: React.FormEvent) {
    event.preventDefault();
    try {
      setLoading(true);
      setMessage(null);
      const created = await api.createTerm(termForm);
      setTerms((current) => [created, ...current]);
      setTermForm({ name: '', startsOn: '', endsOn: '' });
      setMessage('Academic term recorded.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateClass(event: React.FormEvent) {
    event.preventDefault();
    try {
      setLoading(true);
      setMessage(null);
      const created = await api.createClass(classForm);
      setClasses((current) => [created, ...current]);
      setClassForm({ name: '', description: '' });
      setMessage('Class saved.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Tenant Configuration</h1>
        <p className="text-sm text-slate-300">
          Manage branding, academic terms, and classes for the active tenant.
        </p>
      </div>

      {message && <div className="rounded bg-slate-800 p-3 text-sm text-slate-100">{message}</div>}

      <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-6">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Branding</h2>
            <p className="text-sm text-slate-400">
              Update logos, colors, and feature flags. Changes apply across all tenant pages.
            </p>
          </div>
          <Button onClick={handleBrandingSave} disabled={loading}>
            Save branding
          </Button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col space-y-1 text-sm text-slate-300">
            Logo URL
            <input
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              placeholder="https://cdn.school/logo.svg"
              value={branding.logoUrl}
              onChange={(event) =>
                setBranding((state) => ({ ...state, logoUrl: event.target.value }))
              }
            />
          </label>
          <label className="flex flex-col space-y-1 text-sm text-slate-300">
            Primary color
            <input
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={branding.primaryColor}
              onChange={(event) =>
                setBranding((state) => ({ ...state, primaryColor: event.target.value }))
              }
              placeholder="#1d4ed8"
            />
          </label>
          <label className="flex flex-col space-y-1 text-sm text-slate-300">
            Secondary color
            <input
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={branding.secondaryColor}
              onChange={(event) =>
                setBranding((state) => ({ ...state, secondaryColor: event.target.value }))
              }
              placeholder="#0f172a"
            />
          </label>
          <label className="flex flex-col space-y-1 text-sm text-slate-300">
            Dark mode
            <select
              className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={branding.themeFlags.darkMode ? 'enabled' : 'disabled'}
              onChange={(event) =>
                setBranding((state) => ({
                  ...state,
                  themeFlags: { ...state.themeFlags, darkMode: event.target.value === 'enabled' }
                }))
              }
            >
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </label>
        </div>

        <div className="mt-6">
          <Table columns={brandingColumns} data={brandingData} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-6">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-white">Academic terms</h2>
          <p className="text-sm text-slate-400">
            Define school calendar segments for reporting, attendance, and exams.
          </p>
        </header>
        <form className="grid gap-4 sm:grid-cols-4" onSubmit={handleCreateTerm}>
          <input
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            placeholder="Term name"
            required
            value={termForm.name}
            onChange={(event) => setTermForm((state) => ({ ...state, name: event.target.value }))}
          />
          <input
            type="date"
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            placeholder="Start date"
            required
            value={termForm.startsOn}
            onChange={(event) =>
              setTermForm((state) => ({ ...state, startsOn: event.target.value }))
            }
          />
          <input
            type="date"
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            placeholder="End date"
            required
            value={termForm.endsOn}
            onChange={(event) =>
              setTermForm((state) => ({ ...state, endsOn: event.target.value }))
            }
          />
          <Button type="submit" disabled={loading}>
            Add term
          </Button>
        </form>
        <div className="mt-4">
          <Table columns={termColumns} data={terms} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/80 p-6">
        <header className="mb-4">
          <h2 className="text-xl font-semibold text-white">Classes</h2>
          <p className="text-sm text-slate-400">
            Manage class groupings used throughout attendance, results, and invoicing.
          </p>
        </header>
        <form className="grid gap-4 sm:grid-cols-3" onSubmit={handleCreateClass}>
          <input
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            placeholder="Class name"
            required
            value={classForm.name}
            onChange={(event) =>
              setClassForm((state) => ({ ...state, name: event.target.value }))
            }
          />
          <input
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            placeholder="Description"
            value={classForm.description}
            onChange={(event) =>
              setClassForm((state) => ({ ...state, description: event.target.value }))
            }
          />
          <Button type="submit" disabled={loading}>
            Add class
          </Button>
        </form>
        <div className="mt-4">
          <Table columns={classColumns} data={classes} />
        </div>
      </section>
    </div>
  );
}

export default AdminConfigurationPage;


