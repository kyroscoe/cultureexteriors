import { useEffect, useRef, useState } from 'react';
import content from '../data/content.json';
import { deliverEstimate, ESTIMATE_FORM_NAME, validateEstimate } from '../lib/estimate';

export default function EstimateForm() {
  const [errors, setErrors] = useState({});
  const [method, setMethod] = useState('Email');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [failed, setFailed] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const statusRef = useRef(null);
  const formRef = useRef(null);
  const submitting = useRef(false);

  useEffect(() => {
    setEnhanced(true);
  }, []);
  useEffect(() => {
    const first = Object.keys(errors)[0];
    if (first)
      formRef.current
        .querySelector(first === 'services' ? '[name="services[]"]' : `#${first}`)
        .focus();
  }, [errors]);

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setFailed(false);
    setStatus('');
    if (data.get('website')) {
      setFailed(true);
      setStatus('Unable to send this request. Please email us directly.');
      return;
    }
    const nextErrors = validateEstimate(data);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setFailed(true);
      setStatus('Please check the highlighted fields. Your request has not been sent.');
      return;
    }
    submitting.current = true;
    setBusy(true);
    setStatus('Sending your request…');
    try {
      await deliverEstimate(data);
      setStatus('Your estimate request has been received. Thank you.');
      form.reset();
      setMethod('Email');
      statusRef.current.focus();
    } catch (error) {
      setFailed(true);
      setStatus(error.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  function field(id, label, options = {}) {
    const { className = '', ...attributes } = options;
    return (
      <div className={`field ${className}`}>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          name={id}
          required={id !== 'phone' || method === 'Phone'}
          aria-invalid={errors[id] ? true : undefined}
          aria-describedby={errors[id] ? `${id}-error` : undefined}
          {...attributes}
        />
        {errors[id] && (
          <span className="field-error" id={`${id}-error`}>
            {errors[id]}
          </span>
        )}
      </div>
    );
  }

  return (
    <form
      name={ESTIMATE_FORM_NAME}
      method="POST"
      action="/"
      className="form"
      id="estimate-form"
      ref={formRef}
      noValidate={enhanced}
      onSubmit={submit}
      aria-busy={busy || undefined}
    >
      <input type="hidden" name="form-name" value={ESTIMATE_FORM_NAME} />
      <h3>Project details</h3>
      <p className="note">Fields are required unless marked optional.</p>
      <div className="trap" aria-hidden="true">
        <label>
          Leave blank
          <input name="website" tabIndex="-1" autoComplete="off" />
        </label>
      </div>
      <div className="form-grid">
        {field('name', 'Full name', { autoComplete: 'name', maxLength: 120, className: 'full' })}
        {field('email', 'Email', { type: 'email', autoComplete: 'email', maxLength: 200 })}
        {field(
          'phone',
          <>
            Phone{' '}
            <span className="note" id="phone-requirement">
              {method === 'Phone' ? '(required for phone contact)' : '(optional)'}
            </span>
          </>,
          { type: 'tel', autoComplete: 'tel', maxLength: 40 },
        )}
        {field('city', 'City', { autoComplete: 'address-level2', maxLength: 100 })}
        {field('postal', 'ZIP / postal code', { autoComplete: 'postal-code', maxLength: 20 })}
      </div>
      <fieldset>
        <legend>
          What are you considering? <span className="note">Select all that apply.</span>
        </legend>
        <div className="checks">
          {Object.values(content.services).map((service, index) => (
            <label key={service.title}>
              <input
                type="checkbox"
                name="services[]"
                value={service.title}
                aria-invalid={index === 0 && errors.services ? true : undefined}
                aria-describedby={index === 0 && errors.services ? 'service-error' : undefined}
              />
              {service.title}
            </label>
          ))}
        </div>
        {errors.services && (
          <p id="service-error" className="field-error">
            {errors.services}
          </p>
        )}
      </fieldset>
      <div className="field">
        <label htmlFor="description">Tell us about your project</label>
        <textarea
          id="description"
          name="description"
          maxLength="4000"
          minLength="10"
          required
          placeholder="What would you like to improve?"
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <span className="field-error" id="description-error">
            {errors.description}
          </span>
        )}
      </div>
      <div className="field" style={{ marginTop: 20 }}>
        <label htmlFor="method">Preferred contact method</label>
        <select
          id="method"
          name="method"
          value={method}
          onChange={(event) => setMethod(event.target.value)}
          required
        >
          <option value="Email">Email</option>
          <option value="Phone">Phone</option>
        </select>
      </div>
      <p className="form-note">
        Your details are used to respond to your project inquiry. No marketing signup is required.{' '}
        <a href="/privacy/">Privacy notice</a>
      </p>
      <button className="btn" type="submit" id="submit-estimate" disabled={busy}>
        {busy ? 'Please wait…' : 'Send Estimate Request'} <span aria-hidden="true">↗</span>
      </button>
      <div
        className={`status${failed ? ' error' : ''}`}
        role="status"
        aria-live="polite"
        id="form-status"
        ref={statusRef}
        tabIndex="-1"
      >
        {status}
      </div>
    </form>
  );
}

// Build-only HTML outside React's root: Netlify modifies this definition during
// deployment, leaving the hydrated form's DOM unchanged. Keep field names in sync.
export function NetlifyFormDefinition() {
  return (
    <form
      name={ESTIMATE_FORM_NAME}
      method="POST"
      data-netlify="true"
      netlify-honeypot="website"
      hidden
    >
      <input type="hidden" name="form-name" value={ESTIMATE_FORM_NAME} />
      <input name="name" />
      <input type="email" name="email" />
      <input name="phone" />
      <input name="city" />
      <input name="postal" />
      {Object.values(content.services).map((service) => (
        <input key={service.title} type="checkbox" name="services[]" value={service.title} />
      ))}
      <textarea name="description" />
      <select name="method">
        <option value="Email">Email</option>
        <option value="Phone">Phone</option>
      </select>
      <input name="website" />
    </form>
  );
}
