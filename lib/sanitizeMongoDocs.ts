export function sanitizeMongoDocs<T>(docs: any[]): T[] {
  return docs.map((doc) => {
    const cleanDoc = JSON.parse(JSON.stringify(doc));
    cleanDoc.id = cleanDoc._id?.toString() || '';
    delete cleanDoc._id;
    delete cleanDoc.__v;
    return cleanDoc;
  });
}
