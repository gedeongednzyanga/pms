import { useState } from "react";
import {
  IconArrowLeft,
  IconCalendar,
  IconCamera,
  IconDeviceFloppy,
  IconId,
  IconMapPin,
  IconPhone,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

import {
  Badge,
  Button,
  Card,
  Divider,
  FileInput,
  Grid,
  Group,
  Image,
  MultiSelect,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";

import { useNavigate, useParams } from "react-router";

export default function ManageInmate() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [image, setImage] = useState<File | null>(null);

  const [form, setForm] = useState({
    code: "",
    cell_id: "",
    firstname: "",
    middlename: "",
    lastname: "",
    dob: "",
    sex: "Male",
    address: "",
    marital_status: "Single",
    complexion: "",
    eye_color: "",

    crime_ids: [] as string[],
    sentence: "",
    date_from: "",
    date_to: "",

    emergency_name: "",
    emergency_relation: "",
    emergency_contact: "",
  });

  const updateField = (
    field: keyof typeof form,
    value: string | string[]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    console.log({
      ...form,
      image,
    });

    // Ici tu pourras appeler ta commande Tauri :
    //
    // await invoke("save_inmate_cmd", {
    //   inmate: form,
    //   imagePath: imagePath,
    // });

    navigate(`/inmates/${id ?? "new"}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <Group gap="sm">
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => navigate("/inmates")}
              leftSection={<IconArrowLeft size={17} />}
            >
              Retour
            </Button>
          </Group>

          <div className="mt-3">
            <Title order={2}>
              {isEditing
                ? "Modifier le détenu"
                : "Nouveau détenu"}
            </Title>

            <Text size="sm" c="dimmed" mt={4}>
              {isEditing
                ? "Modifiez les informations du détenu."
                : "Enregistrez un nouveau détenu dans le système."}
            </Text>
          </div>
        </div>

        <Badge
          size="lg"
          variant="light"
          color={isEditing ? "orange" : "blue"}
        >
          {isEditing ? "Modification" : "Nouvel enregistrement"}
        </Badge>
      </div>


      {/* =====================================================
          FORM
      ====================================================== */}

      <form onSubmit={handleSubmit}>

        <Stack gap="lg">

          {/* =================================================
              IDENTIFICATION
          ================================================== */}

          <Card
            withBorder
            radius="md"
            shadow="sm"
          >
            <Card.Section
              withBorder
              inheritPadding
              py="md"
            >
              <Group>
                <Paper
                  p="xs"
                  radius="md"
                  bg="blue.0"
                  c="blue"
                >
                  <IconId size={20} />
                </Paper>

                <div>
                  <Text fw={600}>
                    Identification
                  </Text>

                  <Text size="xs" c="dimmed">
                    Informations principales du détenu
                  </Text>
                </div>
              </Group>
            </Card.Section>

            <Stack p="lg">

              <Grid>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Code"
                    placeholder="Ex: DET-2026-001"
                    required
                    value={form.code}
                    onChange={(e) =>
                      updateField("code", e.currentTarget.value)
                    }
                    leftSection={<IconId size={17} />}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Prison & cellule"
                    placeholder="Sélectionner une cellule"
                    required
                    data={[
                      {
                        value: "1",
                        label: "Prison Centrale - Cellule A-01",
                      },
                      {
                        value: "2",
                        label: "Prison Centrale - Cellule A-02",
                      },
                      {
                        value: "3",
                        label: "Prison Centrale - Cellule B-12",
                      },
                    ]}
                    value={form.cell_id}
                    onChange={(value) =>
                      updateField("cell_id", value ?? "")
                    }
                  />
                </Grid.Col>

              </Grid>

              <Divider />

              <Grid>

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput
                    label="Prénom"
                    placeholder="Jean"
                    required
                    value={form.firstname}
                    onChange={(e) =>
                      updateField(
                        "firstname",
                        e.currentTarget.value
                      )
                    }
                    leftSection={<IconUser size={17} />}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput
                    label="Deuxième prénom"
                    placeholder="Optionnel"
                    value={form.middlename}
                    onChange={(e) =>
                      updateField(
                        "middlename",
                        e.currentTarget.value
                      )
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput
                    label="Nom"
                    placeholder="Dupont"
                    required
                    value={form.lastname}
                    onChange={(e) =>
                      updateField(
                        "lastname",
                        e.currentTarget.value
                      )
                    }
                  />
                </Grid.Col>

              </Grid>

              <Grid>

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput
                    type="date"
                    label="Date de naissance"
                    required
                    value={form.dob}
                    onChange={(e) =>
                      updateField("dob", e.currentTarget.value)
                    }
                    leftSection={<IconCalendar size={17} />}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    label="Sexe"
                    required
                    data={[
                      {
                        value: "Male",
                        label: "Masculin",
                      },
                      {
                        value: "Female",
                        label: "Féminin",
                      },
                    ]}
                    value={form.sex}
                    onChange={(value) =>
                      updateField("sex", value ?? "Male")
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    label="État matrimonial"
                    required
                    data={[
                      {
                        value: "Single",
                        label: "Célibataire",
                      },
                      {
                        value: "Married",
                        label: "Marié(e)",
                      },
                      {
                        value: "Widower",
                        label: "Veuf",
                      },
                      {
                        value: "Widow",
                        label: "Veuve",
                      },
                    ]}
                    value={form.marital_status}
                    onChange={(value) =>
                      updateField(
                        "marital_status",
                        value ?? "Single"
                      )
                    }
                  />
                </Grid.Col>

              </Grid>

              <Textarea
                label="Adresse"
                placeholder="Adresse complète..."
                minRows={3}
                required
                value={form.address}
                onChange={(e) =>
                  updateField(
                    "address",
                    e.currentTarget.value
                  )
                }
                leftSection={<IconMapPin size={17} />}
              />

              <Grid>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Teint"
                    placeholder="Ex: Noir"
                    required
                    value={form.complexion}
                    onChange={(e) =>
                      updateField(
                        "complexion",
                        e.currentTarget.value
                      )
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Couleur des yeux"
                    placeholder="Ex: Marron"
                    required
                    value={form.eye_color}
                    onChange={(e) =>
                      updateField(
                        "eye_color",
                        e.currentTarget.value
                      )
                    }
                  />
                </Grid.Col>

              </Grid>

            </Stack>
          </Card>


          {/* =================================================
              DOSSIER JUDICIAIRE
          ================================================== */}

          <Card
            withBorder
            radius="md"
            shadow="sm"
          >

            <Card.Section
              withBorder
              inheritPadding
              py="md"
            >
              <Group>

                <Paper
                  p="xs"
                  radius="md"
                  bg="red.0"
                  c="red"
                >
                  <IconId size={20} />
                </Paper>

                <div>
                  <Text fw={600}>
                    Dossier judiciaire
                  </Text>

                  <Text size="xs" c="dimmed">
                    Informations relatives à la condamnation
                  </Text>
                </div>

              </Group>
            </Card.Section>

            <Stack p="lg">

              <MultiSelect
                label="Infractions / crimes"
                placeholder="Sélectionner les crimes"
                searchable
                clearable
                data={[
                  {
                    value: "1",
                    label: "Vol",
                  },
                  {
                    value: "2",
                    label: "Meurtre",
                  },
                  {
                    value: "3",
                    label: "Agression",
                  },
                  {
                    value: "4",
                    label: "Escroquerie",
                  },
                ]}
                value={form.crime_ids}
                onChange={(value) =>
                  updateField("crime_ids", value)
                }
              />

              <TextInput
                label="Peine"
                placeholder="Ex: 10 ans"
                required
                value={form.sentence}
                onChange={(e) =>
                  updateField(
                    "sentence",
                    e.currentTarget.value
                  )
                }
              />

              <Grid>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    type="date"
                    label="Début de la peine"
                    required
                    value={form.date_from}
                    onChange={(e) =>
                      updateField(
                        "date_from",
                        e.currentTarget.value
                      )
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    type="date"
                    label="Fin de la peine"
                    value={form.date_to}
                    onChange={(e) =>
                      updateField(
                        "date_to",
                        e.currentTarget.value
                      )
                    }
                  />
                </Grid.Col>

              </Grid>

            </Stack>
          </Card>


          {/* =================================================
              CONTACT D'URGENCE
          ================================================== */}

          <Card
            withBorder
            radius="md"
            shadow="sm"
          >

            <Card.Section
              withBorder
              inheritPadding
              py="md"
            >

              <Group>

                <Paper
                  p="xs"
                  radius="md"
                  bg="orange.0"
                  c="orange"
                >
                  <IconUsers size={20} />
                </Paper>

                <div>
                  <Text fw={600}>
                    Contact d'urgence
                  </Text>

                  <Text size="xs" c="dimmed">
                    Personne à contacter en cas d'urgence
                  </Text>
                </div>

              </Group>

            </Card.Section>

            <Stack p="lg">

              <Grid>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Nom"
                    placeholder="Nom du contact"
                    value={form.emergency_name}
                    onChange={(e) =>
                      updateField(
                        "emergency_name",
                        e.currentTarget.value
                      )
                    }
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Relation"
                    placeholder="Ex: Père, mère, frère..."
                    value={form.emergency_relation}
                    onChange={(e) =>
                      updateField(
                        "emergency_relation",
                        e.currentTarget.value
                      )
                    }
                  />
                </Grid.Col>

              </Grid>

              <TextInput
                label="Téléphone"
                placeholder="+243 ..."
                value={form.emergency_contact}
                onChange={(e) =>
                  updateField(
                    "emergency_contact",
                    e.currentTarget.value
                  )
                }
                leftSection={<IconPhone size={17} />}
              />

            </Stack>

          </Card>


          {/* =================================================
              PHOTO
          ================================================== */}

          <Card
            withBorder
            radius="md"
            shadow="sm"
          >

            <Card.Section
              withBorder
              inheritPadding
              py="md"
            >

              <Group>

                <Paper
                  p="xs"
                  radius="md"
                  bg="violet.0"
                  c="violet"
                >
                  <IconCamera size={20} />
                </Paper>

                <div>
                  <Text fw={600}>
                    Photo du détenu
                  </Text>

                  <Text size="xs" c="dimmed">
                    Ajoutez une photo d'identification
                  </Text>
                </div>

              </Group>

            </Card.Section>

            <Stack p="lg">

              <Grid align="center">

                <Grid.Col span={{ base: 12, md: 6 }}>

                  <FileInput
                    label="Photo"
                    placeholder="Sélectionner une image"
                    accept="image/png,image/jpeg,image/webp"
                    leftSection={
                      <IconCamera size={17} />
                    }
                    value={image}
                    onChange={setImage}
                    clearable
                  />

                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>

                  {image ? (
                    <Image
                      src={URL.createObjectURL(image)}
                      h={180}
                      w="100%"
                      fit="contain"
                      radius="md"
                      fallbackSrc=""
                    />
                  ) : (
                    <Paper
                      h={180}
                      withBorder
                      radius="md"
                      className="
                        flex
                        items-center
                        justify-center
                        border-dashed
                      "
                    >
                      <Stack
                        align="center"
                        gap={4}
                      >
                        <IconCamera
                          size={32}
                          className="text-gray-400"
                        />

                        <Text
                          size="xs"
                          c="dimmed"
                        >
                          Aperçu de la photo
                        </Text>
                      </Stack>
                    </Paper>
                  )}

                </Grid.Col>

              </Grid>

            </Stack>

          </Card>


          {/* =================================================
              ACTIONS
          ================================================== */}

          <div className="
            flex
            flex-col-reverse
            gap-3
            sm:flex-row
            sm:justify-end
          ">

            <Button
              variant="default"
              onClick={() => navigate("/inmates")}
            >
              Annuler
            </Button>

            <Button
              type="submit"
              leftSection={
                <IconDeviceFloppy size={18} />
              }
            >
              {isEditing
                ? "Enregistrer les modifications"
                : "Enregistrer le détenu"}
            </Button>

          </div>

        </Stack>

      </form>
    </div>
  );
}