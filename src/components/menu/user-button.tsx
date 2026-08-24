import {
  Avatar,
  Group,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";

export function UserButton() {
  return (
    <UnstyledButton w="100%" p="xs">
      <Group justify="space-between">
        <Group>
          <Avatar radius="xl" />

          <div>
            <Text size="sm" fw={500}>
              Administrateur
            </Text>

            <Text size="xs" c="dimmed">
              admin@csco.local
            </Text>
          </div>
        </Group>

        <IconChevronRight size={16} />
      </Group>
    </UnstyledButton>
  );
}