import { z } from 'zod';

import { 
    INTERNAL_SECRET_KEY,
    BACKEND_URL,
    FILE_MANAGER_URL,
    FILE_MANAGER_FOLDER
} from '$env/static/private';


const envSchema = z.object({
    BACKEND_URL         : z.string().min(1),

    INTERNAL_SECRET_KEY : z.string().min(1),

    FILE_MANAGER_URL    : z.string().min(1),
    FILE_MANAGER_FOLDER : z.string().min(1),
});


const parsedEnv = envSchema.safeParse({
    BACKEND_URL,

    INTERNAL_SECRET_KEY,

    FILE_MANAGER_URL,
    FILE_MANAGER_FOLDER
});


if ( !parsedEnv.success ) {
    console.error(
        '❌ Invalid environment variables:'
    );

    throw new Error( 'Invalid environment variables' );
}


export const ENV = {
    BACKEND_URL         : parsedEnv.data.BACKEND_URL,
    INTERNAL_SECRET_KEY : parsedEnv.data.INTERNAL_SECRET_KEY,

    FILE_MANAGER: {
        URL     : parsedEnv.data.FILE_MANAGER_URL,
        FOLDER  : parsedEnv.data.FILE_MANAGER_FOLDER
    }
};
