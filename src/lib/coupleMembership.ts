export function chooseMemberWeddingId(
  memberships: { wedding_id: string }[],
  preferredWeddingId: string | null,
): string | null {
  return memberships.find((member) => member.wedding_id === preferredWeddingId)?.wedding_id
    ?? memberships[0]?.wedding_id
    ?? null;
}
