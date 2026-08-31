import { useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Menu,
  ScrollArea,
  Table,
  Text,
  Title,
  Loader,
  Center,
} from "@mantine/core";

import {
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { invoke } from "@tauri-apps/api/core";
import { Crime } from "../../interfaces/crime";

// export interface Crime {
//   id: number;
//   name: string;
//   status: number;
//   date_created: string;
//   delete_flag: number;
// }

interface CrimeListProps {
  onCreate: () => void;
  onEdit: (crime: Crime) => void;
  onView: (crime: Crime) => void;
}

export default function CrimeList({
  onCreate,
  onEdit,
  onView,
}: CrimeListProps) {
  const [crimes, setCrimes] = useState<Crime[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCrimes = async () => {
    try {
      setLoading(true);

      const result = await invoke<Crime[]>(
        "get_crimes_cmd"
      );

      setCrimes(result);
    } catch (error) {
      console.error(
        "Erreur chargement des crimes :",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrimes();
  }, []);

  const deleteCrime = async (id: string) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer définitivement ce crime ?"
    );

    if (!confirmed) return;

    try {
      await invoke("delete_crime_cmd", { id });

      await loadCrimes();
    } catch (error) {
      console.error(
        "Erreur suppression crime :",
        error
      );
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const rows = crimes.map((crime, index) => (
    <Table.Tr key={crime.id}>
      <Table.Td ta="center">
        {index + 1}
      </Table.Td>

      <Table.Td>
        {formatDate(crime.created_at)}
      </Table.Td>

      <Table.Td>
        <Text fw={500}>
          {crime.crime_name}
        </Text>
      </Table.Td>

      <Table.Td ta="center">
        {crime.statut_crime === "active" ? (
          <Badge
            color="green"
            variant="light"
            radius="xl"
          >
            Actif
          </Badge>
        ) : (
          <Badge
            color="red"
            variant="light"
            radius="xl"
          >
            Inactif
          </Badge>
        )}
      </Table.Td>

      <Table.Td>
        <Group
          justify="center"
          gap={4}
        >
          <Menu
            shadow="md"
            width={180}
            position="bottom-end"
          >
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
              >
                <MoreVertical size={18} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>
                Actions
              </Menu.Label>

              <Menu.Item
                leftSection={<Eye size={16} />}
                onClick={() => onView(crime)}
              >
                Voir
              </Menu.Item>

              <Menu.Item
                leftSection={<Pencil size={16} />}
                onClick={() => onEdit(crime)}
              >
                Modifier
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item
                color="red"
                leftSection={<Trash2 size={16} />}
                onClick={() =>
                  deleteCrime(crime.id)
                }
              >
                Supprimer
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Card
      shadow="sm"
      radius="md"
      withBorder
    >
      {/* Header */}
      <Card.Section
        withBorder
        inheritPadding
        py="md"
      >
        <Group justify="space-between">
          <div>
            <Title order={4}>
              Liste des crimes
            </Title>

            <Text
              size="sm"
              c="dimmed"
              mt={2}
            >
              Gestion des infractions enregistrées
            </Text>
          </div>

          <Button
            leftSection={<Plus size={18} />}
            onClick={onCreate}
          >
            Nouveau crime
          </Button>
        </Group>
      </Card.Section>

      {/* Table */}
      <ScrollArea>
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          verticalSpacing="sm"
          mt="md"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th ta="center" w={60}>
                #
              </Table.Th>

              <Table.Th>
                Date de création
              </Table.Th>

              <Table.Th>
                Nom
              </Table.Th>

              <Table.Th ta="center">
                Statut
              </Table.Th>

              <Table.Th ta="center" w={120}>
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Center py="xl">
                    <Group>
                      <Loader size="sm" />
                      <Text c="dimmed">
                        Chargement des crimes...
                      </Text>
                    </Group>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : crimes.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Center py="xl">
                    <Text c="dimmed">
                      Aucun crime enregistré
                    </Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : (
              rows
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}