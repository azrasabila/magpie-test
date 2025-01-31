"use client";

import { useState, useEffect } from "react";
import { TextField, Button, Flex, Select } from "@radix-ui/themes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { I_BookAdd } from "@/app/api/postBook";
import { postBook } from "@/app/api/postBook";
import { putBook } from "@/app/api/putBook";
import { Dialog } from "radix-ui";
import fetchCategories from "@/app/api/getCategoryList";
import { I_Book } from "@/app/api/getBookList";

interface BookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  book?: I_Book;
  bookId?: number;
}

export default function BookDialog({ open, onOpenChange, mode, book, bookId }: BookDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<I_BookAdd>({
    title: "",
    author: "",
    isbn: "",
    quantity: 1,
    categoryId: 0,
  });

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => await fetchCategories(100, 1, ''),
  });

  useEffect(() => {
    if (mode === "edit" && book) {
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        quantity: book.bookStatus.availableQty,
        categoryId: book.category.id,
      });
    } else {
      setFormData({ title: "", author: "", isbn: "", quantity: 1, categoryId: 0 });
    }
  }, [mode, book]);

  // Mutation to add or update a book
  const bookMutation = useMutation({
    mutationFn: async (data: I_BookAdd) => {
      if (mode === "edit" && bookId) {
        return await putBook(data, bookId);
      }
      return await postBook(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      onOpenChange(false);
      setFormData({ title: "", author: "", isbn: "", quantity: 1, categoryId: 0 });
    },
  });

  const handleSaveBook = () => {
    if (!formData.title || !formData.author || !formData.isbn || formData.quantity < 1 || formData.categoryId === 0) {
      return alert("All fields are required and quantity must be at least 1!");
    }
    bookMutation.mutate(formData);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-white rounded-lg shadow-lg w-96">
          <Dialog.Title>{mode === "edit" ? "Edit Book" : "Add New Book"}</Dialog.Title>
          <Flex direction="column" gap="3" className="mt-4">
            <TextField.Root
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField.Root
              placeholder="Author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
            <TextField.Root
              placeholder="ISBN"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
            />
            <TextField.Root
              placeholder="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            />

            {/* Category Dropdown */}
            <Select.Root
              value={formData.categoryId.toString()}
              onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
            >
              <Select.Trigger className="p-2" placeholder="Select a category">
                {loadingCategories
                  ? "Loading..."
                  : categories?.data?.find((c) => c.id.toString() === formData.categoryId.toString())?.name || "Select Category"}
              </Select.Trigger>
              <Select.Content>
                {loadingCategories ? (
                  <Select.Item value="0" disabled>Loading categories...</Select.Item>
                ) : (
                  categories?.data?.map((category) => (
                    <Select.Item key={category.id} value={category.id.toString()}>
                      {category.name}
                    </Select.Item>
                  ))
                )}
              </Select.Content>
            </Select.Root>
          </Flex>

          <Flex justify="end" gap="3" className="mt-6">
            <Dialog.Close>
              <Button>Cancel</Button>
            </Dialog.Close>
            <Button onClick={handleSaveBook} color="blue">
              {mode === "edit" ? "Update" : "Add"}
            </Button>
          </Flex>
        </Dialog.Content>
    </Dialog.Root>
  );
}
