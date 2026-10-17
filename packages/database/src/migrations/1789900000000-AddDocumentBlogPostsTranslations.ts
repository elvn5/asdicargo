import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Переводы статей блога о документах для грузоперевозчиков (en, ky) — те же
 * четыре темы, что в AddDocumentBlogPosts. У каждого перевода свои PDF-памятка и
 * обложка в apps/client/public/blog/.
 * ON CONFLICT: если пост с таким слагом уже создан из админки, не трогаем его.
 */
const POSTS: Array<{
  language: 'ru' | 'ky' | 'en';
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  daysAgo: number;
}> = [
  {
    language: "en",
    slug: "cmr-consignment-note-how-to-fill-in",
    title: "CMR consignment note: what it is and how to fill it in correctly",
    excerpt: "The key document of international road haulage: who issues it, what goes into each box and how to avoid typical mistakes. A PDF guide is attached at the end of the article.",
    content: "<p>A <strong>CMR</strong> is the international consignment note that confirms the contract for the international carriage of goods by road. Its form and rules are set by the CMR Convention (Geneva, 1956). Russia and Kyrgyzstan are parties to the Convention, so on the KG ⇄ RU route a CMR is issued for every shipment.</p><h2>Who fills in the CMR</h2><ul><li><strong>The sender</strong> — cargo details, weight, number of packages, attached documents.</li><li><strong>The carrier</strong> — its own details, vehicle numbers and reservations about the condition of the goods at loading.</li><li><strong>The consignee</strong> — signature, stamp and reservations on delivery.</li></ul><p>Under the Convention at least three originals are issued: for the sender, for the consignee (travels with the goods) and for the carrier.</p><h2>Key boxes</h2><ul><li><strong>1–4</strong> — sender, consignee, places and dates of loading and delivery.</li><li><strong>5</strong> — attached documents: invoice, packing list, certificates.</li><li><strong>6–12</strong> — description of goods, number of packages, gross weight and volume.</li><li><strong>18</strong> — carrier's reservations about the condition of the goods and packaging.</li><li><strong>24</strong> — consignee's confirmation of receipt.</li></ul><h2>Typical mistakes</h2><ul><li>Weight and number of packages differ from the packing list.</li><li>Box 18 is empty although the packaging is damaged.</li><li>Corrections without a signature and stamp.</li><li>Wrong trailer registration number.</li></ul><blockquote><p>The carrier's liability under the CMR is limited to 8.33 SDR per kilogram of gross weight. If the cargo is valuable, declare its value in the CMR or insure it.</p></blockquote><p>The full table of CMR boxes and a checklist are in the PDF guide below.</p><p><a href=\"/blog/cmr-consignment-note-how-to-fill-in.pdf\" target=\"_blank\">Download the PDF guide “CMR consignment note: what it is and how to fill it in correctly” (3 pp.)</a></p>",
    daysAgo: 3,
  },
  {
    language: "en",
    slug: "eaeu-cargo-documents",
    title: "Which cargo documents you need for transport within the EAEU",
    excerpt: "There is no customs clearance between Kyrgyzstan and Russia, but the cargo still needs a set of documents. Checklist: contract, invoice, packing list, certificates and tax documents. PDF guide inside.",
    content: "<p>Kyrgyzstan and Russia are members of the Eurasian Economic Union, so EAEU goods move between them <strong>without customs declaration</strong>. But the cargo still needs documents: for controls at the border and on the road, for acceptance and accounting by the consignee, for VAT and in case of a dispute over damaged cargo.</p><h2>The basic set</h2><ul><li><strong>Supply contract</strong> — the basis of the deal.</li><li><strong>Invoice</strong> — confirms the value of the cargo.</li><li><strong>Packing list</strong> — packages, packaging, weight and volume.</li><li><strong>Delivery note or UTD</strong> — transfer of goods to the consignee.</li><li><strong>CMR consignment note</strong> — the contract of international carriage.</li><li><strong>Transport order</strong> — the contract with the carrier.</li></ul><h2>What else may be required</h2><ul><li>EAEU certificate or declaration of conformity — for goods covered by technical regulations.</li><li>Veterinary and phytosanitary documents — for products of animal and plant origin.</li><li>“Chestny Znak” labelling documents — for goods subject to labelling.</li><li>ADR documents — for dangerous goods.</li></ul><h2>VAT on import</h2><p>Within the EAEU, VAT on imported goods is paid by the buyer in the country of destination through the tax authorities: the buyer files an application for the import of goods and payment of indirect taxes no later than the 20th day of the month following the month in which the goods were recorded in the books.</p><blockquote><p>The main rule: the description of goods, number of packages and weight must match in all documents — the contract, invoice, packing list and CMR.</p></blockquote><p>The table of documents and a step-by-step checklist are in the PDF guide below.</p><p><a href=\"/blog/eaeu-cargo-documents.pdf\" target=\"_blank\">Download the PDF guide “Which cargo documents you need for transport within the EAEU” (3 pp.)</a></p>",
    daysAgo: 2,
  },
  {
    language: "en",
    slug: "driver-and-vehicle-documents-for-a-trip",
    title: "Driver and vehicle documents for an international trip",
    excerpt: "A pre-departure checklist for a Kyrgyzstan ⇄ Russia trip: personal documents, tractor and trailer documents, insurance, tachograph and Platon. Download the PDF and keep it in the cab.",
    content: "<p>Delays at the border or fines on the road are most often caused by a forgotten or expired document. Here is a checklist for a Kyrgyzstan ⇄ Russia trip.</p><h2>Driver's documents</h2><ul><li>Passport that allows entry to the country of destination.</li><li>Driving licence, category CE (for an articulated vehicle).</li><li>Tachograph driver card.</li><li>Migration documents.</li><li>Employment contract or trip assignment from the carrier.</li></ul><h2>Vehicle documents</h2><ul><li>Registration certificates of the tractor and semi-trailer.</li><li>Power of attorney or lease agreement if the driver is not the owner.</li><li>Valid roadworthiness test.</li><li>OSAGO policy valid in Russia (border insurance for foreign vehicles).</li><li>Platon registration for vehicles over 12 t.</li></ul><h2>Permits and tachograph</h2><p>Carriers of EAEU countries perform bilateral and transit carriage across the Union without permits. Driving and rest times on international trips are governed by the AETR Agreement, so the tachograph must work and be calibrated.</p><blockquote><p>Check the validity of all documents before departure — an expired policy or roadworthiness test can cost you several days of downtime.</p></blockquote><p>Print the checklist from the PDF guide below and keep it in the cab.</p><p><a href=\"/blog/driver-and-vehicle-documents-for-a-trip.pdf\" target=\"_blank\">Download the PDF guide “Driver and vehicle documents for an international trip” (3 pp.)</a></p>",
    daysAgo: 1,
  },
  {
    language: "en",
    slug: "cargo-damage-or-loss-documents",
    title: "Cargo damage or loss: which documents to prepare",
    excerpt: "How to protect yourself if cargo is damaged or lost: what to put in the transport order, how to handle acceptance and when to file a claim under the CMR. A claim outline is in the PDF.",
    content: "<p>The cargo arrived damaged, short or did not arrive at all? Your chances of compensation depend on how the documents are drawn up: the transport order, the CMR entries, the report and the claim.</p><h2>Transport order</h2><p>It sets out the terms you will rely on in a dispute: route and deadlines, description and value of the cargo, vehicle and driver details, the rate, liability and insurance.</p><h2>CMR deadlines</h2><ul><li><strong>Apparent damage</strong> — reservations immediately on delivery, in box 24 of the CMR and in the report.</li><li><strong>Hidden damage</strong> — written reservations within 7 days (Sundays and public holidays excepted).</li><li><strong>Delay in delivery</strong> — a claim within 21 days.</li><li><strong>Limitation period</strong> — 1 year (3 years in case of the carrier's wilful misconduct).</li></ul><h2>If the cargo is damaged</h2><ol><li>Accept the cargo with reservations instead of refusing it.</li><li>Make a reservation in box 24 of the CMR.</li><li>Draw up a damage report in the driver's presence.</li><li>Take photos and videos of the cargo, packaging and seals.</li><li>Call an independent surveyor for major damage.</li><li>Send a written claim with attachments.</li></ol><blockquote><p>Without reservations on delivery the goods are presumed to have been received in good condition — proving otherwise later is very difficult.</p></blockquote><p>The claim outline and the full procedure are in the PDF guide below.</p><p><a href=\"/blog/cargo-damage-or-loss-documents.pdf\" target=\"_blank\">Download the PDF guide “Cargo damage or loss: which documents to prepare” (3 pp.)</a></p>",
    daysAgo: 0,
  },
  {
    language: "ky",
    slug: "cmr-kantip-tolturuu",
    title: "CMR-накладной деген эмне жана аны кантип туура толтуруу керек",
    excerpt: "Эл аралык автоташуунун негизги документи: аны ким толтурат, ар бир графага эмне жазылат жана типтүү каталардан кантип качуу керек. Макаланын аягында — PDF-эскертме.",
    content: "<p><strong>CMR</strong> — жүктү эл аралык автомобиль менен ташуу келишимин тастыктаган эл аралык товардык-транспорттук накладной. Анын формасы жана эрежелери КДПГ конвенциясы (Женева, 1956) менен белгиленген. Россия жана Кыргызстан Конвенциянын катышуучулары, ошондуктан КР ⇄ РФ багытында CMR ар бир жөнөтүүгө толтурулат.</p><h2>CMRди ким толтурат</h2><ul><li><strong>Жөнөтүүчү</strong> — жүк тууралуу маалымат, салмагы, орундардын саны, тиркелген документтер.</li><li><strong>Ташуучу</strong> — өз маалыматы, унаанын номерлери жана жүктөөдөгү жүктүн абалы боюнча эскертүүлөр.</li><li><strong>Алуучу</strong> — кабыл алууда колу, мөөрү жана эскертүүлөрү.</li></ul><p>Конвенция боюнча эң аз дегенде үч түп нуска толтурулат: жөнөтүүчүгө, алуучуга (жүк менен бирге барат) жана ташуучуга.</p><h2>Негизги графалар</h2><ul><li><strong>1–4</strong> — жөнөтүүчү, алуучу, жүктөө жана түшүрүү жерлери, күнү.</li><li><strong>5</strong> — тиркелген документтер: инвойс, таңгак барагы, сертификаттар.</li><li><strong>6–12</strong> — жүктүн сүрөттөлүшү, орундардын саны, брутто салмагы жана көлөмү.</li><li><strong>18</strong> — жүктүн жана таңгактын абалы боюнча ташуучунун эскертүүлөрү.</li><li><strong>24</strong> — алуучунун кабыл алгандыгы тууралуу белгиси.</li></ul><h2>Типтүү каталар</h2><ul><li>Салмагы жана орундардын саны таңгак барагы менен дал келбейт.</li><li>Таңгак бузулса да 18-графа бош.</li><li>Колу жана мөөрү жок оңдоолор.</li><li>Чиркегичтин мамлекеттик номери туура эмес.</li></ul><blockquote><p>КДПГ боюнча ташуучунун жоопкерчилиги брутто салмагынын ар бир килограммына 8,33 СДР менен чектелет. Жүк кымбат болсо — анын наркын CMRде жарыялаңыз же камсыздандырыңыз.</p></blockquote><p>CMR графаларынын толук таблицасы жана текшерүү чек-листи — төмөндөгү PDF-эскертмеде.</p><p><a href=\"/blog/cmr-kantip-tolturuu.pdf\" target=\"_blank\">PDF-эскертмени жүктөп алуу «CMR-накладной деген эмне жана аны кантип туура толтуруу керек» (3 бет)</a></p>",
    daysAgo: 3,
  },
  {
    language: "ky",
    slug: "eaeb-boyuncha-juk-dokumentteri",
    title: "ЕАЭБ ичинде ташууда жүккө кандай документтер керек",
    excerpt: "КР менен РФтин ортосунда бажы тариздөөсү жок, бирок жүккө документтер топтому керек. Чек-лист: келишим, инвойс, таңгак барагы, сертификаттар жана салык документтери. Ичинде PDF-эскертме.",
    content: "<p>Кыргызстан жана Россия Евразиялык экономикалык биримдикке кирет, ошондуктан ЕАЭБ товарлары өлкөлөрдүн ортосунда <strong>бажы декларациясыз</strong> жылат. Бирок жүккө документтер баары бир керек: чек арадагы жана жолдогу көзөмөл үчүн, алуучунун кабыл алуусу жана эсеби үчүн, КНС төлөө үчүн жана жүк бузулуп калса талаш үчүн.</p><h2>Негизги топтом</h2><ul><li><strong>Жеткирүү келишими</strong> — бүтүмдүн негизи.</li><li><strong>Инвойс / эсеп-фактура</strong> — жүктүн наркын тастыктайт.</li><li><strong>Таңгак барагы</strong> — орундар, таңгак, салмак жана көлөм.</li><li><strong>Товардык накладной же УПД</strong> — товарды алуучуга өткөрүп берүү.</li><li><strong>CMR-накладной</strong> — эл аралык ташуу келишими.</li><li><strong>Келишим-өтүнмө</strong> — ташуучу менен келишим.</li></ul><h2>Кошумча эмне керек болушу мүмкүн</h2><ul><li>ЕАЭБ ТР шайкештик сертификаты же декларациясы — техникалык регламенттердеги товарлар үчүн.</li><li>Ветеринардык жана фитосанитардык документтер — жаныбар жана өсүмдүк продукциясы үчүн.</li><li>«Честный знак» маркировкасы боюнча документтер — маркировкаланган товарлар үчүн.</li><li>ДОПОГ документтери — коркунучтуу жүктөр үчүн.</li></ul><h2>Ташып кирүүдө КНС</h2><p>ЕАЭБ ичинде ташылып кирген товарларга КНСти бара турган өлкөдөгү сатып алуучу салык органдары аркылуу төлөйт: товарлар эсепке алынган айдан кийинки айдын 20-күнүнөн кечиктирбей товарларды ташып кирүү жана кыйыр салыктарды төлөө жөнүндө арыз берет.</p><blockquote><p>Негизги эреже: товар, орундардын саны жана салмагы тууралуу маалымат бардык документтерде — келишимде, инвойсто, таңгак барагында жана CMRде дал келиши керек.</p></blockquote><p>Документтердин таблицасы жана кадам-кадамы менен чек-лист — төмөндөгү PDF-эскертмеде.</p><p><a href=\"/blog/eaeb-boyuncha-juk-dokumentteri.pdf\" target=\"_blank\">PDF-эскертмени жүктөп алуу «ЕАЭБ ичинде ташууда жүккө кандай документтер керек» (3 бет)</a></p>",
    daysAgo: 2,
  },
  {
    language: "ky",
    slug: "aidoochu-jana-unaa-dokumentteri",
    title: "Эл аралык рейс үчүн айдоочунун жана унаанын документтери",
    excerpt: "Кыргызстан ⇄ Россия рейсине чейин айдоочу үчүн чек-лист: жеке документтер, тягач менен чиркегичтин документтери, камсыздандыруу, тахограф жана «Платон». PDFти жүктөп, кабинада сактаңыз.",
    content: "<p>Чек арада токтоп калуу же жолдо айып пул көбүнчө унутулган же мөөнөтү өткөн документтен улам болот. Кыргызстан ⇄ Россия рейси үчүн чек-лист түздүк.</p><h2>Айдоочунун документтери</h2><ul><li>Бара турган өлкөгө кирүүгө укук берген паспорт.</li><li>CE категориясындагы айдоочулук күбөлүк (автопоезд үчүн).</li><li>Тахограф үчүн айдоочунун картасы.</li><li>Миграциялык документтер.</li><li>Эмгек келишими же ташуучудан рейске тапшырма.</li></ul><h2>Унаанын документтери</h2><ul><li>Тягач менен жарым чиркегичтин каттоо күбөлүктөрү.</li><li>Айдоочу ээси болбосо — ишеним кат же ижара келишими.</li><li>Жарактуу техкароо.</li><li>РФте жарактуу ОСАГО полиси (чет өлкөлүк унаалар үчүн — чек арадагы камсыздандыруу).</li><li>12 тоннадан ашкан унаалар үчүн «Платондо» каттоо.</li></ul><h2>Уруксаттар жана тахограф</h2><p>ЕАЭБ өлкөлөрүнүн ташуучулары биримдиктин аймагында эки тараптуу жана транзиттик ташууларды уруксатсыз аткарышат. Эл аралык рейстерде айдоочунун эмгек жана эс алуу режимин ЕСТР келишими жөнгө салат, ошондуктан тахограф иштеп, калибрленген болушу керек.</p><blockquote><p>Жолго чыгаар алдында бардык документтердин мөөнөтүн текшериңиз — мөөнөтү өткөн полис же техкароо бир нече күн токтоп калууга алып келиши мүмкүн.</p></blockquote><p>Төмөндөгү PDF-эскертмеден чек-листти басып чыгарып, кабинада сактаңыз.</p><p><a href=\"/blog/aidoochu-jana-unaa-dokumentteri.pdf\" target=\"_blank\">PDF-эскертмени жүктөп алуу «Эл аралык рейс үчүн айдоочунун жана унаанын документтери» (3 бет)</a></p>",
    daysAgo: 1,
  },
  {
    language: "ky",
    slug: "juk-buzulsa-je-jogolso",
    title: "Жүк бузулса же жоголсо: кандай документтерди тариздөө керек",
    excerpt: "Жүк бузулганда же жоголгондо өзүңүздү кантип коргоо керек: келишим-өтүнмөгө эмне жазуу керек, кабыл алууну кантип тариздөө керек жана CMR боюнча дооматты кайсы мөөнөттө берүү керек. Доомат каттын түзүлүшү — PDFте.",
    content: "<p>Жүк бузулуп, жетишпей келдиби же такыр келген жокпу? Компенсация алуу мүмкүнчүлүгү документтердин кандай толтурулганына жараша болот: келишим-өтүнмө, CMRдеги белгилер, акт жана доомат.</p><h2>Келишим-өтүнмө</h2><p>Анда талашта сиз таяна турган шарттар бекитилет: багыт жана мөөнөттөр, жүктүн сүрөттөлүшү жана наркы, унаа менен айдоочунун маалыматтары, баасы, жоопкерчилик жана камсыздандыруу.</p><h2>КДПГ боюнча мөөнөттөр</h2><ul><li><strong>Ачык бузулуулар</strong> — кабыл алууда дароо, CMRдин 24-графасында жана актыда эскертүү.</li><li><strong>Жашыруун бузулуулар</strong> — 7 күндүн ичинде жазуу жүзүндөгү эскертүүлөр (жекшемби жана майрам күндөрүн эсептебегенде).</li><li><strong>Жеткирүүнүн кечигиши</strong> — 21 күндүн ичинде доомат.</li><li><strong>Доонун эскирүү мөөнөтү</strong> — 1 жыл (ташуучунун атайылап кылган аракетинде — 3 жыл).</li></ul><h2>Жүк бузулса</h2><ol><li>Жүктөн баш тартпай, аны эскертүүлөр менен кабыл алыңыз.</li><li>CMRдин 24-графасына эскертүү жазыңыз.</li><li>Айдоочунун катышуусу менен бузулуу жөнүндө акт түзүңүз.</li><li>Жүктү, таңгакты жана пломбаларды сүрөткө жана видеого тартыңыз.</li><li>Зыян чоң болсо, көз карандысыз сюрвейерди чакырыңыз.</li><li>Тиркемелери менен жазуу жүзүндө доомат жибериңиз.</li></ol><blockquote><p>Кабыл алууда эскертүү жок болсо, жүк талаптагыдай абалда алынды деп эсептелет — кийин тескерисин далилдөө абдан кыйын.</p></blockquote><p>Доомат каттын түзүлүшү жана толук иш-аракет тартиби — төмөндөгү PDF-эскертмеде.</p><p><a href=\"/blog/juk-buzulsa-je-jogolso.pdf\" target=\"_blank\">PDF-эскертмени жүктөп алуу «Жүк бузулса же жоголсо: кандай документтерди тариздөө керек» (3 бет)</a></p>",
    daysAgo: 0,
  },
];

export class AddDocumentBlogPostsTranslations1789900000000 implements MigrationInterface {
  name = 'AddDocumentBlogPostsTranslations1789900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const post of POSTS) {
      await queryRunner.query(
        `INSERT INTO "posts" ("slug", "title", "excerpt", "content", "coverImageUrl", "language", "status", "publishedAt")
         VALUES ($1, $2, $3, $4, $5, $6, 'published', now() - make_interval(days => $7))
         ON CONFLICT ("slug") DO NOTHING`,
        [
          post.slug,
          post.title,
          post.excerpt,
          post.content,
          `/blog/${post.slug}.webp`,
          post.language,
          post.daysAgo,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "posts" WHERE "slug" = ANY($1)`, [POSTS.map((p) => p.slug)]);
  }
}
