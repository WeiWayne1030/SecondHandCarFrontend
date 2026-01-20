export enum UserRole {
  Buyer,  // 買家
  Seller, // 賣家
  Admin   // 管理者
}

export interface User {
  id: number;
  username: string;
  password?: string; // 密碼是可選的，因為我們不應該在客戶端儲存或傳遞它
  role: UserRole;
  name: string;
}
