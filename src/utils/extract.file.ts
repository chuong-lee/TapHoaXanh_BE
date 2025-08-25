export function extractPublicId(url: string): string {
  // Tách sau "/upload/"
  const parts = url.split('/upload/');
  if (parts.length < 2) throw new Error('URL không hợp lệ');

  // Bỏ version (v123456)
  const withoutVersion = parts[1].replace(/^v[0-9]+\//, '');

  // Bỏ đuôi .jpg/.png/.webp...
  return withoutVersion.replace(/\.[^/.]+$/, '');
}
