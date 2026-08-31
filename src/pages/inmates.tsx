
import {
  IconEye,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUser,
  IconFilter,
  IconRefresh,
} from "@tabler/icons-react";

import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Loader,
  Menu,
  Select,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

import { Inmate } from "../interfaces/inmate";
import { PaginatedResponse } from "../interfaces/pagination";

/* =========================================================
   TYPES
========================================================= */

type InmateStatus = "active" | "inactive" | "released";

/* =========================================================
   PAGE
========================================================= */

export default function Inmates() {
  const navigate = useNavigate();

  const [inmates, setInmates] = useState<Inmate[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  /* =======================================================
     CHARGEMENT
  ======================================================= */

  const loadInmates = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const result = await invoke<PaginatedResponse<Inmate>>(
          "get_inmates_cmd",
          {
            page,
            perPage,
            search: search.trim() || null,
          }
        );

        setInmates(result.data);

        /*
         * Adapte ces deux propriétés si ton PaginatedResponse
         * utilise d'autres noms.
         */
        setTotal(result.total ?? 0);
        setTotalPages(result.total_pages ?? 1);
      } catch (error) {
        console.error("Erreur chargement détenus :", error);

        toast.error(
          typeof error === "string"
            ? error
            : "Impossible de charger la liste des détenus."
        );

        setInmates([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [page, perPage, search]
  );

  /* =======================================================
     PREMIER CHARGEMENT / RECHERCHE / PAGINATION
  ======================================================= */

  useEffect(() => {
    loadInmates();
  }, [loadInmates]);

  /* =======================================================
     RESET PAGE LORS D'UNE NOUVELLE RECHERCHE
  ======================================================= */

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  /* =======================================================
     ACTUALISER
  ======================================================= */

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await loadInmates(false);

      toast.success("Liste des détenus actualisée.");
    } finally {
      setRefreshing(false);
    }
  };

  /* =======================================================
     SUPPRESSION
  ======================================================= */

  const handleDelete = async (id: string) => {
    const inmate = inmates.find((item) => item.id === id);

    if (!inmate) {
      return;
    }

    const fullName = [
      inmate.lastname,
      inmate.firstname,
      inmate.middlename,
    ]
      .filter(Boolean)
      .join(" ");

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le détenu "${fullName}" ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await invoke("delete_inmate_cmd", {
        id,
      });

      toast.success("Détenu supprimé avec succès.");

      /*
       * Si on vient de supprimer le dernier élément
       * de la page actuelle, revenir à la page précédente.
       */
      if (inmates.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadInmates(false);
      }
    } catch (error) {
      console.error("Erreur suppression détenu :", error);

      toast.error(
        typeof error === "string"
          ? error
          : "Impossible de supprimer le détenu."
      );
    }
  };

  /* =======================================================
     FILTRE LOCAL DU STATUT
  ======================================================= */

  const filteredInmates = useMemo(() => {
    if (statusFilter === "all") {
      return inmates;
    }

    return inmates.filter(
      (inmate) => getStatus(inmate) === statusFilter
    );
  }, [inmates, statusFilter]);

  /* =======================================================
     STATISTIQUES
  ======================================================= */

  const activeCount = useMemo(
    () =>
      inmates.filter(
        (inmate) => getStatus(inmate) === "active"
      ).length,
    [inmates]
  );

  const releasedCount = useMemo(
    () =>
      inmates.filter(
        (inmate) => getStatus(inmate) === "released"
      ).length,
    [inmates]
  );

  const inactiveCount = useMemo(
    () =>
      inmates.filter(
        (inmate) => getStatus(inmate) === "inactive"
      ).length,
    [inmates]
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Text
            size="xl"
            fw={700}
            className="text-slate-800"
          >
            Liste des détenus
          </Text>

          <Text size="sm" c="dimmed">
            Gérez les détenus enregistrés dans le système.
          </Text>
        </div>

        <Button
          leftSection={<IconPlus size={17} />}
          onClick={() => navigate("/inmates/new")}
        >
          Ajouter un détenu
        </Button>
      </div>

      {/* =================================================
          STATISTIQUES
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat
          label="Total détenus"
          value={total}
          icon={<IconUser size={20} />}
        />

        <MiniStat
          label="Actifs"
          value={activeCount}
          icon={<IconUser size={20} />}
        />

        <MiniStat
          label="Libérés"
          value={releasedCount}
          icon={<IconUser size={20} />}
        />

        <MiniStat
          label="Inactifs"
          value={inactiveCount}
          icon={<IconUser size={20} />}
        />
      </div>

      {/* =================================================
          TABLE CARD
      ================================================= */}

      <Card
        withBorder
        radius="md"
        padding={0}
        className="overflow-hidden"
      >
        {/* TABLE HEADER */}

        <div className="border-b border-slate-200 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Text fw={600}>
                Détenus enregistrés
              </Text>

              <Text size="xs" c="dimmed">
                {filteredInmates.length} résultat
                {filteredInmates.length > 1 ? "s" : ""}
              </Text>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* SEARCH */}

              <TextInput
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                  setPage(1);
                }}
                placeholder="Rechercher..."
                leftSection={<IconSearch size={16} />}
                className="sm:w-64"
              />

              {/* STATUS */}

              <Select
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value ?? "all");
                  setPage(1);
                }}
                data={[
                  {
                    value: "all",
                    label: "Tous les statuts",
                  },
                  {
                    value: "active",
                    label: "Actifs",
                  },
                  {
                    value: "inactive",
                    label: "Inactifs",
                  },
                  {
                    value: "released",
                    label: "Libérés",
                  },
                ]}
                leftSection={<IconFilter size={16} />}
                className="sm:w-48"
              />

              {/* REFRESH */}

              <Tooltip label="Actualiser">
                <ActionIcon
                  variant="default"
                  size="lg"
                  aria-label="Actualiser"
                  onClick={handleRefresh}
                  disabled={loading || refreshing}
                >
                  <IconRefresh
                    size={17}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />
                </ActionIcon>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-x-auto">
          <Table
            highlightOnHover
            verticalSpacing="md"
            horizontalSpacing="md"
            striped
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>

                <Table.Th>Code</Table.Th>

                <Table.Th>Détenu</Table.Th>

                <Table.Th>
                  Date d'enregistrement
                </Table.Th>

                <Table.Th>
                  Date de libération
                </Table.Th>

                <Table.Th>Statut</Table.Th>

                <Table.Th className="text-right">
                  Actions
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {/* LOADING */}

              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Center py="xl">
                      <div className="flex items-center gap-3">
                        <Loader size="sm" />

                        <Text size="sm" c="dimmed">
                          Chargement des détenus...
                        </Text>
                      </div>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : filteredInmates.length > 0 ? (
                filteredInmates.map((inmate, index) => (
                  <InmateRow
                    key={inmate.id}
                    inmate={inmate}
                    index={
                      (page - 1) * perPage + index
                    }
                    onView={() =>
                      navigate(
                        `/inmates/${inmate.id}`
                      )
                    }
                    onEdit={() =>
                      navigate(
                        `/inmates/${inmate.id}/edit`
                      )
                    }
                    onDelete={() =>
                      handleDelete(inmate.id)
                    }
                  />
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <IconUser
                          size={24}
                          className="text-slate-400"
                        />
                      </div>

                      <Text fw={500}>
                        Aucun détenu trouvé
                      </Text>

                      <Text
                        size="sm"
                        c="dimmed"
                      >
                        {search ||
                        statusFilter !== "all"
                          ? "Essayez de modifier vos critères de recherche."
                          : "Aucun détenu n'est encore enregistré."}
                      </Text>
                    </div>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 p-4">
            <Text size="sm" c="dimmed">
              Page {page} sur {totalPages}
            </Text>

            <div className="flex gap-2">
              <Button
                variant="default"
                size="xs"
                disabled={page <= 1}
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
              >
                Précédent
              </Button>

              <Button
                variant="default"
                size="xs"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      totalPages,
                      current + 1
                    )
                  )
                }
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* =========================================================
   INMATE ROW
========================================================= */

interface InmateRowProps {
  inmate: Inmate;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function InmateRow({
  inmate,
  index,
  onView,
  onEdit,
  onDelete,
}: InmateRowProps) {
  const name = [
    inmate.lastname,
    inmate.firstname,
    inmate.middlename,
  ]
    .filter(Boolean)
    .join(" ");

  const status = getStatus(inmate);

  return (
    <Table.Tr>
      {/* # */}

      <Table.Td>
        <Text size="sm" c="dimmed">
          {index + 1}
        </Text>
      </Table.Td>

      {/* CODE */}

      <Table.Td>
        <Text
          size="sm"
          fw={600}
          className="text-slate-700"
        >
          {inmate.code}
        </Text>
      </Table.Td>

      {/* NAME */}

      <Table.Td>
        <div className="flex items-center gap-3">
          <Avatar
            src={
              inmate.photo_path
                ? inmate.photo_path
                : undefined
            }
            radius="xl"
            size={38}
            color="blue"
          >
            {inmate.firstname?.charAt(0)}
            {inmate.lastname?.charAt(0)}
          </Avatar>

          <div className="min-w-0">
            <Text
              size="sm"
              fw={500}
              className="truncate"
            >
              {name || "Nom non renseigné"}
            </Text>

            <Text size="xs" c="dimmed">
              ID #{inmate.id}
            </Text>
          </div>
        </div>
      </Table.Td>

      {/* DATE */}

      <Table.Td>
        <Text size="sm">
          {formatDate(inmate.created_at)}
        </Text>
      </Table.Td>

      {/* RELEASE DATE */}

      <Table.Td>
        {inmate.date_to ? (
          <Text size="sm">
            {formatDate(inmate.date_to)}
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            —
          </Text>
        )}
      </Table.Td>

      {/* STATUS */}

      <Table.Td>
        <StatusBadge status={status} />
      </Table.Td>

      {/* ACTIONS */}

      <Table.Td>
        <div className="flex justify-end">
          <Menu
            shadow="md"
            width={160}
            position="bottom-end"
          >
            <Menu.Target>
              <Button
                variant="light"
                size="xs"
              >
                Actions
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEye size={16} />}
                onClick={onView}
              >
                Voir
              </Menu.Item>

              <Menu.Item
                leftSection={<IconEdit size={16} />}
                onClick={onEdit}
              >
                Modifier
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={onDelete}
              >
                Supprimer
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </Table.Td>
    </Table.Tr>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

interface MiniStatProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

function MiniStat({
  label,
  value,
  icon,
}: MiniStatProps) {
  return (
    <Card
      withBorder
      radius="md"
      className="transition hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <Text size="sm" c="dimmed">
            {label}
          </Text>

          <Text size="xl" fw={700} mt={4}>
            {value}
          </Text>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: InmateStatus;
}) {
  if (status === "released") {
    return (
      <Badge
        color="blue"
        variant="light"
        radius="xl"
      >
        Libéré
      </Badge>
    );
  }

  if (status === "active") {
    return (
      <Badge
        color="green"
        variant="light"
        radius="xl"
      >
        Actif
      </Badge>
    );
  }

  return (
    <Badge
      color="red"
      variant="light"
      radius="xl"
    >
      Inactif
    </Badge>
  );
}

/* =========================================================
   STATUS LOGIC
========================================================= */

function getStatus(inmate: Inmate): InmateStatus {
  /*
   * Une date de libération passée ou aujourd'hui
   * signifie que le détenu est libéré.
   */
  if (inmate.date_to) {
    const releaseDate = new Date(inmate.date_to);

    if (
      !Number.isNaN(releaseDate.getTime()) &&
      releaseDate <= new Date()
    ) {
      return "active";
    }
  }

  /*
   * status = 1 => actif
   */
  if (Number(inmate.status) === 1) {
    return "active";
  }

  return "inactive";
}

/* =========================================================
   DATE
========================================================= */

function formatDate(date?: string | null): string {
  if (!date) {
    return "—";
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return value.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
