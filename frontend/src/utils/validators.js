export function validatePhone(phone) {
  if (!phone) return { valid: false, error: 'ទូរស័ព្ទត្រូវតែចាំបាច់' };
  const cleaned = phone.replace(/[\s-]/g, '');
  if (/^\+?855\d{8,9}$/.test(cleaned) || /^\d{8,9}$/.test(cleaned)) return { valid: true, error: '' };
  return { valid: false, error: 'លេខទូរស័ព្ទមិនត្រឹមត្រូវ' };
}

export function validateEmail(email) {
  if (!email) return { valid: false, error: 'អ៊ីមែលត្រូវតែចាំបាច់' };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: true, error: '' };
  return { valid: false, error: 'អ៊ីមែលមិនត្រឹមត្រូវ' };
}

export function validatePassword(password) {
  if (!password) return { valid: false, error: 'ពាក្យសម្ងាត់ត្រូវតែចាំបាច់', strength: 0 };
  if (password.length < 8) return { valid: false, error: 'ពាក្យសម្ងាត់យ៉ាងតិច ៨ តួអក្សរ', strength: 1 };
  let strength = 1;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return { valid: strength >= 2, error: strength < 2 ? 'ពាក្យសម្ងាត់ខ្សោយពេក' : '', strength: Math.min(strength, 4) };
}

export function validatePrice(price) {
  if (!price && price !== 0) return { valid: false, error: 'តម្លៃត្រូវតែចាំបាច់' };
  const num = Number(price);
  if (isNaN(num) || num < 0) return { valid: false, error: 'តម្លៃមិនត្រឹមត្រូវ' };
  return { valid: true, error: '' };
}

export function validateRequired(value, fieldName = 'Field') {
  if (!value || (typeof value === 'string' && !value.trim())) return { valid: false, error: `${fieldName} ត្រូវតែចាំបាច់` };
  return { valid: true, error: '' };
}

export function validateKhmerPhone(phone) {
  if (!phone) return { valid: false, error: 'ទូរស័ព្ទត្រូវតែចាំបាច់' };
  const cleaned = phone.replace(/[\s-]/g, '');
  if (/^855\d{8,9}$/.test(cleaned) || /^\d{8,9}$/.test(cleaned)) return { valid: true, error: '' };
  return { valid: false, error: 'បញ្ចូលលេខទូរស័ព្ទកម្ពុជា ៨ digits' };
}
