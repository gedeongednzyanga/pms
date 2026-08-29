import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import {
  Eye,
  Pencil,
  Plus,
  Trash2,
  MoreHorizontal,
  Search,
} from "lucide-react";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Menu,
  Pagination,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import { PaginatedResponse } from "../../interfaces/pagination";

export type Prison = {
  id: string;
  prison_name: string;
  address_prison: string | null;
  statut_prison: string;
  created_at: string;
  updated_at: string;
};

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

  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");

  /**
   * ============================
   * Charger les prisons
   * ============================
   */
  const loadPrisons = async () => {
    try {
      setLoading(true);

      const result = await invoke<PaginatedResponse<Prison>>(
        "get_prisons_cmd",
        {
          page,
          per_page: perPage,
          search: search.trim() || null,
        }
      );

      console.log("Prisons :", result);

      setPrisons(result.data);
      setTotalPages(result.total_pages);
      setTotal(result.total);
    } catch (error) {
      console.error(
        "Erreur chargement des prisons :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================
   * Charger au changement
   * ============================
   */
  useEffect(() => {
    loadPrisons();
  }, [page, search]);

  /**
   * ============================
   * Recherche
   * ============================
   */
  const handleSearch = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearch(event.currentTarget.value);
    setPage(1);
  };

  /**
   * ============================
   * Suppression
   * ============================
   */
  const deletePrison = async (id: string) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer définitivement cette prison ?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await invoke("delete_prison_cmd", {
        id,
      });

      // Si on supprime le dernier élément de la page
      if (prisons.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadPrisons();
      }
    } catch (error) {
      console.error(
        "Erreur suppression prison :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================
   * Date
   * ============================
   */
  const formatDate = (date: string) => {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleString("fr-FR", {
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
      {/* =========================
          HEADER
      ========================== */}
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

      {/* =========================
          TOOLBAR
      ========================== */}
      <Group
        justify="space-between"
        px="lg"
        py="md"
      >
        <Text size="sm" c="dimmed">
          {total} prison{total > 1 ? "s" : ""} enregistrée
          {total > 1 ? "s" : ""}
        </Text>

        <TextInput
          placeholder="Rechercher une prison..."
          leftSection={<Search size={17} />}
          value={search}
          onChange={handleSearch}
          w={280}
          // clearable
        />
      </Group>

      {/* =========================
          TABLE
      ========================== */}
      <div
        style={{
          overflowX: "auto",
        }}
      >
        <Table
          striped
          highlightOnHover
          withTableBorder={false}
          verticalSpacing="sm"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th
                style={{ width: 60 }}
              >
                #
              </Table.Th>

              <Table.Th>
                Date de création
              </Table.Th>

              <Table.Th>
                Nom
              </Table.Th>

              <Table.Th>
                Adresse
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
            {/* Loading */}
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
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
              /* Aucun résultat */
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Center py="xl">
                    <Stack
                      align="center"
                      gap="xs"
                    >
                      <Text
                        fw={500}
                        c="dimmed"
                      >
                        {search
                          ? "Aucune prison trouvée."
                          : "Aucune prison enregistrée."}
                      </Text>

                      {search && (
                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => {
                            setSearch("");
                            setPage(1);
                          }}
                        >
                          Réinitialiser la recherche
                        </Button>
                      )}
                    </Stack>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : (
              prisons.map(
                (prison, index) => (
                  <Table.Tr key={prison.id}>
                    {/* Numéro */}
                    <Table.Td>
                      {(page - 1) * perPage +
                        index +
                        1}
                    </Table.Td>

                    {/* Date */}
                    <Table.Td>
                      <Text size="sm">
                        {formatDate(
                          prison.created_at
                        )}
                      </Text>
                    </Table.Td>

                    {/* Nom */}
                    <Table.Td>
                      <Text fw={500}>
                        {prison.prison_name}
                      </Text>
                    </Table.Td>

                    {/* Adresse */}
                    <Table.Td>
                      <Text
                        size="sm"
                        c={
                          prison.address_prison
                            ? undefined
                            : "dimmed"
                        }
                      >
                        {prison.address_prison ||
                          "-"}
                      </Text>
                    </Table.Td>

                    {/* Statut */}
                    <Table.Td ta="center">
                      {prison.statut_prison ===
                      "active" ? (
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
                )
              )
            )}
          </Table.Tbody>
        </Table>
      </div>

      {/* =========================
          PAGINATION
      ========================== */}
      {!loading && totalPages > 1 && (
        <Group
          justify="center"
          py="lg"
          style={{
            borderTop:
              "1px solid var(--mantine-color-gray-3)",
          }}
        >
          <Pagination
            value={page}
            onChange={setPage}
            total={totalPages}
          />
        </Group>
      )}
    </Card>
  );
}