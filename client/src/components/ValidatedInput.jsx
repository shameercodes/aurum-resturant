import { useState } from 'react';
import { sanitize, validators, fieldProps } from '../utils/fieldValidation';

/**
 * @param {string} fieldType - name | email | phone | zip | city | street | text | address | price | stock | rating | otp
 */
export default function ValidatedInput({
  fieldType = 'text',
  value,
  onChange,
  error: externalError,
  showError = true,
  className = 'input-field',
  ...rest
}) {
  const [touched, setTouched] = useState(false);
  const sanitizer =
    fieldType === 'street' ? sanitize.address : (sanitize[fieldType] || sanitize.text);
  const validator = validators[fieldType];
  const props = fieldProps[fieldType] || {};

  const internalError = validator && touched ? validator(value) : '';
  const error = externalError || internalError;

  const handleChange = e => {
    onChange(sanitizer(e.target.value));
  };

  return (
    <div>
      <input
        {...props}
        {...rest}
        className={className}
        value={value}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        aria-invalid={!!error}
      />
      {showError && error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
