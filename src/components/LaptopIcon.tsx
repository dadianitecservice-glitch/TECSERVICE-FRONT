import type { LaptopIconName } from '../data/laptopRepair'

const paths: Record<LaptopIconName, string[]> = {
  power: ['M12 2v9', 'M6.3 5.3a9 9 0 1 0 11.4 0'],
  screen: ['M3 3h18v13H3z', 'M12 16v5M8 21h8'],
  battery: ['M3 6h16v12H3zM22 10v4', 'm12 8-4 5h5l-2 3'],
  heat: ['M9 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0Z', 'M12 8v10M18 5h3M18 9h2'],
  keyboard: ['M2 5h20v14H2z', 'M5 9h1m3 0h1m3 0h1m3 0h1M5 12h1m3 0h1m3 0h1m3 0h1M6 16h12'],
  speed: ['M3 19a10 10 0 1 1 18 0Z', 'm12 15 5-7M5 13h1M7 7l1 1M12 4v1M18 13h1'],
  drop: ['M12 2S4 11 4 15a8 8 0 0 0 16 0c0-4-8-13-8-13Z', 'M8 15a4 4 0 0 0 4 4'],
  search: ['M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z', 'm15 15 6 6'],
  chip: ['M6 6h12v12H6zM9 9h6v6H9z', 'M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4'],
  fan: ['M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z', 'M10 10C3 7 7 0 12 3c2 1 2 4 0 7M14 10c3-7 10-3 7 2-1 2-4 2-7 0M14 14c7 3 3 10-2 7-2-1-2-4 0-7M10 14c-3 7-10 3-7-2 1-2 4-2 7 0'],
  memory: ['M2 5h20v13H2zM5 18v3M9 18v3M15 18v3M19 18v3', 'M6 8v6M10 8v6M14 8v6M18 8v6'],
  software: ['M3 3h18v18H3zM3 8h18', 'm9 11-3 3 3 3m6-6 3 3-3 3'],
  tool: ['M14 7a5 5 0 0 1 7-4l-4 4 2 2 4-4a5 5 0 0 1-6 7L8 21a3 3 0 0 1-4-4Z'],
  people: ['M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6 21v-3a6 6 0 0 1 12 0v3M4 6a3 3 0 0 0 0 6M20 6a3 3 0 0 1 0 6M2 21v-4m20 4v-4'],
  calendar: ['M3 5h18v16H3zM7 2v6m10-6v6M3 10h18', 'M7 14h2m3 0h2m3 0h1M7 17h2m3 0h2'],
  arrow: ['M4 12h16m-6-6 6 6-6 6'],
  phone: ['M8 3 4 4C1 12 12 23 20 20l1-4-5-2-2 3-7-7 3-2-2-5Z'],
  check: ['m5 12 4 4L19 6'],
  info: ['M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 11v6M12 7h.01'],
  chevron: ['m6 9 6 6 6-6'],
  laptop: ['M4 3h16v14H4zM1 21h22M8 17v4m8-4v4'],
  gamepad: ['M6 7h12c4 0 6 13 3 13-2 0-4-4-5-4H8c-1 0-3 4-5 4C0 20 2 7 6 7ZM7 9v6M4 12h6M16 11h.01M19 14h.01'],
  briefcase: ['M3 7h18v14H3zM8 7V3h8v4M3 12h18M10 12v3h4v-3'],
  barcode: ['M2 3v18M5 3v18M9 3v18M12 3v18M14 3v18M18 3v18M22 3v18'],
  close: ['m6 6 12 12M6 18 18 6'],
  ports: ['M5 4h14v16H5zM9 8h6v4H9zM9 16h6', 'M9 1v3m6-3v3M9 20v3m6-3v3'],
  whatsapp: ['M21 11.5a9 9 0 0 1-13.4 7.9L3 21l1.6-4.6A9 9 0 1 1 21 11.5Z', 'm8.2 7.1-1.3.4c-.8 3.1 4.5 8.4 7.6 7.6l.4-1.3-2-.9-.9 1.1a9 9 0 0 1-4-4l1.1-.9-.9-2Z'],
}

export function LaptopIcon({ name, className = '' }: { name: LaptopIconName; className?: string }) {
  return <svg className={`lp-icon ${className}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name].map((d, i) => <path key={i} d={d} />)}</svg>
}
