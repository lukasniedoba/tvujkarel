import {
  validateContact,
  type ContactResponse,
  type ContactField,
  type ValidationCode,
} from '../lib/contact';
import type { Dictionary, ApiCode } from '../i18n/schema';
const form = document.querySelector<HTMLFormElement>('#contact-form');
if (form) {
  const t = JSON.parse(
    document.querySelector('#form-translations')!.textContent!,
  ) as Dictionary['form'];
  const button = form.querySelector<HTMLButtonElement>('[type=submit]')!;
  const buttonText = button.querySelector('span')!;
  const status = form.querySelector<HTMLElement>('#form-status')!;
  let pending = false;
  const showStatus = (code: ApiCode, success = false) => {
    status.textContent = t.codes[code] ?? t.codes.UNKNOWN_ERROR;
    status.className = `form-status ${success ? 'success' : 'error'}`;
    status.hidden = false;
    status.focus();
  };
  const showFields = (fields: Partial<Record<ContactField, ValidationCode>>) => {
    for (const [field, code] of Object.entries(fields)) {
      const input = form.elements.namedItem(field);
      const error = document.getElementById(`${field}-error`);
      if (input instanceof HTMLElement) {
        input.setAttribute('aria-invalid', 'true');
        if (error) {
          error.textContent =
            t.fieldInvalid[field as keyof typeof t.fieldInvalid] + ' ' + t.fieldErrors[code!];
          error.hidden = false;
        }
      }
    }
    form.querySelector<HTMLElement>('[aria-invalid=true]')?.focus();
  };
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending) return;
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    form.querySelectorAll<HTMLElement>('.field-error').forEach((el) => {
      el.hidden = true;
      el.textContent = '';
    });
    status.hidden = true;
    const data = Object.fromEntries(new FormData(form));
    data.locale = form.dataset.locale!;
    const validation = validateContact(data);
    if (!validation.ok) {
      showStatus('VALIDATION_ERROR');
      showFields(validation.fields);
      return;
    }
    pending = true;
    button.disabled = true;
    // The request contains a snapshot of these values. Keep them unchanged until
    // acceptance/failure so a later reset cannot discard edits that were not sent.
    const pendingControls = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        'input, textarea, select',
      ),
    ).filter((control) => !control.disabled);
    pendingControls.forEach((control) => {
      control.disabled = true;
    });
    form.setAttribute('aria-busy', 'true');
    buttonText.textContent = t.submitting;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data),
        signal: controller.signal,
      });
      const result = (await response.json().catch(() => null)) as ContactResponse | null;
      // Server-side validation may focus an invalid field below. Restore the
      // controls once the response is read, before applying that focus.
      pendingControls.forEach((control) => {
        control.disabled = false;
      });
      if (response.ok && result?.ok === true && result.code === 'ACCEPTED') {
        showStatus('ACCEPTED', true);
        form.reset();
      } else {
        const code =
          response.status === 429
            ? 'RATE_LIMITED'
            : result && result.code in t.codes && result.code !== 'ACCEPTED'
              ? result.code
              : 'UNKNOWN_ERROR';
        showStatus(code);
        if (result?.fields) showFields(result.fields);
      }
    } catch {
      showStatus('NETWORK_ERROR');
    } finally {
      clearTimeout(timer);
      pending = false;
      button.disabled = false;
      pendingControls.forEach((control) => {
        control.disabled = false;
      });
      buttonText.textContent = t.submit;
      form.removeAttribute('aria-busy');
    }
  });
  form.addEventListener('input', (event) => {
    const input = event.target;
    if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
      input.removeAttribute('aria-invalid');
      const error = document.getElementById(`${input.name}-error`);
      if (error) error.hidden = true;
    }
  });
}
