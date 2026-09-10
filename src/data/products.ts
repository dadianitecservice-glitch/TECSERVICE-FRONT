export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  category: "ssd" | "laptop";
}

export const products: Product[] = [
  {
    id: "patriot-p320-1tb",
    slug: "patriot-p320-1tb-nvme-ssd",
    name: "Patriot P320 1TB NVMe SSD",
    price: 195,
    image: "/assets/products/patriot-p320-figma.png",
    imageWidth: 480,
    imageHeight: 601,
    imageAlt: "Patriot P320 1TB NVMe SSD",
    category: "ssd",
  },
  {
    id: "kingston-a400-240gb",
    slug: "kingston-a400-240gb-sata-ssd",
    name: "Kingston A400 240GB SATA SSD",
    price: 90,
    image: "/assets/products/kingston-a400-240-figma.png",
    imageWidth: 600,
    imageHeight: 600,
    imageAlt: "Kingston A400 240GB SATA SSD",
    category: "ssd",
  },
  {
    id: "kingston-nv3-1tb",
    slug: "kingston-nv3-1tb-pcie-4-nvme",
    name: "Kingston NV3 1TB PCIe 4.0 NVMe",
    price: 225,
    image: "/assets/products/kingston-nv3-figma.png",
    imageWidth: 1000,
    imageHeight: 1000,
    imageAlt: "Kingston NV3 1TB PCIe 4.0 NVMe SSD",
    category: "ssd",
  },
  {
    id: "samsung-870-evo-250gb",
    slug: "samsung-870-evo-250gb-sata-ssd",
    name: "Samsung 870 EVO 250GB SATA SSD",
    price: 149,
    image: "/assets/products/samsung-870-figma.png",
    imageWidth: 700,
    imageHeight: 700,
    imageAlt: "Samsung 870 EVO 250GB SATA SSD",
    category: "ssd",
  },
  {
    id: "lenovo-loq-15irx9",
    slug: "lenovo-loq-15irx9-i5-16gb-1tb-rtx4050",
    name: "Lenovo LOQ 15IRX9 · i5 / 16GB / 1TB / RTX4050",
    price: 2599,
    oldPrice: 3190,
    image: "/assets/products/lenovo-loq-figma.png",
    imageWidth: 1000,
    imageHeight: 1000,
    imageAlt: "Lenovo LOQ 15IRX9 ლეპტოპი",
    category: "laptop",
  },
  {
    id: "acer-extensa-215-54",
    slug: "acer-extensa-215-54-core-i5-8gb-256gb",
    name: "Acer Extensa 215-54 · Core i5 / 8GB / 256GB",
    price: 1199,
    image: "/assets/products/acer-extensa-figma.png",
    imageWidth: 1000,
    imageHeight: 1000,
    imageAlt: "Acer Extensa 215-54 ლეპტოპი",
    category: "laptop",
  },
  {
    id: "blackview-acebook-6",
    slug: "blackview-acebook-6-16gb-512gb",
    name: "Blackview AceBook 6 · 16GB / 512GB",
    price: 1299,
    image: "/assets/products/blackview-acebook-figma.png",
    imageWidth: 600,
    imageHeight: 600,
    imageAlt: "Blackview AceBook 6 ლეპტოპი",
    category: "laptop",
  },
  {
    id: "acer-aspire-lite-al14",
    slug: "acer-aspire-lite-al14-8gb-256gb",
    name: "Acer Aspire Lite AL14 · 8GB / 256GB",
    price: 1299,
    image: "/assets/products/acer-aspire-lite-figma.png",
    imageWidth: 1000,
    imageHeight: 1000,
    imageAlt: "Acer Aspire Lite AL14 ლეპტოპი",
    category: "laptop",
  },
  {
    id: "acer-aspire-15-a15-51m",
    slug: "acer-aspire-15-a15-51m-i5-8gb-512gb",
    name: "Acer Aspire 15 A15-51M · i5 / 8GB / 512GB",
    price: 1599,
    image: "/assets/products/acer-aspire-15-figma.png",
    imageWidth: 600,
    imageHeight: 600,
    imageAlt: "Acer Aspire 15 A15-51M ლეპტოპი",
    category: "laptop",
  },
  {
    id: "asus-vivobook-15-x1504va",
    slug: "asus-vivobook-15-x1504va-core-5-16gb-512gb",
    name: "Asus Vivobook 15 X1504VA · Core 5 / 16GB / 512GB",
    price: 1855,
    image: "/assets/products/asus-vivobook-figma.png",
    imageWidth: 600,
    imageHeight: 600,
    imageAlt: "Asus Vivobook 15 X1504VA ლეპტოპი",
    category: "laptop",
  },
  {
    id: "kingston-a400-480gb",
    slug: "kingston-a400-480gb-sata-ssd",
    name: "Kingston A400 480GB SATA SSD",
    price: 325,
    image: "/assets/products/kingston-a400-480-figma.png",
    imageWidth: 600,
    imageHeight: 600,
    imageAlt: "Kingston A400 480GB SATA SSD",
    category: "ssd",
  },
  {
    id: "patriot-p210-512gb",
    slug: "patriot-p210-512gb-sata-ssd",
    name: "Patriot P210 512GB SATA SSD",
    price: 295,
    image: "/assets/products/patriot-p210-figma.png",
    imageWidth: 600,
    imageHeight: 600,
    imageAlt: "Patriot P210 512GB SATA SSD",
    category: "ssd",
  },
];

export const formatPrice = (price: number): string =>
  `${new Intl.NumberFormat("ka-GE").format(price)} ₾`;
