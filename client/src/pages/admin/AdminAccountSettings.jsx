import { useEffect, useState } from "react";
import {
  FiMail,
  FiLock,
  FiSave,
  FiShield,
  FiCheckCircle,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function AdminAccountSettings() {
  const { user, updateAdminCredentials } = useAuth();

  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setEmail(user?.email || "");
  }, [user?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }

    if (!normalizedEmail) {
      setError("Email address is required.");
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const emailChanged = normalizedEmail !== user?.email;
    const passwordChanged = Boolean(newPassword);

    if (!emailChanged && !passwordChanged) {
      setError("You haven't entered any changes.");
      return;
    }

    const credentials = { currentPassword };

    if (emailChanged) credentials.email = normalizedEmail;
    if (passwordChanged) credentials.newPassword = newPassword;

    setLoading(true);

    try {
      const result = await updateAdminCredentials(credentials);

      setSuccess(result.message || "Account credentials updated successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update account credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 mx-auto max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Account Settings
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your administrator email and password.
        </p>
      </div>

      <div className="card flex items-center gap-4 p-5">
        <div className="rounded-xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/15">
          <FiShield className="text-2xl" />
        </div>

        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            Administrator Account
          </p>
          <p className="text-sm text-gray-500">
            {user?.name} · {user?.email}
          </p>
          <p className="mt-1 text-xs font-medium text-green-600">
            Admin account
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300">
          <FiCheckCircle />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6 p-6">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <FiMail className="text-brand-600" />
            Login Email
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Change the email address used to log in.
          </p>

          <label className="mb-2 mt-4 block text-sm font-medium">
            New email address
          </label>

          <input
            type="email"
            className="input-field"
            placeholder="your-real-email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="border-t border-gray-100 pt-6 dark:border-gray-800">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <FiLock className="text-brand-600" />
            Change Password
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Leave these fields empty if you only want to change your email.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                New password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Confirm new password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Verify Your Identity
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Enter your current password to authorize these changes.
          </p>

          <input
            type="password"
            className="input-field mt-4"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <FiSave />
          {loading ? "Updating..." : "Save Account Changes"}
        </button>
      </form>
    </div>
  );
}
