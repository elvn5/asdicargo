<script setup lang="ts">
import { ApiError } from '~/composables/useApi';
import type { UserAddress, UserAddressPayload } from '~/types/api';

const { t } = useI18n();
const api = useApi();
const toast = useToast();

const {
  data: addresses,
  status,
  refresh,
} = await useAsyncData('account-addresses', () => api.get<UserAddress[]>('/account/addresses'), {
  server: false,
  default: () => [],
});

const modalOpen = ref(false);
const editing = ref<UserAddress | null>(null);
const saving = ref(false);
const formError = ref<string | null>(null);

function openCreate(): void {
  editing.value = null;
  formError.value = null;
  modalOpen.value = true;
}

function openEdit(address: UserAddress): void {
  editing.value = address;
  formError.value = null;
  modalOpen.value = true;
}

async function onSubmit(payload: UserAddressPayload): Promise<void> {
  saving.value = true;
  formError.value = null;
  try {
    if (editing.value) {
      await api.put(`/account/addresses/${editing.value.id}`, payload);
    } else {
      await api.post('/account/addresses', payload);
    }
    modalOpen.value = false;
    toast.add({ title: t('account.addresses.saved'), color: 'success', icon: 'i-lucide-check' });
    await refresh();
  } catch (error) {
    formError.value =
      // Понятное сообщение сервера (напр. лимит адресов), а не техническое от $fetch.
      error instanceof ApiError && error.status === 400 && !error.message.startsWith('[')
        ? error.message
        : t('account.profile.errSave');
  } finally {
    saving.value = false;
  }
}

// id адреса, по которому идёт действие, — для спиннера на его кнопке.
const busyId = ref<string | null>(null);

async function makeDefault(address: UserAddress): Promise<void> {
  const { id: _id, ...rest } = address;
  busyId.value = address.id;
  try {
    await api.put(`/account/addresses/${address.id}`, { ...rest, isDefault: true });
    await refresh();
  } finally {
    busyId.value = null;
  }
}

async function remove(address: UserAddress): Promise<void> {
  if (!confirm(t('account.addresses.deleteConfirm', { label: address.label }))) return;
  busyId.value = address.id;
  try {
    await api.delete(`/account/addresses/${address.id}`);
    toast.add({
      title: t('account.addresses.deleted'),
      color: 'neutral',
      icon: 'i-lucide-trash-2',
    });
    await refresh();
  } finally {
    busyId.value = null;
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold sm:text-3xl">{{ t('account.addresses.title') }}</h1>
        <p class="mt-1 text-steel-500 dark:text-steel-400">{{ t('account.addresses.sub') }}</p>
      </div>
      <UButton icon="i-lucide-plus" @click="openCreate">{{ t('account.addresses.add') }}</UButton>
    </div>

    <div
      v-if="status === 'error'"
      class="rounded-brand-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
    >
      {{ t('account.loadError') }}
      <UButton size="xs" variant="link" color="error" @click="refresh()">{{ t('account.retry') }}</UButton>
    </div>

    <div v-else-if="status === 'pending' || status === 'idle'" class="grid gap-4 md:grid-cols-2">
      <USkeleton v-for="n in 2" :key="n" class="h-40 w-full rounded-brand-lg" />
    </div>

    <div v-else-if="addresses.length" class="grid gap-4 md:grid-cols-2">
      <article
        v-for="a in addresses"
        :key="a.id"
        class="flex flex-col rounded-brand-lg border bg-white p-5 dark:bg-steel-900/50"
        :class="a.isDefault ? 'border-brand-300 dark:border-brand-800' : 'border-steel-200 dark:border-steel-800'"
      >
        <div class="flex items-start justify-between gap-2">
          <h2 class="font-semibold">{{ a.label }}</h2>
          <UBadge v-if="a.isDefault" color="primary" variant="subtle" class="rounded-full">
            {{ t('account.addresses.default') }}
          </UBadge>
        </div>
        <p class="mt-2 text-sm">{{ a.contactName }} · {{ a.phone }}</p>
        <p class="mt-1 text-sm text-steel-600 dark:text-steel-300">{{ a.city }}, {{ a.address }}</p>
        <p v-if="a.comment" class="mt-1 text-sm text-steel-500 dark:text-steel-400">{{ a.comment }}</p>
        <div class="mt-4 flex flex-wrap gap-1 border-t border-steel-100 pt-3 dark:border-steel-800">
          <UButton size="xs" variant="ghost" icon="i-lucide-pencil" @click="openEdit(a)">
            {{ t('account.addresses.editShort') }}
          </UButton>
          <UButton
            v-if="!a.isDefault"
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-lucide-star"
            :loading="busyId === a.id"
            :disabled="busyId !== null && busyId !== a.id"
            @click="makeDefault(a)"
          >
            {{ t('account.addresses.makeDefault') }}
          </UButton>
          <UButton
            size="xs"
            variant="ghost"
            color="error"
            icon="i-lucide-trash-2"
            class="ml-auto"
            :loading="busyId === a.id"
            :disabled="busyId !== null && busyId !== a.id"
            @click="remove(a)"
          >
            {{ t('account.addresses.delete') }}
          </UButton>
        </div>
      </article>
    </div>

    <div v-else class="rounded-brand-lg border border-dashed border-steel-300 p-10 text-center dark:border-steel-700">
      <UIcon name="i-lucide-book-user" class="mx-auto size-10 text-steel-300 dark:text-steel-600" />
      <p class="mt-3 font-medium">{{ t('account.addresses.empty') }}</p>
      <UButton class="mt-4" size="sm" variant="soft" icon="i-lucide-plus" @click="openCreate">
        {{ t('account.addresses.add') }}
      </UButton>
    </div>

    <AccountAddressFormModal
      v-model:open="modalOpen"
      :address="editing"
      :saving="saving"
      :error="formError"
      @submit="onSubmit"
    />
  </div>
</template>
