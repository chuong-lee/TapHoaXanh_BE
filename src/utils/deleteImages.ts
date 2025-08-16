import { join } from 'path';
import * as fs from 'fs';

export function deleteFileIfExists(filePath: string | undefined) {
  if (!filePath) return;

  const absolutePath = join(process.cwd(), filePath);

  try {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (error) {
    console.error(`❌ Xóa file thất bại: ${absolutePath}`, error);
  }
}
