import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Header from '../src/components/Header';
import HeroMedia from '../src/components/HeroMedia';
import EstimateForm from '../src/components/EstimateForm';

function fillForm() {
  for (const [label, value] of [
    ['Full name', 'Test Homeowner'],
    ['Email', 'homeowner@example.com'],
    ['City', 'Columbus'],
    ['ZIP / postal code', '43215'],
    ['Tell us about your project', 'Compare new siding and window trim.'],
  ])
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  fireEvent.click(screen.getByLabelText('Siding'));
  fireEvent.click(screen.getByLabelText('Windows'));
}

describe('header', () => {
  it('keeps the logo and estimate link without navigation or a menu', () => {
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Culture Homes & Exteriors home' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: 'Request an Estimate' })).toHaveAttribute(
      'href',
      '/contact/',
    );
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('estimate form', () => {
  it('validates required fields and focuses the first error', async () => {
    render(<EstimateForm />);
    fireEvent.submit(document.querySelector('form'));
    expect(screen.getByLabelText('Full name')).toHaveFocus();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Please select at least one service.')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('has not been sent');
  });
  it('posts a multi-service Netlify submission using the detected form name and URL encoding', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, status: 200 });
    render(<EstimateForm />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Send Estimate/ }));
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('request has been received'),
    );
    expect(fetch).toHaveBeenCalledOnce();
    const [url, request] = fetch.mock.calls[0];
    expect(url).toBe('/');
    expect(request.method).toBe('POST');
    expect(request.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    const sent = new URLSearchParams(request.body);
    expect(sent.get('form-name')).toBe('estimate');
    expect(sent.get('email')).toBe('homeowner@example.com');
    expect(sent.getAll('services[]')).toEqual(['Siding', 'Windows']);
    expect(sent.get('website')).toBe('');
    expect(screen.getByRole('status')).toHaveFocus();
  });
  it('requires a phone number only when phone contact is selected', () => {
    render(<EstimateForm />);
    fillForm();
    fireEvent.change(screen.getByLabelText('Preferred contact method'), {
      target: { value: 'Phone' },
    });
    fireEvent.submit(document.querySelector('form'));
    expect(document.querySelector('#phone')).toBeRequired();
    expect(screen.getByText('Enter a phone number for phone contact.')).toBeVisible();
  });
  it('blocks honeypot submissions', () => {
    render(<EstimateForm />);
    fillForm();
    fireEvent.change(screen.getByLabelText('Leave blank'), { target: { value: 'bot' } });
    fireEvent.submit(document.querySelector('form'));
    expect(screen.getByRole('status')).toHaveTextContent('Unable to send');
  });
  it('shows loading, prevents duplicate submissions, and only succeeds after Netlify responds', async () => {
    let accept;
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () =>
        new Promise((resolve) => {
          accept = resolve;
        }),
    );
    render(<EstimateForm />);
    fillForm();
    fireEvent.submit(document.querySelector('form'));
    expect(screen.getByRole('button', { name: /Please wait/ })).toBeDisabled();
    expect(document.querySelector('form')).toHaveAttribute('aria-busy', 'true');
    fireEvent.submit(document.querySelector('form'));
    expect(globalThis.fetch).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).not.toHaveTextContent('has been received');
    accept({ ok: true, status: 200 });
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('request has been received'),
    );
    expect(screen.getByRole('button', { name: /Send Estimate/ })).toBeEnabled();
    expect(screen.getByLabelText('Full name')).toHaveValue('');
  });
  it.each([400, 404, 429, 500, 501, 'network failure'])(
    'retains entered details on %s',
    async (failure) => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
        if (failure === 'network failure') throw new Error('offline');
        return { ok: false, status: failure };
      });
      render(<EstimateForm />);
      fillForm();
      fireEvent.submit(document.querySelector('form'));
      await waitFor(() => expect(screen.getByRole('status')).toHaveClass('error'));
      expect(screen.getByLabelText('Full name')).toHaveValue('Test Homeowner');
      expect(screen.getByRole('button', { name: /Send Estimate/ })).toBeEnabled();
      expect(screen.getByRole('status')).not.toHaveTextContent('has been received');
    },
  );
});

describe('hero fallback', () => {
  it('renders a real photo and no video when footage has not been supplied', () => {
    render(<HeroMedia footage={{ desktop: '', mobile: '' }} />);
    expect(document.querySelector('video')).toBeNull();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/assets/hero-1920.webp');
  });
  it.each(['reduced motion', 'data saving'])(
    'does not load footage with %s enabled',
    (preference) => {
      vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
      const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
      const originalConnection = navigator.connection;
      if (preference === 'reduced motion')
        vi.mocked(window.matchMedia).mockReturnValueOnce({
          matches: true,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        });
      else
        Object.defineProperty(navigator, 'connection', {
          configurable: true,
          value: { saveData: true, addEventListener: vi.fn(), removeEventListener: vi.fn() },
        });
      render(<HeroMedia footage={{ desktop: '/drone.mp4', mobile: '/drone-mobile.mp4' }} />);
      expect(document.querySelector('video')).not.toHaveAttribute('src');
      expect(play).not.toHaveBeenCalled();
      Object.defineProperty(navigator, 'connection', {
        configurable: true,
        value: originalConnection,
      });
    },
  );
});
