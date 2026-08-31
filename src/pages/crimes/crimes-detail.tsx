import {
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Crime } from "../../interfaces/crime";


interface CrimeDetailsProps {
  crime: Crime;
  onEdit: () => void;
  onClose: () => void;
}

export default function CrimeDetails({
  crime,
  onEdit,
  onClose,
}: CrimeDetailsProps) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
    >
      <Card.Section
        withBorder
        inheritPadding
        py="sm"
      >
        <Title order={4}>
          Détails du crime
        </Title>
      </Card.Section>

      <Stack gap="md" mt="md">
        {/* Nom */}
        <div>
          <Text
            size="sm"
            c="dimmed"
            fw={500}
          >
            Nom
          </Text>

          <Text fw={500}>
            {crime.crime_name}
          </Text>
        </div>

        {/* Statut */}
        <div>
          <Text
            size="sm"
            c="dimmed"
            fw={500}
            mb={4}
          >
            Statut
          </Text>

          {crime.statut_crime === "active" ? (
            <Badge
              color="green"
              variant="light"
            >
              Actif
            </Badge>
          ) : (
            <Badge
              color="red"
              variant="light"
            >
              Inactif
            </Badge>
          )}
        </div>

        {/* Date */}
        <div>
          <Text
            size="sm"
            c="dimmed"
            fw={500}
          >
            Date de création
          </Text>

          <Text>
            {new Date(
              crime.created_at
            ).toLocaleString("fr-FR")}
          </Text>
        </div>

        {/* Actions */}
        <Group justify="flex-end" mt="md">
          <Button
            variant="default"
            onClick={onClose}
          >
            Fermer
          </Button>

          <Button onClick={onEdit}>
            Modifier
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}