import {
  Avatar,
  Group,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { useAuth } from "../../services/AuthContext";

export function UserButton() {
  const {user} = useAuth();
  return (
    <UnstyledButton w="100%" p="xs">
      <Group justify="space-between">
        <Group>
          <Avatar radius="xl" />

          <div>
            <Text size="sm" fw={500}>
              {user?.first_name} {user?.last_name}
            </Text>

            <Text size="xs" c="dimmed">
              @{user?.user_name}
            </Text>
          </div>
        </Group>

        <IconChevronRight size={16} />
      </Group>
    </UnstyledButton>
  );
}