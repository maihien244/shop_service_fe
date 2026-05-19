export function useFileUrl() {
    const cdn = import.meta.env.VITE_IMAGE_CDN || 'https://'

    return {
        getFileUrl: (keyName: string) => `${cdn}/${keyName}`
    }
}