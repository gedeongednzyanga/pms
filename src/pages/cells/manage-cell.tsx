
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  IconBuilding,
  IconCheck,
  IconDeviceFloppy,
  IconX,
} from "@tabler/icons-react";

import {
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

interface Prison {
  id: string;
  prison_name: string;
  address_prison: string;
  statut_prison: string;
  created_at: string;
  updated_at: string;
}

type Cell = {
  id: string;
  prison_id: string;
  code: string | null;
  cellule_name: string;
  capacity: number;
  statut_cellule: string;
  created_at: string;
  updated_at: string;
};

type ManageCellProps = {
  cellId?: string;
  onSuccess?: (cell: Cell) => void;
  onCancel?: () => void;
};

export default function ManageCell({
  cellId,
  onSuccess,
  onCancel,
}: ManageCellProps) {
  const isEdit = !!cellId;

  const [prisons, setPrisons] = useState<Prison[]>([]);

  const [prisonId, setPrisonId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [celluleName, setCelluleName] = useState("");
  const [capacity, setCapacity] = useState<number | string>("");

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  /**
   * ============================
   * Charger les prisons
   * ============================
   */
  const loadPrisons = async () => {
    try {
      setError("");

      const data = await invoke<Prison[]>("get_prisonss_cmd");

      setPrisons(data);
    } catch (error) {
      console.error("Erreur récupération prisons :", error);

      setError("Impossible de charger la liste des prisons.");
    }
  };

  /**
   * ============================
   * Charger la cellule
   * ============================
   */
  const loadCell = async () => {
    if (!cellId) return;

    try {
      setLoadingData(true);
      setError("");

     const cell = await invoke<Cell>("get_cellule_cmd", {
        id: cellId,
      });

      setPrisonId(cell.prison_id);
      setCode(cell.code ?? "");
      setCelluleName(cell.cellule_name);
      setCapacity(cell.capacity);
    } catch (error) {
      console.error("Erreur récupération cellule :", error);

      setError(
        typeof error === "string"
          ? error
          : "Impossible de charger les informations de la cellule."
      );
    } finally {
      setLoadingData(false);
    }
  };

  /**
   * ============================
   * Initialisation
   * ============================
   */
  useEffect(() => {
    loadPrisons();
    loadCell();
  }, [cellId]);

  /**
   * ============================
   * Enregistrer
   * ============================
   */
  const handleSubmit = async () => {
    setError("");

    if (!prisonId) {
      setError("Veuillez sélectionner une prison.");
      return;
    }

    if (!celluleName.trim()) {
      setError("Veuillez saisir le nom de la cellule.");
      return;
    }

    if (!capacity || Number(capacity) <= 0) {
      setError("Veuillez saisir une capacité valide.");
      return;
    }

    try {
      setLoading(true);

      // const cell = await invoke<Cell>("create_cellule_cmd", {
      //   data: {
      //     prison_id: prisonId,
      //     code: code.trim() || null,
      //     cellule_name: celluleName.trim(),
      //     capacity: Number(capacity),
      //   },
      // });

      const cell = isEdit
        ? await invoke<Cell>("update_cellule_cmd", {
            id: cellId,
            data: {
              prison_id: prisonId,
              code: code.trim() || null,
              cellule_name: celluleName.trim(),
              capacity: Number(capacity),
            },
          })
        : await invoke<Cell>("create_cellule_cmd", {
            data: {
              prison_id: prisonId,
              code: code.trim() || null,
              cellule_name: celluleName.trim(),
              capacity: Number(capacity),
            },
          });

      onSuccess?.(cell);
      notifications.show({
        title: "Nouvelle cellule",
        message:
          "Cellule enregistrée avec succès.",
        color: "green",
      });

    } catch (error) {
      console.error("Erreur création cellule :", error);

      setError(
        typeof error === "string"
          ? error
          : "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================
   * Loading
   * ============================
   */
  if (loadingData) {
    return (
      <Card shadow="sm" radius="md" withBorder>
        <div className="py-10 text-center text-gray-500">
          Chargement...
        </div>
      </Card>
    );
  }

  return (
    <Card
      shadow="sm"
      radius="md"
      withBorder
      className="mx-auto w-full max-w-2xl"
    >
      {/* Header */}
      <Group justify="space-between" mb="xl">
        <Group gap="sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <IconBuilding size={21} />
          </div>

          <div>
            <Title order={3}>
              {isEdit ? "Modifier la cellule" : "Nouvelle cellule"}
            </Title>

            <div className="text-sm text-gray-500">
              {isEdit
                ? "Modifier les informations de la cellule"
                : "Ajouter une nouvelle cellule"}
            </div>
          </div>
        </Group>
      </Group>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Stack gap="md">
        {/* Prison */}
        <Select
          label="Prison"
          placeholder="Sélectionner une prison"
          description="Sélectionnez la prison à laquelle appartient la cellule"
          required
          searchable
          clearable
          leftSection={<IconBuilding size={17} />}
          data={prisons
            .filter((prison) => prison.statut_prison === "active")
            .map((prison) => ({
              value: String(prison.id),
              label: prison.prison_name,
            }))}
          value={prisonId}
          onChange={setPrisonId}
          disabled={loading}
          nothingFoundMessage="Aucune prison trouvée"
        />

        {/* Code */}
        <TextInput
          label="Code de la cellule"
          placeholder="Ex : CEL-A-01"
          description="Code unique permettant d'identifier la cellule"
          value={code}
          onChange={(event) => setCode(event.currentTarget.value)}
          disabled={loading}
        />

        {/* Nom */}
        <TextInput
          label="Nom de la cellule"
          placeholder="Ex : Cellule A-01"
          required
          value={celluleName}
          onChange={(event) => setCelluleName(event.currentTarget.value)}
          disabled={loading}
        />

        {/* Capacité */}
        <NumberInput
          label="Capacité"
          placeholder="Ex : 20"
          description="Nombre maximum de détenus que la cellule peut accueillir"
          required
          min={1}
          allowDecimal={false}
          value={capacity}
          onChange={setCapacity}
          disabled={loading}
        />
      </Stack>

      {/* Footer */}
      <Group justify="flex-end" mt="xl">
        <Button
          variant="default"
          leftSection={<IconX size={17} />}
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>

        <Button
          leftSection={
            isEdit ? (
              <IconCheck size={17} />
            ) : (
              <IconDeviceFloppy size={17} />
            )
          }
          loading={loading}
          onClick={handleSubmit}
        >
          {isEdit ? "Enregistrer les modifications" : "Enregistrer"}
        </Button>
      </Group>
    </Card>
  );
}