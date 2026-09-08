export interface Review {
  id: string;
  customerName: string;
  rating: number;
  text: string;
  date: string;
  sourceLabel: string;
}

export interface ReviewSummary {
  rating: number;
  publicReviewCount: number;
}

export const reviewSummary: ReviewSummary = {
  rating: 4.8,
  publicReviewCount: 144,
};

export const reviews: Review[] = [
  {
    id: "beka-makadze",
    customerName: "beka makadze",
    rating: 5,
    text: "მომსახურება იდეალურად შეაფასა და განსაკუთრებით აღნიშნა მისაღები ფასები და თანამშრომლების დახმარება.",
    date: "5 თვის წინ",
    sourceLabel: "Google Maps · რეალური მომხმარებლის შეფასება",
  },
  {
    id: "levani-kurkumuli",
    customerName: "Levani Kurkumuli",
    rating: 5,
    text: "ძალიან კარგი მომსახურება აქვთ — სამუშაო დროულად და ხარისხიანად სრულდება.",
    date: "6 თვის წინ",
    sourceLabel: "Google Maps · რეალური მომხმარებლის შეფასება",
  },
  {
    id: "jina-guguchia",
    customerName: "Jina Guguchia",
    rating: 5,
    text: "ძველი ლეპტოპის აღდგენისთვის გუნდს მადლობა გადაუხადა და მათი ყურადღებიანი მუშაობა აღნიშნა.",
    date: "11 თვის წინ",
    sourceLabel: "Google Maps · რეალური მომხმარებლის შეფასება",
  },
  {
    id: "zina-gabichvadze",
    customerName: "Zina Gabichvadze",
    rating: 5,
    text: "გუნდის მუშაობით ძალიან კმაყოფილია — დაზიანებულ კომპიუტერს ახალი სიცოცხლე დაუბრუნეს.",
    date: "1 წლის წინ",
    sourceLabel: "Google Maps · რეალური მომხმარებლის შეფასება",
  },
  {
    id: "zakaria-n",
    customerName: "Zakaria N.",
    rating: 5,
    text: "პროფესიული სპეციალისტები და კარგი ხალხი.",
    date: "2 თვის წინ",
    sourceLabel: "Google Maps · რეალური მომხმარებლის შეფასება",
  },
  {
    id: "khvicha-sidamonidze",
    customerName: "khvicha sidamonidze",
    rating: 5,
    text: "მომსახურების ხარისხსა და თანამშრომლების პროფესიონალიზმს 10-დან 10 ქულა მისცა.",
    date: "1 წლის წინ",
    sourceLabel: "Google Maps · რეალური მომხმარებლის შეფასება",
  },
  {
    id: "guram-mikiashvili",
    customerName: "Guram Mikiashvili",
    rating: 5,
    text: "ძველი HDD-ის შეკეთებისა და ინფორმაციის აღდგენისთვის სწრაფ და მეგობრულ გუნდს მადლობას უხდის.",
    date: "1 წლის წინ",
    sourceLabel: "Google Maps · რეალური მომხმარებლის შეფასება",
  },
  {
    id: "enzy-1337",
    customerName: "Enzy 1337",
    rating: 5,
    text: "PlayStation სწრაფად და ხარისხიანად შეუკეთეს; მომხმარებელმა განსაკუთრებით თბილი პერსონალი აღნიშნა.",
    date: "1 წლის წინ",
    sourceLabel: "Google Maps · რეალური მომხმარებლის შეფასება",
  },
  {
    id: "grigol-peradze",
    customerName: "Grigol Peradze",
    rating: 4,
    text: "გამოცდილი პერსონალი და მეგობრული გარემო.",
    date: "7 თვის წინ",
    sourceLabel: "Google Maps · რეალური მომხმარებლის შეფასება",
  },
];

export const googleReviewsUrl =
  "https://www.google.com/maps/place/TecService+-+%E1%83%A2%E1%83%94%E1%83%A5%E1%83%A1%E1%83%94%E1%83%A0%E1%83%95%E1%83%98%E1%83%A1%E1%83%98/@41.7193573,44.8034385,171m/data=!3m1!1e3!4m6!3m5!1s0x40440d318fe65ddd:0xc417758abd3c535c!8m2!3d41.7188516!4d44.8036156!16s%2Fg%2F11cjhyk5qg";
