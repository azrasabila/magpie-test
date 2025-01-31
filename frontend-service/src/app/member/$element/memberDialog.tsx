"use client";

import { useState, useEffect } from "react";
import { TextField, Button, Flex } from "@radix-ui/themes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { I_Member } from "@/app/api/getMemberList";
import { I_MemberAdd, postMember } from "@/app/api/postMember";
import { Dialog } from "radix-ui";
import { putMember } from "@/app/api/putMember";

interface MemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  member?: I_Member | null; // Pass member data when editing
}

export default function MemberDialog({ open, onOpenChange, mode, member }: MemberDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<I_MemberAdd>({
    name: "",
    email: "",
    phone: "",
  });

  // Pre-fill data if editing a member
  useEffect(() => {
    if (mode === "edit" && member) {
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone,
      });
    } else {
      setFormData({ name: "", email: "", phone: "" });
    }
  }, [mode, member]);

  // Mutation to add or update a member
  const memberMutation = useMutation({
    mutationFn: async (data: I_MemberAdd) => {
      if (mode === "edit" && member?.id) {
        return await putMember(data, member.id);
      }
      return await postMember(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      onOpenChange(false); // Close dialog on success
      setFormData({ name: "", email: "", phone: "" }); // Reset fields
    },
  });

  const handleSaveMember = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      return alert("All fields are required!");
    }
    memberMutation.mutate(formData);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-white rounded-lg shadow-lg w-96">
        <Dialog.Title>{mode === "edit" ? "Edit Member" : "Add New Member"}</Dialog.Title>
        <Flex direction="column" gap="3" className="mt-4">
          <TextField.Root
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField.Root
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField.Root
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </Flex>
        <Flex justify="end" gap="3" className="mt-6">
          <Dialog.Close>
            <Button>Cancel</Button>
          </Dialog.Close>
          <Button onClick={handleSaveMember} color="blue">
            {mode === "edit" ? "Update" : "Add"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
