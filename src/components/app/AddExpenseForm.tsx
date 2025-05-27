
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDangoShare } from "@/contexts/DangoShareContext";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";

const formSchema = z.object({
  description: z.string().min(1, "توضیحات نمی‌تواند خالی باشد.").max(100, "توضیحات بیش از حد طولانی است."),
  amount: z.coerce.number().positive("مبلغ باید مثبت باشد."),
  paidById: z.string().min(1, "پرداخت‌کننده باید انتخاب شود."),
  participantIds: z.array(z.string()).min(1, "حداقل یک شرکت‌کننده باید انتخاب شود."),
});

type AddExpenseFormValues = z.infer<typeof formSchema>;

export function AddExpenseForm() {
  const { members, addExpense, isDataLoaded } = useDangoShare();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<AddExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: undefined,
      paidById: "",
      participantIds: [],
    },
  });

  useEffect(() => {
    if (isOpen && members.length > 0) {
      form.reset({
        description: "",
        amount: undefined, 
        paidById: members[0]?.id || "", 
        participantIds: members.map(m => m.id), 
      });
    } else if (isOpen && members.length === 0) {
      form.reset({
        description: "",
        amount: undefined,
        paidById: "",
        participantIds: [],
      });
    }
  }, [isOpen, members, form]);


  async function onSubmit(values: AddExpenseFormValues) {
    await addExpense(values.description, values.amount, values.paidById, values.participantIds);
    form.reset({
        description: "",
        amount: undefined,
        paidById: members.length > 0 ? members[0].id : "",
        participantIds: members.map(m => m.id),
    });
    setIsOpen(false); 
  }
  
  if (!isDataLoaded) {
    return (
      <Button disabled>
        <PlusCircle className="ml-2 h-4 w-4" /> افزودن هزینه
        <span className="sr-only">(منتظر بارگذاری اطلاعات پاچه بمانید)</span>
      </Button>
    );
  }
  
  if (members.length === 0) {
     return (
      <Button disabled>
        <PlusCircle className="ml-2 h-4 w-4" /> افزودن هزینه
        <span className="sr-only">(ابتدا عضو به این پاچه اضافه کنید)</span>
      </Button>
    );
  }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="ml-2 h-4 w-4" /> افزودن هزینه
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>افزودن هزینه جدید</DialogTitle>
          <DialogDescription dir="rtl">
            هزینه جدید را ثبت کرده و مشخص کنید چه کسی پرداخت کرده و چه کسانی شریک بوده‌اند.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیحات</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: خرید روزانه، شام" {...field} />
                  </FormControl>
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
                      placeholder="مثال: 25500" 
                      {...field} 
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paidById"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>پرداخت شده توسط</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined} dir="rtl">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب کنید چه کسی پرداخت کرده" />
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
            <Controller
              control={form.control}
              name="participantIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>شرکت‌کنندگان</FormLabel>
                  <FormDescription>انتخاب کنید چه کسانی در این هزینه شریک بوده‌اند.</FormDescription>
                  <ScrollArea className="h-[150px] w-full rounded-md border p-4">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2 mb-2 dir-rtl">
                        <Checkbox
                          id={`participant-${member.id}`}
                          checked={field.value?.includes(member.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...(field.value || []), member.id])
                              : field.onChange(
                                  (field.value || []).filter(
                                    (value) => value !== member.id
                                  )
                                );
                          }}
                          className="ml-2"
                        />
                        <label
                          htmlFor={`participant-${member.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {member.name}
                        </label>
                      </div>
                    ))}
                  </ScrollArea>
                   <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
               <DialogClose asChild>
                <Button type="button" variant="outline">انصراف</Button>
              </DialogClose>
              <Button type="submit">افزودن هزینه</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
