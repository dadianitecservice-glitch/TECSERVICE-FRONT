export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

export const services: Service[] = [
  {
    id: "laptops",
    slug: "laptop-repair",
    title: "ლეპტოპები",
    description:
      "პროგრამული და ჰარდვეარული შეკეთება, დედაპლატის, ეკრანის, კლავიატურის, კვების, გაგრილების და სხვა დაზიანებების დიაგნოსტიკა და სერვისი.",
    icon: "/assets/icons/service-laptop.svg",
    href: "/services/laptop-repair",
  },
  {
    id: "computers",
    slug: "computer-repair",
    title: "კომპიუტერები",
    description:
      "დესკტოპ კომპიუტერების დიაგნოსტიკა, კომპონენტების შეკეთება და შეცვლა, სისტემის განახლება, გაგრილება და პროგრამული მომსახურება.",
    icon: "/assets/icons/service-computer.svg",
    href: "/services/computer-repair",
  },
  {
    id: "data-recovery",
    slug: "data-recovery",
    title: "ინფორმაციის აღდგენა",
    description:
      "HDD, SSD, RAID, USB, SD/microSD და მეხსიერების სხვა მატარებლებიდან ინფორმაციის პროფესიონალური აღდგენა, მათ შორის რთული დაზიანებების შემთხვევებში.",
    icon: "/assets/icons/service-recovery.svg",
    href: "/services/data-recovery",
  },
  {
    id: "consoles",
    slug: "console-repair",
    title: "კონსოლები",
    description:
      "PlayStation, Xbox, Nintendo და სხვა კონსოლების დიაგნოსტიკა და შეკეთება — HDMI, კვება, გაგრილება, დედაპლატა, კონტროლერები და სხვა დაზიანებები.",
    icon: "/assets/icons/service-console.svg",
    href: "/services/console-repair",
  },
  {
    id: "drones",
    slug: "drone-repair",
    title: "დრონები",
    description:
      "დრონების გიმბალის, კამერის, მოტორების, ESC-ის, პლატების, GPS-ის, სენსორების და პროგრამული სისტემების დიაგნოსტიკა და შეკეთება.",
    icon: "/assets/icons/service-drone.svg",
    href: "/services/drone-repair",
  },
  {
    id: "mobile-tablets",
    slug: "mobile-tablet-repair",
    title: "მობილურები / პლანშეტები",
    description:
      "ეკრანის, ბატარეის, დამტენის კონექტორის, კამერის, დინამიკის, კორპუსის და სხვა დაზიანებების შეკეთება და პროგრამული მომსახურება.",
    icon: "/assets/icons/service-mobile.svg",
    href: "/services/mobile-tablet-repair",
  },
  {
    id: "other-electronics",
    slug: "other-electronics",
    title: "სხვა ელექტრონიკა",
    description:
      "პროექტორების, CCTV კამერების, UPS სისტემების და სხვა ელექტრონული მოწყობილობების დიაგნოსტიკა და შეკეთება.",
    icon: "/assets/icons/service-other.svg",
    href: "/services/other-electronics",
  },
];

