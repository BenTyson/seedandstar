"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const onRemove = (url: string) => {
    onChange(value.filter((v) => v !== url));
  };

  return (
    <div className="space-y-4">
      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {value.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              <Image
                src={url}
                alt="Product image"
                fill
                className="object-cover"
                sizes="200px"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => onRemove(url)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dropzone - Simplified */}
      {value.length < 5 && (
        <UploadDropzone
          endpoint="productImage"
          onClientUploadComplete={(res) => {
            console.log("Upload complete:", res);
            if (res && res.length > 0) {
              const newUrls = res.map((file) => file.url);
              onChange([...value, ...newUrls]);
              toast.success(`${res.length} image(s) uploaded`);
            }
          }}
          onUploadError={(error: Error) => {
            console.error("Upload error:", error);
            toast.error(`Upload failed: ${error.message}`);
          }}
        />
      )}
    </div>
  );
}
