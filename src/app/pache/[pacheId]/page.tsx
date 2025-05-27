
"use client";

import Header from "@/components/app/Header";
import { AddMemberForm } from "@/components/app/AddMemberForm";
import { MemberList } from "@/components/app/MemberList";
import { AddExpenseForm } from "@/components/app/AddExpenseForm";
import { ExpenseList } from "@/components/app/ExpenseList";
import { RecordPaymentForm } from "@/components/app/RecordPaymentForm";
import { PaymentList } from "@/components/app/PaymentList";
import { Separator } from "@/components/ui/separator";
import { DangoShareProvider, useDangoShare } from '@/contexts/DangoShareContext';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import type { PacheGroup } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle, Home, Loader2 } from "lucide-react";
import Link from "next/link";


function PacheDetailContent() {
  const params = useParams();
  const pacheId = params.pacheId as string;
  // Access context data if needed for the header title, or fetch separately
  const { getPacheName, isDataLoaded: isContextDataLoaded } = useDangoShare();
  const [pacheName, setPacheName] = useState("بارگذاری نام پاچه...");

  useEffect(() => {
    if (isContextDataLoaded) {
      const name = getPacheName();
      setPacheName(name || "پاچه");
    }
  }, [isContextDataLoaded, getPacheName]);

  if (!isContextDataLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">در حال بارگذاری اطلاعات پاچه...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background" dir="rtl">
      <Header pageTitle={pacheName} showBackButton={true} />
      <main className="flex-grow container mx-auto p-4 md:p-6 space-y-8">
        
        <section className="bg-card p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-start">
            <AddMemberForm />
            <AddExpenseForm />
            <RecordPaymentForm />
          </div>
        </section>

        <section>
          <MemberList />
        </section>

        <Separator className="my-8" />

        <section>
          <ExpenseList />
        </section>

        <Separator className="my-8" />

        <section>
          <PaymentList />
        </section>

      </main>
      <footer className="py-4 px-4 md:px-6 border-t mt-auto">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          پاچه - مدیریت آسان دنگ و هزینه‌های اشتراکی برای "{pacheName}".
        </div>
      </footer>
    </div>
  );
}

export default function PacheDetailPage() {
  const params = useParams();
  const pacheId = params.pacheId as string;
  
  if (!pacheId) {
     // This case should ideally be handled by Next.js routing if pacheId is missing
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-red-600">خطا: شناسه پاچه نامعتبر است.</p>
        <Button asChild variant="link" className="mt-4">
            <Link href="/">بازگشت به لیست پاچه‌ها</Link>
        </Button>
      </div>
    );
  }

  return (
    <DangoShareProvider pacheId={pacheId}>
      <PacheDetailContent />
    </DangoShareProvider>
  );
}
