
"use client";

import { useDangoShare } from "@/contexts/DangoShareContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, UserCircle, ArrowLeft, Trash2 } from "lucide-react"; // Changed ArrowRight to ArrowLeft
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function PaymentList() {
  const { payments, getMemberNameById, deletePayment, isDataLoaded } = useDangoShare();

  if (!isDataLoaded) {
    return (
      <Card dir="rtl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-6 w-6" />
            لیست پرداخت‌ها
          </CardTitle>
          <CardDescription>جزئیات تمام پرداخت‌های ثبت شده برای تسویه حساب.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 p-1">
            {[...Array(2)].map((_, i) => (
              <li key={i} className="p-4 rounded-md border bg-card shadow-sm space-y-2 list-none">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4" /> 
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-7 w-20" />
                </div>
                <Skeleton className="h-4 w-32" />
              </li>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" dir="rtl">
        <History className="mx-auto h-12 w-12 mb-2" />
        هنوز هیچ پرداختی برای تسویه حساب ثبت نشده است.
      </div>
    );
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-6 w-6" />
          لیست پرداخت‌ها
        </CardTitle>
        <CardDescription>جزئیات تمام پرداخت‌های ثبت شده برای تسویه حساب.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {payments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment) => (
            <li key={payment.id} className="p-4 rounded-md border bg-card shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1 text-lg">
                      <UserCircle className="h-5 w-5 text-muted-foreground ml-1" />
                      <span className="font-semibold">{getMemberNameById(payment.fromMemberId)}</span>
                      <ArrowLeft className="h-5 w-5 text-primary mx-1" /> {/* Changed Icon */}
                      <UserCircle className="h-5 w-5 text-muted-foreground ml-1" />
                      <span className="font-semibold">{getMemberNameById(payment.toMemberId)}</span>
                    </div>
                    <Badge variant="secondary" className="text-base whitespace-nowrap">
                      {payment.amount.toLocaleString('fa-IR')} تومان
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(payment.date), "PPP p", { locale: faIR })}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 ml-3 shrink-0"
                  onClick={async () => await deletePayment(payment.id)}
                  aria-label={`حذف پرداخت از ${getMemberNameById(payment.fromMemberId)} به ${getMemberNameById(payment.toMemberId)}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

    