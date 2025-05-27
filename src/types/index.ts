
export interface Member {
  id: string;
  name: string;
}

export interface ExpenseShare {
  memberId: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidById: string;
  date: string; // ISO string
  shares: ExpenseShare[];
}

export interface Payment {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  date: string; // ISO string
}

export interface CalculatedBalance {
  memberId: string;
  memberName: string;
  balance: number; // Positive if owed, negative if owes
}

export interface PacheGroup {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
  payments: Payment[];
}

export interface PacheData {
  paches: PacheGroup[];
}
