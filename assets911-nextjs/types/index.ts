export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  provider: 'google' | 'phoneNumber';
  phoneNumber?: string;
  ghanaCardNumber?: string;
  permissions?: number[];
  institutionName?: {
    id: string;
    name: string;
  };
}

export interface Asset {
  _id: string;
  model: string;
  brand: string;
  name: string;
  type: string;
  categoryType?: string;
  uniqueNumber: string;
  dateOfPurchase: string;
  price: number;
  purchaseReceipt?: string;
  identificationDetails: string;
  otherDetails?: string;
  images?: string[];
  registrationAddress: string;
  presentLocation?: string;
  owner: string | User;
  recentTransferRecord?: string;
  status: 'lost' | 'sold' | 'okay' | 'damaged' | 'for sale';
  additionalCategoryData?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User;
  token: string;
}

export interface ApiError {
  status: number;
  data?: {
    message?: string;
    error?: string;
  };
}
