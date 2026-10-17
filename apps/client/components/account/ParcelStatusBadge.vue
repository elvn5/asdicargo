<script setup lang="ts">
import type { ParcelStatus } from '~/types/api';

const props = defineProps<{ status: ParcelStatus }>();
const { t } = useI18n();
const meta = computed(() => PARCEL_STATUS_META[props.status]);
</script>

<template>
  <UBadge :color="meta.color" variant="subtle" :icon="meta.icon" class="rounded-full">
    {{ t(`account.status.${status}`) }}
  </UBadge>
</template>
