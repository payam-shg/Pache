
"use client";

import { useDangoShare } from "@/contexts/DangoShareContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListChecks, FileText, UserCircle, Users2, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale'; 
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function ExpenseList() {
  const { expenses, getMemberNameById, deleteExpense, isDataLoaded } = useDangoShare();

  if (!isDataLoaded) {
    return (
      <Card dir="rtl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-6 w-6" />
            لیست هزینه‌ها
          </CardTitle>
          <CardDescription>جزئیات تمام هزینه‌های ثبت شده.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 p-1">
            {[...Array(2)].map((_, i) => (
              <li key={i} className="p-4 rounded-md border bg-card shadow-sm space-y-2 list-none">
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="h-6 w-40 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-7 w-20" />
                </div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
              </li>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" dir="rtl">
        <ListChecks className="mx-auto h-12 w-12 mb-2" />
        هنوز هیچ هزینه‌ای ثبت نشده است.
      </div>
    );
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-6 w-6" />
          لیست هزینه‌ها
        </CardTitle>
        <CardDescription>جزئیات تمام هزینه‌های ثبت شده.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense) => (
            <li key={expense.id} className="p-4 rounded-md border bg-card shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary ml-1" />
                        {expense.description}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(expense.date), "PPP p", { locale: faIR })}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-base whitespace-nowrap">
                      {expense.amount.toLocaleString('fa-IR')} تومان
                    </Badge>
                  </div>
                  
                  <div className="text-sm mb-2">
                    <span className="font-medium flex items-center gap-1">
                      <UserCircle className="h-4 w-4 text-muted-foreground ml-1" /> پرداخت شده توسط:
                    </span>
                    <span className="mr-1">{getMemberNameById(expense.paidById)}</span>
                  </div>

                  <div>
                    <span className="font-medium flex items-center gap-1">
                      <Users2 className="h-4 w-4 text-muted-foreground ml-1" /> شرکت‌کنندگان:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {expense.shares.map((share) => (
                        <Badge key={share.memberId} variant="outline" className="font-normal">
                          {getMemberNameById(share.memberId)} ({share.amount.toLocaleString('fa-IR')} ت)
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 ml-3 shrink-0"
                  onClick={async () => await deleteExpense(expense.id)}
                  aria-label={`حذف هزینه ${expense.description}`}
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

    