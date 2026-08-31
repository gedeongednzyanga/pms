
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import {
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
  IconAlertTriangle,
  IconX,
} from "@tabler/icons-react";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Pagination,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Loader,
  Center,
} from "@mantine/core";

import { notifications } from "@mantine/notifications";

import { Crime } from "../interfaces/crime";
import { PaginatedResponse } from "../interfaces/pagination";
import { useNavigate } from "react-router";
import CrimeDetails from "./crimes/crimes-detail";

type CrimesProps = {
  onCreate?: () => void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
};

export default function Crimes({
  onEdit
}: CrimesProps) {
  const navigate = useNavigate();

  const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);
  const [crimes, setCrimes] = useState<Crime[]>([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const perPage = 10;

  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

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
          search: search.trim(),
        }
      );

      setCrimes(response.data);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error("Erreur chargement crimes :", error);

      setCrimes([]);
      setTotalPages(1);

      notifications.show({
        title: "Erreur",
        message: "Impossible de charger les infractions.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Recharger lorsque la page ou le filtre change
   */
  useEffect(() => {
    loadCrimes();
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

    // Retour à la première page
    setPage(1);
  };

  /**
   * Effacer la recherche
   */
  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  /**
   * ============================
   * Suppression
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
      console.error("Erreur suppression :", error);

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

  return (
    <>
      <Stack gap="lg">

        {/* =========================
            HEADER
        ========================== */}
        <Group
          justify="space-between"
          align="center"
          wrap="wrap"
          gap="md"
        >
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
          padding="lg"
        >

          {/* =========================
              TOOLBAR / FILTRE
          ========================== */}
          <Group
            justify="space-between"
            align="center"
            mb="md"
            wrap="wrap"
            gap="sm"
          >
            <div>
              <Text fw={600}>
                Liste des infractions
              </Text>

              <Text size="xs" c="dimmed">
                {crimes.length} résultat
                {crimes.length > 1 ? "s" : ""}
              </Text>
            </div>

            <TextInput
              placeholder="Rechercher une infraction..."
              leftSection={
                <IconSearch size={17} />
              }
              rightSection={
                search ? (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={clearSearch}
                    aria-label="Effacer la recherche"
                  >
                    <IconX size={15} />
                  </ActionIcon>
                ) : null
              }
              value={search}
              onChange={handleSearch}
              w={{ base: "100%", sm: 300 }}
              radius="md"
            />
          </Group>

          {/* =========================
              TABLE
          ========================== */}
          <ScrollArea
            type="auto"
            offsetScrollbars
          >
            <Table
              highlightOnHover
              verticalSpacing="sm"
              withTableBorder
              withColumnBorders
              miw={700}
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

                  <Table.Th
                    ta="center"
                    style={{ width: 150 }}
                  >
                    Actions
                  </Table.Th>

                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>

                {/* Loading */}
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
                            Chargement...
                          </Text>
                        </Stack>
                      </Center>
                    </Table.Td>
                  </Table.Tr>
                ) : crimes.length === 0 ? (

                  /* Aucun résultat */
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Stack
                        align="center"
                        gap={4}
                        py="xl"
                      >
                        <IconSearch
                          size={32}
                          stroke={1.5}
                          opacity={0.4}
                        />

                        <Text
                          ta="center"
                          fw={500}
                        >
                          {search
                            ? "Aucune infraction trouvée"
                            : "Aucune infraction enregistrée"}
                        </Text>

                        <Text
                          size="sm"
                          c="dimmed"
                          ta="center"
                        >
                          {search
                            ? "Essayez avec un autre terme de recherche."
                            : "Commencez par ajouter une nouvelle infraction."}
                        </Text>

                        {search && (
                          <Button
                            variant="light"
                            size="xs"
                            mt="xs"
                            onClick={clearSearch}
                          >
                            Réinitialiser la recherche
                          </Button>
                        )}
                      </Stack>
                    </Table.Td>
                  </Table.Tr>

                ) : (

                  /* Résultats */
                  crimes.map((crime, index) => (
                    <Table.Tr key={crime.id}>

                      {/* Numéro */}
                      <Table.Td ta="center">
                        {(page - 1) * perPage +
                          index +
                          1}
                      </Table.Td>

                      {/* Date */}
                      <Table.Td>
                        <Text size="sm">
                          {formatDate(
                            crime.created_at
                          )}
                        </Text>
                      </Table.Td>

                      {/* Nom */}
                      <Table.Td>
                        <Text fw={500}>
                          {crime.crime_name}
                        </Text>
                      </Table.Td>

                      {/* Statut */}
                      <Table.Td ta="center">
                        {crime.statut_crime ===
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
                      <Table.Td>
                        <Group
                          justify="center"
                          gap={4}
                        >

                          {/* Voir */}
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => setSelectedCrime(crime)}
                            aria-label="Voir"
                          >
                            <IconEye size={18} />
                          </ActionIcon>

                          {/* Modifier */}
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

                          {/* Supprimer */}
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
                  ))
                )}

              </Table.Tbody>
            </Table>
          </ScrollArea>

          {/* =========================
              PAGINATION
          ========================== */}
          {totalPages > 1 && !loading && (
            <Group
              justify="center"
              mt="lg"
            >
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                withEdges
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
        radius="md"
      >
        <Stack>

          <Group gap="sm" align="flex-start">
            <IconAlertTriangle
              size={25}
              color="red"
            />

            <Text>
              Êtes-vous sûr de vouloir supprimer
              ce crime ?
            </Text>
          </Group>

          <Text
            size="sm"
            c="dimmed"
          >
            Cette action supprimera définitivement
            le crime de la liste.
          </Text>

          <Group
            justify="flex-end"
            mt="md"
          >
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

      <Modal
        opened={selectedCrime !== null}
        onClose={() => setSelectedCrime(null)}
        title="Détails du crime"
        centered
        size="md"
        radius="md"
      >
        {selectedCrime && (
          <CrimeDetails
            crime={selectedCrime}
            onClose={() => setSelectedCrime(null)}
            onEdit={() => navigate(`/crimes/${selectedCrime.id}/edit`)}
            // onEdit={() => {
            //   onEdit?.(selectedCrime.id);
            //   setSelectedCrime(null);
            // }}
          />
        )}
      </Modal>

    </>
  );
}

/**
 * ============================
 * Formater la date
 * ============================
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
