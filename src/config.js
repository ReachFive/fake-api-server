export default {
    port: 1090,
    bodyLimit: '100kb',
    corsHeaders: ['Link'],
    enableUI: process.env.ENABLE_UI === 'true',
}
