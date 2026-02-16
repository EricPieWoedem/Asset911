export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  provider: 'google' | 'phoneNumber';
  phoneNumber?: string;
  ghanaCardNumber?: string;
  password: string;
  refreshToken?: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  id: string;
  name: string;
  email: string;
  ghanaCardNumber?: string;
  permissions?: number[];
  institutionId?: string;
  institutionName?: string;
}

export interface AuthResponse {
  accessToken: string;
  userProfile?: {
    name: string;
    email: string;
    picture?: string;
    ghanaCardNumber?: string;
  };
}

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
}
