export default {
    port: 1090,
    bodyLimit: '100kb',
    corsHeaders: ['Link'],
    corsOrigin: process.env.CORS_ORIGIN || false,
    enableUI: process.env.ENABLE_UI === 'true',
}
