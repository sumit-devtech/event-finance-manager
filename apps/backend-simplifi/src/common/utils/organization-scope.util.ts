export function withOrganizationScope(organizationId: string | null | undefined) {
  if (!organizationId) {
    return {};
  }
  return { organizationId };
}

export function ensureOrganizationAccess(
  userOrgId: string | null | undefined,
  resourceOrgId: string | null | undefined,
): boolean {
  if (!userOrgId || !resourceOrgId) {
    return false;
  }
  return userOrgId === resourceOrgId;
}

