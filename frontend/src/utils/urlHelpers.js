/**
 * Konverterar MinIO/storage URLer till publika URLer för produktion.
 * Hanterar mixed content genom att ersätta localhost med storage subdomain.
 */
export const getStorageUrl = (url, siteUrl = 'https://www.eduflexlms.se') => {
    if (!url) return '';

    // Ersätt MinIO-URLer med publik storage URL för produktion
    if (url.includes('minio:9000')) {
        url = url.replace('http://minio:9000', 'https://storage.eduflexlms.se');
    }
    if (url.includes('localhost:9000')) {
        url = url.replace('http://localhost:9000', 'https://storage.eduflexlms.se');
    }

    // Om det redan är en full URL, returnera den
    if (url.startsWith('http')) return url;

    // Hantera relativa paths
    if (!url.startsWith('/')) {
        // Ensure all relative paths are prefixed with /api/files/
        url = '/api/files/' + url;
    }

    return `${siteUrl}${url}`;
};

/**
 * Hämtar profilbild-URL med fallback till site_url
 */
export const getProfilePictureUrl = (profilePictureUrl, systemSettings) => {
    if (!profilePictureUrl) return null;
    const siteUrl = systemSettings?.site_url || 'https://www.eduflexlms.se';
    return getStorageUrl(profilePictureUrl, siteUrl);
};
