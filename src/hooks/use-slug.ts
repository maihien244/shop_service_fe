import slugify from 'slugify'

export const useSlug = (locale: string) => {
    const config = {
        replacement: '-',
        remove: /[*+~.()'"!:@]/g,
        lower: true,
        strict: true,
        locale: locale
    }

    return {
        generateSlug: (text: string) => slugify(text, config)
    }
}