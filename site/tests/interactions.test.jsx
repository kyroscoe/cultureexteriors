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
  it('prepares a multi-service email draft without a network request or false success', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    render(<EstimateForm />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Prepare Email/ }));
    const draft = await screen.findByRole('link', { name: /Open your email draft/ });
    expect(draft).toHaveAttribute(
      'href',
      expect.stringContaining('mailto:info@cultureexteriors.com'),
    );
    expect(decodeURIComponent(draft.href)).toContain('Services: Siding, Windows');
    expect(draft).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Nothing has been sent');
    expect(fetch).not.toHaveBeenCalled();
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
    expect(screen.getByRole('status')).toHaveTextContent('Unable to prepare');
    expect(screen.queryByRole('link', { name: /Open your email draft/ })).not.toBeInTheDocument();
  });
  it('shows loading and only succeeds after explicit delivery acceptance', async () => {
    let accept;
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () =>
        new Promise((resolve) => {
          accept = resolve;
        }),
    );
    render(<EstimateForm endpoint="/api/estimate" />);
    fillForm();
    fireEvent.submit(document.querySelector('form'));
    expect(screen.getByRole('button', { name: /Please wait/ })).toBeDisabled();
    expect(document.querySelector('form')).toHaveAttribute('aria-busy', 'true');
    accept({ ok: true, json: async () => ({ accepted: true }) });
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('accepted your estimate request'),
    );
    expect(screen.getByRole('button', { name: /Send Estimate/ })).toBeEnabled();
    expect(screen.getByLabelText('Full name')).toHaveValue('');
  });
  it.each(['rejected', 'network failure', 'invalid JSON'])(
    'retains entered details on %s',
    async (failure) => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
        if (failure === 'network failure') throw new Error('offline');
        return {
          ok: failure === 'invalid JSON',
          json: async () => {
            if (failure === 'invalid JSON') throw new Error('invalid');
            return { accepted: false };
          },
        };
      });
      render(<EstimateForm endpoint="/api/estimate" />);
      fillForm();
      fireEvent.submit(document.querySelector('form'));
      await waitFor(() => expect(screen.getByRole('status')).toHaveClass('error'));
      expect(screen.getByLabelText('Full name')).toHaveValue('Test Homeowner');
      expect(screen.getByRole('button', { name: /Send Estimate/ })).toBeEnabled();
      expect(screen.getByRole('status')).not.toHaveTextContent(
        'accepted your estimate request. Thank you',
      );
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
