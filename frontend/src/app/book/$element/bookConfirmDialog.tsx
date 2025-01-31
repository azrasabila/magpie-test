"use client";

import { Button, Flex, Text } from "@radix-ui/themes";
import { Dialog } from "radix-ui";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}

export default function ConfirmDialog({ open, onOpenChange, title, description, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="p-6 bg-white rounded-lg shadow-md">
        <Dialog.Title>{title}</Dialog.Title>
        <Text className="mt-2">{description}</Text>
        <Flex justify="end" gap="3" className="mt-6">
          <Dialog.Close asChild>
            <Button>Cancel</Button>
          </Dialog.Close>
          <Button color="red" onClick={onConfirm}>Delete</Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
