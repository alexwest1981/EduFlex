/**
 * Resolves the correct public path for a gamification asset based on its type.
 * 
 * @param {string} fileName The filename of the asset (e.g., 'frame_neon_01.png')
 * @param {string} itemType The type of item (FRAME, BACKGROUND, BADGE, TITLE)
 * @returns {string} The full path to the asset
 */
export const getGamificationAssetPath = (fileName, itemType) => {
    if (!fileName) return '';

    // If it's a full URL (MinIO or external), return as is
    if (fileName.startsWith('http') || fileName.startsWith('/api')) {
        return fileName;
    }

    const basePath = '/gamification';

    switch (itemType) {
        case 'FRAME':
            return `${basePath}/frames/${fileName}`;
        case 'BACKGROUND':
            return `${basePath}/backdrop/${fileName}`;
        case 'BADGE':
            return `${basePath}/badges/${fileName}`;
        case 'TITLE':
            return `${basePath}/titles/${fileName}`;
        default:
            return `${basePath}/${fileName}`;
    }
};
