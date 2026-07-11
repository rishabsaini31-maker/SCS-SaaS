"use client";

import { useState, type FormEvent } from "react";
import { useStaff, StaffUser } from "@/hooks/useStaff";
import { toast } from "@/lib/toast";

type StaffApiError = {
  response?: {
    data?: {
      error?: string;
    };
  };
};

const getErrorMessage = (error: unknown) => {
  const apiError = error as StaffApiError;
  return apiError.response?.data?.error || "An error occurred";
};

export default function StaffManagementSection() {
  const {
    staff,
    isLoading,
    metrics,
    createStaff,
    isCreating,
    updateStaff,
    toggleStatus,
    resetPassword,
    deleteStaff,
    isDeleting,
  } = useStaff();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT" | "RESET">("ADD");
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"OWNER" | "SALESMAN">("SALESMAN");
  const [canOverridePrice, setCanOverridePrice] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const openAddModal = () => {
    setModalMode("ADD");
    setSelectedStaff(null);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("SALESMAN");
    setCanOverridePrice(false);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (s: StaffUser) => {
    setModalMode("EDIT");
    setSelectedStaff(s);
    setName(s.name);
    setEmail(s.email);
    setRole(s.role);
    setCanOverridePrice(s.canOverridePrice || false);
    setIsModalOpen(true);
  };

  const openResetModal = (s: StaffUser) => {
    setModalMode("RESET");
    setSelectedStaff(s);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (modalMode === "ADD") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        await createStaff({ name, email, password, role, canOverridePrice });
        toast.success("Staff added successfully");
      } else if (modalMode === "EDIT" && selectedStaff) {
        await updateStaff({ id: selectedStaff.id, data: { name, email, role, canOverridePrice } });
        toast.success("Staff updated successfully");
      } else if (modalMode === "RESET" && selectedStaff) {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        await resetPassword({ id: selectedStaff.id, data: { password } });
        toast.success("Password reset successfully");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this salesman?")) {
      try {
        await deleteStaff(id);
        toast.success("Staff deleted successfully");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  const handleToggleStatus = async (s: StaffUser) => {
    try {
      await toggleStatus({ id: s.id, isActive: !s.isActive });
      toast.success(`Staff account ${!s.isActive ? "enabled" : "disabled"}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <section className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-h1 text-h1">Staff Management</h3>
        <button
          className="flex items-center space-x-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
          onClick={openAddModal}
          type="button"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          <span>+ Add Salesman</span>
        </button>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-slate-100 bg-slate-50/30">
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <p className="text-sm font-medium text-slate-500">Total Staff</p>
            <p className="text-2xl font-bold mt-1">{metrics.totalStaff}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <p className="text-sm font-medium text-slate-500">Active Staff</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">{metrics.activeStaff}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <p className="text-sm font-medium text-slate-500">Disabled Staff</p>
            <p className="text-2xl font-bold mt-1 text-rose-600">{metrics.disabledStaff}</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <p className="text-sm font-medium text-slate-500">Today&apos;s Bills By Staff</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">{metrics.todaysBillsByStaff}</p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/30 text-left border-b border-slate-100">
              <th className="px-6 py-3 text-label-caps font-label-caps text-slate-500 uppercase">User</th>
              <th className="px-6 py-3 text-label-caps font-label-caps text-slate-500 uppercase">Role</th>
              <th className="px-6 py-3 text-label-caps font-label-caps text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-label-caps font-label-caps text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-500">Loading staff...</td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-500">No staff accounts found.</td>
              </tr>
            ) : (
              staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                        {s.name.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                        {s.lastLoginAt && (
                          <p className="text-[10px] text-slate-400 mt-0.5">Last login: {new Date(s.lastLoginAt).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${s.role === "OWNER" ? "bg-primary-fixed text-on-primary-fixed-variant" : "bg-secondary-container text-on-secondary-container"}`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <span className={`text-xs font-medium ${s.isActive ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {s.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleToggleStatus(s)} className="text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        {s.isActive ? "Disable" : "Enable"}
                      </button>
                      <button onClick={() => openEditModal(s)} className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded">
                        Edit
                      </button>
                      <button onClick={() => openResetModal(s)} className="text-xs font-medium text-amber-600 hover:text-amber-800 bg-amber-50 px-2 py-1 rounded">
                        Reset Pass
                      </button>
                      <button onClick={() => handleDelete(s.id)} disabled={isDeleting} className="text-xs font-medium text-rose-600 hover:text-rose-800 bg-rose-50 px-2 py-1 rounded">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4 backdrop-blur-sm">
          <form
            className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl p-6 space-y-4"
            onSubmit={handleSubmit}
          >
            <h3 className="text-lg font-bold text-slate-900">
              {modalMode === "ADD" ? "Add Salesman" : modalMode === "EDIT" ? "Edit Staff" : "Reset Password"}
            </h3>
            
            {(modalMode === "ADD" || modalMode === "EDIT") && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700">Name</label>
                  <input
                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Role</label>
                  <select
                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value as "OWNER" | "SALESMAN")}
                  >
                    <option value="SALESMAN">SALESMAN</option>
                    <option value="OWNER">OWNER</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={canOverridePrice}
                      onChange={(e) => setCanOverridePrice(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Allow modifying product prices in billing</span>
                  </label>
                </div>
              </>
            )}

            {(modalMode === "ADD" || modalMode === "RESET") && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <input
                      className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 pr-16 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-primary hover:text-blue-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <input
                      className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 pr-16 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-primary hover:text-blue-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button
                className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
                type="submit"
                disabled={isCreating}
              >
                {modalMode === "ADD" ? "Add Staff" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
