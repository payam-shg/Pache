
"use client";

import type { PacheGroup } from "@/types";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, ArrowLeftCircle, ListChecks, Coins, Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface PachesPageHeaderProps {
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (isOpen: boolean) => void;
  newPacheName: string;
  setNewPacheName: (name: string) => void;
  handleCreatePache: () => void;
}

const PachesPageHeader: React.FC<PachesPageHeaderProps> = ({
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  newPacheName,
  setNewPacheName,
  handleCreatePache,
}) => (
  <header className="py-6 px-4 md:px-6 border-b bg-card">
    <div className="container mx-auto flex items-center justify-between" dir="rtl">
      <div className="flex items-center gap-3">
        <Coins className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">پاچه</h1>
      </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="ml-2 h-4 w-4" /> ایجاد پاچه جدید
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>ایجاد پاچه جدید</DialogTitle>
            <DialogDescription dir="rtl">
              نامی برای پاچه (گروه هزینه) جدید خود انتخاب کنید.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-pache-name" className="text-right col-span-1">
                نام پاچه
              </Label>
              <Input
                id="new-pache-name"
                value={newPacheName}
                onChange={(e) => setNewPacheName(e.target.value)}
                className="col-span-3"
                placeholder="مثال: سفر شمال، شام دوستانه"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">انصراف</Button>
            </DialogClose>
            <Button type="button" onClick={handleCreatePache}>ایجاد</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </header>
);


export default function PachesDashboardPage() {
  const [paches, setPaches] = useState<PacheGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPacheName, setNewPacheName] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchPaches = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/paches");
      if (!response.ok) throw new Error("Failed to fetch paches");
      const data = await response.json();
      setPaches(data);
    } catch (error) {
      console.error("Error fetching paches:", error);
      toast({
        title: "خطا در بارگذاری پاچه‌ها",
        description: "لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
      setPaches([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPaches();
  }, [fetchPaches]);

  const handleCreatePache = async () => {
    if (!newPacheName.trim()) {
      toast({
        title: "نام پاچه الزامی است",
        description: "لطفاً نامی برای پاچه جدید وارد کنید.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch("/api/paches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPacheName }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create pache");
      }
      const createdPache = await response.json();
      setPaches((prevPaches) => [...prevPaches, createdPache]);
      toast({ title: "پاچه ایجاد شد", description: `پاچه "${createdPache.name}" با موفقیت ایجاد شد.` });
      setNewPacheName("");
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating pache:", error);
      toast({
        title: "خطا در ایجاد پاچه",
        description: error.message || "لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePache = async (pacheId: string, pacheName: string) => {
    if (!confirm(`آیا از حذف پاچه "${pacheName}" مطمئن هستید؟ این عمل قابل بازگشت نیست.`)) {
      return;
    }
    try {
      const response = await fetch(`/api/paches/${pacheId}`, { method: "DELETE" });
      if (!response.ok) {
         const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete pache");
      }
      setPaches((prevPaches) => prevPaches.filter((p) => p.id !== pacheId));
      toast({ title: "پاچه حذف شد", description: `پاچه "${pacheName}" با موفقیت حذف شد.` });
    } catch (error: any) {
      console.error("Error deleting pache:", error);
      toast({
        title: "خطا در حذف پاچه",
        description: error.message || "لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
  };
  

  return (
    <div className="flex flex-col min-h-screen bg-background" dir="rtl">
      <PachesPageHeader 
        isCreateDialogOpen={isCreateDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        newPacheName={newPacheName}
        setNewPacheName={setNewPacheName}
        handleCreatePache={handleCreatePache}
      />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="flex-grow">
                   <Skeleton className="h-4 w-full mb-1" />
                   <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-10" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : paches.length === 0 ? (
          <div className="text-center py-12">
            <ListChecks className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">هنوز هیچ پاچه‌ای ایجاد نشده است.</p>
            <p className="text-muted-foreground mt-2">برای شروع، یک پاچه جدید ایجاد کنید.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paches.map((pache) => (
              <Card key={pache.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="break-words">{pache.name}</CardTitle>
                  <CardDescription>
                    {pache.members.length} عضو، {pache.expenses.length} هزینه
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    برای مدیریت اعضا، هزینه‌ها و پرداخت‌های این پاچه کلیک کنید.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-4">
                  <Button asChild variant="outline">
                    <Link href={`/pache/${pache.id}`} className="flex items-center gap-2">
                      <ArrowLeftCircle className="h-5 w-5" />
                      مشاهده و مدیریت
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeletePache(pache.id, pache.name)}
                    aria-label={`حذف پاچه ${pache.name}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <footer className="py-4 px-4 md:px-6 border-t mt-auto bg-card">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>پاچه - مدیریت آسان دنگ و هزینه‌های اشتراکی.</p>
          <p className="mt-1">
            ساخته شده توسط Payam Shafiee.
            <Link href="https://github.com/payam-shg" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline ml-2 mr-1">
              <Github className="h-4 w-4" />
              مشاهده کد در گیت‌هاب
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
