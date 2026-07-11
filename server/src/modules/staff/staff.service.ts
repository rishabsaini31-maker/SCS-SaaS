import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";
import { hashPassword } from "../../common/utils/password";
import type { CreateStaffInput, UpdateStaffInput, ResetPasswordInput, ToggleStatusInput } from "./staff.schema";

export async function createStaff(tenantId: string, data: CreateStaffInput, adminId: string) {
  const existingStaff = await prisma.staffUser.findUnique({
    where: { email: data.email },
  });

  if (existingStaff) {
    throw new CustomError("Email is already registered.", 400);
  }

  const existingOwner = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingOwner) {
    throw new CustomError("Email is already in use by an owner.", 400);
  }

  const passwordHash = await hashPassword(data.password);

  const staff = await prisma.staffUser.create({
    data: {
      tenantId,
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      canOverridePrice: data.canOverridePrice || false,
    },
    select: {
      id: true,
      tenantId: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return staff;
}

export async function getStaffList(tenantId: string) {
  return prisma.staffUser.findMany({
    where: { tenantId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      canOverridePrice: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStaffMetrics(tenantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const staffMembers = await prisma.staffUser.findMany({
    where: { tenantId },
    select: {
      id: true,
      name: true,
      role: true,
      isActive: true,
    },
  });

  const totalStaff = staffMembers.length;
  const activeStaff = staffMembers.filter(s => s.isActive).length;
  const disabledStaff = totalStaff - activeStaff;

  const todaysBills = await prisma.invoice.count({
    where: {
      tenantId,
      createdByStaffId: { not: null },
      createdAt: { gte: today },
    },
  });

  return {
    totalStaff,
    activeStaff,
    disabledStaff,
    todaysBillsByStaff: todaysBills,
  };
}

export async function getStaffPerformance(tenantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const staffList = await prisma.staffUser.findMany({
    where: { tenantId, role: "SALESMAN" },
    select: { id: true, name: true },
  });

  const performance = await Promise.all(
    staffList.map(async (staff) => {
      const todaysInvoices = await prisma.invoice.findMany({
        where: { tenantId, createdByStaffId: staff.id, createdAt: { gte: today } },
      });
      const monthlyInvoices = await prisma.invoice.findMany({
        where: { tenantId, createdByStaffId: staff.id, createdAt: { gte: startOfMonth } },
      });

      return {
        id: staff.id,
        name: staff.name,
        todaysBills: todaysInvoices.length,
        todaysSalesAmount: todaysInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        monthlySalesAmount: monthlyInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      };
    })
  );

  return performance;
}

export async function updateStaff(tenantId: string, id: string, data: UpdateStaffInput) {
  const staff = await prisma.staffUser.findFirst({
    where: { id, tenantId },
  });

  if (!staff) {
    throw new CustomError("Staff not found", 404);
  }

  if (data.email && data.email !== staff.email) {
    const existing = await prisma.staffUser.findUnique({ where: { email: data.email } });
    const existingOwner = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing || existingOwner) throw new CustomError("Email is already in use", 400);
  }

  return prisma.staffUser.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, canOverridePrice: true, isActive: true },
  });
}

export async function resetStaffPassword(tenantId: string, id: string, data: ResetPasswordInput) {
  const staff = await prisma.staffUser.findFirst({ where: { id, tenantId } });
  if (!staff) throw new CustomError("Staff not found", 404);

  const passwordHash = await hashPassword(data.password);
  await prisma.staffUser.update({
    where: { id },
    data: { passwordHash },
  });

  return { success: true };
}

export async function toggleStaffStatus(tenantId: string, id: string, data: ToggleStatusInput) {
  const staff = await prisma.staffUser.findFirst({ where: { id, tenantId } });
  if (!staff) throw new CustomError("Staff not found", 404);

  return prisma.staffUser.update({
    where: { id },
    data: { isActive: data.isActive },
    select: { id: true, isActive: true },
  });
}

export async function deleteStaff(tenantId: string, id: string) {
  const staff = await prisma.staffUser.findFirst({ where: { id, tenantId } });
  if (!staff) throw new CustomError("Staff not found", 404);

  await prisma.staffUser.delete({ where: { id } });
  return { success: true };
}
