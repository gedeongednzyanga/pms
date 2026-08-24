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
  Select,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";

type Prison = {
  id: number;
  name: string;
};

type Cell = {
  id: number;
  prison_id: number;
  name: string;
  status: number;
};

type ManageCellProps = {
  cellId?: number;
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
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string>("1");

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
      const data = await invoke<Prison[]>("get_prisons_cmd");

      setPrisons(data);
    } catch (error) {
      console.error(error);
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

      const cell = await invoke<Cell>("get_cell_cmd", {
        id: cellId,
      });

      setPrisonId(String(cell.prison_id));
      setName(cell.name);
      setStatus(String(cell.status));
    } catch (error) {
      console.error(error);
      setError("Impossible de charger les informations de la cellule.");
    } finally {
      setLoadingData(false);
    }
  };

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

    if (!name.trim()) {
      setError("Veuillez saisir le nom de la cellule.");
      return;
    }

    try {
      setLoading(true);

      const cell = await invoke<Cell>("save_cell_cmd", {
        id: cellId ?? null,
        prisonId: Number(prisonId),
        name: name.trim(),
        status: Number(status),
      });

      onSuccess?.(cell);
    } catch (error) {
      console.error(error);

      setError(
        typeof error === "string"
          ? error
          : "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  };

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
        <div>
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
        </div>
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
          required
          searchable
          clearable
          leftSection={<IconBuilding size={17} />}
          data={prisons.map((prison) => ({
            value: String(prison.id),
            label: prison.name,
          }))}
          value={prisonId}
          onChange={setPrisonId}
          disabled={loading}
        />

        {/* Nom */}
        <TextInput
          label="Nom de la cellule"
          placeholder="Ex : Cellule A-01"
          required
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          disabled={loading}
        />

        {/* Statut */}
        <Select
          label="Statut"
          required
          value={status}
          onChange={(value) => setStatus(value ?? "1")}
          data={[
            {
              value: "1",
              label: "Active",
            },
            {
              value: "0",
              label: "Inactive",
            },
          ]}
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