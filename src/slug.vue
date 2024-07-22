<template>
	<v-input
		v-if="isEditing && !disabled"
		:autofocus="true"
		:model-value="value"
		:placeholder="placeholder"
		:trim="trim"
		:slug="true"
		slug-separator="-"
		@update:model-value="onChange"
		@blur="disableEdit"
		@keydown="onKeyPress"
	>
		<template v-if="iconLeft || renderedPrefix" #prepend>
			<v-icon v-if="iconLeft" :name="iconLeft" />
			<span class="prefixsuffix">{{ renderedPrefix }}</span>
		</template>
		<template v-if="renderedSuffix" #append>
			<span class="prefixsuffix">{{ renderedSuffix }}</span>
		</template>
	</v-input>
	<div v-else class="link-preview-mode">
		<v-icon v-if="iconLeft" :name="iconLeft" class="icon-left" />

		<a v-if="value && prefix" target="_blank" class="link" :href="presentedLink">{{ presentedLink }}</a>
		<span v-else class="link" @click="!disabled && enableEdit">{{ presentedLink }}</span>

		<v-button v-if="!disabled" v-tooltip="t('edit')" x-small secondary icon class="action-button" @click="enableEdit">
			<v-icon name="edit" />
		</v-button>

		<v-button
			v-if="isDiffer && !isTouched"
			v-tooltip="t('auto_generate')"
			x-small
			secondary
			icon
			class="action-button"
			@click="setByCurrentState"
		>
			<v-icon name="auto_fix_high" />
		</v-button>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, nextTick, watch, computed, PropType } from 'vue';
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
			default: () => ['create'],
		},
	},
	emits: ['input'],
	setup(props, { emit, attrs }) {
		const { t } = useI18n();
		const values = inject('values', ref<Record<string, any>>({}));
		const isEditing = ref<boolean>(props.autofocus);
		const isTouched = ref<boolean>(false);
		const cachedValueBeforeEdit = ref<string>(props.value);
		const trim = ref<boolean>(true);
		const renderedPrefix = computed<string>(() => render(props.prefix || '', values.value));
		const renderedSuffix = computed<string>(() => render(props.suffix || '', values.value));
		const presentedLink = computed<string>(
			() =>
				renderedPrefix.value +
				(props.value || props.placeholder || attrs['field-data']?.meta.field) +
				renderedSuffix.value
		);
		const isDiffer = computed<boolean>(() => {
			const transformed = transform(render(props.template, values.value));
			if (transformed === (props.value || '')) return false;
			return transformed !== (props.value || '').replace(/-\d+$/, '');
		});

		watch(values, (values: Record<string, any>) => {
			// Reject manual touching.
			if (isEditing.value || isTouched.value) return;

			// According the update policy.
			if (!(typeof values.id !== 'undefined' ? props.update.includes('update') : props.update.includes('create')))
				return;

			// Avoid self update.
			if (values[props.field] && (values[props.field] || '') !== (props.value || '')) return;

			emitter(values);
		});

		return {
			t,
			renderedSuffix,
			renderedPrefix,
			presentedLink,
			isTouched,
			isEditing,
			trim,
			isDiffer,
			setByCurrentState,
			onChange,
			onKeyPress,
			enableEdit,
			disableEdit,
		};

		function onKeyPress(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				// Temporary disable triming to avoid overwriting of the model value by the blur event inside v-input.
				trim.value = false;
				isTouched.value = false;
				emit('input', cachedValueBeforeEdit.value);
				nextTick(() => {
					disableEdit();
					trim.value = true;
				});
			} else if (event.key === 'Enter') {
				disableEdit();
			}
		}

		function onChange(value: string) {
			if (props.disabled) return;
			if (props.value === value) return;

			isTouched.value = Boolean(value && value.trim());

			// Emit exact value.
			emit('input', transform(value || ''));
		}

		function transform(value: string) {
			// Entferne den Uhrzeit-Anteil aus dem String
			const regex = /T\d{2}:\d{2}:\d{2}/;
			value = value.replace(regex, '');
			return slugify(value, { separator: '-', preserveTrailingDash: true }).slice(0, props.length);
		}

		function setByCurrentState() {
			isTouched.value = false;
			emitter(values.value);
		}

		function emitter(values: Record<string, any>) {
			const newValue = transform(render(props.template, values));
			if (newValue === (props.value || '')) return;

			emit('input', newValue);
		}

		function enableEdit(): void {
			cachedValueBeforeEdit.value = props.value;
			isEditing.value = true;
		}

		function disableEdit(): void {
			isEditing.value = false;
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

.icon-left {
	margin-right: 8px;
}

.action-button {
	margin-left: 8px;
}

.link {
	color: var(--foreground-subdued);
	text-decoration: underline;
	word-break: break-word;
}

a.link {
	color: var(--primary);
}

a.link:focus-visible,
a.link:hover {
	color: var(--primary-75);
}
</style>
