"use client";
import React, { useState } from "react";
import { useUpdateTenant, useResetOwnerPassword } from "@/lib/hooks";

export type EditTenantModalProps = {
  tenant: any;
  onClose: () => void;
};

export default function EditTenantModal({
  tenant,
  onClose,
}: EditTenantModalProps) {
  const updateTenant = useUpdateTenant();
  const resetPassword = useResetOwnerPassword();

  const [businessName, setBusinessName] = useState(tenant.businessName || "");
  const [ownerName, setOwnerName] = useState(tenant.ownerName || "");
  const [phone, setPhone] = useState(tenant.phone || "");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await updateTenant.mutateAsync({
        tenantId: tenant.id,
        businessName,
        ownerName,
        phone,
      });
      alert("Tenant details updated successfully!");
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update tenant details.",
      );
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Password cannot be empty.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      await resetPassword.mutateAsync({
        tenantId: tenant.id,
        password,
      });
      alert("Password updated successfully!");
      setPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update password.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-outline-variant flex items-center justify-between">
          <h2 className="text-xl font-bold text-on-surface">
            Edit Tenant: {tenant.businessName}
          </h2>
          <button
            onClick={onClose}
            className="text-secondary hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="p-3 mb-4 rounded-lg bg-error-container text-error text-sm">
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* Update Details Form */}
            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <h3 className="font-semibold text-on-surface text-lg">
                General Details
              </h3>
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updateTenant.isPending}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary-container disabled:opacity-50 transition-colors"
                >
                  {updateTenant.isPending
                    ? "Updating..."
                    : "Save Details"}
                </button>
              </div>
            </form>

            <hr className="border-outline-variant" />

            {/* Change Password Form */}
            <form onSubmit={handleResetPassword} className="space-y-4">
              <h3 className="font-semibold text-on-surface text-lg">
                Change Password
              </h3>
              <p className="text-sm text-secondary">
                This will reset the login password for the tenant owner ({tenant.email}).
              </p>
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={resetPassword.isPending || !password}
                  className="px-4 py-2 bg-error text-on-error rounded-lg text-sm font-medium hover:bg-error/90 disabled:opacity-50 transition-colors"
                >
                  {resetPassword.isPending
                    ? "Updating Password..."
                    : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
