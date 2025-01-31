"use client";

import { useState, useEffect } from "react";
import { Button, Flex, Text, Select } from "@radix-ui/themes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { I_Lending } from "@/app/api/getLendingList";
import { I_LendingAdd, postLending } from "@/app/api/postLending";
import { Dialog } from "radix-ui";
import { putLending } from "@/app/api/putLending";
import { getBookList } from "@/app/api/getBookList";
import { getMemberList } from "@/app/api/getMemberList";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { format } from "date-fns";

interface LendingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  lending?: I_Lending | null;
}

export default function LendingDialog({ open, onOpenChange, mode, lending }: LendingDialogProps) {
  const queryClient = useQueryClient();

  const getDefaultDueDate = () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    return format(futureDate, "yyyy-MM-dd"); // Format as "YYYY-MM-DD" for input[type="date"]
  };

  // State for form fields
  const [formData, setFormData] = useState<I_LendingAdd>({
    bookId: 0,
    memberId: 0,
    dueDate: getDefaultDueDate(),
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Fetch book & member list
  const { data: books, isLoading: isLoadingBook } = useQuery({
    queryKey: ["books"], queryFn: async () => await getBookList({
      pageSize: 1000
    })
  });
  const { data: members, isLoading: isLoadingMember } = useQuery({ queryKey: ["members"], queryFn: async () => await getMemberList({ page: 1, pageSize: 100 }) });

  // Prefill data when editing
  useEffect(() => {
    if (mode === "edit" && lending) {
      setFormData({
        bookId: lending.bookId,
        memberId: lending.memberId,
        dueDate: lending.dueDate,
      });
      setSelectedDate(new Date(lending.dueDate));
    } else {
      setFormData({ bookId: 0, memberId: 0, dueDate: "" });
      setSelectedDate(undefined);
    }
  }, [mode, lending]);

  // Mutation to add or update lending
  const lendingMutation = useMutation({
    mutationFn: async (data: I_LendingAdd) => {
      if (mode === "edit" && lending?.id) {
        return await putLending(data, lending.id);
      }
      return await postLending(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lendings"] });
      onOpenChange(false);
      setFormData({ bookId: 0, memberId: 0, dueDate: "" });
      setSelectedDate(undefined);
    },
  });

  const handleSaveLending = () => {
    if (!formData.bookId || !formData.memberId || !formData.dueDate) {
      return alert("All fields are required!");
    }
    lendingMutation.mutate(formData);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-white rounded-lg shadow-lg w-96">
        <Dialog.Title>{mode === "edit" ? "Edit Lending" : "Add New Lending"}</Dialog.Title>

        <Flex direction="column" gap="3" className="mt-4">
          <Text>Book</Text>
          <Select.Root
            value={formData.bookId.toString()}
            onValueChange={(value) => setFormData({ ...formData, bookId: Number(value) })}
          >
            <Select.Trigger placeholder="Select a book" />
            <Select.Content>
              {books?.data?.map((book) => (
                <Select.Item key={book.id} value={book.id.toString()} disabled={book.bookStatus.availableQty < 1}>
                  {book.title} ({book.bookStatus.availableQty})
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Text>Member</Text>
          <Select.Root
            value={formData.memberId.toString()}
            onValueChange={(value) => setFormData({ ...formData, memberId: Number(value) })}
          >
            <Select.Trigger placeholder="Select a member" />
            <Select.Content>
              {members?.data?.map((member) => (
                <Select.Item key={member.id} value={member.id.toString()}>
                  {member.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Text>Due Date</Text>
          <Popover>
            <PopoverTrigger asChild>
              <Button className="w-full">
                {selectedDate ? selectedDate.toDateString() : "Select Due Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="fixed top-1/2 left-1/2 transform -translate-x-1/4 -translate-y-1/2 p-6 bg-white rounded-lg shadow-lg w-96">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setFormData({ ...formData, dueDate: date?.toISOString() || "" });
                }}
              />
            </PopoverContent>
          </Popover>
        </Flex>

        <Flex justify="end" gap="3" className="mt-6">
          <Dialog.Close>
            <Button>Cancel</Button>
          </Dialog.Close>
          <Button onClick={handleSaveLending} color="blue">
            {mode === "edit" ? "Update" : "Add"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
