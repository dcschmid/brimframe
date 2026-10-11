interface Publishable {
  id: string;
  data: { draft: boolean; publishDate: Date };
}

export function selectPublished<T extends Publishable>(
  entries: readonly T[],
): T[] {
  return entries
    .filter((entry) => entry.data.draft === false)
    .sort(
      (a, b) =>
        b.data.publishDate.valueOf() - a.data.publishDate.valueOf() ||
        a.id.localeCompare(b.id),
    );
}
