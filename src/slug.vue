<template>
	<v-input
		v-if="isEditing && !disabled"
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

		<a v-if="value && prefix" target="_blank" class="link" :href="presentedLink">{{ presentedLink }}</a>
		<span v-else class="link" @click="!disabled && (isEditing = true)">{{ presentedLink }}</span>

		<v-button v-if="!disabled" v-tooltip="t('edit')" x-small secondary icon @click="isEditing = true">
			<v-icon name="edit" />
		</v-button>

		<v-button v-if="haveChange" v-tooltip="t('auto_generate')" x-small secondary icon @click="setByCurrentState">
			<v-icon name="auto_fix_high" />
		</v-button>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, watch, computed, PropType } from 'vue';
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
		update: {
			type: Array as PropType<string[]>,
			default: () => [],
		},
	},
	emits: ['input'],
	setup(props, { emit }) {
		const { t } = useI18n();
		const values = inject('values', ref<Record<string, any>>({}));
		const isEditing = ref<Boolean>(props.autofocus);
		const isTouched = ref<Boolean>(false);

		const prefix = computed(() => render(props.prefix || '', values.value));
		const suffix = computed(() => render(props.suffix || '', values.value));
		const presentedLink = computed(() => `${prefix.value}${props.value || props.placeholder || ''}${suffix.value}`);
		const haveChange = computed(() => props.value && transform(render(props.template, values.value)) !== props.value);

		watch(values, (values: Record<string, any>) => {
			// Reject manual touching.
			if (isEditing.value || isTouched.value) return;

			// According the update policy.
			if (!(props.primaryKey !== '+' ? props.update.includes('update') : props.update.includes('create'))) return;

			// Avoid self update.
			if (values[props.field] && values[props.field] !== props.value) return;

			emitter(values);
		});

		return {
			t,
			suffix,
			prefix,
			presentedLink,
			isEditing,
			haveChange,
			setByCurrentState,
			onChange,
			onKeyPress,
		};

		function onKeyPress(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				isTouched.value = false;
				isEditing.value = false;
			} else if (event.key === 'Enter') {
				isEditing.value = false;
			}
		}

		function onChange(value: string) {
			if (props.disabled) return;
			if (props.value === value) return;

			isTouched.value = Boolean(value && value.trim());

			emit('input', transform(value || ''));
		}

		function transform(value: string) {
			return slugify(value, { separator: '-', preserveTrailingDash: true }).slice(0, props.length);
		}

		function setByCurrentState() {
			emitter(values.value);
		}

		function emitter(values: Record<string, any>) {
			const newValue = transform(render(props.template, values));
			if (newValue === props.value) return;

			emit('input', newValue);
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
