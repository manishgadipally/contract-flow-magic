
export interface ContractParty {
  endDate: string;
  rate: string;
  startDate: string;
  placeOfService: string;
  name: string;
  email: string;
  organization?: string;
  address?: string;
  signature?: string;
}

export interface ContractDetails {
  placeOfService: string;
  startDate: string;
  endDate: string;
  rate: string;
  mealsIncluded: boolean;
  additionalDetails?: string;
}

export interface ContractAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface ContractHistoryItem {
  id: string;
  date: string;
  action: string;
  user: string;
  notes?: string;
}

export interface CurrencyAmount {
  CurrencyCode: string;
  Value: number;
}

export interface PlatformFee {
  FromNeed: CurrencyAmount;
  FromOffer: CurrencyAmount;
}

export interface PaymentTranche {
  DueDate: string;
  Amount: CurrencyAmount;
  Status?: 'not_paid' | 'requested' | 'paid' | 'cancelled';
  RequestDate?: string;
  PaymentDate?: string;
}

export interface PaymentInterval {
  PaymentFrequency: 'Monthly' | 'Weekly' | 'Daily';
  Tranches: PaymentTranche[];
}

export interface PaymentPlan {
  PaymentOption: 'Full';
  PaymentIntervals: PaymentInterval[];
}

export interface ContractPayment {
  NeedPayableAmount: CurrencyAmount;
  OfferReceivableAmount: CurrencyAmount;
  PlatformFee: PlatformFee;
  PaymentPlans: PaymentPlan[];
  selectedPaymentType?: 'one-time' | 'partial';
  selectedPaymentFrequency?: 'Monthly' | 'Weekly' | 'Daily';
}

export interface Contract {
  id: string;
  subject: string;
  type: string;
  facilitatedBy: string;
  status: 'draft' | 'pending_review' | 'active' | 'in_progress' | 'pending_completion' | 'completed' | 'cancelled';
  progress: number;
  from: ContractParty;
  to: ContractParty;
  details: ContractDetails;
  payment?: ContractPayment;
  attachments?: ContractAttachment[];
  history?: ContractHistoryItem[];
  createdAt: string;
  updatedAt: string;
}
