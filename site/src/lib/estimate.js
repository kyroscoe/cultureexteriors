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
  if (!data.getAll('services').length) errors.services = 'Please select at least one service.';
  return errors;
}

export function emailDraft(data, email) {
  const body = `Estimate request\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone') || 'Not provided'}\nCity: ${data.get('city')}\nZIP / postal code: ${data.get('postal')}\nServices: ${data.getAll('services').join(', ')}\nPreferred contact: ${data.get('method')}\n\nProject:\n${data.get('description')}`;
  return `mailto:${email}?subject=${encodeURIComponent('Exterior project estimate request')}&body=${encodeURIComponent(body)}`;
}

export async function deliverEstimate(endpoint, data) {
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...Object.fromEntries(data), services: data.getAll('services') }),
    });
  } catch {
    throw new Error('Connection failed. Please email us directly.');
  }
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('The delivery service could not confirm acceptance. Please email us directly.');
  }
  if (!response.ok || result.accepted !== true)
    throw new Error(
      'Your request was not accepted by the delivery service. Please try again or email us directly.',
    );
}
