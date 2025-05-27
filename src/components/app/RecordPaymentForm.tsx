
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDangoShare } from "@/contexts/DangoShareContext";
import { HandCoins } from "lucide-react";
import { useState, useEffect } from "react";

const formSchema = z.object({
  fromMemberId: z.string().min(1, "پرداخت‌کننده باید انتخاب شود."),
  toMemberId: z.string().min(1, "دریافت‌کننده باید انتخاب شود."),
  amount: z.coerce.number().positive("مبلغ باید مثبت باشد."),
}).refine(data => data.fromMemberId !== data.toMemberId, {
  message: "پرداخت‌کننده و دریافت‌کننده نمی‌توانند یکسان باشند.",
  path: ["toMemberId"], 
});

type RecordPaymentFormValues = z.infer<typeof formSchema>;

export function RecordPaymentForm() {
  const { members, recordPayment, isDataLoaded } = useDangoShare();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromMemberId: "",
      toMemberId: "",
      amount: undefined,
    },
  });

  useEffect(() => {
    if (isOpen && members.length > 0) {
      form.reset({
        fromMemberId: members.length > 0 ? members[0].id : "",
        toMemberId: members.length > 1 ? members[1].id : "",
        amount: undefined,
      });
    }
  }, [isOpen, members, form]);

  async function onSubmit(values: RecordPaymentFormValues) {
    await recordPayment(values.fromMemberId, values.toMemberId, values.amount);
    form.reset({
        fromMemberId: members.length > 0 ? members[0].id : "",
        toMemberId: members.length > 1 ? members[1].id : "",
        amount: undefined,
    });
    setIsOpen(false);
  }

  if (!isDataLoaded) {
     return (
      <Button disabled>
        <HandCoins className="ml-2 h-4 w-4" /> ثبت پرداخت
         <span className="sr-only">(منتظر بارگذاری اطلاعات پاچه بمانید)</span>
      </Button>
    );
  }

  if (members.length < 2) {
     return (
      <Button disabled>
        <HandCoins className="ml-2 h-4 w-4" /> ثبت پرداخت
         <span className="sr-only">(ابتدا حداقل دو عضو به این پاچه اضافه کنید)</span>
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <HandCoins className="ml-2 h-4 w-4" /> ثبت پرداخت
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>ثبت پرداخت</DialogTitle>
          <DialogDescription dir="rtl">
            پرداخت انجام شده بین دو عضو برای تسویه حساب را ثبت کنید.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="fromMemberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>از طرف (پرداخت‌کننده)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined} dir="rtl">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب پرداخت‌کننده" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="toMemberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>به (دریافت‌کننده)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined} dir="rtl">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب دریافت‌کننده" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id} disabled={member.id === form.getValues("fromMemberId")}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مبلغ (تومان)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="مثال: 10000" 
                      {...field} 
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">انصراف</Button>
              </DialogClose>
              <Button type="submit">ثبت پرداخت</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
