import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Некорректный e-mail').max(255),
  password: z.string().min(8, 'Минимум 8 символов').max(128),
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
});
export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Некорректный e-mail'),
  password: z.string().min(1, 'Введите пароль'),
});
export type LoginDto = z.infer<typeof loginSchema>;

// Полезная нагрузка Telegram Login Widget (data-onauth / callback).
export const telegramLoginSchema = z.object({
  id: z.coerce.number().int(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().url().optional(),
  auth_date: z.coerce.number().int(),
  hash: z.string().min(1),
});
export type TelegramLoginDto = z.infer<typeof telegramLoginSchema>;

// Пустые строки из формы считаем «не заполнено».
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === '' ? null : value))
    .nullable();

export const updateProfileSchema = z.object({
  firstName: optionalText(100),
  lastName: optionalText(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$|^$/, 'Некорректный номер телефона')
    .transform((value) => (value === '' ? null : value))
    .nullable(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Некорректный e-mail')
    .max(255)
    .or(z.literal('').transform(() => null))
    .nullable(),
});
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  // Обязателен, если пароль уже был задан (пользователи Telegram задают его впервые).
  currentPassword: z.string().max(128).optional(),
  newPassword: z.string().min(8, 'Минимум 8 символов').max(128),
});
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
