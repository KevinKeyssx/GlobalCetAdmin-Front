import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // ... tus otras configuraciones como compilerOptions si las tienes
    kit: {
        adapter: adapter({
            out: 'build',
            precompress: false
        }),
        prerender: {
            handleUnseenRoutes: 'ignore' 
        },
        paths: {
            base: '/admin'
        }
    }
};

export default config;