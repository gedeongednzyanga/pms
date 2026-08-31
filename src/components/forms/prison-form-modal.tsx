import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import {
  IconBuilding,
  IconCheck,
  IconDeviceFloppy,
  IconX,
} from "@tabler/icons-react";

import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

export type Prison = {
  id: string;
  prison_name: string;
  address_prison: string | null;
  statut_prison: string;
  created_at: string;
  updated_at: string;
};

type PrisonFormModalProps = {
  opened: boolean;
  onClose: () => void;
  prison?: Prison | null;
  onSuccess?: (prison: Prison) => void;
};

export default function PrisonFormModal({
  opened,
  onClose,
  prison,
  onSuccess,
}: PrisonFormModalProps) {

  const isEditing = !!prison;

  const [prisonName, setPrisonName] = useState("");
  const [addressPrison, setAddressPrison] = useState("");
  const [status, setStatus] = useState<string>("active");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * ============================
   * Initialiser le formulaire
   * ============================
   */
  useEffect(() => {
    if (!opened) return;

    setPrisonName(prison?.prison_name ?? "");
    setAddressPrison(prison?.address_prison ?? "");
    setStatus(prison?.statut_prison ?? "active");

    setError("");
  }, [opened, prison]);

  /**
   * ============================
   * Enregistrer
   * ============================
   */
  const handleSubmit = async () => {

    setError("");

    const name = prisonName.trim();
    const address = addressPrison.trim();

    if (!name) {
      setError(
        "Le nom de la prison est obligatoire."
      );
      return;
    }

    if (!status) {
      setError(
        "Le statut de la prison est obligatoire."
      );
      return;
    }

    try {

      setLoading(true);

      let savedPrison: Prison;

      /**
       * ============================
       * MODIFICATION
       * ============================
       */
      if (isEditing && prison) {

        savedPrison = await invoke<Prison>(
          "update_prison_cmd",
          {
            id: prison.id,
            data: {
              prison_name: name,
              address_prison: address,
              statut_prison: status,
            },
          }
        );

      } else {

        /**
         * ============================
         * CREATION
         * ============================
         */
        savedPrison = await invoke<Prison>(
          "create_prison_cmd",
          {
            data: {
              prison_name: name,
              address_prison: address,
              statut_prison: status,
            },
          }
        );
      }

      /**
       * Informer le parent
       */
      onSuccess?.(savedPrison);

      /**
       * Fermer le modal
       */
      onClose();
      notifications.show({
        title: "Nouvelle prison",
        message:
          "Prison enregistrée avec succès.",
        color: "green",
      });

    } catch (err) {

      console.error(
        "Erreur enregistrement prison :",
        err
      );

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

        {/* =========================
            ERREUR
        ========================== */}
        {error && (
          <Alert
            color="red"
            variant="light"
          >
            {error}
          </Alert>
        )}

        {/* =========================
            NOM
        ========================== */}
        <TextInput
          label="Nom de la prison"
          placeholder="Ex. Prison centrale de Goma"
          leftSection={
            <IconBuilding size={17} />
          }
          value={prisonName}
          onChange={(event) =>
            setPrisonName(
              event.currentTarget.value
            )
          }
          required
          disabled={loading}
        />

        {/* =========================
            ADRESSE
        ========================== */}
        <Textarea
          label="Adresse de la prison"
          placeholder="Ex. Avenue de la Prison, Goma"
          minRows={3}
          autosize
          maxRows={5}
          value={addressPrison}
          onChange={(event) =>
            setAddressPrison(
              event.currentTarget.value
            )
          }
          disabled={loading}
        />

        {/* =========================
            STATUT
        ========================== */}
        <Select
          label="Statut"
          placeholder="Sélectionner un statut"
          required
          value={status}
          onChange={(value) =>
            setStatus(value ?? "active")
          }
          data={[
            {
              value: "active",
              label: "Active",
            },
            {
              value: "desactive",
              label: "Inactive",
            },
          ]}
          allowDeselect={false}
          disabled={loading}
        />

        {/* =========================
            ACTIONS
        ========================== */}
        <Group
          justify="flex-end"
          mt="md"
        >

          <Button
            variant="default"
            leftSection={
              <IconX size={17} />
            }
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>

          <Button
            leftSection={
              isEditing ? (
                <IconCheck size={17} />
              ) : (
                <IconDeviceFloppy
                  size={17}
                />
              )
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