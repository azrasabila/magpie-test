"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { debounce } from "lodash";
import { Table, Box, Flex, Text, Button, TextField, Badge } from "@radix-ui/themes";
import { CaretLeftIcon, CaretRightIcon } from "@radix-ui/react-icons";
import { getLendingList, I_Lending } from "@/app/api/getLendingList";
import { deleteLending } from "@/app/api/deleteLending";
import LendingDialog from "./lendingDialog";
import ConfirmDialog from "./lendingConfirmDialog";
import { format, isBefore } from "date-fns";
import { postReturnLending } from "@/app/api/postReturnLending";

export default function LendingList() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
    const [selectedLending, setSelectedLending] = useState<I_Lending | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [lendingToDelete, setLendingToDelete] = useState<I_Lending | null>(null);
    const today = new Date();

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
        queryKey: ["lendings", page, debouncedSearch],
        queryFn: async () => await getLendingList({ pageSize: 10, page, search: debouncedSearch }),
    });

    const openAddDialog = () => {
        setDialogMode("add");
        setSelectedLending(null);
        setDialogOpen(true);
    };

    const openEditDialog = (lending: I_Lending) => {
        setDialogMode("edit");
        setSelectedLending(lending);
        setDialogOpen(true);
    };

    const openDeleteDialog = (lending: I_Lending) => {
        setLendingToDelete(lending);
        setConfirmDialogOpen(true);
    };

    const deleteMutation = useMutation({
        mutationFn: async (lendingId: number) => await postReturnLending(lendingId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lendings"] });
            setConfirmDialogOpen(false);
            setLendingToDelete(null);
        },
    });

    const handleDeleteLending = () => {
        if (lendingToDelete) {
            deleteMutation.mutate(lendingToDelete.id);
        }
    };

    if (isLoading) return <Text className="text-center mt-4">Loading lendings...</Text>;
    if (isError) return <Text className="text-center text-red-500 mt-4">Failed to load lendings.</Text>;

    return (
        <Box className="p-6">
            <Flex justify="between" align="center">
                <Text size="6" weight="bold">Lending List</Text>
                <Button onClick={openAddDialog}>Add Lending</Button>
            </Flex>

            <Flex gap="3" className="my-4">
                <TextField.Root
                    placeholder="Search lendings..."
                    value={search}
                    onChange={handleSearchChange}
                    className="p-2"
                />
            </Flex>

            <Table.Root className="w-full border rounded-lg min-w-[800px]">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>Book Name</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Member Name</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Borrow Date</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Due Date</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Return Date</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className="sticky right-0 bg-white shadow-md">Action</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data?.data?.map((lending) => {
                        const dueDate = new Date(lending.dueDate);
                        const isOverdue = isBefore(dueDate, today) && lending.status === "BORROWED";

                        return (
                            <Table.Row key={lending.id}>
                                <Table.Cell>{lending.book.title}</Table.Cell>
                                <Table.Cell>{lending.member.name}</Table.Cell>
                                <Table.Cell>{format(new Date(lending.borrowedDate), "dd MMM yyyy")}</Table.Cell>
                                <Table.Cell>{format(dueDate, "dd MMM yyyy")}</Table.Cell>
                                <Table.Cell>{lending.returnDate ? format(new Date(lending.returnDate), "dd MMM yyyy") : '-'}</Table.Cell>
                                <Table.Cell>
                                    {isOverdue ? (
                                        <Badge color="red">Overdue</Badge>
                                    ) : lending.status === "BORROWED" ? (
                                        <Badge color="orange">Borrowed</Badge>
                                    ) : (
                                        <Badge color="green">Returned</Badge>
                                    )}
                                </Table.Cell>
                                <Table.Cell className="sticky right-0 bg-white shadow-md">
                                    <Flex gap="2">
                                        <Button color="yellow" onClick={() => openDeleteDialog(lending)}>Return</Button>
                                    </Flex>
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table.Root>

            <Flex justify="center" align="center" gap="2" className="mt-4">
                <Button disabled={page === 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))}>
                    <CaretLeftIcon />
                </Button>
                <Text>Page {page}</Text>
                <Button onClick={() => setPage((prev) => prev + 1)}>
                    <CaretRightIcon />
                </Button>
            </Flex>

            <LendingDialog open={dialogOpen} onOpenChange={setDialogOpen} mode={dialogMode} lending={selectedLending} />

            <ConfirmDialog
                open={confirmDialogOpen}
                onOpenChange={setConfirmDialogOpen}
                title="Return Book"
                description={`Are you sure you want to return this book?`}
                onConfirm={handleDeleteLending}
            />
        </Box>
    );
}
