
import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate, useParams } from "react-router";
import { readFile } from "@tauri-apps/plugin-fs";

import {
  IconAlertCircle,
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconEdit,
  IconFileDescription,
  IconHistory,
  IconMapPin,
  IconPhone,
  IconPrinter,
  IconShield,
  IconTrash,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";

import {
  Badge,
  Button,
  Card,
  Center,
  Divider,
  Group,
  Image,
  Loader,
  Modal,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { notifications } from "@mantine/notifications";

import { InmateDetails } from "../../interfaces/inmate";
import PdfPreview from "../../components/preview-pdf";
import { X } from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface InmateCrime {
  id?: string | number;
  crime_name?: string;
  designation?: string;
  libelle?: string;
  label?: string;
}

interface HistoryRecord {
  id: string | number;
  date: string;
  action: string;
  remarks?: string | null;
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date?: string | null): string {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function getCrimeName(
  crime: string | InmateCrime
): string {
  if (typeof crime === "string") {
    return crime;
  }

  return (
    crime.crime_name ||
    crime.designation ||
    crime.libelle ||
    crime.label ||
    "Infraction"
  );
}

function getFullName(
  inmate: InmateDetails["inmate"]
): string {
  return [
    inmate.firstname,
    inmate.middlename,
    inmate.lastname,
  ]
    .filter(Boolean)
    .join(" ");
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

function SectionHeader({
  icon,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-lg
          bg-blue-50
          text-blue-600
        "
      >
        {icon}
      </div>

      <div>
        <Text fw={600}>{title}</Text>

        {description && (
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        )}
      </div>
    </div>
  );
}

interface InfoProps {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
}

function Info({
  label,
  value,
  icon,
}: InfoProps) {
  return (
    <div>
      <Text size="xs" c="dimmed" mb={4}>
        {label}
      </Text>

      <div className="flex items-center gap-1">
        {icon && (
          <span className="text-slate-400">
            {icon}
          </span>
        )}

        <Text size="sm" fw={500}>
          {value || "—"}
        </Text>
      </div>
    </div>
  );
}

/* =========================================================
   PERSONAL INFORMATION
========================================================= */

interface PersonalInformationProps {
  details: InmateDetails;
  photoPreview: string | null;
}

function PersonalInformation({
  details,
  photoPreview,
}: PersonalInformationProps) {
  const inmate = details.inmate;

  const fullName = getFullName(inmate);

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fullName || "Détenu"
  )}&size=300`;

  return (
    <Card withBorder radius="md">
      <SectionHeader
        icon={<IconUser size={20} />}
        title="Informations personnelles"
        description="Informations générales du détenu"
      />

      <Divider my="lg" />

      <div className="grid gap-8 md:grid-cols-[180px_1fr]">
        {/* PHOTO */}
        <div className="flex justify-center">
          <Image
            src={photoPreview || avatarUrl}
            alt={fullName || "Détenu"}
            radius="md"
            className="h-44 w-44 object-cover"
            fallbackSrc={avatarUrl}
          />
        </div>

        {/* INFORMATIONS */}
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          <Info
            label="Nom complet"
            value={fullName}
          />

          <Info
            label="Sexe"
            value={
              inmate.sex === "Male"
                ? "Masculin"
                : inmate.sex === "Female"
                  ? "Féminin"
                  : inmate.sex
            }
          />

          <Info
            label="Date de naissance"
            value={formatDate(inmate.dob)}
          />

          <Info
            label="État civil"
            value={inmate.marital_status}
          />

          <Info
            label="Adresse"
            value={inmate.address}
            icon={<IconMapPin size={15} />}
          />
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   PRISON / CELL INFORMATION
========================================================= */

function AssignmentSection({
  details,
}: {
  details: InmateDetails;
}) {
  return (
    <Card withBorder radius="md">
      <SectionHeader
        icon={<IconShield size={20} />}
        title="Affectation"
        description="Informations sur l'établissement pénitentiaire"
      />

      <Divider my="lg" />

      <div className="grid gap-6 md:grid-cols-2">
        <Info
          label="Cellule"
          value={details.cellule?.cellule_name}
          icon={<IconShield size={15} />}
        />

        <Info
          label="Bloc / Quartier"
          value={details.cellule?.cellule_name}
        />
      </div>
    </Card>
  );
}

/* =========================================================
   CASE INFORMATION
========================================================= */

function CaseInformation({
  details,
}: {
  details: InmateDetails;
}) {
  const crimes = details.crimes ?? [];

  return (
    <Card withBorder radius="md">
      <SectionHeader
        icon={<IconFileDescription size={20} />}
        title="Détails de l'affaire"
        description="Informations judiciaires"
      />

      <Divider my="lg" />

      <div className="grid gap-6 md:grid-cols-2">
        {/* INFRACTIONS */}
        <div>
          <Text size="xs" c="dimmed" mb={8}>
            Infractions commises
          </Text>

          {crimes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {crimes.map((crime, index) => (
                <Badge
                  key={
                    typeof crime === "string"
                      ? `${crime}-${index}`
                      : crime.id ?? index
                  }
                  variant="light"
                >
                  {getCrimeName(crime)}
                </Badge>
              ))}
            </div>
          ) : (
            <Text size="sm" fw={500}>
              —
            </Text>
          )}
        </div>

        <Info
          label="Début de la peine"
          value={formatDate(details.inmate.date_from)}
        />

        <Info
          label="Fin de la peine"
          value={formatDate(details.inmate.date_to)}
        />
      </div>
    </Card>
  );
}

/* =========================================================
   EMERGENCY CONTACT
========================================================= */

function EmergencyContact({
  details,
}: {
  details: InmateDetails;
}) {
  const inmate = details.inmate;

  return (
    <Card withBorder radius="md">
      <SectionHeader
        icon={<IconUsers size={20} />}
        title="Contact d'urgence"
        description="Personne à contacter en cas d'urgence"
      />

      <Divider my="lg" />

      <div className="grid gap-6 md:grid-cols-3">
        <Info
          label="Nom"
          value={inmate.emergency_name}
        />

        <Info
          label="Relation"
          value={inmate.emergency_relation}
        />

        <Info
          label="Téléphone"
          value={inmate.emergency_contact}
          icon={<IconPhone size={15} />}
        />
      </div>
    </Card>
  );
}

/* =========================================================
   HISTORY
========================================================= */

interface HistorySectionProps {
  history: HistoryRecord[];
}

function HistorySection({
  history,
}: HistorySectionProps) {
  return (
    <Card withBorder radius="md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          icon={<IconHistory size={20} />}
          title="Historique du détenu"
          description="Historique des opérations et événements"
        />

        <Button
          leftSection={<IconHistory size={17} />}
          className="print:hidden"
          disabled
        >
          Ajouter un événement
        </Button>
      </div>

      <Divider my="lg" />

      {history.length === 0 ? (
        <div className="py-8 text-center">
          <IconHistory
            size={32}
            className="mx-auto mb-2 text-slate-400"
          />

          <Text size="sm" c="dimmed">
            Aucun événement dans l'historique.
          </Text>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-3 py-3 font-medium">
                  Date
                </th>

                <th className="px-3 py-3 font-medium">
                  Action
                </th>

                <th className="px-3 py-3 font-medium">
                  Remarques
                </th>

                <th className="px-3 py-3 text-right print:hidden">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {history.map((record) => (
                <tr
                  key={record.id}
                  className="border-b last:border-0 hover:bg-slate-50"
                >
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <IconCalendar
                        size={16}
                        className="text-slate-400"
                      />

                      {formatDate(record.date)}
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <Badge variant="light">
                      {record.action}
                    </Badge>
                  </td>

                  <td className="px-3 py-4 text-slate-600">
                    {record.remarks || "—"}
                  </td>

                  <td className="px-3 py-4 print:hidden">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="subtle"
                        size="xs"
                      >
                        <IconEdit size={16} />
                      </Button>

                      <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                      >
                        <IconTrash size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

/* =========================================================
   DELETE MODAL
========================================================= */

interface DeleteModalProps {
  opened: boolean;
  deleting: boolean;
  inmateName: string;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteModal({
  opened,
  deleting,
  inmateName,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={() => {
        if (!deleting) {
          onClose();
        }
      }}
      title="Supprimer le détenu"
      centered
    >
      <Stack>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <IconAlertCircle size={22} />
          </div>

          <div>
            <Text fw={600}>
              Êtes-vous sûr ?
            </Text>

            <Text size="sm" c="dimmed" mt={4}>
              Vous êtes sur le point de supprimer
              définitivement le dossier de{" "}
              <strong>{inmateName}</strong>.
            </Text>
          </div>
        </div>

        <Text size="sm" c="red">
          Cette opération est irréversible.
        </Text>

        <Group justify="flex-end">
          <Button
            variant="default"
            disabled={deleting}
            onClick={onClose}
            leftSection={<IconX size={17} />}
          >
            Annuler
          </Button>

          <Button
            color="red"
            loading={deleting}
            onClick={onConfirm}
            leftSection={
              !deleting ? (
                <IconTrash size={17} />
              ) : undefined
            }
          >
            Supprimer définitivement
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ViewInmate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */

  const [details, setDetails] =
    useState<InmateDetails | null>(null);

  const [history, setHistory] =
    useState<HistoryRecord[]>([]);

  const [photoPreview, setPhotoPreview] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [deleteModalOpened, setDeleteModalOpened] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* -------------------------------------------------------
     LOAD INMATE
  ------------------------------------------------------- */

  const loadInmate = useCallback(async () => {
    if (!id) {
      setError(
        "Identifiant du détenu introuvable."
      );

      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result =
        await invoke<InmateDetails>(
          "get_inmate_by_id_cmd",
          { id }
        );

      if (!result?.inmate) {
        throw new Error(
          "Le détenu demandé n'existe pas."
        );
      }

      setDetails(result);

      // À remplacer par le chargement réel
      // de l'historique lorsque le backend sera prêt.
      setHistory([]);
    } catch (err) {
      console.error(
        "Erreur chargement détenu:",
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : String(err);

      setError(message);

      notifications.show({
        title: "Erreur",
        message:
          message ||
          "Impossible de charger le détenu.",
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  /* -------------------------------------------------------
     LOAD PHOTO
  ------------------------------------------------------- */

  useEffect(() => {
    let objectUrl: string | null = null;

    const loadPhoto = async () => {
      const photoPath =
        details?.inmate?.photo_path;

      if (!photoPath) {
        setPhotoPreview(null);
        return;
      }

      try {
        const bytes = await readFile(photoPath);

        const extension = photoPath
          .split(".")
          .pop()
          ?.toLowerCase();

        const mimeTypes: Record<string, string> = {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          webp: "image/webp",
          gif: "image/gif",
        };

        const mimeType =
          mimeTypes[extension || ""] ||
          "image/jpeg";

        const blob = new Blob(
          [bytes],
          { type: mimeType }
        );

        objectUrl =
          URL.createObjectURL(blob);

        setPhotoPreview(objectUrl);
      } catch (err) {
        console.error(
          "Impossible de charger la photo:",
          err
        );

        setPhotoPreview(null);
      }
    };

    loadPhoto();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [details?.inmate?.photo_path]);

  /* -------------------------------------------------------
     INITIAL LOAD
  ------------------------------------------------------- */

  useEffect(() => {
    loadInmate();
  }, [loadInmate]);

  /* -------------------------------------------------------
     DELETE
  ------------------------------------------------------- */

  const handleDelete = async () => {
    if (!id || !details) {
      return;
    }

    try {
      setDeleting(true);

      await invoke(
        "delete_inmate_cmd",
        { id }
      );

      notifications.show({
        title: "Détenu supprimé",
        message:
          "Le dossier du détenu a été supprimé avec succès.",
        color: "green",
        icon: <IconCheck size={18} />,
      });

      setDeleteModalOpened(false);

      navigate("/inmates");
    } catch (err) {
      console.error(
        "Erreur suppression détenu:",
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : String(err);

      notifications.show({
        title: "Erreur",
        message:
          message ||
          "Impossible de supprimer le détenu.",
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setDeleting(false);
    }
  };

  /* -------------------------------------------------------
     PRINT
  ------------------------------------------------------- */
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const handleGenerateFiche = async () => {
    if (!id) return;

    try {
      const path = await invoke<string>(
        "export_inmate_fiche_pdf",
        {
          inmateId: id,
        }
      );

      setPdfFile(path);

      notifications.show({
        title: "PDF généré",
        message: `Fiche enregistrée : ${path}`,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Erreur",
        message: String(error),
        color: "red",
      });
    }
  };

  /* -------------------------------------------------------
     DERIVED VALUES
  ------------------------------------------------------- */

  const fullName = details
    ? getFullName(details.inmate)
    : "";

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (loading) {
    return (
      <Center
        mih={400}
        className="w-full"
      >
        <Stack align="center" gap="sm">
          <Loader size="md" />

          <Text size="sm" c="dimmed">
            Chargement du dossier du détenu...
          </Text>
        </Stack>
      </Center>
    );
  }

  /* -------------------------------------------------------
     ERROR
  ------------------------------------------------------- */

  if (error || !details) {
    return (
      <Center
        mih={400}
        className="w-full"
      >
        <Card
          withBorder
          radius="md"
          className="w-full max-w-lg"
        >
          <Stack align="center">
            <IconAlertCircle
              size={42}
              className="text-red-500"
            />

            <Title order={3}>
              Détenu introuvable
            </Title>

            <Text
              size="sm"
              c="dimmed"
              ta="center"
            >
              {error ||
                "Impossible de récupérer les informations de ce détenu."}
            </Text>

            <Group>
              <Button
                variant="light"
                leftSection={
                  <IconArrowLeft size={18} />
                }
                onClick={() =>
                  navigate("/inmates")
                }
              >
                Retour
              </Button>

              <Button
                onClick={loadInmate}
              >
                Réessayer
              </Button>
            </Group>
          </Stack>
        </Card>
      </Center>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <div
        id="inmate-details"
        className="mx-auto max-w-7xl space-y-6 pb-8"
      >
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
          <div className="flex items-center gap-3">
            <Button
              variant="subtle"
              color="gray"
              onClick={() =>
                navigate("/inmates")
              }
              leftSection={
                <IconArrowLeft size={18} />
              }
            >
              Retour
            </Button>

            <div>
              <Title order={2}>
                Détails du détenu
              </Title>

              <Text size="sm" c="dimmed">
                Informations complètes du dossier
              </Text>
            </div>
          </div>

          <Group>
            <Button
              variant="light"
              leftSection={
                <IconPrinter size={18} />
              }
              onClick={handleGenerateFiche}
            >
              Imprimer
            </Button>

            <Button
              variant="light"
              leftSection={
                <IconEdit size={18} />
              }
              onClick={() =>
                navigate(
                  `/inmates/${id}/edit`
                )
              }
            >
              Modifier
            </Button>

            <Button
              color="red"
              variant="light"
              leftSection={
                <IconTrash size={18} />
              }
              onClick={() =>
                setDeleteModalOpened(true)
              }
            >
              Supprimer
            </Button>
          </Group>
        </div>

        {/* =================================================
            PRINT HEADER
        ================================================= */}

        <div className="hidden print:block">
          <Title order={2}>
            Dossier du détenu
          </Title>

          <Text size="sm" mt={4}>
            {fullName}
          </Text>

          <Divider my="md" />
        </div>

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <PersonalInformation
          details={details}
          photoPreview={photoPreview}
        />

        {/* =================================================
            ASSIGNMENT
        ================================================= */}

        <AssignmentSection
          details={details}
        />

        {/* =================================================
            CASE INFORMATION
        ================================================= */}

        <CaseInformation
          details={details}
        />

        {/* =================================================
            EMERGENCY CONTACT
        ================================================= */}

        <EmergencyContact
          details={details}
        />

        {/* =================================================
            HISTORY
        ================================================= */}

        <HistorySection
          history={history}
        />
      </div>

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      <DeleteModal
        opened={deleteModalOpened}
        deleting={deleting}
        inmateName={fullName}
        onClose={() =>
          setDeleteModalOpened(false)
        }
        onConfirm={handleDelete}
      />

       {pdfFile && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-3 sm:p-5">
          {/* CONTENEUR MODAL */}
          <div className="flex h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl ">

            {/* HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b px-5 py-3 ">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold">
                  Aperçu du rapport
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Vérifiez le document avant impression.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPdfFile(null)}
                className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* PDF */}
            <div className="min-h-0 flex-1 bg-slate-100 p-2 dark:bg-slate-950 sm:p-4">
              <div className="h-full w-full overflow-hidden rounded-md bg-white shadow-sm">
                <PdfPreview file={pdfFile} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

