

const extWhitelist = new Set([
    // videos
    'gif',
    'mp4',
    'webm',
    'mkv',
    'mov',
    'avi',

    // images
    'bmp',
    'jpg',
    'jpeg',
    'png',
    'tif',
    'webp',

    // audio
    'mp3',
    'aac',
    'wav',
    'flac',
    'opus',
    'ogg'
])

export const getFileExt = (url: string, opts = { strict: true }) => {
    const { pathname } = new URL(url)
    const parts = pathname.split('.')
    const ext = (parts[parts.length - 1] || '').trim().toLowerCase()

    if (!opts.strict || extWhitelist.has(ext)) {
        return ext
    }
}