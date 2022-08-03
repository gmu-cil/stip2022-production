export type Profile = {
  uid: string;
  name: string;
  email: string;
  emailVerified: boolean;
  isAnonymous: boolean;
  lastLoginAt: string;
  photoURL: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  createdAt?: string;
  updatedAt: string;
  [key: string]: any;
};

export type EmailPassword = {
  email: string;
  password: string;
};
