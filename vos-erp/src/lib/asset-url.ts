/**
 * Standardizes asset URLs.
 * If the URL is already a full http link (from Supabase), return it.
 * If it's a local path, return it as-is.
 */
export function assetUrl(fileIdOrUrl?: string | null, params?: Record<string, string>) {
    if (!fileIdOrUrl) return '';

    // If it's already a full URL (e.g. from Supabase Storage), return it directly
    if (fileIdOrUrl.startsWith('http') || fileIdOrUrl.startsWith('/uploads/') || fileIdOrUrl.startsWith('/')) {
        return fileIdOrUrl;
    }

    // Fallback: return as-is
    return fileIdOrUrl;
}
