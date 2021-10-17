<template>
	<v-input
		v-if="isEditing"
		:autofocus="true"
		:model-value="value"
		:placeholder="placeholder"
		:trim="true"
		:db-safe="true"
		:slug="true"
		slug-separator="-"
		@update:model-value="onChange"
		@blur="isEditing = false"
		@keyup="onKeyPress"
	>
		<template v-if="iconLeft || prefix" #prepend>
			<v-icon v-if="iconLeft" :name="iconLeft" />
			<span class="prefixsuffix">{{ prefix }}</span>
		</template>
		<template v-if="suffix" #append>
			<span class="prefixsuffix">{{ suffix }}</span>
		</template>
	</v-input>
	<div v-else class="link-preview-mode">
		<v-icon v-if="iconLeft" :name="iconLeft" />

		<span v-if="disabled" class="link">{{ finalLink }}</span>
		<a v-else-if="value && prefix" target="_blank" class="link" :href="finalLink">{{ finalLink }}</a>
		<span v-else class="link" @click="isEditing = true">{{ finalLink }}</span>

		<v-button v-if="!disabled" v-tooltip="t('edit')" x-small secondary icon @click="isEditing = true">
			<v-icon name="keyboard_return" />
		</v-button>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, watch, computed } from 'vue';
import { render } from 'micromustache';
import slugify from '@sindresorhus/slugify';
import { useI18n } from 'vue-i18n';

export default defineComponent({
	props: {
		primaryKey: {
			type: [Number, String],
			required: true,
		},
		field: {
			type: String,
			default: null,
			required: true,
		},
		value: {
			type: String,
			default: null,
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		placeholder: {
			type: String,
			default: null,
		},
		template: {
			type: String,
			default: '',
			required: true,
		},
		prefix: {
			type: String,
			default: '',
		},
		suffix: {
			type: String,
			default: '',
		},
		iconLeft: {
			type: String,
			default: null,
		},
		length: {
			type: Number,
			default: null,
		},
		autofocus: {
			type: Boolean,
			default: false,
		},
		slug: {
			type: Boolean,
			default: false,
		},
		update: {
			type: Array,
			default: () => [],
		},
	},
	emits: ['input'],
	setup(props, { emit }) {
		const { t } = useI18n();

		const values = inject('values', ref<Record<string, any>>({}));
		const isEditing = ref(props.autofocus);
		const isTouched = ref(false);

		watch(values, (values) => {
			// Reject manual touching.
			if (isEditing.value || isTouched.value) return;

			// According the update policy.
			if (!(props.primaryKey !== '+' ? props.update.includes('update') : props.update.includes('create'))) return;

			// Avoid self update.
			if (values[props.field] && values[props.field] !== props.value) return;

			const newValue = transform(render(props.template, values));
			if (newValue !== props.value) {
				emit('input', newValue);
			}
		});

		const finalLink = computed(() => {
			return `${props.prefix || ''}${props.value || props.placeholder || ''}${props.suffix || ''}`;
		});

		return { t, isEditing, onChange, onKeyPress, finalLink };

		function onKeyPress(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				isTouched.value = false;
				isEditing.value = false;
			} else if (event.key === 'Enter') {
				isEditing.value = false;
			}
		}

		function onChange(value: string) {
			if (props.value === value) return;
			isTouched.value = true;
			emit('input', transform(value));
		}

		function transform(value: string) {
			return slugify(value, { separator: '-' }).slice(0, props.length);
		}
	},
});
</script>

<style lang="css" scoped>
.prefixsuffix {
	color: var(--foreground-subdued);
}

.link-preview-mode {
	display: flex;
	align-items: center;
	min-height: var(--input-height);
}

.link {
	color: var(--foreground-subdued);
	text-decoration: underline;
}

.link:not(:first-child) {
	margin-inline-start: 8px;
}

.link:not(:last-child) {
	margin-inline-end: 8px;
}

a.link {
	color: var(--primary);
}

a.link:focus-visible,
a.link:hover {
	color: var(--primary-75);
}
</style>
