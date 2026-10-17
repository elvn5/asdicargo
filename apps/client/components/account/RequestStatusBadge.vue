<script setup lang="ts">
import type { ShipmentRequestStatus } from '~/types/api';

const props = defineProps<{ status: ShipmentRequestStatus }>();
const { t } = useI18n();
const meta = computed(() => REQUEST_STATUS_META[props.status]);
</script>

<template>
  <UBadge :color="meta.color" variant="subtle" :icon="meta.icon" class="rounded-full">
    {{ t(`account.requests.status.${status}`) }}
  </UBadge>
</template>
