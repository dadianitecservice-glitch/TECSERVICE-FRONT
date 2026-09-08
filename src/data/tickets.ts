export type TicketStage =
  | "received"
  | "diagnostics"
  | "repairing"
  | "ready";

export type MilestoneState = "complete" | "current" | "upcoming";

export interface TicketMilestone {
  id: TicketStage;
  label: string;
  state: MilestoneState;
  complete: boolean;
  current: boolean;
  helperText?: string;
}

export interface Ticket {
  id: string;
  number: string;
  code: string;
  phone: string;
  device: string;
  model: string;
  receivedAt: string;
  receivedDate: string;
  updatedAt: string;
  lastUpdated: string;
  status: string;
  statusKey: TicketStage;
  statusLabel: string;
  update: string;
  updateNote: string;
  privacyNote: string;
  milestones: TicketMilestone[];
}

export const DEMO_TICKET_CODE = "TS-2026-001245";
export const DEMO_PHONE = "+995 591 47 40 40";
export const DEMO_OTP = "123456";

export const tickets: Ticket[] = [
  {
    id: "ticket-ts-2026-001245",
    number: DEMO_TICKET_CODE,
    code: DEMO_TICKET_CODE,
    phone: DEMO_PHONE,
    device: "ლეპტოპი",
    model: "ASUS ROG G…",
    receivedAt: "28 აგვისტო, 2026",
    receivedDate: "28 აგვისტო, 2026",
    updatedAt: "2 სექტემბერი, 14:35",
    lastUpdated: "2 სექტემბერი, 14:35",
    status: "მიმდინარეობს შეკეთება",
    statusKey: "repairing",
    statusLabel: "მიმდინარეობს შეკეთება",
    update: "მოწყობილობაზე მიმდინარეობს შეთანხმებული სამუშაოები.",
    updateNote: "სტატუსი განახლდება სამუშაო ეტაპის ცვლილებისას.",
    privacyNote:
      "პირადი დეტალები ხელმისაწვდომია მხოლოდ ნომრის დადასტურების შემდეგ.",
    milestones: [
      {
        id: "received",
        label: "მიღებულია",
        state: "complete",
        complete: true,
        current: false,
      },
      {
        id: "diagnostics",
        label: "დიაგნოსტიკა",
        state: "complete",
        complete: true,
        current: false,
      },
      {
        id: "repairing",
        label: "შეკეთება",
        state: "current",
        complete: false,
        current: true,
        helperText: "მიმდინარე",
      },
      {
        id: "ready",
        label: "მზადაა",
        state: "upcoming",
        complete: false,
        current: false,
      },
    ],
  },
];

export const normalizeTicketCode = (value: string): string =>
  value.trim().toUpperCase().replace(/\s+/g, "");

export const normalizePhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("995")) {
    return digits.slice(3);
  }

  return digits;
};

export const findTicketByCode = (code: string): Ticket | undefined => {
  const normalizedCode = normalizeTicketCode(code);
  return tickets.find(
    (ticket) => normalizeTicketCode(ticket.code) === normalizedCode,
  );
};

export const demoTicket = tickets[0];

export const findTicket = findTicketByCode;

export const findTicketsByPhone = (phone: string): Ticket[] => {
  const normalizedPhone = normalizePhone(phone);
  return tickets.filter(
    (ticket) => normalizePhone(ticket.phone) === normalizedPhone,
  );
};

export const verifyDemoOtp = (otp: string): boolean =>
  otp.replace(/\D/g, "") === DEMO_OTP;
