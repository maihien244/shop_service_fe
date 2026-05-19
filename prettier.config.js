//  @ts-check

/** @type {import('prettier').Config} */
const config = {
    semi: false,
    singleQuote: true,
    trailingComma: 'all',
    tabWidth: 4,
    plugins: ['prettier-plugin-tailwindcss'],
    tailwindFunctions: ['cn', 'tv'],
}

export default config
