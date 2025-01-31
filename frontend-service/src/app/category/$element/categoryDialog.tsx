"use client";

import { useState, useEffect } from "react";
import { TextField, Button, Flex } from "@radix-ui/themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { I_Category } from "@/app/api/getCategoryList";
import { I_CategoryAdd, postCategory } from "@/app/api/postCategory";
import { Dialog } from "radix-ui";
import { putCategory } from "@/app/api/putCategory";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  category?: I_Category | null; // Pass category data when editing
}

export default function CategoryDialog({ open, onOpenChange, mode, category }: CategoryDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<I_CategoryAdd>({
    name: "",
  });

  // Pre-fill data if editing a category
  useEffect(() => {
    if (mode === "edit" && category) {
      setFormData({
        name: category.name,
      });
    } else {
      setFormData({ name: "" });
    }
  }, [mode, category]);

  // Mutation to add or update a category
  const categoryMutation = useMutation({
    mutationFn: async (data: I_CategoryAdd) => {
      if (mode === "edit" && category?.id) {
        return await putCategory(data, category.id);
      }
      return await postCategory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorys"] });
      onOpenChange(false);
      setFormData({ name: "" });
    },
  });

  const handleSaveCategory = () => {
    if (!formData.name) {
      return alert("All fields are required!");
    }
    categoryMutation.mutate(formData);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-white rounded-lg shadow-lg w-96">
        <Dialog.Title>{mode === "edit" ? "Edit Category" : "Add New Category"}</Dialog.Title>
        <Flex direction="column" gap="3" className="mt-4">
          <TextField.Root
            placeholder="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </Flex>
        <Flex justify="end" gap="3" className="mt-6">
          <Dialog.Close>
            <Button>Cancel</Button>
          </Dialog.Close>
          <Button onClick={handleSaveCategory} color="blue">
            {mode === "edit" ? "Update" : "Add"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
