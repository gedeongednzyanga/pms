
import { invoke } from "@tauri-apps/api/core";

import {
  IconAlertCircle,
  IconDeviceFloppy,
  IconGavel,
  IconX,
} from "@tabler/icons-react";

import {
  Alert,
  Button,
  Card,
  Group,
  Select,
  Stack,
  TextInput,
  Title,
  Text,
  Textarea,
} from "@mantine/core";

import { notifications } from "@mantine/notifications";
import { useNavigate, useParams } from "react-router";
import { useState } from "react";

type Crime = {
  id: number;
  name: string;
  status: number;
  delete_flag: number;
  date_created: string;
};

export default function ManageCrime() {
  const { id } = useParams();
  const navigate = useNavigate();

  const crimeId = id ? Number(id) : undefined;
  const isEdit = !!crimeId;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(false);
  // const [loadingCrime, setLoadingCrime] = useState(false);

  const [error, setError] = useState("");

  /**
   * ============================
   * Enregistrer
   * ============================
   */
  const handleSubmit = async (
    event: React.SyntheticEvent
  ) => {
    event.preventDefault();

    setError("");

    try {
      setLoading(true);

       await invoke<Crime>("create_crime_cmd",
        { 
          data :{
            crime_name: name,
            description_crime: description,
            statut_crime: status,
          }
        }
      );

      notifications.show({
        title: isEdit
          ? "Infraction modifiée"
          : "Infraction créé",
        message: isEdit
          ? "L'infraction a été modifiée avec succès."
          : "L'infraction a été créée avec succès.",
        color: "green",
      });

      // // Aller vers la page de détails
      // navigate(`/crimes/${crime.id}`);
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

  /**
   * ============================
   * Annuler
   * ============================
   */
  const handleCancel = () => {
    if (isEdit && crimeId) {
      navigate(`/crimes/${crimeId}`);
    } else {
      navigate("/crimes");
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Stack gap="lg">

        {/* =========================
            HEADER
        ========================== */}
        <div>
          <Group gap="sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
              <IconGavel size={23} />
            </div>

            <div>
              <Title order={2}>
                {isEdit
                  ? "Modifier le crime"
                  : "Nouveau crime"}
              </Title>

              <Text size="sm" c="dimmed">
                {isEdit
                  ? "Modifier les informations de cette infraction"
                  : "Enregistrer une nouvelle infraction"}
              </Text>
            </div>
          </Group>
        </div>

        {/* =========================
            FORM
        ========================== */}
        <Card
          withBorder
          radius="md"
          shadow="sm"
          padding="xl"
        >
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">

              {/* Error */}
              {error && (
                <Alert
                  icon={<IconAlertCircle size={18} />}
                  color="red"
                  variant="light"
                >
                  {error}
                </Alert>
              )}

              {/* Nom */}
              <TextInput
                label="Nom du crime"
                placeholder="Ex. Vol, Meurtre, Escroquerie..."
                required
                value={name}
                onChange={(event) =>
                  setName(
                    event.currentTarget.value
                  )
                }
                disabled={loading}
              />

              <Textarea
                label="Description"
                placeholder="Description de l'infraction..."
                minRows={5}
                required
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.currentTarget.value
                  )
                }
              />

              {/* Statut */}
              <Select
                label="Statut"
                placeholder="Sélectionner un statut"
                required
                value={status}
                onChange={(value) =>
                  setStatus(value ?? 'active')
                }
                data={[
                  {
                    value: 'active',
                    label: "Actif",
                  },
                  {
                    value: 'desactive',
                    label: "Inactif",
                  },
                ]}
                disabled={loading}
              />

              {/* Actions */}
              <Group
                justify="flex-end"
                mt="md"
              >
                <Button
                  type="button"
                  variant="default"
                  leftSection={
                    <IconX size={17} />
                  }
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Annuler
                </Button>

                <Button
                  type="submit"
                  loading={loading}
                  leftSection={
                    <IconDeviceFloppy
                      size={17}
                    />
                  }
                >
                  {isEdit
                    ? "Enregistrer les modifications"
                    : "Enregistrer"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Stack>
    </div>
  );
}