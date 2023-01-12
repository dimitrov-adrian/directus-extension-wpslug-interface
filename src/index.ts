import { defineInterface } from '@directus/extensions-sdk';
import InterfaceSlug from './slug.vue';

export default defineInterface({
	id: 'extension-wpslug',
	name: 'Slug',
	description: 'WordPress alike slug/permalink interface',
	icon: 'link',
	component: InterfaceSlug,
	types: ['string'],
	group: 'standard',
	options: ({ collection }) => {
		return [
			{
				field: 'placeholder',
				name: '$t:placeholder',
				meta: {
					width: 'full',
					interface: 'input',
					options: {
						placeholder: '$t:enter_a_placeholder',
					},
				},
			},
			{
				field: 'template',
				type: 'string',
				name: '$t:template',
				meta: {
					width: 'full',
					interface: 'system-display-template',
					required: true,
					options: {
						collectionName: collection,
						font: 'monospace',
						placeholder: '{{ title }}-{{ id }}',
					},
				},
			},
			{
				field: 'iconLeft',
				name: '$t:icon_left',
				type: 'string',
				meta: {
					width: 'half',
					interface: 'select-icon',
				},
			},
			{
				field: 'prefix',
				type: 'string',
				name: '$t:prefix',
				meta: {
					width: 'full',
					interface: 'system-display-template',
					options: {
						collectionName: collection,
						font: 'monospace',
						placeholder: 'http://example.com/',
					},
				},
			},
			{
				field: 'suffix',
				type: 'string',
				name: '$t:suffix',
				meta: {
					width: 'full',
					interface: 'system-display-template',
					options: {
						collectionName: collection,
						font: 'monospace',
						placeholder: '/',
					},
				},
			},
			{
				field: 'update',
				name: '$t:auto_generate',
				type: 'json',
				meta: {
					width: 'half',
					interface: 'select-multiple-checkbox',
					options: {
						choices: [
							{ text: '$t:on_create', value: 'create' },
							{ text: '$t:on_update', value: 'update' },
						],
					},
				},
				schema: {
					default_value: ['create'],
				},
			},
		];
	},
});
