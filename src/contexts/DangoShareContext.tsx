
"use client";

import type { Member, Expense, Payment, CalculatedBalance, ExpenseShare, PacheGroup } from '@/types';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DangoShareContextType {
  pacheId: string | null;
  pacheName: string;
  members: Member[];
  setMembers: Dispatch<SetStateAction<Member[]>>;
  expenses: Expense[];
  setExpenses: Dispatch<SetStateAction<Expense[]>>;
  payments: Payment[];
  setPayments: Dispatch<SetStateAction<Payment[]>>;
  addMember: (name: string) => Promise<void>;
  addExpense: (
    description: string,
    totalAmount: number,
    paidById: string,
    participantIds: string[]
  ) => Promise<void>;
  recordPayment: (fromMemberId: string, toMemberId: string, amount: number) => Promise<void>;
  deleteMember: (memberId: string) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  deletePayment: (paymentId: string) => Promise<void>;
  calculateBalances: () => CalculatedBalance[];
  getMemberNameById: (id: string) => string;
  getPacheName: () => string;
  isDataLoaded: boolean;
}

const DangoShareContext = createContext<DangoShareContextType | undefined>(undefined);

interface DangoShareProviderProps {
  children: ReactNode;
  pacheId: string;
}

export const DangoShareProvider = ({ children, pacheId }: DangoShareProviderProps) => {
  const [currentPacheId, setCurrentPacheId] = useState<string | null>(pacheId);
  const [pacheName, setPacheName] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setCurrentPacheId(pacheId); 
  }, [pacheId]);

  const fetchPacheData = useCallback(async (id: string | null) => {
    if (!id) {
      setIsDataLoaded(true); 
      setPacheName("");
      setMembers([]);
      setExpenses([]);
      setPayments([]);
      return;
    }
    setIsDataLoaded(false);
    try {
      const response = await fetch(`/api/paches/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
            toast({ title: "پاچه یافت نشد", description: `پاچه با شناسه ${id} پیدا نشد.`, variant: "destructive" });
            setPacheName("پاچه یافت نشد");
        } else {
            throw new Error(`Failed to fetch pache data: ${response.statusText}`);
        }
        setMembers([]);
        setExpenses([]);
        setPayments([]);
      } else {
        const pacheData: PacheGroup = await response.json();
        setPacheName(pacheData.name);
        setMembers(pacheData.members || []);
        setExpenses(pacheData.expenses || []);
        setPayments(pacheData.payments || []);
      }
    } catch (error) {
      console.error("Error fetching pache data from API:", error);
      toast({
        title: "خطا در بارگذاری اطلاعات پاچه",
        description: "اطلاعات پاچه از سرور دریافت نشد.",
        variant: "destructive",
      });
      setPacheName("");
      setMembers([]);
      setExpenses([]);
      setPayments([]);
    } finally {
      setIsDataLoaded(true);
    }
  }, [toast]);

  useEffect(() => {
    if (currentPacheId) {
      fetchPacheData(currentPacheId);
    } else {
        setIsDataLoaded(true); 
    }
  }, [currentPacheId, fetchPacheData]);

  const handleSaveData = useCallback(async (updatedPacheData: Partial<PacheGroup>) => {
    if (!currentPacheId) {
      toast({ title: "خطای ذخیره‌سازی", description: "شناسه پاچه مشخص نیست.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`/api/paches/${currentPacheId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPacheData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save pache data');
      }
    } catch (error: any) {
      toast({
        title: "خطا در ذخیره‌سازی",
        description: error.message || "اطلاعات پاچه در سرور ذخیره نشد.",
        variant: "destructive",
      });
    }
  }, [currentPacheId, toast]);


  const addMember = async (name: string) => {
    if (!currentPacheId) return;
    if (name.trim() === '') return;
    if (members.find(m => m.name.toLowerCase() === name.trim().toLowerCase())) {
      toast({ title: "عضو تکراری", description: "عضوی با این نام از قبل موجود است.", variant: "destructive" });
      return;
    }
    const newMember: Member = { id: crypto.randomUUID(), name: name.trim() };
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    await handleSaveData({ members: updatedMembers });
    toast({ title: "عضو اضافه شد", description: `${name.trim()} به پاچه "${pacheName}" اضافه شد.` });
  };

  const addExpense = async (
    description: string,
    totalAmount: number,
    paidById: string,
    participantIds: string[]
  ) => {
    if (!currentPacheId) return;
    if (description.trim() === '' || totalAmount <= 0 || !paidById || participantIds.length === 0) {
       toast({ title: "هزینه نامعتبر", description: "لطفاً تمام فیلدهای هزینه را به درستی پر کنید.", variant: "destructive" });
      return;
    }

    const shareAmount = totalAmount / participantIds.length;
    const shares: ExpenseShare[] = participantIds.map((pid) => ({
      memberId: pid,
      amount: parseFloat(shareAmount.toFixed(2)), 
    }));

    const calculatedTotalShares = shares.reduce((sum, share) => sum + share.amount, 0);
    let remainder = totalAmount - calculatedTotalShares;
    if (Math.abs(remainder) > 0.001 && shares.length > 0) { 
        const adjustment = parseFloat((remainder / shares.length).toFixed(2));
        for (let i = 0; i < shares.length; i++) {
            if (remainder === 0) break;
            const singleAdjustment = parseFloat(Math.min(Math.abs(remainder), Math.abs(adjustment)).toFixed(2)) * Math.sign(remainder);
            shares[i].amount = parseFloat((shares[i].amount + singleAdjustment).toFixed(2));
            remainder = parseFloat((remainder - singleAdjustment).toFixed(2));
        }
        if (Math.abs(remainder) > 0.0001 && shares.length > 0) {
             shares[0].amount = parseFloat((shares[0].amount + remainder).toFixed(2));
        }
    }

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      description: description.trim(),
      amount: totalAmount,
      paidById,
      date: new Date().toISOString(),
      shares,
    };
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    await handleSaveData({ expenses: updatedExpenses });
    toast({ title: "هزینه اضافه شد", description: `هزینه "${description.trim()}" به مبلغ ${totalAmount.toLocaleString('fa-IR')} به پاچه "${pacheName}" اضافه شد.` });
  };

  const recordPayment = async (fromMemberId: string, toMemberId: string, amount: number) => {
    if (!currentPacheId) return;
    if (!fromMemberId || !toMemberId || amount <= 0 || fromMemberId === toMemberId) {
      toast({ title: "پرداخت نامعتبر", description: "فیلدها را صحیح پر کنید و مطمئن شوید پرداخت‌کننده و دریافت‌کننده متفاوتند.", variant: "destructive" });
      return;
    }
    const newPayment: Payment = {
      id: crypto.randomUUID(),
      fromMemberId,
      toMemberId,
      amount,
      date: new Date().toISOString(),
    };
    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    await handleSaveData({ payments: updatedPayments });
    const fromName = getMemberNameById(fromMemberId);
    const toName = getMemberNameById(toMemberId);
    toast({ title: "پرداخت ثبت شد", description: `پرداخت ${amount.toLocaleString('fa-IR')} از ${fromName} به ${toName} در پاچه "${pacheName}" ثبت شد.` });
  };
  
  const deleteMember = async (memberId: string) => {
    if (!currentPacheId) return;
    const memberName = getMemberNameById(memberId);
    if (!window.confirm(`آیا از حذف عضو "${memberName}" مطمئن هستید؟ این عمل ممکن است روی محاسبات هزینه و پرداخت‌های قبلی تاثیر بگذارد.`)) return;

    const updatedMembers = members.filter(m => m.id !== memberId);
    setMembers(updatedMembers);
    await handleSaveData({ members: updatedMembers });
    toast({ title: "عضو حذف شد", description: `عضو "${memberName}" از پاچه "${pacheName}" حذف شد.` });
  };

  const deleteExpense = async (expenseId: string) => {
    if (!currentPacheId) return;
    const expenseToDelete = expenses.find(e => e.id === expenseId);
    if (!expenseToDelete) return;
    if (!window.confirm(`آیا از حذف هزینه "${expenseToDelete.description}" مطمئن هستید؟`)) return;

    const updatedExpenses = expenses.filter(e => e.id !== expenseId);
    setExpenses(updatedExpenses);
    await handleSaveData({ expenses: updatedExpenses });
    toast({ title: "هزینه حذف شد", description: `هزینه "${expenseToDelete.description}" حذف شد.` });
  };

  const deletePayment = async (paymentId: string) => {
    if (!currentPacheId) return;
    const paymentToDelete = payments.find(p => p.id === paymentId);
    if (!paymentToDelete) return;
    const fromName = getMemberNameById(paymentToDelete.fromMemberId);
    const toName = getMemberNameById(paymentToDelete.toMemberId);
    if (!window.confirm(`آیا از حذف پرداخت از "${fromName}" به "${toName}" به مبلغ ${paymentToDelete.amount.toLocaleString('fa-IR')} مطمئن هستید؟`)) return;

    const updatedPayments = payments.filter(p => p.id !== paymentId);
    setPayments(updatedPayments);
    await handleSaveData({ payments: updatedPayments });
    toast({ title: "پرداخت حذف شد", description: `پرداخت از "${fromName}" به "${toName}" حذف شد.` });
  };

  const getMemberNameById = (id: string): string => {
    return members.find(m => m.id === id)?.name || "عضو ناشناس";
  };

  const getPacheName = (): string => {
    return pacheName;
  }

  const calculateBalances = (): CalculatedBalance[] => {
    if (!isDataLoaded || !currentPacheId) return []; 
    const balances: Record<string, number> = {};

    members.forEach(member => {
      balances[member.id] = 0;
    });

    expenses.forEach(expense => {
      balances[expense.paidById] = (balances[expense.paidById] || 0) + expense.amount;
      expense.shares.forEach(share => {
        balances[share.memberId] = (balances[share.memberId] || 0) - share.amount;
      });
    });

    payments.forEach(payment => {
      // Payer's balance increases (debt reduces or credit increases if overpaid)
      balances[payment.fromMemberId] = (balances[payment.fromMemberId] || 0) + payment.amount;
      // Payee's balance decreases (credit reduces or debt increases if they were paid more than owed)
      balances[payment.toMemberId] = (balances[payment.toMemberId] || 0) - payment.amount;
    });
    
    return members.map(member => ({
      memberId: member.id,
      memberName: member.name,
      balance: parseFloat(balances[member.id].toFixed(2)) 
    })).sort((a, b) => a.memberName.localeCompare(b.memberName, 'fa'));
  };

  return (
    <DangoShareContext.Provider
      value={{
        pacheId: currentPacheId,
        pacheName,
        members,
        setMembers,
        expenses,
        setExpenses,
        payments,
        setPayments,
        addMember,
        addExpense,
        recordPayment,
        deleteMember,
        deleteExpense,
        deletePayment,
        calculateBalances,
        getMemberNameById,
        getPacheName,
        isDataLoaded,
      }}
    >
      {children}
    </DangoShareContext.Provider>
  );
};

export const useDangoShare = () => {
  const context = useContext(DangoShareContext);
  if (context === undefined) {
    throw new Error('useDangoShare must be used within a DangoShareProvider');
  }
  return context;
};

    
