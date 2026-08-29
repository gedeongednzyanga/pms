import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import {
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
  IconAlertTriangle,
} from "@tabler/icons-react";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Pagination,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";

import { notifications } from "@mantine/notifications";
import { Crime } from "../interfaces/crime";
import { PaginatedResponse } from "../interfaces/pagination";
import { useNavigate } from "react-router";

type CrimesProps = {
  onCreate?: () => void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
};

export default function Crimes({
  onEdit,
  onView,
}: CrimesProps) {
  const [crimes, setCrimes] = useState<Crime[]>([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 10;

  const [loading, setLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  // const [crimes, setCrimes] = useState<Crime[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  /**
   * ============================
   * Charger les crimes
   * ============================
   */
  
  const loadCrimes = async () => {
    try {
      setLoading(true);

      const response = await invoke<PaginatedResponse<Crime>>(
        "get_crimes_cmd",
        {
          page,
          perPage,
        }
      );

      setCrimes(response.data);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error(error);

      setCrimes([]);

      notifications.show({
        title: "Erreur",
        message: "Impossible de charger les infractions.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrimes();
  }, []);

  /**
   * ============================
   * Supprimer
   * ============================
   */
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setLoading(true);

      await invoke("delete_crime_cmd", {
        id: deleteId,
      });

      notifications.show({
        title: "Crime supprimé",
        message: "Le crime a été supprimé avec succès.",
        color: "green",
      });

      setDeleteId(null);

      await loadCrimes();
    } catch (error) {
      console.error(error);

      notifications.show({
        title: "Erreur",
        message:
          typeof error === "string"
            ? error
            : "Impossible de supprimer le crime.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================
   * Changement recherche
   * ============================
   */
  const handleSearch = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearch(event.currentTarget.value);
    setPage(1);
  };

  const navigate = useNavigate();

  return (
    <>
      <Stack gap="lg">
        {/* =========================
            HEADER
        ========================== */}
        <Group justify="space-between">
          <div>
            <Text size="xl" fw={700}>
              Infractions
            </Text>

            <Text size="sm" c="dimmed">
              Gestion des infractions enregistrées
            </Text>
          </div>

          <Button
            leftSection={<IconPlus size={17} />}
            onClick={() => navigate("/crimes/new")}
          >
            Nouveau crime
          </Button>
        </Group>

        {/* =========================
            CARD
        ========================== */}
        <Card
          withBorder
          radius="md"
          shadow="sm"
          padding="lg"
        >
          {/* Toolbar */}
          <Group justify="space-between" mb="md">
            <Text fw={600}>
              Liste des crimes
            </Text>

            <TextInput
              placeholder="Rechercher un crime..."
              leftSection={
                <IconSearch size={17} />
              }
              value={search}
              onChange={handleSearch}
              w={280}
            />
          </Group>

          {/* Table */}
          <Table
            highlightOnHover
            verticalSpacing="sm"
            withTableBorder
            withColumnBorders
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

                <Table.Th ta="center">
                  Statut
                </Table.Th>

                <Table.Th ta="center">
                  Actions
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {crimes.length === 0 ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={5}
                  >
                    <Text
                      ta="center"
                      c="dimmed"
                      py="xl"
                    >
                      Aucun crime trouvé.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                crimes.map(
                  (crime, index) => (
                    <Table.Tr key={crime.id}>
                      {/* # */}
                      <Table.Td ta="center">
                        {(page - 1) * perPage +
                          index +
                          1}
                      </Table.Td>

                      {/* Date */}
                      <Table.Td>
                        {formatDate(
                          crime.created_at
                        )}
                      </Table.Td>

                      {/* Nom */}
                      <Table.Td>
                        <Text fw={500}>
                          {crime.crime_name}
                        </Text>
                      </Table.Td>

                      {/* Statut */}
                      <Table.Td ta="center">
                        {crime.statut_crime === "active" ? (
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
                      <Table.Td>
                        <Group
                          justify="center"
                          gap={4}
                        >
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() =>
                              onView?.(crime.id)
                            }
                            aria-label="Voir"
                          >
                            <IconEye size={18} />
                          </ActionIcon>

                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() =>
                              onEdit?.(crime.id)
                            }
                            aria-label="Modifier"
                          >
                            <IconEdit size={18} />
                          </ActionIcon>

                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() =>
                              setDeleteId(
                                crime.id
                              )
                            }
                            aria-label="Supprimer"
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  )
                )
              )}
            </Table.Tbody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <Group
              justify="center"
              mt="lg"
            >
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
              />
            </Group>
          )}
        </Card>
      </Stack>

      {/* =========================
          DELETE MODAL
      ========================== */}
      <Modal
        opened={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Supprimer le crime"
        centered
      >
        <Stack>
          <Group gap="sm">
            <IconAlertTriangle
              size={25}
              color="red"
            />

            <Text>
              Êtes-vous sûr de vouloir supprimer
              ce crime ?
            </Text>
          </Group>

          <Text size="sm" c="dimmed">
            Cette action supprimera le crime de la
            liste.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button
              variant="default"
              onClick={() =>
                setDeleteId(null)
              }
            >
              Annuler
            </Button>

            <Button
              color="red"
              loading={loading}
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

/**
 * Formater la date
 */
function formatDate(date: string) {
  if (!date) return "-";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return value.toLocaleString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}