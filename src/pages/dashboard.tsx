
import {
  IconUsers,
  IconUser,
  IconBuilding,
  IconHome,
  IconArrowUpRight,
  IconArrowDownRight,
  IconEye,
  IconDotsVertical,
  IconScale,
  IconRefresh,
} from "@tabler/icons-react";

import {
  Badge,
  Card,
  Group,
  Menu,
  Text,
  Avatar,
  Table,
  Skeleton,
  ActionIcon,
  Tooltip,
} from "@mantine/core";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

import { DashboardStats } from "../interfaces/dashboard";


/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {

  const [dashboard, setDashboard] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


  /* =========================================================
     CHARGEMENT DASHBOARD
  ========================================================= */

  const loadDashboard = async (
    showRefresh = false
  ) => {

    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data =
        await invoke<DashboardStats>(
          "get_dashboard_stats_cmd"
        );

      setDashboard(data);

    } catch (error) {

      console.error(
        "Erreur dashboard :",
        error
      );

      toast.error(
        `Impossible de charger le dashboard : ${String(error)}`
      );

    } finally {

      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadDashboard();
  }, []);


  /* =========================================================
     DONNEES SEXE
  ========================================================= */

  const genderData = useMemo(() => [

    {
      name: "Hommes",
      value: dashboard?.total_male ?? 0,
    },

    {
      name: "Femmes",
      value: dashboard?.total_female ?? 0,
    },

  ], [dashboard]);


  /* =========================================================
     POURCENTAGES SEXE
  ========================================================= */

  const malePercentage =
    dashboard &&
    dashboard.total_inmates > 0
      ? (
          (dashboard.total_male /
            dashboard.total_inmates) *
          100
        ).toFixed(1)
      : "0.0";


  const femalePercentage =
    dashboard &&
    dashboard.total_inmates > 0
      ? (
          (dashboard.total_female /
            dashboard.total_inmates) *
          100
        ).toFixed(1)
      : "0.0";


  /* =========================================================
     TAUX OCCUPATION
  ========================================================= */

  const occupancyPercentage =
    dashboard &&
    dashboard.total_capacity > 0
      ? (
          (dashboard.total_inmates /
            dashboard.total_capacity) *
          100
        ).toFixed(1)
      : "0.0";


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="space-y-6">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <Group justify="space-between">

        <div>

          <Text
            size="xl"
            fw={700}
          >
            Dashboard
          </Text>

          <Text
            size="sm"
            c="dimmed"
          >
            Vue d'ensemble de votre établissement.
          </Text>

        </div>


        <Tooltip label="Actualiser">

          <ActionIcon
            variant="light"
            size="lg"
            loading={refreshing}
            onClick={() =>
              loadDashboard(true)
            }
          >
            <IconRefresh
              size={18}
            />
          </ActionIcon>

        </Tooltip>

      </Group>


      {/* =====================================================
          STATISTIQUES
      ===================================================== */}

      <div
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        {/* DETENUS */}

        <StatCard
          title="Détenus"
          value={
            dashboard
              ? dashboard.total_inmates.toLocaleString()
              : "0"
          }
          description="Total enregistré"
          icon={
            <IconUsers
              size={22}
            />
          }
          positive
          loading={loading}
        />


        {/* HOMMES */}

        <StatCard
          title="Hommes"
          value={
            dashboard
              ? dashboard.total_male.toLocaleString()
              : "0"
          }
          description={`${malePercentage}% des détenus`}
          icon={
            <IconUser
              size={22}
            />
          }
          positive
          loading={loading}
        />


        {/* CELLULES */}

        <StatCard
          title="Cellules"
          value={
            dashboard
              ? dashboard.total_cells.toLocaleString()
              : "0"
          }
          description={`${dashboard?.occupied_cells ?? 0} occupées`}
          icon={
            <IconHome
              size={22}
            />
          }
          loading={loading}
        />


        {/* ETABLISSEMENTS */}

        {/* <StatCard
          title="Établissements"
          value={
            dashboard
              ? dashboard.total_prisons.toLocaleString()
              : "0"
          }
          description="Établissements actifs"
          icon={
            <IconBuilding
              size={22}
            />
          }
          positive
          loading={loading}
        /> */}

        <StatCard
          title="Taux d'occupation"
          value={`${occupancyPercentage}%`}
          description={`${dashboard?.occupied_cells ?? 0} cellules occupées`}
          icon={<IconBuilding size={22} />}
        />

      </div>


      {/* =====================================================
          INFORMATIONS CAPACITE
      ===================================================== */}

      <div
        className="
          grid
          gap-4
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >

        <MiniStat
          title="Capacité totale"
          value={
            dashboard?.total_capacity
              ?.toLocaleString() ?? "0"
          }
          icon={
            <IconHome
              size={18}
            />
          }
        />


        <MiniStat
          title="Places disponibles"
          value={
            dashboard?.available_capacity
              ?.toLocaleString() ?? "0"
          }
          icon={
            <IconArrowDownRight
              size={18}
            />
          }
        />


        <MiniStat
          title="Cellules occupées"
          value={
            dashboard?.occupied_cells
              ?.toLocaleString() ?? "0"
          }
          icon={
            <IconUsers
              size={18}
            />
          }
        />


        <MiniStat
          title="Crimes actifs"
          value={
            dashboard?.total_crimes
              ?.toLocaleString() ?? "0"
          }
          icon={
            <IconScale
              size={18}
            />
          }
        />

      </div>


      {/* =====================================================
          GRAPHIQUES
      ===================================================== */}

      <div
        className="
          grid
          gap-6
          lg:grid-cols-3
        "
      >


        {/* ===================================================
            REPARTITION SEXE
        =================================================== */}

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


                <RechartsTooltip />


                <Legend
                  verticalAlign="bottom"
                  height={36}
                />

              </PieChart>

            </ResponsiveContainer>

          </div>


          <div
            className="
              mt-2
              grid
              grid-cols-2
              gap-3
            "
          >

            <GenderStat
              label="Hommes"
              value={
                dashboard?.total_male
                  ?.toLocaleString() ?? "0"
              }
              percentage={`${malePercentage}%`}
            />


            <GenderStat
              label="Femmes"
              value={
                dashboard?.total_female
                  ?.toLocaleString() ?? "0"
              }
              percentage={`${femalePercentage}%`}
            />

          </div>

        </Card>


        {/* ===================================================
            EVOLUTION
        =================================================== */}

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

              {new Date()
                .getFullYear()}

            </Badge>

          </Group>


          <div className="h-82.5">

            {loading ? (

              <Skeleton
                height="100%"
                radius="md"
              />

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={
                    dashboard?.prisoners_evolution ?? []
                  }
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

                  <RechartsTooltip />


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

            )}

          </div>

        </Card>

      </div>


      {/* =====================================================
          DERNIERS DETENUS
      ===================================================== */}

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

              {loading ? (

                Array.from({
                  length: 5,
                }).map((_, index) => (

                  <Table.Tr key={index}>

                    <Table.Td>
                      <Skeleton height={35} />
                    </Table.Td>

                    <Table.Td>
                      <Skeleton height={20} />
                    </Table.Td>

                    <Table.Td>
                      <Skeleton height={20} />
                    </Table.Td>

                    <Table.Td>
                      <Skeleton height={20} />
                    </Table.Td>

                    <Table.Td>
                      <Skeleton height={20} />
                    </Table.Td>

                    <Table.Td>
                      <Skeleton height={20} />
                    </Table.Td>

                    <Table.Td />

                  </Table.Tr>

                ))

              ) : dashboard?.latest_prisoners?.length ? (

                dashboard.latest_prisoners.map(
                  (prisoner) => (

                    <Table.Tr
                      key={prisoner.id}
                    >

                      <Table.Td>

                        <div
                          className="
                            flex
                            items-center
                            gap-3
                          "
                        >

                          <Avatar
                            radius="xl"
                            size={34}
                          >

                            {prisoner.name
                              .split(" ")
                              .filter(Boolean)
                              .map(
                                (name) =>
                                  name[0]
                              )
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}

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

                            <ActionIcon
                              variant="subtle"
                              color="gray"
                            >

                              <IconDotsVertical
                                size={18}
                              />

                            </ActionIcon>

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
                )

              ) : (

                <Table.Tr>

                  <Table.Td
                    colSpan={7}
                  >

                    <div
                      className="
                        py-8
                        text-center
                      "
                    >

                      <Text
                        size="sm"
                        c="dimmed"
                      >
                        Aucun détenu enregistré.
                      </Text>

                    </div>

                  </Table.Td>

                </Table.Tr>

              )}

            </Table.Tbody>

          </Table>

        </div>

      </Card>


      {/* =====================================================
          BOTTOM
      ===================================================== */}

      <div
        className="
          grid
          gap-6
          lg:grid-cols-3
        "
      >


        {/* ===================================================
            ACTIVITES
        =================================================== */}

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

            {loading ? (

              Array.from({
                length: 4,
              }).map((_, index) => (

                <div
                  key={index}
                  className="
                    flex
                    items-center
                    gap-3
                    p-3
                  "
                >

                  <Skeleton
                    circle
                    height={8}
                    width={8}
                  />

                  <div className="flex-1">

                    <Skeleton
                      height={15}
                      width="40%"
                      mb={5}
                    />

                    <Skeleton
                      height={12}
                      width="60%"
                    />

                  </div>

                  <Skeleton
                    height={12}
                    width={60}
                  />

                </div>

              ))

            ) : dashboard?.activities?.length ? (

              dashboard.activities.map(
                (activity, index) => (

                  <Activity
                    key={`${activity.title}-${index}`}
                    {...activity}
                  />

                )
              )

            ) : (

              <Text
                size="sm"
                c="dimmed"
                ta="center"
                py="xl"
              >
                Aucune activité récente.
              </Text>

            )}

          </div>

        </Card>


        {/* ===================================================
            ACTIONS RAPIDES
        =================================================== */}

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
                <IconUser
                  size={18}
                />
              }
            />


            <QuickAction
              label="Gérer les établissements"
              icon={
                <IconBuilding
                  size={18}
                />
              }
            />


            <QuickAction
              label="Voir les crimes"
              icon={
                <IconScale
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


/* =========================================================
   STAT CARD
========================================================= */

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  positive?: boolean;
  loading?: boolean;
}


function StatCard({
  title,
  value,
  description,
  icon,
  positive,
  loading,
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


          {loading ? (

            <Skeleton
              height={30}
              width={80}
              mt={4}
            />

          ) : (

            <Text
              size="xl"
              fw={700}
              mt={4}
            >
              {value}
            </Text>

          )}

        </div>


        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-blue-50
            text-blue-600
          "
        >
          {icon}
        </div>

      </Group>


      <div
        className="
          mt-4
          flex
          items-center
          gap-1
        "
      >

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


/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {

  return (

    <Card
      withBorder
      radius="md"
      padding="sm"
    >

      <Group gap="sm">

        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-gray-50
            text-gray-600
          "
        >
          {icon}
        </div>


        <div>

          <Text
            size="xs"
            c="dimmed"
          >
            {title}
          </Text>

          <Text
            fw={700}
            size="sm"
          >
            {value}
          </Text>

        </div>

      </Group>

    </Card>
  );
}


/* =========================================================
   GENDER STAT
========================================================= */

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

    <div
      className="
        rounded-lg
        bg-gray-50
        p-3
      "
    >

      <Text
        size="xs"
        c="dimmed"
      >
        {label}
      </Text>


      <div
        className="
          mt-1
          flex
          items-center
          justify-between
        "
      >

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


/* =========================================================
   ACTIVITY
========================================================= */

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
        flex
        items-center
        gap-3
        rounded-lg
        p-3
        transition
        hover:bg-gray-50
      "
    >

      <div
        className="
          h-2
          w-2
          shrink-0
          rounded-full
          bg-blue-600
        "
      />


      <div
        className="
          min-w-0
          flex-1
        "
      >

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


/* =========================================================
   QUICK ACTION
========================================================= */

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
        flex
        w-full
        items-center
        gap-3
        rounded-lg
        border
        px-3
        py-3
        text-left
        text-sm
        transition
        hover:bg-gray-50
        hover:border-blue-200
      "
    >

      <div
        className="
          flex
          h-8
          w-8
          items-center
          justify-center
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


/* =========================================================
   BUTTON LINK
========================================================= */

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
