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
      "ლეპტოპების პროგრამული და ტექნიკური დიაგნოსტიკა. ეკრანის, კლავიატურის, კვებისა და გაგრილების სისტემების შეკეთება.",
    icon: "/assets/icons/service-laptop.svg",
    href: "/services/laptop-repair",
  },
  {
    id: "computers",
    slug: "computer-repair",
    title: "კომპიუტერები",
    description:
      "დესკტოპ კომპიუტერების დიაგნოსტიკა და კომპონენტების შეცვლა. სისტემის განახლება, გაგრილება და პროგრამული მომსახურება.",
    icon: "/assets/icons/service-computer.svg",
    href: "/services/computer-repair",
  },
  {
    id: "data-recovery",
    slug: "data-recovery",
    title: "ინფორმაციის აღდგენა",
    description:
      "HDD, SSD, RAID და სხვა მეხსიერებიდან მონაცემების აღდგენა. ვმუშაობთ რთულ ფიზიკურ და პროგრამულ დაზიანებებზეც.",
    icon: "/assets/icons/service-recovery.svg",
    href: "/services/data-recovery",
  },
  {
    id: "consoles",
    slug: "console-repair",
    title: "კონსოლები",
    description:
      "PlayStation, Xbox და Nintendo კონსოლების დიაგნოსტიკა. HDMI-ის, კვების, გაგრილებისა და კონტროლერების შეკეთება.",
    icon: "/assets/icons/service-console.svg",
    href: "/services/console-repair",
  },
  {
    id: "drones",
    slug: "drone-repair",
    title: "დრონები",
    description:
      "დრონების კამერის, გიმბალისა და მოტორების დიაგნოსტიკა. მართვის პლატების, GPS-ისა და სენსორების შეკეთება.",
    icon: "/assets/icons/service-drone.svg",
    href: "/services/drone-repair",
  },
  {
    id: "mobile-tablets",
    slug: "mobile-tablet-repair",
    title: "მობილურები / პლანშეტები",
    description:
      "ეკრანის, ბატარეისა და დამტენის კონექტორის შეკეთება. კამერის, დინამიკისა და პროგრამული სისტემის მომსახურება.",
    icon: "/assets/icons/service-mobile.svg",
    href: "/services/mobile-tablet-repair",
  },
  {
    id: "other-electronics",
    slug: "other-electronics",
    title: "სხვა ელექტრონიკა",
    description:
      "პროექტორების, CCTV კამერებისა და UPS სისტემების დიაგნოსტიკა. სხვა ელექტრონული მოწყობილობების კომპონენტური შეკეთება.",
    icon: "/assets/icons/service-other.svg",
    href: "/services/other-electronics",
  },
];
