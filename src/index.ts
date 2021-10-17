import { defineInterface } from '@directus/shared/utils';
import InterfaceSlug from './slug.vue';
import Options from './options.vue';

export default defineInterface({
	id: 'directus-extension-wpslug-interface',
	name: 'Slug',
	description: 'WordPress alike slug/permalink interface',
	icon: 'link',
	component: InterfaceSlug,
	types: ['string'],
	options: Options,
});
