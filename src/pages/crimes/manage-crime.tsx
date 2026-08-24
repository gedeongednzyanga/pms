import { useEffect, useState } from "react";
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
} from "@mantine/core";

import { notifications } from "@mantine/notifications";
import { useNavigate, useParams } from "react-router";

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
  const [status, setStatus] = useState("1");

  const [loading, setLoading] = useState(false);
  const [loadingCrime, setLoadingCrime] = useState(false);

  const [error, setError] = useState("");

  /**
   * ============================
   * Charger le crime
   * ============================
   */
  const loadCrime = async () => {
    if (!crimeId) return;

    try {
      setLoadingCrime(true);
      setError("");

      const crime = await invoke<Crime>(
        "get_crime_cmd",
        {
          id: crimeId,
        }
      );

      setName(crime.name);
      setStatus(String(crime.status));
    } catch (error) {
      console.error(error);

      setError(
        typeof error === "string"
          ? error
          : "Impossible de charger les informations du crime."
      );
    } finally {
      setLoadingCrime(false);
    }
  };

  useEffect(() => {
    loadCrime();
  }, [crimeId]);

  /**
   * ============================
   * Enregistrer
   * ============================
   */
  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");

    const crimeName = name.trim();

    if (!crimeName) {
      setError("Veuillez saisir le nom du crime.");
      return;
    }

    try {
      setLoading(true);

      const crime = await invoke<Crime>(
        "save_crime_cmd",
        {
          id: crimeId ?? null,
          name: crimeName,
          status: Number(status),
        }
      );

      notifications.show({
        title: isEdit
          ? "Crime modifié"
          : "Crime créé",
        message: isEdit
          ? "Le crime a été modifié avec succès."
          : "Le crime a été créé avec succès.",
        color: "green",
      });

      // Aller vers la page de détails
      navigate(`/crimes/${crime.id}`);
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

  if (loadingCrime) {
    return (
      <Card
        withBorder
        radius="md"
        shadow="sm"
      >
        <Text ta="center" c="dimmed" py="xl">
          Chargement du crime...
        </Text>
      </Card>
    );
  }

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

              {/* Statut */}
              <Select
                label="Statut"
                placeholder="Sélectionner un statut"
                required
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