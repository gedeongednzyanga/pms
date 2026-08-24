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
  Menu,
  Select,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

interface Inmate {
  id: number;
  code: string;
  firstname: string;
  lastname: string;
  middlename?: string;
  date_created: string;
  date_to?: string | null;
  status: number;
  photo?: string | null;
}

const inmates: Inmate[] = [
  {
    id: 1,
    code: "DET-2026-001",
    firstname: "Jean",
    lastname: "Dupont",
    middlename: "",
    date_created: "2026-08-20 09:30",
    date_to: null,
    status: 1,
  },
  {
    id: 2,
    code: "DET-2026-002",
    firstname: "Patrick",
    lastname: "Kabeya",
    middlename: "David",
    date_created: "2026-08-19 14:20",
    date_to: null,
    status: 1,
  },
  {
    id: 3,
    code: "DET-2026-003",
    firstname: "Michel",
    lastname: "Mwamba",
    middlename: "",
    date_created: "2026-08-15 11:45",
    date_to: "2026-08-22",
    status: 1,
  },
  {
    id: 4,
    code: "DET-2026-004",
    firstname: "Joseph",
    lastname: "Kambale",
    middlename: "",
    date_created: "2026-08-10 08:15",
    date_to: null,
    status: 0,
  },
];

export default function Inmates() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(
    "all"
  );

  const filteredInmates = useMemo(() => {
    return inmates.filter((inmate) => {
      const name = [
        inmate.lastname,
        inmate.firstname,
        inmate.middlename,
      ]
        .filter(Boolean)
        .join(" ");

      const searchValue = search.toLowerCase();

      const matchesSearch =
        name.toLowerCase().includes(searchValue) ||
        inmate.code.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        statusFilter === null ||
        getStatus(inmate) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <Text
            size="xl"
            fw={700}
            className="text-slate-800"
          >
            Liste des détenus
          </Text>

          <Text
            size="sm"
            c="dimmed"
          >
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

      {/* =========================
          STATISTICS
      ========================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <MiniStat
          label="Total détenus"
          value={inmates.length}
          icon={<IconUser size={20} />}
        />

        <MiniStat
          label="Actifs"
          value={
            inmates.filter(
              (item) => getStatus(item) === "active"
            ).length
          }
          icon={<IconUser size={20} />}
        />

        <MiniStat
          label="Libérés"
          value={
            inmates.filter(
              (item) => getStatus(item) === "released"
            ).length
          }
          icon={<IconUser size={20} />}
        />

        <MiniStat
          label="Inactifs"
          value={
            inmates.filter(
              (item) => getStatus(item) === "inactive"
            ).length
          }
          icon={<IconUser size={20} />}
        />

      </div>

      {/* =========================
          TABLE CARD
      ========================== */}

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

              <Text
                size="xs"
                c="dimmed"
              >
                {filteredInmates.length} résultat
                {filteredInmates.length > 1 ? "s" : ""}
              </Text>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">

              {/* Search */}

              <TextInput
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.currentTarget.value
                  )
                }
                placeholder="Rechercher..."
                leftSection={
                  <IconSearch size={16} />
                }
                className="sm:w-64"
              />

              {/* Status */}

              <Select
                value={statusFilter}
                onChange={setStatusFilter}
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
                leftSection={
                  <IconFilter size={16} />
                }
                className="sm:w-48"
              />

              <Tooltip label="Actualiser">
                <ActionIcon
                  variant="default"
                  size="lg"
                  aria-label="Actualiser"
                >
                  <IconRefresh size={17} />
                </ActionIcon>
              </Tooltip>

            </div>

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <Table
            highlightOnHover
            verticalSpacing="md"
            horizontalSpacing="md"
          >

            <Table.Thead>
              <Table.Tr>

                <Table.Th>#</Table.Th>

                <Table.Th>
                  Code
                </Table.Th>

                <Table.Th>
                  Détenu
                </Table.Th>

                <Table.Th>
                  Date d'enregistrement
                </Table.Th>

                <Table.Th>
                  Date de libération
                </Table.Th>

                <Table.Th>
                  Statut
                </Table.Th>

                <Table.Th className="text-right">
                  Actions
                </Table.Th>

              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>

              {filteredInmates.length > 0 ? (
                filteredInmates.map(
                  (inmate, index) => (
                    <InmateRow
                      key={inmate.id}
                      inmate={inmate}
                      index={index}
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
                        handleDelete(inmate)
                      }
                    />
                  )
                )
              ) : (
                <Table.Tr>

                  <Table.Td
                    colSpan={7}
                  >
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
                        Essayez de modifier vos critères
                        de recherche.
                      </Text>

                    </div>
                  </Table.Td>

                </Table.Tr>
              )}

            </Table.Tbody>

          </Table>

        </div>

      </Card>

    </div>
  );
}

/* =========================
   INMATE ROW
========================= */

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
        <Text
          size="sm"
          c="dimmed"
        >
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
            src={inmate.photo}
            radius="xl"
            size={38}
            color="blue"
          >
            {inmate.firstname.charAt(0)}
            {inmate.lastname.charAt(0)}
          </Avatar>

          <div className="min-w-0">

            <Text
              size="sm"
              fw={500}
              className="truncate"
            >
              {name}
            </Text>

            <Text
              size="xs"
              c="dimmed"
            >
              ID #{inmate.id}
            </Text>

          </div>

        </div>

      </Table.Td>

      {/* DATE */}

      <Table.Td>

        <Text size="sm">
          {formatDate(
            inmate.date_created
          )}
        </Text>

      </Table.Td>

      {/* RELEASE DATE */}

      <Table.Td>

        {inmate.date_to ? (
          <Text size="sm">
            {formatDate(
              inmate.date_to
            )}
          </Text>
        ) : (
          <Text
            size="sm"
            c="dimmed"
          >
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
                leftSection={
                  <IconEye size={16} />
                }
                onClick={onView}
              >
                Voir
              </Menu.Item>

              <Menu.Item
                leftSection={
                  <IconEdit size={16} />
                }
                onClick={onEdit}
              >
                Modifier
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                color="red"
                leftSection={
                  <IconTrash size={16} />
                }
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

/* =========================
   STAT
========================= */

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
          <Text
            size="sm"
            c="dimmed"
          >
            {label}
          </Text>

          <Text
            size="xl"
            fw={700}
            mt={4}
          >
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

/* =========================
   STATUS
========================= */

function StatusBadge({
  status,
}: {
  status: string;
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

/* =========================
   STATUS LOGIC
========================= */

function getStatus(
  inmate: Inmate
): "active" | "inactive" | "released" {
  if (
    inmate.date_to &&
    new Date(inmate.date_to) <=
      new Date()
  ) {
    return "released";
  }

  if (inmate.status === 1) {
    return "active";
  }

  return "inactive";
}

/* =========================
   DATE
========================= */

function formatDate(
  date: string
) {
  const value = new Date(date);

  return value.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

/* =========================
   DELETE
========================= */

function handleDelete(
  inmate: Inmate
) {
  const confirmed =
    window.confirm(
      `Voulez-vous vraiment supprimer le détenu "${inmate.firstname} ${inmate.lastname}" ?`
    );

  if (!confirmed) {
    return;
  }

  console.log(
    "Delete inmate:",
    inmate.id
  );

  // Plus tard :
  // await invoke("delete_inmate_cmd", {
  //   id: inmate.id
  // });
}