import { INFRASTRUCTURE_VIDEO_URL } from '$env/static/private';
import type { PageServerLoad }       from './$types';

export const load: PageServerLoad = async ( ) => {
	return {
		videoUrl : INFRASTRUCTURE_VIDEO_URL,
	};
};
