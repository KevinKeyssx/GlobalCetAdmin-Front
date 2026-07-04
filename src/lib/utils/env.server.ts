import { z } from 'zod';

import {
	INTERNAL_SECRET_KEY,
	BACKEND_URL,
	FILE_MANAGER_URL,
	FILE_MANAGER_FOLDER,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	BETTER_AUTH_URL,
	BETTER_AUTH_SECRET,
	BETTER_AUTH_BASE_PATH
} from '$env/static/private';


const envSchema = z.object( {
	BACKEND_URL          : z.string().min( 1 ),

	INTERNAL_SECRET_KEY  : z.string().min( 1 ),

	FILE_MANAGER_URL     : z.string().min( 1 ),
	FILE_MANAGER_FOLDER  : z.string().min( 1 ),

	GOOGLE_CLIENT_ID     : z.string().min( 1 ),
	GOOGLE_CLIENT_SECRET : z.string().min( 1 ),

	BETTER_AUTH_URL       : z.string().min( 1 ),
	BETTER_AUTH_SECRET    : z.string().min( 1 ),
	BETTER_AUTH_BASE_PATH : z.string().min( 1 )
} );


const parsedEnv = envSchema.safeParse( {
	BACKEND_URL,

	INTERNAL_SECRET_KEY,

	FILE_MANAGER_URL,
	FILE_MANAGER_FOLDER,

	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,

	BETTER_AUTH_URL,
	BETTER_AUTH_SECRET,
	BETTER_AUTH_BASE_PATH
} );


if ( !parsedEnv.success ) {
	console.error(
		'❌ Invalid environment variables:'
	);

	throw new Error( 'Invalid environment variables' );
}


export const ENV = {
	BACKEND_URL          : parsedEnv.data.BACKEND_URL,
	INTERNAL_SECRET_KEY  : parsedEnv.data.INTERNAL_SECRET_KEY,

	FILE_MANAGER: {
		URL     : parsedEnv.data.FILE_MANAGER_URL,
		FOLDER  : parsedEnv.data.FILE_MANAGER_FOLDER
	},

	GOOGLE: {
		CLIENT_ID       : parsedEnv.data.GOOGLE_CLIENT_ID,
		CLIENT_SECRET   : parsedEnv.data.GOOGLE_CLIENT_SECRET
	},

	BETTER_AUTH: {
		URL       : parsedEnv.data.BETTER_AUTH_URL,
		SECRET    : parsedEnv.data.BETTER_AUTH_SECRET,
		BASE_PATH : parsedEnv.data.BETTER_AUTH_BASE_PATH
	}
};
