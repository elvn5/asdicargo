<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';
import { ApiError } from '~/composables/useApi';
import { useAuthStore } from '~/stores/auth';

const { t, locale } = useI18n();
const auth = useAuthStore();
const toast = useToast();

// ---------------- Личные данные ----------------
const profileSchema = toTypedSchema(
  z.object({
    firstName: z.string().trim().max(100),
    lastName: z.string().trim().max(100),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()-]{7,20}$|^$/, t('account.profile.errPhone')),
    email: z.string().trim().email(t('auth.errEmail')).or(z.literal('')),
  }),
);

const profileForm = useForm({
  validationSchema: profileSchema,
  initialValues: {
    firstName: auth.user?.firstName ?? '',
    lastName: auth.user?.lastName ?? '',
    phone: auth.user?.phone ?? '',
    email: auth.user?.email ?? '',
  },
});
// При первом заходе профиль может подгрузиться уже после setup (SSR без сессии).
watch(
  () => auth.user,
  (user) => {
    if (!user || profileForm.meta.value.dirty) return;
    profileForm.resetForm({
      values: {
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        phone: user.phone ?? '',
        email: user.email ?? '',
      },
    });
  },
);

const [firstName, firstNameAttrs] = profileForm.defineField('firstName');
const [lastName, lastNameAttrs] = profileForm.defineField('lastName');
const [phone, phoneAttrs] = profileForm.defineField('phone');
const [email, emailAttrs] = profileForm.defineField('email');

const savingProfile = ref(false);
const profileError = ref<string | null>(null);

const onSaveProfile = profileForm.handleSubmit(async (values) => {
  profileError.value = null;
  savingProfile.value = true;
  try {
    await auth.updateProfile(values);
    profileForm.resetForm({ values });
    toast.add({ title: t('account.profile.saved'), color: 'success', icon: 'i-lucide-check' });
  } catch (error) {
    profileError.value =
      error instanceof ApiError && error.status === 409
        ? t('account.profile.errEmailTaken')
        : t('account.profile.errSave');
  } finally {
    savingProfile.value = false;
  }
});

// Заполненность профиля — по ключевым полям для оформления посылок.
const completeness = computed(() => {
  const fields = [firstName.value, lastName.value, phone.value, email.value];
  const filled = fields.filter((v) => typeof v === 'string' && v.trim() !== '').length;
  return Math.round((filled / fields.length) * 100);
});

// ---------------- Пароль ----------------
const hasPassword = computed(() => auth.user?.hasPassword ?? false);

const passwordSchema = computed(() =>
  toTypedSchema(
    z
      .object({
        currentPassword: hasPassword.value
          ? z.string().min(1, t('auth.errPasswordRequired'))
          : z.string().optional(),
        newPassword: z.string().min(8, t('auth.errPasswordMin')),
        confirmPassword: z.string(),
      })
      .refine((v) => v.newPassword === v.confirmPassword, {
        message: t('auth.errPasswordMatch'),
        path: ['confirmPassword'],
      }),
  ),
);

const passwordForm = useForm({ validationSchema: passwordSchema });
const [currentPassword, currentPasswordAttrs] = passwordForm.defineField('currentPassword');
const [newPassword, newPasswordAttrs] = passwordForm.defineField('newPassword');
const [confirmPassword, confirmPasswordAttrs] = passwordForm.defineField('confirmPassword');

const savingPassword = ref(false);
const passwordError = ref<string | null>(null);

const onChangePassword = passwordForm.handleSubmit(async (values) => {
  passwordError.value = null;
  savingPassword.value = true;
  try {
    await auth.changePassword(values.newPassword, values.currentPassword || undefined);
    passwordForm.resetForm();
    toast.add({
      title: t('account.profile.passwordChanged'),
      color: 'success',
      icon: 'i-lucide-check',
    });
  } catch (error) {
    passwordError.value =
      error instanceof ApiError && error.status === 401
        ? t('account.profile.errCurrentPassword')
        : t('account.profile.errSave');
  } finally {
    savingPassword.value = false;
  }
});

const memberSince = computed(() =>
  auth.user
    ? new Date(auth.user.createdAt).toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'ru-RU', {
        // С днём — чтобы месяц стоял в родительном падеже («с 17 октября»).
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '',
);
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold sm:text-3xl">{{ t('account.profile.title') }}</h1>

    <!-- Карточка пользователя + заполненность -->
    <section
      v-if="auth.user"
      class="flex flex-col gap-5 rounded-brand-lg border border-steel-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6 dark:border-steel-800 dark:bg-steel-900/50"
    >
      <div class="flex items-center gap-4">
        <UAvatar :src="auth.user.avatarUrl ?? undefined" :alt="auth.displayName" size="xl" icon="i-lucide-user" />
        <div class="min-w-0">
          <p class="truncate text-lg font-semibold">{{ auth.displayName }}</p>
          <p class="text-sm text-steel-500 dark:text-steel-400">{{ t('account.profile.memberSince', { date: memberSince }) }}</p>
          <p v-if="auth.user.telegramId" class="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <UIcon name="i-lucide-send" class="size-3.5" />
            {{ t('account.profile.telegram') }}: {{ t('account.profile.telegramConnected') }}
          </p>
        </div>
      </div>
      <div class="sm:ml-auto sm:w-64">
        <div class="flex justify-between text-sm">
          <span class="font-medium">{{ t('account.profile.completeness', { percent: completeness }) }}</span>
        </div>
        <UProgress :model-value="completeness" class="mt-2" />
        <p class="mt-2 text-xs text-steel-500 dark:text-steel-400">{{ t('account.profile.completenessHint') }}</p>
      </div>
    </section>

    <!-- Личные данные -->
    <section class="rounded-brand-lg border border-steel-200 bg-white p-5 sm:p-6 dark:border-steel-800 dark:bg-steel-900/50">
      <h2 class="mb-5 font-semibold">{{ t('account.profile.personal') }}</h2>
      <form class="grid gap-4 sm:grid-cols-2" @submit="onSaveProfile">
        <UFormField :label="t('account.profile.firstName')" :error="profileForm.errors.value.firstName">
          <UInput v-model="firstName" v-bind="firstNameAttrs" autocomplete="given-name" size="lg" class="w-full" />
        </UFormField>
        <UFormField :label="t('account.profile.lastName')" :error="profileForm.errors.value.lastName">
          <UInput v-model="lastName" v-bind="lastNameAttrs" autocomplete="family-name" size="lg" class="w-full" />
        </UFormField>
        <UFormField :label="t('account.profile.phone')" :error="profileForm.errors.value.phone">
          <UInput
            v-model="phone"
            v-bind="phoneAttrs"
            type="tel"
            autocomplete="tel"
            placeholder="+996 555 123 456"
            size="lg"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="t('account.profile.email')" :error="profileForm.errors.value.email">
          <UInput v-model="email" v-bind="emailAttrs" type="email" autocomplete="email" size="lg" class="w-full" />
        </UFormField>

        <div class="flex flex-wrap items-center gap-3 sm:col-span-2">
          <UButton type="submit" :loading="savingProfile" :disabled="!profileForm.meta.value.dirty" icon="i-lucide-save">
            {{ t('account.profile.save') }}
          </UButton>
          <p v-if="profileError" class="text-sm text-red-600 dark:text-red-400">{{ profileError }}</p>
        </div>
      </form>
    </section>

    <!-- Безопасность -->
    <section class="rounded-brand-lg border border-steel-200 bg-white p-5 sm:p-6 dark:border-steel-800 dark:bg-steel-900/50">
      <h2 class="font-semibold">{{ t('account.profile.security') }}</h2>
      <p v-if="!hasPassword" class="mt-1 text-sm text-steel-500 dark:text-steel-400">
        {{ t('account.profile.setPasswordHint') }}
      </p>
      <form class="mt-5 grid gap-4 sm:grid-cols-2" @submit="onChangePassword">
        <UFormField
          v-if="hasPassword"
          :label="t('account.profile.currentPassword')"
          :error="passwordForm.errors.value.currentPassword"
          class="sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]"
        >
          <UInput
            v-model="currentPassword"
            v-bind="currentPasswordAttrs"
            type="password"
            autocomplete="current-password"
            size="lg"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="t('account.profile.newPassword')" :error="passwordForm.errors.value.newPassword">
          <UInput
            v-model="newPassword"
            v-bind="newPasswordAttrs"
            type="password"
            autocomplete="new-password"
            size="lg"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="t('account.profile.confirmPassword')" :error="passwordForm.errors.value.confirmPassword">
          <UInput
            v-model="confirmPassword"
            v-bind="confirmPasswordAttrs"
            type="password"
            autocomplete="new-password"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <div class="flex flex-wrap items-center gap-3 sm:col-span-2">
          <UButton type="submit" color="neutral" variant="soft" :loading="savingPassword" icon="i-lucide-key-round">
            {{ hasPassword ? t('account.profile.changePassword') : t('account.profile.setPassword') }}
          </UButton>
          <p v-if="passwordError" class="text-sm text-red-600 dark:text-red-400">{{ passwordError }}</p>
        </div>
      </form>
    </section>
  </div>
</template>
