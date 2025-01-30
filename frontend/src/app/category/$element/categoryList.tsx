"use client";

import fetchCategories from "@/app/api/getCategoryList";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@radix-ui/themes";
import { Table } from "@radix-ui/themes";
import { Box, Flex, Text } from "@radix-ui/themes";
import { CaretLeftIcon, CaretRightIcon } from "@radix-ui/react-icons";

export default function CategoryList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories", page, search],
    queryFn: () => fetchCategories(10, page, search),
  });

  if (isLoading)
    return <Text className="text-center mt-4">Loading categories...</Text>;
  if (isError)
    return <Text className="text-center text-red-500 mt-4">Failed to load categories.</Text>;

  return (
    <Box className="p-6">
      <Text size="6" weight="bold" className="mb-4">
        Category List
      </Text>

      {/* Search Input */}
      <Flex gap="3" className="my-4">
        <input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 text-black "
        />
      </Flex>

      <Table.Root className="w-full border rounded-lg">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Category Name</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data?.data?.map((category: any) => (
            <Table.Row key={category.id}>
              <Table.Cell>{category.id}</Table.Cell>
              <Table.Cell>{category.name}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {/* Pagination */}
      <Flex width='full' justify="between" gap="2" className="mt-4">
        <Button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
          <CaretLeftIcon/>
        </Button>
        <Text>Page {page}</Text>
        <Button onClick={() => setPage((prev) => prev + 1)}><CaretRightIcon/></Button>
      </Flex>
    </Box>
  );
}
