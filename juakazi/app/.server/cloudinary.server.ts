import cloudinary, { type UploadApiResponse } from 'cloudinary';
import {writeAsyncIterableToWritable} from '@react-router/node';

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

export async function uploadImageToCloudinary(
    data: AsyncIterable<Uint8Array>
  ) {
    const uploadPromise = new Promise<UploadApiResponse>(
      async (resolve, reject) => {
        const uploadStream =
          cloudinary.v2.uploader.upload_stream(
            {
              folder: "JuaKazi",
            },
            (error, result) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(result);
            }
          );
        await writeAsyncIterableToWritable(
          data,
          uploadStream
        );
      }
    );
  
    return uploadPromise;
  }