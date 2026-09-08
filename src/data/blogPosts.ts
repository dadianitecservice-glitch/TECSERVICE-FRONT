export interface BlogPost {
  id: string;
  slug: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  href: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "lost-files-first-minutes",
    slug: "lost-files-first-minutes",
    category: "მონაცემები",
    date: "04 სექტემბერი, 2026",
    title: "დაკარგული ფაილები — რა უნდა გააკეთოთ პირველ წუთებში?",
    excerpt:
      "სწორი პირველი ნაბიჯები ზრდის უსაფრთხო აღდგენის შანსს და იცავს დისკს დამატებითი დაზიანებისგან.",
    image: "/assets/blog/data-recovery-figma.png",
    imageAlt: "მონაცემების აღდგენის ლაბორატორიული სამუშაო",
    href: "/blog/lost-files-first-minutes",
  },
  {
    id: "five-reasons-laptop-is-slow",
    slug: "five-reasons-laptop-is-slow",
    category: "ლეპტოპები",
    date: "01 სექტემბერი, 2026",
    title: "ლეპტოპი ნელდება? 5 მიზეზი და გამოსავალი",
    excerpt:
      "მტვერი, გადახურება, ძველი HDD და მცირე RAM ხშირად შენელების მთავარი მიზეზებია.",
    image: "/assets/blog/laptop-repair-figma.png",
    imageAlt: "ლეპტოპის ტექნიკური დიაგნოსტიკა",
    href: "/blog/five-reasons-laptop-is-slow",
  },
  {
    id: "console-overheating",
    slug: "console-overheating-signs-and-prevention",
    category: "კონსოლები",
    date: "28 აგვისტო, 2026",
    title: "თამაშის კონსოლის გადახურება: ნიშნები და პრევენცია",
    excerpt:
      "ხმაურიანი ქულერი და მოულოდნელი გამორთვა შესაძლოა გაგრილების პრობლემაზე მიუთითებდეს.",
    image: "/assets/blog/console-repair-figma.png",
    imageAlt: "სათამაშო კონსოლის ტექნიკური მომსახურება",
    href: "/blog/console-overheating-signs-and-prevention",
  },
  {
    id: "choose-right-ssd",
    slug: "choose-the-right-ssd-for-your-laptop",
    category: "კომპონენტები",
    date: "24 აგვისტო, 2026",
    title: "როგორ ავარჩიოთ სწორი SSD ლეპტოპისთვის?",
    excerpt:
      "SATA და NVMe დისკების განსხვავება, თავსებადობა და სწორი მოცულობის არჩევა.",
    image: "/assets/blog/ssd-figma.png",
    imageAlt: "ლეპტოპისთვის SSD დისკის შერჩევა",
    href: "/blog/choose-the-right-ssd-for-your-laptop",
  },
  {
    id: "drone-care",
    slug: "drone-care-before-and-after-flight",
    category: "დრონები",
    date: "19 აგვისტო, 2026",
    title: "დრონის მოვლა ფრენის წინ და შემდეგ",
    excerpt:
      "ბატარეის, პროპელერების, კამერისა და მართვის სისტემის აუცილებელი შემოწმება.",
    image: "/assets/blog/drone-repair-figma.png",
    imageAlt: "დრონის შემოწმება და ტექნიკური მომსახურება",
    href: "/blog/drone-care-before-and-after-flight",
  },
  {
    id: "computer-shuts-down-under-load",
    slug: "why-computer-shuts-down-under-load",
    category: "კომპიუტერები",
    date: "14 აგვისტო, 2026",
    title: "რატომ ითიშება კომპიუტერი დატვირთვისას?",
    excerpt:
      "კვების ბლოკი, ტემპერატურა და კომპონენტები — დიაგნოსტიკის მთავარი მიმართულებები.",
    image: "/assets/blog/ssd-figma.png",
    imageAlt: "კომპიუტერის კომპონენტების დიაგნოსტიკა",
    href: "/blog/why-computer-shuts-down-under-load",
  },
  {
    id: "data-recovery-after-formatting",
    slug: "data-recovery-after-formatting",
    category: "მონაცემები",
    date: "09 აგვისტო, 2026",
    title: "მონაცემთა აღდგენა ფორმატირების შემდეგ",
    excerpt:
      "რატომ არ უნდა ჩაიწეროს ახალი ფაილები დისკზე და როდის უნდა მივმართოთ სპეციალისტს.",
    image: "/assets/blog/data-recovery-figma.png",
    imageAlt: "დისკიდან მონაცემების უსაფრთხო აღდგენა",
    href: "/blog/data-recovery-after-formatting",
  },
  {
    id: "xbox-controller-problems",
    slug: "common-xbox-controller-problems",
    category: "კონსოლები",
    date: "03 აგვისტო, 2026",
    title: "Xbox კონტროლერის გავრცელებული პრობლემები",
    excerpt:
      "Stick drift, კავშირის წყვეტა და ღილაკების გაუმართაობა — ძირითადი ნიშნები.",
    image: "/assets/blog/console-repair-figma.png",
    imageAlt: "Xbox კონტროლერის შეკეთება",
    href: "/blog/common-xbox-controller-problems",
  },
  {
    id: "laptop-battery-replacement-signs",
    slug: "laptop-battery-replacement-signs",
    category: "ლეპტოპები",
    date: "28 ივლისი, 2026",
    title: "ლეპტოპის ბატარეის შეცვლის ნიშნები",
    excerpt:
      "სწრაფი დაცლა, გადახურება და შეშუპება — ნიშნები, რომლებიც უყურადღებოდ არ უნდა დარჩეს.",
    image: "/assets/blog/laptop-repair-figma.png",
    imageAlt: "ლეპტოპის ბატარეის დიაგნოსტიკა",
    href: "/blog/laptop-battery-replacement-signs",
  },
  {
    id: "raid-first-steps",
    slug: "first-steps-after-raid-failure",
    category: "მონაცემები",
    date: "21 ივლისი, 2026",
    title: "RAID მასივის დაზიანების პირველი ნაბიჯები",
    excerpt:
      "უსაფრთხო რეაგირება, რომელიც რთული ავარიისას მონაცემთა აღდგენის შანსს ინარჩუნებს.",
    image: "/assets/blog/data-recovery-figma.png",
    imageAlt: "RAID მასივიდან ინფორმაციის აღდგენა",
    href: "/blog/first-steps-after-raid-failure",
  },
];

