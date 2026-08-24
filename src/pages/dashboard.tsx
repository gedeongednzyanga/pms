import {
  IconUsers,
  IconUser,
  IconCalendarEvent,
  IconBuilding,
  IconArrowUpRight,
  IconArrowDownRight,
  IconEye,
  IconDotsVertical,
} from "@tabler/icons-react";

import {
  Badge,
  Card,
  Group,
  Menu,
  Text,
  Avatar,
  Table,
} from "@mantine/core";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/* =========================
   DATA
========================= */

const genderData = [
  {
    name: "Hommes",
    value: 1080,
  },
  {
    name: "Femmes",
    value: 168,
  },
];

const prisonersEvolution = [
  {
    month: "Jan",
    prisonniers: 980,
  },
  {
    month: "Fév",
    prisonniers: 1020,
  },
  {
    month: "Mar",
    prisonniers: 1065,
  },
  {
    month: "Avr",
    prisonniers: 1090,
  },
  {
    month: "Mai",
    prisonniers: 1135,
  },
  {
    month: "Juin",
    prisonniers: 1180,
  },
  {
    month: "Juil",
    prisonniers: 1215,
  },
  {
    month: "Août",
    prisonniers: 1248,
  },
];

const latestPrisoners = [
  {
    id: 1,
    name: "Jean Dupont",
    matricule: "PR-2026-00125",
    gender: "Masculin",
    prison: "Prison Centrale",
    cell: "B-12",
    date: "24 Août 2026",
  },
  {
    id: 2,
    name: "Marie Kabeya",
    matricule: "PR-2026-00124",
    gender: "Féminin",
    prison: "Prison Centrale",
    cell: "F-04",
    date: "24 Août 2026",
  },
  {
    id: 3,
    name: "Patrick Ilunga",
    matricule: "PR-2026-00123",
    gender: "Masculin",
    prison: "Prison Nord",
    cell: "A-08",
    date: "23 Août 2026",
  },
  {
    id: 4,
    name: "David Mbuyi",
    matricule: "PR-2026-00122",
    gender: "Masculin",
    prison: "Prison Centrale",
    cell: "C-02",
    date: "23 Août 2026",
  },
  {
    id: 5,
    name: "Sarah Mukendi",
    matricule: "PR-2026-00121",
    gender: "Féminin",
    prison: "Prison Sud",
    cell: "F-11",
    date: "22 Août 2026",
  },
];

const activities = [
  {
    title: "Nouvel enregistrement",
    description: "Jean Dupont a été enregistré",
    time: "Il y a 10 min",
  },
  {
    title: "Visite enregistrée",
    description: "Visite de Marie Kabeya",
    time: "Il y a 25 min",
  },
  {
    title: "Transfert effectué",
    description: "Transfert vers Cellule B-12",
    time: "Il y a 1h",
  },
  {
    title: "Rapport généré",
    description: "Rapport mensuel des détenus",
    time: "Il y a 2h",
  },
];

/* =========================
   DASHBOARD
========================= */

export default function Dashboard() {
  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================== */}

      <div>
        <Text size="xl" fw={700}>
          Dashboard
        </Text>

        <Text size="sm" c="dimmed">
          Vue d'ensemble de votre établissement.
        </Text>
      </div>

      {/* =========================
          STATISTICS
      ========================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Détenus"
          value="1,248"
          description="+12% ce mois"
          icon={<IconUsers size={22} />}
          positive
        />

        <StatCard
          title="Visiteurs"
          value="356"
          description="+8.2% ce mois"
          icon={<IconUser size={22} />}
          positive
        />

        <StatCard
          title="Visites aujourd'hui"
          value="48"
          description="12 en attente"
          icon={<IconCalendarEvent size={22} />}
        />

        <StatCard
          title="Établissements"
          value="12"
          description="Tous opérationnels"
          icon={<IconBuilding size={22} />}
          positive
        />

      </div>

      {/* =========================
          CHARTS
      ========================== */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Gender */}
        <Card
          withBorder
          radius="md"
        >
          <Text fw={600}>
            Répartition par sexe
          </Text>

          <Text
            size="xs"
            c="dimmed"
            mb="md"
          >
            Nombre de détenus hommes et femmes
          </Text>

          <div className="h-70">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>

                <Pie
                  data={genderData}
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {genderData.map(
                    (_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? "#2563eb"
                            : "#ec4899"
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />

                <Legend
                  verticalAlign="bottom"
                  height={36}
                />

              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-3">

            <GenderStat
              label="Hommes"
              value="1,080"
              percentage="86.5%"
            />

            <GenderStat
              label="Femmes"
              value="168"
              percentage="13.5%"
            />

          </div>
        </Card>

        {/* Evolution */}
        <Card
          withBorder
          radius="md"
          className="lg:col-span-2"
        >
          <Group
            justify="space-between"
            mb="md"
          >
            <div>
              <Text fw={600}>
                Évolution des détenus
              </Text>

              <Text
                size="xs"
                c="dimmed"
              >
                Évolution du nombre de détenus
                durant les derniers mois
              </Text>
            </div>

            <Badge variant="light">
              2026
            </Badge>
          </Group>

          <div className="h-82.5">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={prisonersEvolution}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="prisonniers"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>

          </div>
        </Card>

      </div>

      {/* =========================
          LATEST PRISONERS
      ========================== */}

      <Card
        withBorder
        radius="md"
      >
        <Group
          justify="space-between"
          mb="md"
        >
          <div>
            <Text fw={600}>
              Derniers détenus enregistrés
            </Text>

            <Text
              size="xs"
              c="dimmed"
            >
              Les derniers détenus ajoutés
              au système
            </Text>
          </div>

          <ButtonLink>
            Voir tous
          </ButtonLink>
        </Group>

        <div className="overflow-x-auto">

          <Table
            verticalSpacing="sm"
            highlightOnHover
            withColumnBorders={false}
          >
            <Table.Thead>
              <Table.Tr>

                <Table.Th>
                  Détenu
                </Table.Th>

                <Table.Th>
                  Matricule
                </Table.Th>

                <Table.Th>
                  Sexe
                </Table.Th>

                <Table.Th>
                  Établissement
                </Table.Th>

                <Table.Th>
                  Cellule
                </Table.Th>

                <Table.Th>
                  Date
                </Table.Th>

                <Table.Th />

              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>

              {latestPrisoners.map(
                (prisoner) => (
                  <Table.Tr key={prisoner.id}>

                    <Table.Td>

                      <div className="flex items-center gap-3">

                        <Avatar
                          radius="xl"
                          size={34}
                        >
                          {prisoner.name
                            .split(" ")
                            .map(
                              (name) =>
                                name[0]
                            )
                            .join("")
                            .slice(0, 2)}
                        </Avatar>

                        <div>
                          <Text
                            size="sm"
                            fw={500}
                          >
                            {prisoner.name}
                          </Text>

                          <Text
                            size="xs"
                            c="dimmed"
                          >
                            Détenu
                          </Text>
                        </div>

                      </div>

                    </Table.Td>

                    <Table.Td>
                      <Text size="sm">
                        {prisoner.matricule}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Badge
                        variant="light"
                        color={
                          prisoner.gender ===
                          "Masculin"
                            ? "blue"
                            : "pink"
                        }
                      >
                        {prisoner.gender}
                      </Badge>
                    </Table.Td>

                    <Table.Td>
                      <Text size="sm">
                        {prisoner.prison}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Badge
                        variant="light"
                        color="gray"
                      >
                        {prisoner.cell}
                      </Badge>
                    </Table.Td>

                    <Table.Td>
                      <Text
                        size="sm"
                        c="dimmed"
                      >
                        {prisoner.date}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Menu
                        position="bottom-end"
                        shadow="md"
                      >
                        <Menu.Target>
                          <IconDotsVertical
                            size={18}
                            className="cursor-pointer text-gray-500"
                          />
                        </Menu.Target>

                        <Menu.Dropdown>

                          <Menu.Item
                            leftSection={
                              <IconEye
                                size={16}
                              />
                            }
                          >
                            Voir le dossier
                          </Menu.Item>

                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>

                  </Table.Tr>
                )
              )}

            </Table.Tbody>
          </Table>

        </div>
      </Card>

      {/* =========================
          BOTTOM
      ========================== */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Activities */}

        <Card
          withBorder
          radius="md"
          className="lg:col-span-2"
        >
          <Group
            justify="space-between"
            mb="md"
          >
            <div>
              <Text fw={600}>
                Activités récentes
              </Text>

              <Text
                size="xs"
                c="dimmed"
              >
                Dernières opérations
              </Text>
            </div>

            <Badge variant="light">
              Aujourd'hui
            </Badge>
          </Group>

          <div className="space-y-1">

            {activities.map(
              (activity, index) => (
                <Activity
                  key={index}
                  {...activity}
                />
              )
            )}

          </div>
        </Card>

        {/* Quick actions */}

        <Card
          withBorder
          radius="md"
        >
          <Text fw={600}>
            Actions rapides
          </Text>

          <Text
            size="xs"
            c="dimmed"
            mb="md"
          >
            Accès rapide aux fonctionnalités
            principales.
          </Text>

          <div className="grid gap-2">

            <QuickAction
              label="Ajouter un détenu"
              icon={
                <IconUser size={18} />
              }
            />

            <QuickAction
              label="Enregistrer une visite"
              icon={
                <IconCalendarEvent
                  size={18}
                />
              }
            />

            <QuickAction
              label="Voir les rapports"
              icon={
                <IconArrowUpRight
                  size={18}
                />
              }
            />

          </div>
        </Card>

      </div>

    </div>
  );
}


/* =========================
   STAT CARD
========================= */

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  positive?: boolean;
}

function StatCard({
  title,
  value,
  description,
  icon,
  positive,
}: StatCardProps) {
  return (
    <Card
      withBorder
      radius="md"
      className="
        transition
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >
      <Group justify="space-between">

        <div>
          <Text
            size="sm"
            c="dimmed"
          >
            {title}
          </Text>

          <Text
            size="xl"
            fw={700}
            mt={4}
          >
            {value}
          </Text>
        </div>

        <div
          className="
            flex h-11 w-11
            items-center justify-center
            rounded-xl
            bg-blue-50
            text-blue-600
          "
        >
          {icon}
        </div>

      </Group>

      <div className="mt-4 flex items-center gap-1">

        {positive ? (
          <IconArrowUpRight
            size={15}
            className="text-green-600"
          />
        ) : (
          <IconArrowDownRight
            size={15}
            className="text-orange-500"
          />
        )}

        <Text
          size="xs"
          c="dimmed"
        >
          {description}
        </Text>

      </div>
    </Card>
  );
}


/* =========================
   GENDER STAT
========================= */

function GenderStat({
  label,
  value,
  percentage,
}: {
  label: string;
  value: string;
  percentage: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <Text size="xs" c="dimmed">
        {label}
      </Text>

      <div className="mt-1 flex items-center justify-between">

        <Text fw={700}>
          {value}
        </Text>

        <Text
          size="xs"
          c="dimmed"
        >
          {percentage}
        </Text>

      </div>
    </div>
  );
}


/* =========================
   ACTIVITY
========================= */

interface ActivityProps {
  title: string;
  description: string;
  time: string;
}

function Activity({
  title,
  description,
  time,
}: ActivityProps) {
  return (
    <div
      className="
        flex items-center gap-3
        rounded-lg p-3
        transition
        hover:bg-gray-50
      "
    >
      <div className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />

      <div className="min-w-0 flex-1">

        <Text
          size="sm"
          fw={500}
        >
          {title}
        </Text>

        <Text
          size="xs"
          c="dimmed"
          className="truncate"
        >
          {description}
        </Text>

      </div>

      <Text
        size="xs"
        c="dimmed"
        className="shrink-0"
      >
        {time}
      </Text>

    </div>
  );
}


/* =========================
   QUICK ACTION
========================= */

interface QuickActionProps {
  label: string;
  icon: React.ReactNode;
}

function QuickAction({
  label,
  icon,
}: QuickActionProps) {
  return (
    <button
      type="button"
      className="
        flex w-full items-center gap-3
        rounded-lg border
        px-3 py-3
        text-left text-sm
        transition
        hover:bg-gray-50
        hover:border-blue-200
      "
    >
      <div
        className="
          flex h-8 w-8
          items-center justify-center
          rounded-md
          bg-blue-50
          text-blue-600
        "
      >
        {icon}
      </div>

      <span>
        {label}
      </span>

    </button>
  );
}


/* =========================
   BUTTON LINK
========================= */

function ButtonLink({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="
        text-sm
        font-medium
        text-blue-600
        hover:text-blue-700
      "
    >
      {children}
    </button>
  );
}