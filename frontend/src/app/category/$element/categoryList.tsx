"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { debounce } from "lodash";
import { Table, Box, Flex, Text, Button, TextField, Section } from "@radix-ui/themes";
import { CaretLeftIcon, CaretRightIcon } from "@radix-ui/react-icons";
import getCategoryList, { I_Category } from "@/app/api/getCategoryList";
import { deleteCategory } from "@/app/api/deleteCategory";
import CategoryDialog from "./categoryDialog";
import ConfirmDialog from "./categoryConfirmDialog";

export default function CategoryList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] = useState<I_Category | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<I_Category | null>(null);

  // Debounce search input
  const debouncedUpdate = useCallback(
    debounce((value) => {
      setDebouncedSearch(value);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedUpdate(e.target.value);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categorys", page, debouncedSearch],
    queryFn: async () => await getCategoryList(10, page, debouncedSearch),
  });

  const openAddDialog = () => {
    setDialogMode("add");
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const openEditDialog = (category: I_Category) => {
    setDialogMode("edit");
    setSelectedCategory(category);
    setDialogOpen(true);
  };

  const openDeleteDialog = (category: I_Category) => {
    setCategoryToDelete(category);
    setConfirmDialogOpen(true);
  };

  // Mutation to delete a category
  const deleteMutation = useMutation({
    mutationFn: async (categoryId: number) => await deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorys"] });
      setConfirmDialogOpen(false);
      setCategoryToDelete(null);
    },
  });

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id);
    }
  };

  if (isLoading) return <Text className="text-center mt-4">Loading categorys...</Text>;
  if (isError) return <Text className="text-center text-red-500 mt-4">Failed to load categorys.</Text>;

  return (
    <>
      <Section width='full' className="p-6 w-full">
        <Flex justify="between" align="center">
          <Text size="6" weight="bold">Category List</Text>
          <Button onClick={openAddDialog}>Add Category</Button>
        </Flex>

        {/* Search Input */}
        <Flex gap="3" className="my-4">
          <TextField.Root
            placeholder="Search categorys..."
            value={search}
            onChange={handleSearchChange}
            className="p-2"
          />
        </Flex>

        {/* Table */}
        <Table.Root className="w-full border rounded-lg">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Category Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data?.data?.map((category) => (
              <Table.Row key={category.id}>
                <Table.Cell>{category.name}</Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <Button onClick={() => openEditDialog(category)}>Edit</Button>
                    <Button color="red" onClick={() => openDeleteDialog(category)}>Delete</Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        {/* Pagination */}
        <Flex justify="center" align="center" gap="2" className="mt-4">
          <Button disabled={page === 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
            <CaretLeftIcon />
          </Button>
          <Text>Page {page}</Text>
          <Button onClick={() => setPage((prev) => prev + 1)}>
            <CaretRightIcon />
          </Button>
        </Flex>
      </Section>
      <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} mode={dialogMode} category={selectedCategory} />

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Delete Category"
        description={`Are you sure you want to delete ${categoryToDelete?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteCategory}
      />
    </>
  );
}
