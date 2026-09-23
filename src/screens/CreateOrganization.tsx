import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { MultiSelect, type MultiSelectOption } from '../components/ui/MultiSelect';
import { apiFetch, ApiError } from '../config/api';
import styles from './CreateOrganization.module.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;
// Mirrors Backend/src/middleware/validateOrganizationInvite.ts, which
// mirrors the DB check constraints in
// supabase/migrations/20260921020000_create_organizations.sql — each layer
// validates independently, same pattern as the rest of this schema.
const REG_ID_REGEX = /^[A-Z]{2}\/[A-Z]{2,15}\/[0-9]{4}\/[0-9]{3,8}$/;
const LICENCE_NO_REGEX = /^[A-Z]{2}-[A-Z]{2,15}-(20B|21B)-[0-9]{3,10}$/;

interface FormState {
  orgName: string;
  mainBranchName: string;
  regId: string;
  licenceNo: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
}

const initialForm: FormState = {
  orgName: '',
  mainBranchName: '',
  regId: '',
  licenceNo: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: 'India',
  pincode: '',
  adminName: '',
  adminEmail: '',
  adminPhone: '',
};

function validate(form: FormState): string | null {
  if (form.orgName.trim().length < 2) return 'Organization name is required';
  if (form.mainBranchName.trim().length < 2) return 'Main branch name is required';
  if (!REG_ID_REGEX.test(form.regId.trim().toUpperCase())) {
    return 'Clinical Establishment Reg. ID must look like MH/PUNE/2026/04128';
  }
  if (!LICENCE_NO_REGEX.test(form.licenceNo.trim().toUpperCase())) {
    return 'Pharmacy Licence Number must look like MH-PUNE-20B-1234';
  }
  if (form.pincode.trim() && !PINCODE_REGEX.test(form.pincode.trim())) {
    return 'Pincode must be 6 digits';
  }
  if (form.adminName.trim().length < 2) return 'Admin name is required';
  if (!EMAIL_REGEX.test(form.adminEmail.trim().toLowerCase())) {
    return 'A valid admin email is required';
  }
  if (form.adminPhone.trim() && !PHONE_REGEX.test(form.adminPhone.trim())) {
    return 'Admin phone must be 10 digits';
  }
  return null;
}

interface CreateOrganizationResponse {
  organization_id: string;
  admin_user_id: string;
  email_sent: boolean;
}

/**
 * Super admin form: creates an organization and invites its org admin in
 * one request (POST /organizations — see
 * Backend/src/controllers/organizationController.ts). Trims every field and
 * re-validates client-side before sending, same checks the backend runs, so
 * a bad request fails immediately instead of round-tripping.
 */
export function CreateOrganization() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [hospitalTypes, setHospitalTypes] = useState<MultiSelectOption[]>([]);
  const [hospitalTypeIds, setHospitalTypeIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    apiFetch<{ hospital_types: { id: string; name: string }[] }>('/hospitals/types')
      .then((data) => {
        if (cancelled) return;
        setHospitalTypes(data.hospital_types.map((type) => ({ id: type.id, label: type.name })));
      })
      .catch(() => {
        if (!cancelled) setError('Could not load hospital types — refresh to try again');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(field: keyof FormState) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const result = await apiFetch<CreateOrganizationResponse>('/organizations', {
        method: 'POST',
        body: JSON.stringify({
          organization: {
            name: form.orgName.trim(),
            main_branch_name: form.mainBranchName.trim(),
            reg_id: form.regId.trim().toUpperCase(),
            licence_no: form.licenceNo.trim().toUpperCase(),
            address_line1: form.addressLine1.trim() || null,
            address_line2: form.addressLine2.trim() || null,
            city: form.city.trim() || null,
            state: form.state.trim() || null,
            country: form.country.trim() || null,
            pincode: form.pincode.trim() || null,
            hospital_type_ids: hospitalTypeIds,
          },
          admin: {
            name: form.adminName.trim(),
            email: form.adminEmail.trim().toLowerCase(),
            phone: form.adminPhone.trim() || null,
          },
        }),
      });

      setSuccess(
        result.email_sent
          ? `Organization created — an invite was emailed to ${form.adminEmail.trim()}.`
          : 'Organization created, but the invite email failed to send. Check Resend and invite the admin manually.',
      );
      setForm(initialForm);
      setHospitalTypeIds([]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong, please try again');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell
      title="New organization"
      subtitle="Create an organization and invite its admin"
      actions={
        <Button variant="secondary" size="sm" onClick={() => navigate('/organizations')}>
          Back to organizations
        </Button>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Card title="Organization details" className={styles.card}>
          <div className={styles.grid}>
            <FormField
              label="Organization name"
              value={form.orgName}
              onChange={handleChange('orgName')}
              required
            />
            <FormField
              label="Main branch name"
              value={form.mainBranchName}
              onChange={handleChange('mainBranchName')}
              required
            />
            <FormField
              label="Clinical Establishment Reg. ID"
              value={form.regId}
              onChange={handleChange('regId')}
              placeholder="MH/PUNE/2026/04128"
              required
            />
            <FormField
              label="Pharmacy Licence Number"
              value={form.licenceNo}
              onChange={handleChange('licenceNo')}
              placeholder="MH-PUNE-20B-1234"
              required
            />
            <FormField label="Address line 1" value={form.addressLine1} onChange={handleChange('addressLine1')} />
            <FormField label="Address line 2" value={form.addressLine2} onChange={handleChange('addressLine2')} />
            <FormField label="City" value={form.city} onChange={handleChange('city')} />
            <FormField label="State" value={form.state} onChange={handleChange('state')} />
            <FormField label="Country" value={form.country} onChange={handleChange('country')} />
            <FormField label="Pincode" value={form.pincode} onChange={handleChange('pincode')} placeholder="411001" />
            <div className={styles.field}>
              <label className={styles.label}>Hospital types</label>
              <MultiSelect
                options={hospitalTypes}
                selected={hospitalTypeIds}
                onChange={setHospitalTypeIds}
                placeholder="Select hospital types…"
              />
            </div>
          </div>
        </Card>

        <Card title="Organization admin" className={styles.card}>
          <div className={styles.grid}>
            <FormField
              label="Admin name"
              value={form.adminName}
              onChange={handleChange('adminName')}
              required
            />
            <FormField
              label="Admin email"
              type="email"
              value={form.adminEmail}
              onChange={handleChange('adminEmail')}
              required
            />
            <FormField
              label="Admin phone"
              value={form.adminPhone}
              onChange={handleChange('adminPhone')}
              placeholder="9876543210"
            />
          </div>
        </Card>

        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        {success && <p className={styles.success}>{success}</p>}

        <Button type="submit" disabled={submitting} className={styles.submit}>
          {submitting ? 'Creating…' : 'Create organization'}
        </Button>
      </form>
    </AppShell>
  );
}
