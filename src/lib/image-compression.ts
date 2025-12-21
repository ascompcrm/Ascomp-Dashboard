/**
 * Compresses and resizes an image file
 * @param file - The original image file
 * @param maxWidth - Maximum width (default: 1200px)
 * @param maxHeight - Maximum height (default: 1200px)
 * @param quality - JPEG quality (0-1, default: 0.8)
 * @returns Compressed image as Blob
 */
export async function compressImage(
    file: File,
    maxWidth: number = 1200,
    maxHeight: number = 1200,
    quality: number = 0.8
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let width = img.width
                let height = img.height

                if (width > maxWidth || height > maxHeight) {
                    const aspectRatio = width / height

                    if (width > height) {
                        width = maxWidth
                        height = width / aspectRatio
                    } else {
                        height = maxHeight
                        width = height * aspectRatio
                    }
                }

                // Create canvas with new dimensions
                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                // Draw image on canvas (resized)
                ctx.drawImage(img, 0, 0, width, height)

                // Convert to JPEG blob with compression
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob)
                        } else {
                            reject(new Error('Failed to create blob'))
                        }
                    },
                    'image/jpeg',
                    quality
                )
            }

            img.onerror = () => {
                reject(new Error('Failed to load image'))
            }

            img.src = e.target?.result as string
        }

        reader.onerror = () => {
            reject(new Error('Failed to read file'))
        }

        reader.readAsDataURL(file)
    })
}
