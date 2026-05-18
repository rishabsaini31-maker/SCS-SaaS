export {
  assertTenantOwnership,
  getTenantId,
  tenantCreateData,
  tenantWhere,
} from "./tenant.utils";

import { tenantWhere } from "./tenant.utils";

export const tenantFilter = tenantWhere;

export default tenantFilter;
