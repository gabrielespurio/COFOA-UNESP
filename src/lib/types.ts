export type UserRole = 'PARTICIPANT' | 'ADMIN';

export interface ParticipantData {
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  institution: string;
  city: string;
  state: string;
  category: string;
  course?: string;
  cro?: string;
  croState?: string;
  abroadInstitution?: string;
  abroadCountry?: string;
}

export interface RegistrationCategory {
  id: string;
  name: string;
  type: 'presencial' | 'online';
  priceTier: string;
  requiresCRO?: boolean;
  requiresStudentProof?: boolean;
  requiresAbroadProof?: boolean;
  active: boolean;
}

export interface BatchPrice {
  batchId: string;
  priceTier: string;
  amount: number; // in cents
}

export interface RegistrationBatch {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  prices: BatchPrice[];
  status: 'upcoming' | 'active' | 'closed';
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  startDate: string | null;
  endDate: string | null;
  allowedCategories?: string[];
  active: boolean;
}

export interface Registration {
  id: string;
  participantId: string;
  categoryId: string;
  batchId: string;
  couponId?: string;
  amount: number;
  status: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'refunded';

export interface Payment {
  id: string;
  registrationId: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  gatewayId?: string;
  gatewayResponse?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  name: string;
  email: string;
  institution: string;
  isCorresponding: boolean;
}

export interface ScientificWork {
  id: string;
  title: string;
  abstract: string;
  categoryArea?: string;
  authors: Author[];
  advisor?: string;
  presenter?: string;
  modality?: string;
  identifiedFileUrl?: string;
  unidentifiedFileUrl?: string;
  enrollmentProofUrl?: string;
  submittedAt: string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
}

export interface Certificate {
  id: string;
  participantId: string;
  type: 'participation' | string; // Assuming other types may exist, fallback to string
  fileUrl?: string;
  availableAt?: string;
  generatedAt?: string;
  downloadedAt?: string;
}

export interface ConsentRecord {
  id: string;
  participantId: string;
  type: 'privacy_policy' | 'terms_of_use';
  version: string;
  acceptedAt: string;
  ipAddress?: string;
}
