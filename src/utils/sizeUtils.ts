export function calculateMapArea(width: number, height: number): number {
    return width * height;
}

export function calculateAspectRatio(width: number, height: number): number {
    return width / height;
}

export function scaleDimensions(originalWidth: number, originalHeight: number, scaleFactor: number): { width: number; height: number } {
    return {
        width: originalWidth * scaleFactor,
        height: originalHeight * scaleFactor,
    };
}

export function maintainRealLifeSize(originalSize: number, currentSize: number, realLifeDimension: number): number {
    return (currentSize / originalSize) * realLifeDimension;
}