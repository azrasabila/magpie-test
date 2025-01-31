"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { debounce } from "lodash";
import { Table, Box, Flex, Text, Button, TextField } from "@radix-ui/themes";
import { CaretLeftIcon, CaretRightIcon } from "@radix-ui/react-icons";
import { I_Member, getMemberList } from "@/app/api/getMemberList";
import ConfirmDialog from "./memberConfirmDialog";
import MemberDialog from "./memberDialog";
import { deleteMember } from "@/app/api/deleteMember";

export default function MemberList() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
    const [selectedMember, setSelectedMember] = useState<I_Member | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<I_Member | null>(null);

    // Debounce search input
    const debouncedUpdate = useCallback(
        debounce((value) => {
            setDebouncedSearch(value);
        }, 500),
        []
    );

    // Update search query
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        debouncedUpdate(e.target.value);
    };

    // Fetch member list
    const { data, isLoading, isError } = useQuery({
        queryKey: ["members", page, debouncedSearch],
        queryFn: async () => await getMemberList({ page, pageSize: 10, search: debouncedSearch }),
    });

    const openAddDialog = () => {
        setDialogMode("add");
        setSelectedMember(null);
        setDialogOpen(true);
    };

    const openEditDialog = (member: I_Member) => {
        setDialogMode("edit");
        setSelectedMember(member);
        setDialogOpen(true);
    };

    const openDeleteDialog = (member: I_Member) => {
        setMemberToDelete(member);
        setConfirmDialogOpen(true);
    };

    // Mutation to delete a member
    const deleteMutation = useMutation({
        mutationFn: async (memberId: number) => await deleteMember(memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members"] });
            setConfirmDialogOpen(false);
            setMemberToDelete(null);
        },
    });

    const handleDeleteMember = () => {
        if (memberToDelete) {
            deleteMutation.mutate(memberToDelete.id);
        }
    };

    if (isLoading) return <Text className="text-center mt-4">Loading members...</Text>;
    if (isError) return <Text className="text-center text-red-500 mt-4">Failed to load members.</Text>;

    return (
        <Box className="p-6">
            <Flex justify="between" align="center">
                <Text size="6" weight="bold">Member List</Text>
                <Button onClick={openAddDialog}>Add Member</Button>
            </Flex>

            {/* Search Input */}
            <Flex gap="3" className="my-4">
                <TextField.Root
                    placeholder="Search members..."
                    value={search}
                    onChange={handleSearchChange}
                    className="p-2"
                />
            </Flex>

            {/* Table */}
            <Table.Root className="w-full border rounded-lg">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Member Name</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data?.data?.map((member) => (
                        <Table.Row key={member.id}>
                            <Table.Cell>{member.id}</Table.Cell>
                            <Table.Cell>{member.name}</Table.Cell>
                            <Table.Cell>{member.email}</Table.Cell>
                            <Table.Cell>{member.status}</Table.Cell>
                            <Table.Cell>
                                <Flex gap="2">
                                    <Button onClick={() => openEditDialog(member)}>Edit</Button>
                                    <Button color="red" onClick={() => openDeleteDialog(member)}>Delete</Button>
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

            {/* Member Dialog (Add/Edit) */}
            <MemberDialog open={dialogOpen} onOpenChange={setDialogOpen} mode={dialogMode} member={selectedMember} />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={confirmDialogOpen}
                onOpenChange={setConfirmDialogOpen}
                title="Delete Member"
                description={`Are you sure you want to delete ${memberToDelete?.name}? This action cannot be undone.`}
                onConfirm={handleDeleteMember}
            />
        </Box>
    );
}
