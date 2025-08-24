import { join, dirname } from 'path';
import * as fs from 'fs';

export function deleteFileIfExists(filePath: string | undefined) {
  if (!filePath) return;

  const absolutePath = join(process.cwd(), filePath);

  try {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      const folderPath = dirname(absolutePath);

      if (fs.existsSync(folderPath) && fs.readdirSync(folderPath).length === 0) {
        fs.rmdirSync(folderPath);
      }
    }
  } catch (error) {
    console.error(`❌ Xóa file hoặc thư mục thất bại: ${absolutePath}`, error);
  }
}
