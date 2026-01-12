/**
 * Product Images Component
 * 
 * Architecture: Component for managing product images
 * 
 * Core Principle:
 * - R2 stores bytes (image files)
 * - Neon stores relations (product_images table)
 * - JWT enforces ownership
 * - UI orchestrates only
 */

import React, { useState, useEffect } from 'react';
import { Upload, X, ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { uploadFile } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';
import { queryData } from '../../services/dataApi';

interface ProductImage {
  id: string;
  product_id: string;
  file_id: string;
  sort_order: number;
  created_at: string;
}

interface FileMetadata {
  id: string;
  object_key: string;
  mime_type: string;
  size: number;
}

interface ProductImagesProps {
  productId: string;
  businessId: string;
}

export function ProductImages({ productId, businessId }: ProductImagesProps) {
  const { getAccessToken } = useAuth();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch product images
  useEffect(() => {
    const fetchImages = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch product_images via Data API
        const token = await getAccessToken();
        const productImages = await queryData<ProductImage>(
          'product_images',
          {
            select: 'id,product_id,file_id,sort_order,created_at',
            filter: `product_id.eq.${productId}`,
            order: 'sort_order.asc',
          },
          token
        );

        setImages(productImages);

        // Fetch file metadata and generate signed URLs
        const urls: Record<string, string> = {};
        for (const img of productImages) {
          try {
            const token = await getAccessToken();
            const response = await fetch(`/api/storage?action=download-url&file_id=${img.file_id}`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
              const data = await response.json();
              urls[img.id] = data.data.downloadUrl;
            }
          } catch (err) {
            console.error(`Failed to get URL for image ${img.id}:`, err);
          }
        }

        setImageUrls(urls);
      } catch (err: any) {
        console.error('Failed to fetch product images:', err);
        setError(err.message || 'فشل تحميل الصور');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [productId]);

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !productId || !businessId) return;

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type (images only)
        if (!file.type.startsWith('image/')) {
          throw new Error(`الملف ${file.name} ليس صورة`);
        }

        // Validate file size (3MB max)
        const MAX_SIZE = 3 * 1024 * 1024; // 3MB
        if (file.size > MAX_SIZE) {
          throw new Error(`حجم الملف ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) يتجاوز الحد الأقصى (3MB)`);
        }

        // STEP 1: Upload file
        const token = await getAccessToken();
        const uploadResult = await uploadFile({
          file,
          businessId,
          originalFilename: file.name,
          metadata: { type: 'product-image', product_id: productId },
          token,
        });

        // STEP 2: Add to product_images
        const addResponse = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: 'add-image',
            product_id: productId,
            file_id: uploadResult.id,
          }),
        });

        if (!addResponse.ok) {
          const error = await addResponse.json().catch(() => ({ message: 'Failed to add image' }));
          throw new Error(error.message || 'فشل إضافة الصورة');
        }

        const addData = await addResponse.json();
        return addData.data;
      });

      const newImages = await Promise.all(uploadPromises);

      // STEP 3: Fetch signed URLs for new images
      const urls: Record<string, string> = {};
      for (const img of newImages) {
        try {
          const token = await getAccessToken();
          const response = await fetch(`/api/storage?action=download-url&file_id=${img.file_id}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            urls[img.id] = data.data.downloadUrl;
          }
        } catch (err) {
          console.error(`Failed to get URL for new image ${img.id}:`, err);
        }
      }

      // STEP 4: Update state
      setImages((prev) => [...prev, ...newImages].sort((a, b) => a.sort_order - b.sort_order));
      setImageUrls((prev) => ({ ...prev, ...urls }));

      toast.success(`تم رفع ${newImages.length} صورة بنجاح!`);
    } catch (err: any) {
      console.error('Image upload error:', err);
      setError(err.message || 'حدث خطأ أثناء رفع الصور');
      toast.error(err.message || 'فشل رفع الصور');
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // Handle image removal
  const handleRemoveImage = async (imageId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

    try {
      const token = await getAccessToken();
      const response = await fetch('/api/products', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'remove-image',
          image_id: imageId,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to remove image' }));
        throw new Error(error.message || 'فشل حذف الصورة');
      }

      // Remove from state
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setImageUrls((prev) => {
        const newUrls = { ...prev };
        delete newUrls[imageId];
        return newUrls;
      });

      toast.success('تم حذف الصورة بنجاح');
    } catch (err: any) {
      console.error('Image removal error:', err);
      toast.error(err.message || 'فشل حذف الصورة');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-gray-900">صور المنتج</h3>
        <label className="relative">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
            id="product-images-upload"
          />
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs font-bold rounded-lg border-2 border-gray-200 hover:bg-gray-50"
            disabled={uploading}
          >
            <span>
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin ml-1.5" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 ml-1.5" />
                  رفع صور
                </>
              )}
            </span>
          </Button>
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {images.length === 0 ? (
        <div className="p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 font-medium">لا توجد صور</p>
          <p className="text-xs text-gray-400 mt-1">حد أقصى 3MB لكل صورة</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image) => (
            <Card
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200 group"
            >
              {imageUrls[image.id] ? (
                <img
                  src={imageUrls[image.id]}
                  alt={`Product image ${image.sort_order + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => {
                    // Remove broken image URL
                    setImageUrls((prev) => {
                      const newUrls = { ...prev };
                      delete newUrls[image.id];
                      return newUrls;
                    });
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 left-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(image.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

