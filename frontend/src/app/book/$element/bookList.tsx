"use client";

import { useState, useCallback } from "react";
import { debounce } from "lodash";
import { TextField, Select, Button, Flex, Box, DataList } from "@radix-ui/themes";
import { CaretLeftIcon, CaretRightIcon, PlusIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { useBooks } from "../$action/getBookList";
import getCategoryList from "@/app/api/getCategoryList";
import BookDialog from "./bookDialog";
import { I_Book } from "@/app/api/getBookList";

export default function BookList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editBook, setEditBook] = useState<I_Book | undefined>(undefined); // Store the book being edited
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");

  const { data, isLoading, error } = useBooks({ page, pageSize: 10, search: debouncedSearch, categoryId: selectedCategory });
  const { data: categoryData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => await getCategoryList(1000, 1),
  });

  const debouncedUpdate = useCallback(
    debounce((value) => setDebouncedSearch(value), 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedUpdate(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  const openAddDialog = () => {
    setEditBook(undefined);
    setDialogMode("add");
    setDialogOpen(true);
  };

  const openEditDialog = (book: I_Book) => {
    setDialogMode("edit");
    setEditBook(book);
    setDialogOpen(true);
  };

  if (isLoading) return <p>Loading books...</p>;
  if (error) return <p>Error loading books: {error.message}</p>;

  return (
    <>
      <Box className="p-4">
        <Flex justify="between" align="center" className="mb-4">
          <h1 className="text-2xl font-bold">Book List</h1>
          <Button onClick={() => openAddDialog()}>
            <PlusIcon /> Add Book
          </Button>
        </Flex>

        <Flex gap="3" className="mb-4">
          <TextField.Root
            placeholder="Search books..."
            value={search}
            onChange={handleSearchChange}
            className="p-2 w-full"
          />

          <Select.Root value={selectedCategory} onValueChange={setSelectedCategory}>
            <Select.Trigger className="p-2 w-48">
              {categoryData?.data?.find((c) => c.id.toString() === selectedCategory)?.name || "All Category"}
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="0">All Categories</Select.Item>
              {categoryData?.data?.map((category) => (
                <Select.Item key={category.id} value={category.id.toString()}>
                  {category.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>

        {/* Book List */}
        <ul className="mt-4 space-y-2">
          {data?.data?.map((book) => (
            <li key={book.id} className="p-4 border rounded shadow flex justify-between items-center">
              <Flex direction='column'>
                <h2 className="text-lg font-semibold mb-2">{book.title}</h2>
                <DataList.Root>
                  <DataList.Item>
                    <DataList.Label>Author</DataList.Label>
                    <DataList.Value>{book.author}</DataList.Value>
                  </DataList.Item>

                  <DataList.Item>
                    <DataList.Label>ISBN</DataList.Label>
                    <DataList.Value>{book.isbn}</DataList.Value>
                  </DataList.Item>

                  <DataList.Item>
                    <DataList.Label>Category</DataList.Label>
                    <DataList.Value>{book.category.name}</DataList.Value>
                  </DataList.Item>
                </DataList.Root>
              </Flex>
              <DataList.Root>
                {book.bookStatus && (
                  <>
                    <DataList.Item>
                      <DataList.Label>Available</DataList.Label>
                      <DataList.Value>{book.bookStatus.availableQty}</DataList.Value>
                    </DataList.Item>

                    <DataList.Item>
                      <DataList.Label>Borrowed</DataList.Label>
                      <DataList.Value>{book.bookStatus.borrowedQty}</DataList.Value>
                    </DataList.Item>
                  </>
                )}
              </DataList.Root>
              <Button onClick={() => openEditDialog(book)} variant="soft">
                <Pencil1Icon /> Edit
              </Button>
            </li>
          ))}
        </ul>

        {/* Pagination */}
        <Flex justify="center" align="center" gap="2" className="mt-4">
          <Button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            variant="soft"
          >
            <CaretLeftIcon />
          </Button>
          <p>Page {page}</p>
          <Button
            onClick={() => setPage((prev) => prev + 1)}
            variant="soft"
            disabled={data?.pagination?.totalPages === data?.pagination?.currentPage}
          >
            <CaretRightIcon />
          </Button>
        </Flex>
      </Box>

      <BookDialog open={isDialogOpen} onOpenChange={setDialogOpen} mode={editBook ? "edit" : "add"} book={editBook} bookId={editBook?.id} />
    </>
  );
}
