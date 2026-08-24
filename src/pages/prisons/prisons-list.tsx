import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Eye,
  Pencil,
  Plus,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  Table,
  Text,
  Title,
  Loader,
  Center,
  Stack,
} from "@mantine/core";

export interface Prison {
  id: number;
  name: string;
  status: number;
  date_created: string;
  delete_flag: number;
}

interface PrisonListProps {
  onCreate: () => void;
  onEdit: (prison: Prison) => void;
  onView: (prison: Prison) => void;
}

export default function PrisonList({
  onCreate,
  onEdit,
  onView,
}: PrisonListProps) {
  const [prisons, setPrisons] = useState<Prison[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPrisons = async () => {
    try {
      setLoading(true);

      const result = await invoke<Prison[]>("get_prisons_cmd");

      setPrisons(result);
    } catch (error) {
      console.error("Erreur chargement des prisons :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrisons();
  }, []);

  const deletePrison = async (id: number) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer définitivement cette prison ?"
    );

    if (!confirmed) return;

    try {
      await invoke("delete_prison_cmd", { id });

      await loadPrisons();
    } catch (error) {
      console.error("Erreur suppression prison :", error);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
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
          borderBottom: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <div>
          <Title order={3}>
            Liste des prisons
          </Title>

          <Text
            size="sm"
            c="dimmed"
            mt={3}
          >
            Gérez les prisons enregistrées
          </Text>
        </div>

        <Button
          leftSection={<Plus size={17} />}
          onClick={onCreate}
        >
          Nouvelle prison
        </Button>
      </Group>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <Table
          striped
          highlightOnHover
          withTableBorder={false}
          verticalSpacing="sm"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 60 }}>
                #
              </Table.Th>

              <Table.Th>
                Date de création
              </Table.Th>

              <Table.Th>
                Nom
              </Table.Th>

              <Table.Th
                ta="center"
                style={{ width: 120 }}
              >
                Statut
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
                <Table.Td colSpan={5}>
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
                        Chargement des prisons...
                      </Text>
                    </Stack>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : prisons.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Center py="xl">
                    <Text c="dimmed">
                      Aucune prison enregistrée
                    </Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : (
              prisons.map((prison, index) => (
                <Table.Tr key={prison.id}>
                  <Table.Td>
                    {index + 1}
                  </Table.Td>

                  <Table.Td>
                    <Text size="sm">
                      {formatDate(
                        prison.date_created
                      )}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Text fw={500}>
                      {prison.name}
                    </Text>
                  </Table.Td>

                  <Table.Td ta="center">
                    {prison.status === 1 ? (
                      <Badge
                        color="green"
                        variant="light"
                        radius="xl"
                      >
                        Actif
                      </Badge>
                    ) : (
                      <Badge
                        color="red"
                        variant="light"
                        radius="xl"
                      >
                        Inactif
                      </Badge>
                    )}
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
                          <MoreHorizontal
                            size={18}
                          />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={
                            <Eye size={16} />
                          }
                          onClick={() =>
                            onView(prison)
                          }
                        >
                          Voir
                        </Menu.Item>

                        <Menu.Item
                          leftSection={
                            <Pencil size={16} />
                          }
                          onClick={() =>
                            onEdit(prison)
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
                            deletePrison(
                              prison.id
                            )
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