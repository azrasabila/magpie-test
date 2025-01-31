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

export default function DeleteDialog({ open, onOpenChange, title, description, onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6 bg-white rounded-lg shadow-lg w-96">
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
