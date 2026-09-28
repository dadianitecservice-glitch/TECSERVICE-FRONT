import { blogArticleCopy } from "./blogArticleCopy.ts";

export interface BlogSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  category: string;
  date: string;
  dateTime: string;
  title: string;
  excerpt: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  categoryId: string;
  readMinutes: number;
  takeaway: string;
  serviceHref: string;
  sections: BlogSection[];
  sources?: Array<{ label: string; url: string }>;
}

type BlogTeaser = Omit<BlogPost, "categoryId" | "readMinutes" | "takeaway" | "serviceHref" | "sections" | "sources">;

export const blogCategories: Array<{ id: string; label: { ka: string; en: string } }> = [
  { id: "data", label: { ka: "მონაცემები", en: "Data recovery" } },
  { id: "laptops", label: { ka: "ლეპტოპები", en: "Laptops" } },
  { id: "consoles", label: { ka: "კონსოლები", en: "Consoles" } },
  { id: "components", label: { ka: "კომპონენტები", en: "Components" } },
  { id: "drones", label: { ka: "დრონები", en: "Drones" } },
  { id: "computers", label: { ka: "კომპიუტერები", en: "Computers" } },
];

const blogTeasers: BlogTeaser[] = [
  {
    id: "sd-card-photo-recovery-for-photographers",
    slug: "sd-card-photo-recovery-for-photographers",
    category: "მონაცემები",
    date: "26 სექტემბერი, 2026",
    dateTime: "2026-09-26",
    title: "SD ბარათიდან ფოტოების აღდგენა — გზამკვლევი ფოტოგრაფებისთვის",
    excerpt:
      "კამერა SD ბარათს ვერ კითხულობს ან ფოტოები გაქრა? გაიგეთ, რა გააკეთოთ პირველ წუთებში, რას მოერიდოთ და რაზეა დამოკიდებული RAW, JPEG და ვიდეოს აღდგენა.",
    image: "/assets/blog/sd-card-photo-recovery.webp",
    imageWidth: 1280,
    imageHeight: 720,
    imageAlt: "SD მეხსიერების ბარათი და ბარათის წამკითხველი ფოტოაპარატის გვერდით",
  },
  {
    id: "lost-files-first-minutes",
    slug: "lost-files-first-minutes",
    category: "მონაცემები",
    date: "04 სექტემბერი, 2026",
    dateTime: "2026-09-04",
    title: "დაკარგული ფაილები — რა უნდა გააკეთოთ პირველ წუთებში?",
    excerpt:
      "როგორ შეაჩეროთ ახალი ჩაწერა, შეამოწმოთ სარეზერვო ასლები და ამოიცნოთ დაზიანების საყურადღებო ნიშნები.",
    image: "/assets/blog/data-recovery.webp",
    imageWidth: 849,
    imageHeight: 565,
    imageAlt: "მონაცემების აღდგენის ლაბორატორიული სამუშაო",
  },
  {
    id: "five-reasons-laptop-is-slow",
    slug: "five-reasons-laptop-is-slow",
    category: "ლეპტოპები",
    date: "01 სექტემბერი, 2026",
    dateTime: "2026-09-01",
    title: "ლეპტოპი ნელდება? 5 მიზეზი და გამოსავალი",
    excerpt:
      "ფონური პროგრამები, დისკი, ოპერატიული მეხსიერება და გაგრილება — რა უნდა შეამოწმოთ პირველ რიგში.",
    image: "/assets/blog/laptop-repair.webp",
    imageWidth: 2000,
    imageHeight: 1334,
    imageAlt: "ლეპტოპის ტექნიკური დიაგნოსტიკა",
  },
  {
    id: "console-overheating",
    slug: "console-overheating-signs-and-prevention",
    category: "კონსოლები",
    date: "28 აგვისტო, 2026",
    dateTime: "2026-08-28",
    title: "თამაშის კონსოლის გადახურება: ნიშნები და პრევენცია",
    excerpt:
      "ხმაურიანი ქულერი და მოულოდნელი გამორთვა შესაძლოა გაგრილების პრობლემაზე მიუთითებდეს.",
    image: "/assets/blog/console-repair.webp",
    imageWidth: 800,
    imageHeight: 533,
    imageAlt: "სათამაშო კონსოლის ტექნიკური მომსახურება",
  },
  {
    id: "choose-right-ssd",
    slug: "choose-the-right-ssd-for-your-laptop",
    category: "კომპონენტები",
    date: "24 აგვისტო, 2026",
    dateTime: "2026-08-24",
    title: "როგორ ავარჩიოთ სწორი SSD ლეპტოპისთვის?",
    excerpt:
      "SATA და NVMe დისკების განსხვავება, თავსებადობა და სწორი მოცულობის არჩევა.",
    image: "/assets/blog/ssd.webp",
    imageWidth: 1000,
    imageHeight: 1000,
    imageAlt: "ლეპტოპისთვის SSD დისკის შერჩევა",
  },
  {
    id: "drone-care",
    slug: "drone-care-before-and-after-flight",
    category: "დრონები",
    date: "19 აგვისტო, 2026",
    dateTime: "2026-08-19",
    title: "დრონის მოვლა ფრენის წინ და შემდეგ",
    excerpt:
      "ბატარეის, პროპელერების, კამერისა და მართვის სისტემის აუცილებელი შემოწმება.",
    image: "/assets/blog/drone-repair.webp",
    imageWidth: 800,
    imageHeight: 533,
    imageAlt: "დრონის შემოწმება და ტექნიკური მომსახურება",
  },
  {
    id: "computer-shuts-down-under-load",
    slug: "why-computer-shuts-down-under-load",
    category: "კომპიუტერები",
    date: "14 აგვისტო, 2026",
    dateTime: "2026-08-14",
    title: "რატომ ითიშება კომპიუტერი დატვირთვისას?",
    excerpt:
      "კვების ბლოკი, ტემპერატურა და კომპონენტები — დიაგნოსტიკის მთავარი მიმართულებები.",
    image: "/assets/blog/ssd.webp",
    imageWidth: 1000,
    imageHeight: 1000,
    imageAlt: "კომპიუტერის კომპონენტების დიაგნოსტიკა",
  },
  {
    id: "data-recovery-after-formatting",
    slug: "data-recovery-after-formatting",
    category: "მონაცემები",
    date: "09 აგვისტო, 2026",
    dateTime: "2026-08-09",
    title: "მონაცემთა აღდგენა ფორმატირების შემდეგ",
    excerpt:
      "რატომ არ უნდა ჩაიწეროს ახალი ფაილები დისკზე და როდის უნდა მივმართოთ სპეციალისტს.",
    image: "/assets/blog/data-recovery.webp",
    imageWidth: 849,
    imageHeight: 565,
    imageAlt: "დისკიდან მონაცემების უსაფრთხო აღდგენა",
  },
  {
    id: "xbox-controller-problems",
    slug: "common-xbox-controller-problems",
    category: "კონსოლები",
    date: "03 აგვისტო, 2026",
    dateTime: "2026-08-03",
    title: "Xbox-ის კონტროლერის გავრცელებული პრობლემები",
    excerpt:
      "Stick drift, კავშირის წყვეტა და ღილაკების გაუმართაობა — ძირითადი ნიშნები.",
    image: "/assets/blog/console-repair.webp",
    imageWidth: 800,
    imageHeight: 533,
    imageAlt: "Xbox კონტროლერის შეკეთება",
  },
  {
    id: "laptop-battery-replacement-signs",
    slug: "laptop-battery-replacement-signs",
    category: "ლეპტოპები",
    date: "28 ივლისი, 2026",
    dateTime: "2026-07-28",
    title: "როდის სჭირდება ლეპტოპის ბატარეას შემოწმება?",
    excerpt:
      "სწრაფი დაცლა, გადახურება და გაბერვა — ნიშნები, რომლებიც უყურადღებოდ არ უნდა დარჩეს.",
    image: "/assets/blog/laptop-repair.webp",
    imageWidth: 2000,
    imageHeight: 1334,
    imageAlt: "ლეპტოპის ბატარეის დიაგნოსტიკა",
  },
  {
    id: "raid-first-steps",
    slug: "first-steps-after-raid-failure",
    category: "მონაცემები",
    date: "21 ივლისი, 2026",
    dateTime: "2026-07-21",
    title: "პირველი ნაბიჯები RAID მასივის დაზიანებისას",
    excerpt:
      "უსაფრთხო რეაგირება, რომელიც რთული ავარიისას მონაცემთა აღდგენის შანსს ინარჩუნებს.",
    image: "/assets/blog/data-recovery.webp",
    imageWidth: 849,
    imageHeight: 565,
    imageAlt: "RAID მასივიდან ინფორმაციის აღდგენა",
  },
];

const englishMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function getBlogPosts(locale: "ka" | "en"): BlogPost[] {
  return blogTeasers.map((teaser) => {
    const article = blogArticleCopy[teaser.id];
    const [year, month, day] = teaser.dateTime.split("-");
    const category = blogCategories.find((item) => item.id === article.categoryId)!;
    return {
      ...teaser,
      ...article[locale],
      category: category.label[locale],
      categoryId: article.categoryId,
      readMinutes: article.readMinutes,
      serviceHref: article.serviceHref,
      date: locale === "ka" ? teaser.date : `${Number(day)} ${englishMonths[Number(month) - 1]} ${year}`,
    };
  });
}

export const blogPosts: BlogPost[] = getBlogPosts("ka");

export function getBlogPost(slug: string, locale: "ka" | "en" = "ka"): BlogPost | undefined {
  return getBlogPosts(locale).find((post) => post.slug === slug);
}
