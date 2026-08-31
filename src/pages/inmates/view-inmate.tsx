import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate, useParams } from "react-router";

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

// interface Inmate {
//   id: string | number;

//   code: string;

//   firstname: string;
//   middlename?: string | null;
//   lastname: string;

//   sex?: "Male" | "Female" | string | null;

//   dob?: string | null;
//   address?: string | null;

//   marital_status?: string | null;
//   complexion?: string | null;
//   eye_color?: string | null;

//   image_path?: string | null;

//   prison?: string | null;
//   prison_name?: string | null;

//   cell_block?: string | null;
//   cell_name?: string | null;
//   cellule_name?: string | null;
//   cell_code?: string | null;

//   status?: number | boolean | string | null;
//   visiting_privilege?: number | boolean | string | null;

//   crimes?: string[] | InmateCrime[] | null;

//   sentence?: string | null;

//   date_from?: string | null;
//   date_to?: string | null;

//   emergency_name?: string | null;
//   emergency_relation?: string | null;
//   emergency_contact?: string | null;
// }

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

// function getFullName(inmate: Inmate): string {
//   return [
//     inmate.firstname,
//     inmate.middlename,
//     inmate.lastname,
//   ]
//     .filter(Boolean)
//     .join(" ");
// }

function isTruthy(value?: number | boolean | string | null): boolean {
  if (value === true || value === 1) return true;

  if (typeof value === "string") {
    return ["1", "true", "yes", "oui"].includes(value.toLowerCase());
  }

  return false;
}

// function isReleased(inmate: Inmate): boolean {
//   if (!inmate.date_to) return false;

//   const endDate = new Date(inmate.date_to);

//   if (Number.isNaN(endDate.getTime())) {
//     return false;
//   }

//   return endDate <= new Date();
// }

function getCrimeName(crime: string | InmateCrime): string {
  if (typeof crime === "string") {
    return crime;
  }

  return (
    // crime.name ||
    crime.crime_name ||
    crime.designation ||
    crime.libelle ||
    crime.label ||
    "Infraction"
  );
}

/* =========================================================
   SECTION HEADER
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

/* =========================================================
   INFO
========================================================= */

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
      <Text
        size="xs"
        c="dimmed"
        mb={4}
      >
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
   VIEW INMATE
========================================================= */

export default function ViewInmate() {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  // const [inmate, setInmate] = useState<Inmate | null>(null);

  const [history, setHistory] = useState<HistoryRecord[]>([]);

  const [loading, setLoading] = useState(true);

  const [deleting, setDeleting] = useState(false);

  const [deleteModalOpened, setDeleteModalOpened] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  const [details, setDetails] = useState<InmateDetails | null>(null);

  /* =======================================================
     LOAD INMATE
  ======================================================= */

  const loadInmate = useCallback(async () => {
    if (!id) {
      setError("Identifiant du détenu introuvable.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await invoke<InmateDetails>(
        "get_inmate_by_id_cmd",
        {
          id,
        }
      );

      if (!result || !result.inmate) {
        throw new Error(
          "Le détenu demandé n'existe pas."
        );
      }

      setDetails(result);

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

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadInmate();
  }, [loadInmate]);

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async () => {
    if (!id || !details) {
      return;
    }

    try {
      setDeleting(true);

      await invoke(
        "delete_inmate_cmd",
        {
          id,
        }
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

  /* =======================================================
     PRINT
  ======================================================= */

  const handlePrint = () => {
    window.print();
  };

  /* =======================================================
     DERIVED VALUES
  ======================================================= */

  // const released = useMemo(() => {
  //   return inmate ? isReleased(inmate) : false;
  // }, [inmate]);

  // const active = useMemo(() => {
  //   if (!inmate) return false;

  //   return (
  //     isTruthy(inmate.status) &&
  //     !released
  //   );
  // }, [inmate, released]);

  // const fullName = useMemo(() => {
  //   if (!inmate) return "";

  //   return getFullName(inmate);
  // }, [inmate]);

  // const prisonName = useMemo(() => {
  //   if (!inmate) return "—";

  //   return (
  //     inmate.prison_name ||
  //     inmate.prison ||
  //     "—"
  //   );
  // }, [inmate]);

  // const cellName = useMemo(() => {
  //   if (!inmate) return "—";

  //   return (
  //     inmate.cell_block ||
  //     inmate.cell_name ||
  //     inmate.cellule_name ||
  //     inmate.cell_code ||
  //     "—"
  //   );
  // }, [inmate]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <Center
        mih={400}
        className="w-full"
      >
        <Stack
          align="center"
          gap="sm"
        >
          <Loader size="md" />

          <Text
            size="sm"
            c="dimmed"
          >
            Chargement du dossier du détenu...
          </Text>
        </Stack>
      </Center>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

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
            HEADER
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

              <Text
                size="sm"
                c="dimmed"
              >
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
              onClick={handlePrint}
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

          <Text size="sm">
            Code : {details.inmate.code}
          </Text>

          <Divider my="md" />
        </div>

        {/* =================================================
            STATUS
        ================================================= */}

        <div className="grid gap-4 md:grid-cols-2">
          <Card
            withBorder
            radius="md"
          >
            <Group justify="space-between">
              <div>
                <Text
                  size="xs"
                  c="dimmed"
                >
                  STATUT DU DÉTENU
                </Text>

                <Text
                  fw={600}
                  mt={4}
                >
                  -
                  {/* {released
                    ? "Libéré"
                    : active
                      ? "Actif"
                      : "Inactif"} */}
                </Text>
              </div>

              <Badge
                size="lg"
                // color={
                //   released
                //     ? "blue"
                //     : active
                //       ? "green"
                //       : "red"
                // }
                variant="light"
              >
                {/* {released
                  ? "Libéré"
                  : active
                    ? "Actif"
                    : "Inactif"} */}
              </Badge>
            </Group>
          </Card>

          <Card
            withBorder
            radius="md"
          >
            <Group justify="space-between">
              <div>
                <Text
                  size="xs"
                  c="dimmed"
                >
                  PRIVILÈGE DE VISITE
                </Text>

                <Text
                  fw={600}
                  mt={4}
                >
                  {isTruthy(
                    // inmate.visiting_privilege
                  )
                    ? "Visites autorisées"
                    : "Visites interdites"}
                </Text>
              </div>

              <Badge
                size="lg"
                color={
                  isTruthy(
                    // inmate.visiting_privilege
                  )
                    ? "green"
                    : "red"
                }
                variant="light"
              >
                {isTruthy(
                  // inmate.visiting_privilege
                )
                  ? "Autorisé"
                  : "Interdit"}
              </Badge>
            </Group>
          </Card>
        </div>

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <Card
          withBorder
          radius="md"
        >
          <SectionHeader
            icon={
              <IconUser size={20} />
            }
            title="Informations personnelles"
            description="Informations générales du détenu"
          />

          <Divider my="lg" />

          <div className="grid gap-8 md:grid-cols-[180px_1fr]">
            {/* PHOTO */}

            <div className="flex justify-center">
              <Image
                src={
                  details.inmate.photo_path ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    details.inmate.lastname || "Détenu"
                  )}&size=300`
                }
                alt={details.inmate.firstname}
                radius="md"
                className="h-44 w-44 object-cover"
                fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  details.inmate.firstname || "Détenu"
                )}&size=300`}
              />
            </div>

            {/* DETAILS */}

            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              <Info
                label="Nom complet"
                value={details.inmate.firstname}
              />

              <Info
                label="Code"
                value={details.inmate.code}
              />

              <Info
                label="Sexe"
                value={
                  details.inmate.sex === "Male"
                    ? "Masculin"
                    : details.inmate.sex === "Female"
                      ? "Féminin"
                      : details.inmate.sex
                }
              />

              <Info
                label="Date de naissance"
                value={formatDate(
                  details.inmate.dob
                )}
              />

              <Info
                label="État civil"
                value={
                  details.inmate.marital_status
                }
              />

              <Info
                label="Teint"
                value={
                  details.inmate.complexion
                }
              />

              <Info
                label="Couleur des yeux"
                value={
                  details.inmate.eye_color
                }
              />

              <Info
                label="Adresse"
                value={details.inmate.address}
                icon={
                  <IconMapPin
                    size={15}
                  />
                }
              />
            </div>
          </div>
        </Card>

        {/* =================================================
            PRISON INFORMATION
        ================================================= */}

        <Card
          withBorder
          radius="md"
        >
          <SectionHeader
            icon={
              <IconShield size={20} />
            }
            title="Affectation"
            description="Informations sur l'établissement pénitentiaire"
          />

          <Divider my="lg" />

          <div className="grid gap-6 md:grid-cols-2">
            <Info
              label="Prison"
              value={details.cellule?.cellule_name}
              icon={
                <IconShield
                  size={15}
                />
              }
            />

            <Info
              label="Bloc / Cellule"
              value={details.cellule?.cellule_name}
            />
          </div>
        </Card>

        {/* =================================================
            CASE DETAILS
        ================================================= */}

        <Card
          withBorder
          radius="md"
        >
          <SectionHeader
            icon={
              <IconFileDescription
                size={20}
              />
            }
            title="Détails de l'affaire"
            description="Informations judiciaires"
          />

          <Divider my="lg" />

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Text
                size="xs"
                c="dimmed"
                mb={8}
              >
                Infractions commises
              </Text>

              {details.crimes &&
              details.crimes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {details.crimes.map(
                    (crime, index) => (
                      <Badge
                        key={
                          typeof crime ===
                          "string"
                            ? `${crime}-${index}`
                            : crime.id ??
                              index
                        }
                        variant="light"
                      >
                        {getCrimeName(
                          crime
                        )}
                      </Badge>
                    )
                  )}
                </div>
              ) : (
                <Text
                  size="sm"
                  fw={500}
                >
                  —
                </Text>
              )}
            </div>

            <Info
              label="Peine"
              value={
                details.inmate.sentence
              }
            />

            <Info
              label="Début de la peine"
              value={formatDate(
                details.inmate.date_from
              )}
            />

            <Info
              label="Fin de la peine"
              value={formatDate(
                details.inmate.date_to
              )}
            />
          </div>
        </Card>

        {/* =================================================
            EMERGENCY CONTACT
        ================================================= */}

        <Card
          withBorder
          radius="md"
        >
          <SectionHeader
            icon={
              <IconUsers size={20} />
            }
            title="Contact d'urgence"
            description="Personne à contacter en cas d'urgence"
          />

          <Divider my="lg" />

          <div className="grid gap-6 md:grid-cols-3">
            <Info
              label="Nom"
              value={
                details.inmate.emergency_name
              }
            />

            <Info
              label="Relation"
              value={
                details.inmate.emergency_relation
              }
            />

            <Info
              label="Téléphone"
              value={
                details.inmate.emergency_contact
              }
              icon={
                <IconPhone size={15} />
              }
            />
          </div>
        </Card>

        {/* =================================================
            HISTORY
        ================================================= */}

        <Card
          withBorder
          radius="md"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeader
              icon={
                <IconHistory
                  size={20}
                />
              }
              title="Historique du détenu"
              description="Historique des opérations et événements"
            />

            <Button
              leftSection={
                <IconHistory
                  size={17}
                />
              }
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

              <Text
                size="sm"
                c="dimmed"
              >
                Aucun événement dans
                l'historique.
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
                  {history.map(
                    (record) => (
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

                            {formatDate(
                              record.date
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          <Badge variant="light">
                            {
                              record.action
                            }
                          </Badge>
                        </td>

                        <td className="px-3 py-4 text-slate-600">
                          {
                            record.remarks ||
                            "—"
                          }
                        </td>

                        <td className="px-3 py-4 print:hidden">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="subtle"
                              size="xs"
                            >
                              <IconEdit
                                size={
                                  16
                                }
                              />
                            </Button>

                            <Button
                              variant="subtle"
                              color="red"
                              size="xs"
                            >
                              <IconTrash
                                size={
                                  16
                                }
                              />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      <Modal
        opened={deleteModalOpened}
        onClose={() =>
          !deleting &&
          setDeleteModalOpened(false)
        }
        title="Supprimer le détenu"
        centered
      >
        <Stack>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <IconAlertCircle
                size={22}
              />
            </div>

            <div>
              <Text fw={600}>
                Êtes-vous sûr ?
              </Text>

              <Text
                size="sm"
                c="dimmed"
                mt={4}
              >
                Vous êtes sur le point de
                supprimer définitivement le
                dossier de{" "}
                <strong>
                  {details.inmate.firstname}
                </strong>
                .
              </Text>
            </div>
          </div>

          <Text
            size="sm"
            c="red"
          >
            Cette opération est
            irréversible.
          </Text>

          <Group justify="flex-end">
            <Button
              variant="default"
              disabled={deleting}
              onClick={() =>
                setDeleteModalOpened(
                  false
                )
              }
              leftSection={
                <IconX size={17} />
              }
            >
              Annuler
            </Button>

            <Button
              color="red"
              loading={deleting}
              onClick={handleDelete}
              leftSection={
                !deleting ? (
                  <IconTrash
                    size={17}
                  />
                ) : undefined
              }
            >
              Supprimer définitivement
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
