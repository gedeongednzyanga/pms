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
  Button,
  Card,
  Center,
  Group,
  Loader,
  Menu,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { Utilisateur } from "../../interfaces/user";
import { notifications } from "@mantine/notifications";
import { PaginatedResponse } from "../../interfaces/pagination";

interface UserListProps {
  onCreate: () => void;
  onEdit: (user: Utilisateur) => void;
  refreshKey: number;
}

export default function UserList({
  onCreate,
  onEdit,
  refreshKey,
}: UserListProps) {
  const [users, setUsers] = useState<Utilisateur[]>([]);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
  try {
    setLoading(true);

    const result = await invoke<
      PaginatedResponse<Utilisateur>
    >("get_users_cmd", {
      page,
      per_page: perPage,
      search: "",
    });

    setUsers(result.data);

    setTotal(result.total);
    setTotalPages(result.total_pages);
  } catch (error) {
    console.error(
      "Erreur chargement utilisateurs :",
      error
    );

    notifications.show({
      title: "Erreur",
      message: "Erreur lors du chargement des utilisateurs.",
      color: "red",
    });
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadUsers();
  }, [page, perPage, refreshKey]);

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

  const getFullName = (user: Utilisateur) => {
    return [
      user.first_name,
      user.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  };

  // const getUserType = (type: number) => {
  //   switch (type) {
  //     case 1:
  //       return "Administrateur";

  //     case 2:
  //       return "Personnel";

  //     default:
  //       return "N/A";
  //   }
  // };

  // const getUserTypeColor = (type: number) => {
  //   switch (type) {
  //     case 1:
  //       return "blue";

  //     case 2:
  //       return "gray";

  //     default:
  //       return "dark";
  //   }
  // };

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
        <Table>
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
        style={{ width: 100 }}
      >
        Actions
      </Table.Th>
    </Table.Tr>
  </Table.Thead>

  <Table.Tbody>
    {loading ? (
      <Table.Tr>
        <Table.Td colSpan={6}>
          <Center py="xl">
            <Stack align="center" gap="xs">
              <Loader size="sm" />

              <Text size="sm" c="dimmed">
                Chargement des utilisateurs...
              </Text>
            </Stack>
          </Center>
        </Table.Td>
      </Table.Tr>
    ) : users.length === 0 ? (
      <Table.Tr>
        <Table.Td colSpan={6}>
          <Center py="xl">
            <Stack align="center" gap="xs">
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

          <Table.Td>
            {(page - 1) * perPage + index + 1}
          </Table.Td>

          <Table.Td>
            <Text size="sm">
              {formatDate(user.updated_at ?? "")}
            </Text>
          </Table.Td>

          <Table.Td ta="center">
            <Avatar
              radius="xl"
              size="md"
              color="blue"
              alt={getFullName(user)}
            >
              {user.first_name?.charAt(0)}
              {user.last_name?.charAt(0)}
            </Avatar>
          </Table.Td>

          <Table.Td>
            <Text fw={500}>
              {getFullName(user)}
            </Text>
          </Table.Td>

          <Table.Td>
            <Text size="sm">
              @{user.user_name}
            </Text>
          </Table.Td>

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
                  <MoreHorizontal size={18} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>

                <Menu.Item
                  leftSection={<Pencil size={16} />}
                  onClick={() => onEdit(user)}
                >
                  Modifier
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  color="red"
                  leftSection={<Trash2 size={16} />}
                  onClick={() => deleteUser(user.id)}
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
<Group
  justify="space-between"
  px="lg"
  py="md"
>
  <Text size="sm" c="dimmed">
    {total} utilisateur{total > 1 ? "s" : ""}
  </Text>

  <Group gap="sm">
    <Select
      value={String(perPage)}
      onChange={(value) => {
        setPerPage(Number(value));
        setPage(1);
      }}
      data={[
        { value: "10", label: "10 / page" },
        { value: "20", label: "20 / page" },
        { value: "50", label: "50 / page" },
        { value: "100", label: "100 / page" },
      ]}
      w={120}
    />

    <Pagination
      value={page}
      onChange={setPage}
      total={totalPages}
    />
  </Group>
</Group>
      </div>
    </Card>
  );
}