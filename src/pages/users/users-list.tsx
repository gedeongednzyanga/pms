import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  User,
} from "lucide-react";

import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Menu,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";

export interface User {
  id: number;
  firstname: string;
  middlename?: string | null;
  lastname: string;
  username: string;
  avatar?: string | null;
  type: number;
  date_updated: string;
}

interface UserListProps {
  onCreate: () => void;
  onEdit: (user: User) => void;
}

export default function UserList({
  onCreate,
  onEdit,
}: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const result = await invoke<User[]>(
        "get_users_cmd"
      );

      setUsers(result);
    } catch (error) {
      console.error(
        "Erreur chargement utilisateurs :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const deleteUser = async (id: number) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer définitivement cet utilisateur ?"
    );

    if (!confirmed) return;

    try {
      await invoke("delete_user_cmd", {
        id,
      });

      await loadUsers();
    } catch (error) {
      console.error(
        "Erreur suppression utilisateur :",
        error
      );
    }
  };

  const getFullName = (user: User) => {
    return [
      user.firstname,
      user.middlename,
      user.lastname,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getUserType = (type: number) => {
    switch (type) {
      case 1:
        return "Administrateur";

      case 2:
        return "Personnel";

      default:
        return "N/A";
    }
  };

  const getUserTypeColor = (type: number) => {
    switch (type) {
      case 1:
        return "blue";

      case 2:
        return "gray";

      default:
        return "dark";
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "fr-FR",
      {
        dateStyle: "short",
        timeStyle: "short",
      }
    );
  };

  return (
    <Card
      withBorder
      radius="md"
      shadow="sm"
      p={0}
    >
      {/* Header */}
      <Group
        justify="space-between"
        px="lg"
        py="md"
        style={{
          borderBottom:
            "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <div>
          <Title order={3}>
            Liste des utilisateurs
          </Title>

          <Text
            size="sm"
            c="dimmed"
            mt={3}
          >
            Gérez les comptes utilisateurs de
            l'application
          </Text>
        </div>

        <Button
          leftSection={<Plus size={17} />}
          onClick={onCreate}
        >
          Nouvel utilisateur
        </Button>
      </Group>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <Table
          striped
          highlightOnHover
          verticalSpacing="sm"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 60 }}>
                #
              </Table.Th>

              <Table.Th>
                Date de modification
              </Table.Th>

              <Table.Th
                style={{ width: 100 }}
                ta="center"
              >
                Avatar
              </Table.Th>

              <Table.Th>
                Nom
              </Table.Th>

              <Table.Th>
                Nom d'utilisateur
              </Table.Th>

              <Table.Th
                ta="center"
                style={{ width: 150 }}
              >
                Type
              </Table.Th>

              <Table.Th
                ta="center"
                style={{ width: 100 }}
              >
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Center py="xl">
                    <Stack
                      align="center"
                      gap="xs"
                    >
                      <Loader size="sm" />

                      <Text
                        size="sm"
                        c="dimmed"
                      >
                        Chargement des utilisateurs...
                      </Text>
                    </Stack>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : users.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Center py="xl">
                    <Stack
                      align="center"
                      gap="xs"
                    >
                      <User size={32} />

                      <Text c="dimmed">
                        Aucun utilisateur enregistré
                      </Text>
                    </Stack>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : (
              users.map((user, index) => (
                <Table.Tr key={user.id}>
                  {/* # */}
                  <Table.Td>
                    {index + 1}
                  </Table.Td>

                  {/* Date */}
                  <Table.Td>
                    <Text size="sm">
                      {formatDate(
                        user.date_updated
                      )}
                    </Text>
                  </Table.Td>

                  {/* Avatar */}
                  <Table.Td ta="center">
                    <Avatar
                      src={user.avatar || undefined}
                      alt={getFullName(user)}
                      radius="xl"
                      size="md"
                    >
                      {user.firstname?.charAt(0)}
                      {user.lastname?.charAt(0)}
                    </Avatar>
                  </Table.Td>

                  {/* Nom */}
                  <Table.Td>
                    <Text fw={500}>
                      {getFullName(user)}
                    </Text>
                  </Table.Td>

                  {/* Username */}
                  <Table.Td>
                    <Text size="sm">
                      @{user.username}
                    </Text>
                  </Table.Td>

                  {/* Type */}
                  <Table.Td ta="center">
                    <Badge
                      color={getUserTypeColor(
                        user.type
                      )}
                      variant="light"
                      radius="xl"
                    >
                      {getUserType(user.type)}
                    </Badge>
                  </Table.Td>

                  {/* Actions */}
                  <Table.Td ta="center">
                    <Menu
                      shadow="md"
                      width={180}
                      position="bottom-end"
                    >
                      <Menu.Target>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                        >
                          <MoreHorizontal
                            size={18}
                          />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={
                            <Pencil size={16} />
                          }
                          onClick={() =>
                            onEdit(user)
                          }
                        >
                          Modifier
                        </Menu.Item>

                        <Menu.Divider />

                        <Menu.Item
                          color="red"
                          leftSection={
                            <Trash2 size={16} />
                          }
                          onClick={() =>
                            deleteUser(user.id)
                          }
                        >
                          Supprimer
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </div>
    </Card>
  );
}