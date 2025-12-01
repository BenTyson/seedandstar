import { createUploadthing, type FileRouter } from "uploadthing/next";
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

const f = createUploadthing();

export const ourFileRouter = {
  productImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("Server: Upload complete!", file.url);
    // Return the file data so client can access it
    return { uploadedUrl: file.url };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
