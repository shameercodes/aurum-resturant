import { useState } from 'react';
import ValidatedInput from '../components/ValidatedInput';
import { sanitize, validators } from '../utils/fieldValidation';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const submit = e => {
    e.preventDefault();
    const fieldErrors = {
      name: validators.name(form.name),
      email: validators.email(form.email),
      message: form.message.trim().length < 10 ? 'Message must be at least 10 characters' : '',
    };
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Contact us</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="card p-6">
          {sent ? (
            <p className="text-green-600">Thank you! We'll get back to you soon.</p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <ValidatedInput
                fieldType="name"
                placeholder="Your name"
                required
                value={form.name}
                onChange={v => setForm({ ...form, name: v })}
                error={errors.name}
              />
              <ValidatedInput
                fieldType="email"
                placeholder="Email"
                required
                value={form.email}
                onChange={v => setForm({ ...form, email: v })}
                error={errors.email}
              />
              <div>
                <textarea
                  className="input-field"
                  rows={5}
                  placeholder="Message"
                  required
                  value={form.message}
                  onChange={e => setForm({ ...form, message: sanitize.text(e.target.value, 500) })}
                />
                {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
              </div>
              <button type="submit" className="btn-primary w-full">Send message</button>
            </form>
          )}
        </div>
        <div className="card overflow-hidden p-0">
          <iframe
            title="Map"
            className="h-80 w-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.0!2d-0.1276!3d51.5074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDMwJzI2LjYiTiAwwrAwNyczOS40Ilc!5e0!3m2!1sen!2suk!4v1"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
