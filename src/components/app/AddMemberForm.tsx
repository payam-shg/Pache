
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
import { useDangoShare } from "@/contexts/DangoShareContext";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(1, { message: "نام عضو نمی‌تواند خالی باشد." }).max(50, {message: "نام بیش از حد طولانی است."}),
});

type AddMemberFormValues = z.infer<typeof formSchema>;

export function AddMemberForm() {
  const { addMember, isDataLoaded } = useDangoShare();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(values: AddMemberFormValues) {
    await addMember(values.name);
    form.reset();
    setIsOpen(false); 
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={!isDataLoaded}>
          <PlusCircle className="ml-2 h-4 w-4" /> افزودن عضو
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>افزودن عضو جدید</DialogTitle>
          <DialogDescription dir="rtl">
            نام عضو جدید را وارد کنید تا به گروه اضافه شود.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام عضو</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: علی" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">انصراف</Button>
              </DialogClose>
              <Button type="submit">افزودن عضو</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
