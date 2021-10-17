<template>
	<div>
		<v-form v-model="options" :fields="fields" />
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { Field } from '@directus/shared/types';

export default defineComponent({
	props: {
		collection: {
			type: String,
			required: true,
		},
		fieldData: {
			type: Object as PropType<Field>,
			default: null,
		},
		value: {
			type: Object,
			default: null,
		},
	},
	emits: ['input'],
	setup(props, { emit }) {
		const options = computed({
			get() {
				return props.value || {};
			},
			set(options: Record<string, unknown>) {
				emit('input', options);
			},
		});

		const fields = [
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
				field: 'prefix',
				type: 'string',
				name: '$t:prefix',
				meta: {
					interface: 'input',
					width: 'half',
					options: {
						placeholder: 'http://example.com/',
					},
				},
			},
			{
				field: 'suffix',
				type: 'string',
				name: '$t:suffix',
				meta: {
					interface: 'input',
					width: 'half',
					options: {
						placeholder: '/',
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
				field: 'template',
				type: 'string',
				name: '$t:template',
				meta: {
					width: 'full',
					interface: 'system-display-template',
					required: true,

					options: {
						collectionName: props.collection,
						font: 'monospace',
						placeholder: '{{ title }}-{{ id }}',
					},
				},
			},
			{
				field: 'update',
				name: '$t:update',
				type: 'json',
				meta: {
					width: 'half',
					interface: 'select-multiple-checkbox',
					default_value: 'normal',
					options: {
						choices: [
							{ text: '$t:on_create', value: 'create' },
							{ text: '$t:on_update', value: 'update' },
						],
					},
				},
				schema: {
					default_value: '[]',
				},
			},
		];

		return { fields, options };
	},
});
</script>
