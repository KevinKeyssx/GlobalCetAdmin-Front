import { writable, type Writable } from 'svelte/store';

export const globalLoadingStore: Writable<boolean> = writable( false );
