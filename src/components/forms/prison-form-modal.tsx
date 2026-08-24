import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Button,
  Group,
  Modal,
  Select,
  Stack,
  TextInput,
  Alert,
} from "@mantine/core";
import { IconAlertCircle, IconDeviceFloppy } from "@tabler/icons-react";
import { Prison } from "../../pages/prisons/prisons-list";


interface PrisonFormModalProps {
  opened: boolean;
  onClose: () => void;
  prison?: Prison | null;
  onSuccess?: () => void;
}

export default function PrisonFormModal({
  opened,
  onClose,
  prison,
  onSuccess,
}: PrisonFormModalProps) {
  const isEditing = !!prison;

  const [name, setName] = useState("");
  const [status, setStatus] = useState<string>("1");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (opened) {
      setName(prison?.name ?? "");
      setStatus(prison?.status === 0 ? "0" : "1");
      setError("");
    }
  }, [opened, prison]);

  const handleSubmit = async () => {
    setError("");

    if (!name.trim()) {
      setError("Le nom de la prison est obligatoire.");
      return;
    }

    try {
      setLoading(true);

      const data = {
        id: prison?.id ?? null,
        name: name.trim(),
        status: Number(status),
      };

      await invoke("save_prison_cmd", {
        prison: data,
      });

      onSuccess?.();
      onClose();

    } catch (err) {
      console.error("Erreur enregistrement prison :", err);

      setError(
        typeof err === "string"
          ? err
          : "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        isEditing
          ? "Modifier la prison"
          : "Nouvelle prison"
      }
      centered
      size="md"
    >
      <Stack gap="md">

        {error && (
          <Alert
            icon={<IconAlertCircle size={18} />}
            color="red"
            variant="light"
          >
            {error}
          </Alert>
        )}

        <TextInput
          label="Nom"
          placeholder="Ex. Prison centrale de Goma"
          value={name}
          onChange={(event) =>
            setName(event.currentTarget.value)
          }
          required
          disabled={loading}
        />

        <Select
          label="Statut"
          value={status}
          onChange={(value) =>
            setStatus(value ?? "1")
          }
          data={[
            {
              value: "1",
              label: "Actif",
            },
            {
              value: "0",
              label: "Inactif",
            },
          ]}
          allowDeselect={false}
          disabled={loading}
        />

        <Group
          justify="flex-end"
          mt="md"
        >
          <Button
            variant="default"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>

          <Button
            leftSection={
              <IconDeviceFloppy size={17} />
            }
            loading={loading}
            onClick={handleSubmit}
          >
            {isEditing
              ? "Enregistrer les modifications"
              : "Enregistrer"}
          </Button>
        </Group>

      </Stack>
    </Modal>
  );
}