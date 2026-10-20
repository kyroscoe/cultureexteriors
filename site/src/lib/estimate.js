export const ESTIMATE_FORM_NAME = 'estimate';

export function validateEstimate(data) {
  const errors = {};
  const value = (key) => String(data.get(key) || '').trim();
  if (!value('name')) errors.name = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email')))
    errors.email = 'Enter a valid email address.';
  if (!value('city')) errors.city = 'Enter your city.';
  if (!value('postal')) errors.postal = 'Enter your ZIP or postal code.';
  if (value('description').length < 10)
    errors.description = 'Describe your project in at least 10 characters.';
  if (value('method') === 'Phone' && !value('phone'))
    errors.phone = 'Enter a phone number for phone contact.';
  if (!data.getAll('services[]').length) errors.services = 'Please select at least one service.';
  return errors;
}

export async function deliverEstimate(data) {
  const body = new URLSearchParams(data);
  body.set('form-name', ESTIMATE_FORM_NAME);
  let response;
  try {
    response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  } catch {
    throw new Error('Connection failed. Please email us directly.');
  }
  // Netlify responds with HTML, not JSON. A non-2xx response must never show success.
  if (!response.ok)
    throw new Error(
      response.status === 501
        ? 'This local preview cannot submit requests. Please use the live website or email info@cultureexteriors.com.'
        : 'Your request was not accepted. Your details are still here. Please try again or email info@cultureexteriors.com.',
    );
}
