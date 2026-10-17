/**
 * Города для поиска «Откуда / Куда». AsDi Cargo возит сборные грузы между
 * Кыргызстаном и Россией, поэтому справочник ограничен этими странами;
 * любой другой город можно ввести вручную.
 */
export type CountryCode = 'kg' | 'ru';

export const KG_CITIES = [
  'Бишкек',
  'Ош',
  'Джалал-Абад',
  'Каракол',
  'Токмок',
  'Кара-Балта',
  'Кант',
  'Нарын',
  'Талас',
  'Баткен',
  'Узген',
  'Балыкчы',
  'Чолпон-Ата',
  'Кызыл-Кия',
  'Майлуу-Суу',
  'Таш-Кумыр',
  'Кара-Суу',
  'Ноокат',
  'Исфана',
  'Сокулук',
] as const;

export const RU_CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Красноярск',
  'Челябинск',
  'Самара',
  'Уфа',
  'Ростов-на-Дону',
  'Краснодар',
  'Омск',
  'Воронеж',
  'Пермь',
  'Волгоград',
  'Саратов',
  'Тюмень',
  'Тольятти',
  'Ижевск',
  'Барнаул',
  'Ульяновск',
  'Иркутск',
  'Хабаровск',
  'Владивосток',
  'Ярославль',
  'Махачкала',
  'Томск',
  'Оренбург',
  'Кемерово',
  'Новокузнецк',
  'Рязань',
  'Набережные Челны',
  'Астрахань',
  'Пенза',
  'Липецк',
  'Киров',
  'Чебоксары',
  'Калининград',
  'Тула',
  'Курск',
  'Сочи',
  'Ставрополь',
  'Сургут',
  'Якутск',
  'Чита',
  'Улан-Удэ',
  'Абакан',
  'Благовещенск',
  'Мурманск',
] as const;

/** Города, которые показываем первыми в выборе. */
export const POPULAR_CITIES = [
  'Бишкек',
  'Ош',
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
];

const normalize = (value: string): string => value.trim().toLowerCase().replace(/ё/g, 'е');

const KG_SET = new Set(KG_CITIES.map(normalize));
const RU_SET = new Set(RU_CITIES.map(normalize));

/** Страна города из справочника; null — город введён вручную и неизвестен. */
export function countryOf(city: string): CountryCode | null {
  const key = normalize(city);
  if (KG_SET.has(key)) return 'kg';
  if (RU_SET.has(key)) return 'ru';
  return null;
}

/** Поиск по справочнику: сначала совпадения с начала названия, затем по вхождению. */
export function searchCities(query: string, list: readonly string[]): string[] {
  const q = normalize(query);
  if (!q) return [...list];
  const starts = list.filter((c) => normalize(c).startsWith(q));
  const contains = list.filter((c) => !normalize(c).startsWith(q) && normalize(c).includes(q));
  return [...starts, ...contains];
}
