import { useEffect, useState } from "react";
import {
  IconBuilding,
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
;
import { useNavigate } from "react-router";

import { invoke } from "@tauri-apps/api/core";
import { notifications } from "@mantine/notifications";

interface Cell {
  id: number;
  name: string;
  prison_id: number;
  prison: string;
  status: number;
  date_created: string;
}

export default function Cells() {
  const navigate = useNavigate();

  const [cells, setCells] = useState<Cell[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================
     CHARGER LES CELLULES
  ========================== */

  const fetchCells = async () => {
    try {
      setLoading(true);

      const result = await invoke<Cell[]>("get_cells_cmd");

      setCells(result);
    } catch (error) {
      console.error(error);

      notifications.show({
        title: "Erreur",
        message: "Impossible de charger les cellules.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCells();
  }, []);

  /* =========================
     SUPPRIMER
  ========================== */

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer définitivement cette cellule ?"
    );

    if (!confirmed) return;

    try {
      await invoke("delete_cell_cmd", { id });

      notifications.show({
        title: "Cellule supprimée",
        message: "La cellule a été supprimée avec succès.",
        color: "green",
      });

      fetchCells();
    } catch (error) {
      console.error(error);

      notifications.show({
        title: "Erreur",
        message: "Impossible de supprimer la cellule.",
        color: "red",
      });
    }
  };

  /* =========================
     FILTRAGE
  ========================== */

  const filteredCells = cells.filter((cell) => {
    const value = search.toLowerCase();

    return (
      cell.name.toLowerCase().includes(value) ||
      cell.prison.toLowerCase().includes(value)
    );
  });

  /* =========================
     DATE
  ========================== */

  const formatDate = (date: string) => {
    if (!date) return "-";

    const d = new Date(date);

    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(d);
  };

  return (
    <div className="space-y-5 p-6">

      {/* =========================
          HEADER
      ========================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <IconBuilding size={22} stroke={1.7} />
            </div>

            <div>
              <Text fw={700} size="lg">
                Cellules
              </Text>

              <Text size="sm" c="dimmed">
                Gestion des cellules pénitentiaires
              </Text>
            </div>
          </div>
        </div>

        <Button
          leftSection={<IconPlus size={17} />}
          onClick={() => navigate("/cells/new")}
        >
          Nouvelle cellule
        </Button>

      </div>

      {/* =========================
          CARD
      ========================== */}

      <Card
        withBorder
        radius="md"
        padding={0}
        className="overflow-hidden"
      >

        {/* =========================
            TOOLBAR
        ========================== */}

        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">

          <div>
            <Text fw={600}>
              Liste des cellules
            </Text>

            <Text size="xs" c="dimmed">
              {filteredCells.length} cellule
              {filteredCells.length > 1 ? "s" : ""}
            </Text>
          </div>

          <TextInput
            value={search}
            onChange={(event) =>
              setSearch(event.currentTarget.value)
            }
            placeholder="Rechercher une cellule..."
            leftSection={
              <IconSearch size={17} />
            }
            className="w-full sm:w-72"
          />

        </div>

        {/* =========================
            TABLE
        ========================== */}

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">

                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  #
                </th>

                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Date de création
                </th>

                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Prison
                </th>

                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Cellule
                </th>

                <th className="px-4 py-3 text-center font-semibold text-slate-600">
                  Statut
                </th>

                <th className="px-4 py-3 text-center font-semibold text-slate-600">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-slate-500"
                  >
                    Chargement des cellules...
                  </td>
                </tr>

              ) : filteredCells.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center"
                  >
                    <Text c="dimmed">
                      Aucune cellule trouvée.
                    </Text>
                  </td>
                </tr>

              ) : (

                filteredCells.map((cell, index) => (

                  <tr
                    key={cell.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >

                    <td className="px-4 py-3 text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(cell.date_created)}
                    </td>

                    <td className="px-4 py-3">

                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                          <IconBuilding
                            size={16}
                            stroke={1.7}
                          />
                        </div>

                        <Text size="sm" fw={500}>
                          {cell.prison}
                        </Text>

                      </div>

                    </td>

                    <td className="px-4 py-3">
                      <Text size="sm" fw={500}>
                        {cell.name}
                      </Text>
                    </td>

                    <td className="px-4 py-3 text-center">

                      {cell.status === 1 ? (

                        <Badge
                          color="green"
                          variant="light"
                          radius="xl"
                        >
                          Active
                        </Badge>

                      ) : (

                        <Badge
                          color="red"
                          variant="light"
                          radius="xl"
                        >
                          Inactive
                        </Badge>

                      )}

                    </td>

                    <td className="px-4 py-3">

                      <Group
                        justify="center"
                        gap={5}
                      >

                        <Tooltip label="Voir">
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() =>
                              navigate(`/cells/${cell.id}`)
                            }
                          >
                            <IconEye
                              size={18}
                              stroke={1.7}
                            />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Modifier">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() =>
                              navigate(`/cells/${cell.id}/edit`)
                            }
                          >
                            <IconEdit
                              size={18}
                              stroke={1.7}
                            />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Supprimer">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() =>
                              handleDelete(cell.id)
                            }
                          >
                            <IconTrash
                              size={18}
                              stroke={1.7}
                            />
                          </ActionIcon>
                        </Tooltip>

                      </Group>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </Card>

    </div>
  );
}