import {
  IconArrowLeft,
  IconCalendar,
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
} from "@tabler/icons-react";

import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Image,
  Text,
  Title,
} from "@mantine/core";

import { useNavigate, useParams } from "react-router";

interface Inmate {
  id: number;
  code: string;
  firstname: string;
  middlename?: string;
  lastname: string;
  sex: "Male" | "Female";
  dob: string;
  address: string;
  marital_status: string;
  complexion: string;
  eye_color: string;

  image_path?: string;

  prison: string;
  cell_block: string;

  status: number;
  visiting_privilege: number;

  crimes: string[];
  sentence: string;
  date_from: string;
  date_to?: string;

  emergency_name?: string;
  emergency_relation?: string;
  emergency_contact?: string;
}

interface HistoryRecord {
  id: number;
  date: string;
  action: string;
  remarks: string;
}

/*
 * Données temporaires.
 *
 * Plus tard, elles viendront de ton API/backend.
 */
const inmate: Inmate = {
  id: 1,
  code: "INM-2026-001",
  firstname: "Jean",
  middlename: "Pierre",
  lastname: "Dupont",

  sex: "Male",
  dob: "1990-05-14",

  address: "Goma, Nord-Kivu",
  marital_status: "Married",
  complexion: "Dark",
  eye_color: "Brown",

  prison: "Central Prison",
  cell_block: "Block A - Cell 12",

  status: 1,
  visiting_privilege: 1,

  crimes: [
    "Vol",
    "Agression",
  ],

  sentence: "5 ans",
  date_from: "2024-02-10",
  date_to: "2029-02-10",

  emergency_name: "Marie Dupont",
  emergency_relation: "Épouse",
  emergency_contact: "+243 999 999 999",
};

const history: HistoryRecord[] = [
  {
    id: 1,
    date: "2026-08-20",
    action: "Transfer",
    remarks: "Transfert vers le bloc A.",
  },
  {
    id: 2,
    date: "2026-07-15",
    action: "Visit",
    remarks: "Visite familiale autorisée.",
  },
  {
    id: 3,
    date: "2026-05-12",
    action: "Medical Check",
    remarks: "Contrôle médical effectué.",
  },
];

function formatDate(date?: string) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getFullName(inmate: Inmate) {
  return [
    inmate.firstname,
    inmate.middlename,
    inmate.lastname,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function ViewInmate() {
  const navigate = useNavigate();
  const { id } = useParams();

  /*
   * Plus tard :
   *
   * const inmate = await getInmate(id)
   *
   * Ici nous utilisons temporairement les données
   * ci-dessus.
   */

  const isReleased =
    inmate.date_to &&
    new Date(inmate.date_to) <= new Date();

  const active =
    inmate.status === 1 && !isReleased;

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* =========================================
          HEADER
      ========================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-3">

          <Button
            variant="subtle"
            color="gray"
            onClick={() => navigate("/inmates")}
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
            onClick={() => window.print()}
          >
            Imprimer
          </Button>

          <Button
            variant="light"
            leftSection={
              <IconEdit size={18} />
            }
            onClick={() =>
              navigate(`/inmates/${id}/edit`)
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
          >
            Supprimer
          </Button>

        </Group>

      </div>


      {/* =========================================
          STATUS
      ========================================== */}

      <div className="grid gap-4 md:grid-cols-2">

        <Card
          withBorder
          radius="md"
        >
          <Group justify="space-between">

            <div>
              <Text size="xs" c="dimmed">
                STATUT DU DÉTENU
              </Text>

              <Text fw={600} mt={4}>
                {isReleased
                  ? "Libéré"
                  : active
                    ? "Actif"
                    : "Inactif"}
              </Text>
            </div>

            <Badge
              size="lg"
              color={
                isReleased
                  ? "blue"
                  : active
                    ? "green"
                    : "red"
              }
              variant="light"
            >
              {isReleased
                ? "Libéré"
                : active
                  ? "Actif"
                  : "Inactif"}
            </Badge>

          </Group>
        </Card>


        <Card
          withBorder
          radius="md"
        >
          <Group justify="space-between">

            <div>
              <Text size="xs" c="dimmed">
                PRIVILÈGE DE VISITE
              </Text>

              <Text fw={600} mt={4}>
                {inmate.visiting_privilege
                  ? "Visites autorisées"
                  : "Visites interdites"}
              </Text>
            </div>

            <Badge
              size="lg"
              color={
                inmate.visiting_privilege
                  ? "green"
                  : "red"
              }
              variant="light"
            >
              {inmate.visiting_privilege
                ? "Autorisé"
                : "Interdit"}
            </Badge>

          </Group>
        </Card>

      </div>


      {/* =========================================
          PERSONAL INFORMATION
      ========================================== */}

      <Card
        withBorder
        radius="md"
      >

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
              src={
                inmate.image_path ||
                "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(
                  getFullName(inmate)
                ) +
                "&size=300"
              }
              alt={getFullName(inmate)}
              radius="md"
              className="h-44 w-44 object-cover"
            />

          </div>


          {/* DETAILS */}

          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">

            <Info
              label="Nom complet"
              value={getFullName(inmate)}
            />

            <Info
              label="Code"
              value={inmate.code}
            />

            <Info
              label="Sexe"
              value={
                inmate.sex === "Male"
                  ? "Masculin"
                  : "Féminin"
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
              label="Teint"
              value={inmate.complexion}
            />

            <Info
              label="Couleur des yeux"
              value={inmate.eye_color}
            />

            <Info
              label="Adresse"
              value={inmate.address}
              icon={<IconMapPin size={15} />}
            />

          </div>

        </div>

      </Card>


      {/* =========================================
          PRISON INFORMATION
      ========================================== */}

      <Card
        withBorder
        radius="md"
      >

        <SectionHeader
          icon={<IconShield size={20} />}
          title="Affectation"
          description="Informations sur l'établissement pénitentiaire"
        />

        <Divider my="lg" />

        <div className="grid gap-6 md:grid-cols-2">

          <Info
            label="Prison"
            value={inmate.prison}
            icon={<IconShield size={15} />}
          />

          <Info
            label="Bloc / Cellule"
            value={inmate.cell_block}
          />

        </div>

      </Card>


      {/* =========================================
          CASE DETAILS
      ========================================== */}

      <Card
        withBorder
        radius="md"
      >

        <SectionHeader
          icon={<IconFileDescription size={20} />}
          title="Détails de l'affaire"
          description="Informations judiciaires"
        />

        <Divider my="lg" />

        <div className="grid gap-6 md:grid-cols-2">

          <Info
            label="Infractions commises"
            value={inmate.crimes.join(", ")}
          />

          <Info
            label="Peine"
            value={inmate.sentence}
          />

          <Info
            label="Début de la peine"
            value={formatDate(inmate.date_from)}
          />

          <Info
            label="Fin de la peine"
            value={formatDate(inmate.date_to)}
          />

        </div>

      </Card>


      {/* =========================================
          EMERGENCY CONTACT
      ========================================== */}

      <Card
        withBorder
        radius="md"
      >

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


      {/* =========================================
          HISTORY
      ========================================== */}

      <Card
        withBorder
        radius="md"
      >

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <SectionHeader
            icon={<IconHistory size={20} />}
            title="Historique du détenu"
            description="Historique des opérations et événements"
          />

          <Button
            leftSection={<IconHistory size={17} />}
          >
            Ajouter un événement
          </Button>

        </div>

        <Divider my="lg" />

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

                <th className="px-3 py-3 text-right">
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
                    {record.remarks}
                  </td>

                  <td className="px-3 py-4">

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

      </Card>

    </div>
  );
}


/* =========================================
   SECTION HEADER
========================================= */

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

      <div className="
        flex h-9 w-9 shrink-0
        items-center justify-center
        rounded-lg
        bg-blue-50
        text-blue-600
      ">
        {icon}
      </div>

      <div>

        <Text fw={600}>
          {title}
        </Text>

        {description && (
          <Text
            size="xs"
            c="dimmed"
          >
            {description}
          </Text>
        )}

      </div>

    </div>
  );
}


/* =========================================
   INFO
========================================= */

interface InfoProps {
  label: string;
  value?: string;
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