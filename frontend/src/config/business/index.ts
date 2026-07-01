import type { BusinessConfig, BusinessType } from "./types";
import { wholesaleConfig } from "./wholesale";
import { groceryConfig } from "./grocery";
import { clothingConfig } from "./clothing";
import { electronicsConfig } from "./electronics";
import { medicalConfig } from "./medical";
import { hardwareConfig } from "./hardware";
import { stationeryConfig } from "./stationery";
import { mobileConfig } from "./mobile";
import { cosmeticsConfig } from "./cosmetics";
import { restaurantConfig } from "./restaurant";
import { generalRetailConfig } from "./generalRetail";

const businessConfigs: Record<BusinessType, BusinessConfig> = {
  WHOLESALE_DISTRIBUTOR: wholesaleConfig,
  GROCERY: groceryConfig,
  CLOTHING: clothingConfig,
  ELECTRONICS: electronicsConfig,
  MEDICAL: medicalConfig,
  HARDWARE: hardwareConfig,
  STATIONERY: stationeryConfig,
  MOBILE: mobileConfig,
  COSMETICS: cosmeticsConfig,
  RESTAURANT: restaurantConfig,
  GENERAL_RETAIL: generalRetailConfig,
};

export function getBusinessConfig(businessType?: string | null): BusinessConfig {
  const normalized = (businessType || "GENERAL_RETAIL") as BusinessType;
  return businessConfigs[normalized] || generalRetailConfig;
}

export function getBusinessTypeLabel(businessType?: string | null) {
  return getBusinessConfig(businessType).label;
}
