
"use client";

import { useDangoShare } from "@/contexts/DangoShareContext";
import type { CalculatedBalance } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function MemberList() {
  const { members, calculateBalances, deleteMember, isDataLoaded } = useDangoShare();
  
  if (!isDataLoaded) {
    return (
      <Card dir="rtl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            اعضا
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 p-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-md border">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const balances: CalculatedBalance[] = calculateBalances();

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" dir="rtl">
        <Users className="mx-auto h-12 w-12 mb-2" />
        هنوز عضوی اضافه نشده است. با افزودن چند عضو شروع کنید!
      </div>
    );
  }

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          اعضا
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {balances.map(({ memberId, memberName, balance }) => (
            <li
              key={memberId}
              className="flex justify-between items-center p-3 rounded-md border bg-card gap-2"
            >
              <div className="flex items-center gap-2 flex-grow">
                <User className="h-5 w-5 text-muted-foreground ml-1" />
                <span className="font-medium">{memberName}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`font-semibold text-sm px-2 py-1 rounded-md whitespace-nowrap ${
                    balance === 0 ? "bg-muted text-muted-foreground" :
                    balance > 0 ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200" : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
                  }`}
                >
                  {balance === 0 ? "تسویه شده" : balance > 0 ? `طلبکار: ${balance.toLocaleString('fa-IR')} ت` : `بدهکار: ${Math.abs(balance).toLocaleString('fa-IR')} ت`}
                </span>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={async () => await deleteMember(memberId)}
                  aria-label={`حذف عضو ${memberName}`}
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

    