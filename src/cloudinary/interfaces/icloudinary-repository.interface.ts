import { CloudinaryResponse } from '../cloudinary-response';

export abstract class ICloudinaryRepository {
  abstract uploadToCloudinary(
    file: Buffer,
    options?: {
      folder?: string;
      public_id?: string;
      transformation?: any[];
      fileType?: 'product' | 'category' | 'avatar';
    },
  ): Promise<CloudinaryResponse>;

  abstract deleteFromCloudinary(publicId: string): Promise<any>;

  abstract getCloudinaryInfo(publicId: string): Promise<any>;

  abstract createFolderIfNotExists(folderName: string): Promise<void>;
}
