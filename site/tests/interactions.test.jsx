import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Header from '../src/components/Header';
import Gallery, { BeforeAfter } from '../src/components/Gallery';
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

describe('navigation and gallery', () => {
  it('opens the mobile menu, operates every dropdown, and returns focus on Escape', async () => {
    const user = userEvent.setup();
    render(<Header current="home" />);
    const menu = screen.getByRole('button', { name: /Menu/ });
    await user.click(menu);
    expect(menu).toHaveAttribute('aria-expanded', 'true');
    for (const service of ['siding', 'roofing', 'windows', 'gutters']) {
      const toggle = screen.getByRole('button', { name: `Show ${service} topics` });
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(document.querySelector(`#nav-${service}`)).toContainElement(
        document.querySelector(`a[href="/${service}/#options"]`),
      );
      await user.keyboard('{Escape}');
      expect(toggle).toHaveFocus();
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    }
    await user.keyboard('{Escape}');
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    expect(menu).toHaveFocus();
  });
  it('closes a dropdown on outside click and when focus leaves its group', async () => {
    const user = userEvent.setup();
    render(<Header current="siding" />);
    const toggle = screen.getByRole('button', { name: 'Show siding topics' });
    await user.click(toggle);
    await user.click(screen.getByRole('link', { name: 'Home' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    fireEvent.blur(toggle, { relatedTarget: screen.getByRole('link', { name: 'Contact' }) });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
  it('filters each service and announces the number of images', async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    for (const label of ['Siding', 'Roofing', 'Windows', 'Gutters']) {
      await user.click(screen.getByRole('button', { name: label }));
      expect(document.querySelectorAll('figure:not([hidden])')).toHaveLength(1);
      expect(document.querySelector('#gallery-status')).toHaveTextContent(
        `Showing 1 ${label.toLowerCase()} image`,
      );
    }
    await user.click(screen.getByRole('button', { name: 'All details' }));
    expect(document.querySelectorAll('figure:not([hidden])')).toHaveLength(4);
  });
  it('only displays approved comparison photos and supports a keyboard-accessible range', () => {
    const { rerender } = render(<BeforeAfter />);
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    rerender(<BeforeAfter pair={{ approved: true, before: '/before.jpg', after: '/after.jpg' }} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '70' } });
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '70 percent before photo');
    expect(screen.getByAltText('Before the exterior project')).toHaveStyle({
      clipPath: 'inset(0 30% 0 0)',
    });
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
