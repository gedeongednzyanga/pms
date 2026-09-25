
import { useEffect, useMemo, useState } from "react";
import {
  IconArrowLeft,
  IconCamera,
  IconDeviceFloppy,
  IconId,
  IconMapPin,
  IconPhone,
  IconUser,
  IconUsers,
  IconScale,
  IconHome,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";

import {
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Image,
  Loader,
  MultiSelect,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Title,
} from "@mantine/core";

import { DateInput, DatePickerInput } from "@mantine/dates";

import { useNavigate, useParams } from "react-router";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";

import dayjs from "dayjs";
import "dayjs/locale/fr";

import { toast } from "sonner";

dayjs.locale("fr");

// ============================================================
// TYPES
// ============================================================

interface Cellule {
  id: string;
  code: string | null;
  cellule_name: string | null;
  prison_id?: string | null;
  prison_name?: string | null;
}

interface Crime {
  id: string;
  crime_name: string;
}

interface InmateDetails {
  inmate: {
    id: string;
    cellule_id: string;

    firstname: string;
    middlename: string | null;
    lastname: string;

    dob: string;
    sex: string;
    address: string;
    marital_status: string;

    arreter_par: string | null;
    lieu_arreter: string | null;
    date_from: string;
    date_to: string | null;

    emergency_name: string | null;
    emergency_relation: string | null;
    emergency_contact: string | null;

    photo_path: string | null;

    created_at: string;
    updated_at: string;
  };

  crimes: Crime[];

  cellule: Cellule | null;
}

interface InmateForm {
  cellule_id: string;

  firstname: string;
  middlename: string;
  lastname: string;

  dob: string;
  sex: string;
  address: string;
  marital_status: string;

  crime_ids: string[];

  arreter_par: string;
  lieu_arreter: string;
  date_from: string;
  date_to: string;

  emergency_name: string;
  emergency_relation: string;
  emergency_contact: string;
}

// ============================================================
// INITIAL FORM
// ============================================================

const initialForm: InmateForm = {
  cellule_id: "",

  firstname: "",
  middlename: "",
  lastname: "",

  dob: "",
  sex: "Male",
  address: "",
  marital_status: "Single",

  crime_ids: [],

  arreter_par: "",
  lieu_arreter: "",
  date_from: "",
  date_to: "",

  emergency_name: "",
  emergency_relation: "",
  emergency_contact: "",
};

// ============================================================
// HELPERS
// ============================================================

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const possibleError = error as {
      message?: unknown;
      error?: unknown;
    };

    if (typeof possibleError.message === "string") {
      return possibleError.message;
    }

    if (typeof possibleError.error === "string") {
      return possibleError.error;
    }
  }

  return "Une erreur inattendue est survenue.";
}

// ============================================================
// COMPONENT
// ============================================================

export default function ManageInmate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEditing = Boolean(id);

  // ==========================================================
  // STATE
  // ==========================================================

  const [form, setForm] = useState<InmateForm>(initialForm);

  // const [prisons, setPrisons] = useState<Prison[]>([]);
  const [cellules, setCellules] = useState<Cellule[]>([]);
  const [crimes, setCrimes] = useState<Crime[]>([]);

  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loadingData, setLoadingData] = useState(true);
  const [loadingInmate, setLoadingInmate] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState<
    Partial<Record<keyof InmateForm, string>>
  >({});

  // ==========================================================
  // UPDATE FIELD
  // ==========================================================

  const updateField = <K extends keyof InmateForm>(
    field: K,
    value: InmateForm[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const next = { ...previous };
      delete next[field];

      return next;
    });
  };

  // ==========================================================
  // LOAD PRISONS
  // ==========================================================

  // const loadPrisons = async () => {
  //   try {
     
  //     const result = await invoke<Prison[]>(
  //       "get_prisons_for_select_cmd"
  //     );

  //     setPrisons(Array.isArray(result) ? result : []);
  //   } catch (error) {
  //     console.error("Erreur chargement prisons :", error);

  //     toast.error("Impossible de charger les prisons", {
  //       description: getErrorMessage(error),
  //     });
  //   }
  // };

  // ==========================================================
  // LOAD CELLULES
  // ==========================================================

  const loadCellules = async () => {
    try {
      /*
       * La commande doit retourner les cellules avec leur prison.
       *
       * Exemple :
       *
       * {
       *   id: "...",
       *   code: "A-01",
       *   cellule_name: "Cellule A-01",
       *   prison_id: "...",
       *   prison_name: "Prison Centrale"
       * }
       */

      const result = await invoke<Cellule[]>(
        "get_cellules_for_select_cmd"
      );

      setCellules(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Erreur chargement cellules :", error);

      toast.error("Impossible de charger les cellules", {
        description: getErrorMessage(error),
      });
    }
  };

  // ==========================================================
  // LOAD CRIMES
  // ==========================================================

  const loadCrimes = async () => {
    try {
      /*
       * La commande doit retourner :
       *
       * [
       *   { id: "...", name: "Vol" },
       *   { id: "...", name: "Meurtre" }
       * ]
       */

      const result = await invoke<Crime[]>(
        "get_crimes_for_select_cmd"
      );

      setCrimes(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Erreur chargement crimes :", error);

      toast.error("Impossible de charger les crimes", {
        description: getErrorMessage(error),
      });
    }
  };

  // ==========================================================
  // LOAD FORM DATA
  // ==========================================================

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);

      try {
        await Promise.all([
          // loadPrisons(),
          loadCellules(),
          loadCrimes(),
        ]);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // ==========================================================
  // LOAD INMATE FOR EDIT
  // ==========================================================

  useEffect(() => {
    if (!id) {
      setLoadingInmate(false);
      return;
    }

    const loadInmate = async () => {
      setLoadingInmate(true);

      try {
        const result = await invoke<InmateDetails>(
          "get_inmate_cmd",
          {
            id,
          }
        );

        if (!result?.inmate) {
          throw new Error("Les informations du détenu sont introuvables.");
        }

        const inmate = result.inmate;

        setForm({
          cellule_id: inmate.cellule_id ?? "",

          firstname: inmate.firstname ?? "",
          middlename: inmate.middlename ?? "",
          lastname: inmate.lastname ?? "",

          dob: inmate.dob ?? "",
          sex: inmate.sex ?? "Male",
          address: inmate.address ?? "",
          marital_status:
            inmate.marital_status ?? "Single",

          crime_ids: Array.isArray(result.crimes)
            ? result.crimes.map((crime) => crime.id)
            : [],

          arreter_par: inmate.arreter_par ?? "",
          lieu_arreter: inmate.lieu_arreter ?? "",
          date_from: inmate.date_from ?? "",
          date_to: inmate.date_to ?? "",

          emergency_name:
            inmate.emergency_name ?? "",

          emergency_relation:
            inmate.emergency_relation ?? "",

          emergency_contact:
            inmate.emergency_contact ?? "",
        });

        if (inmate.photo_path) {
          setImagePath(inmate.photo_path);

          /*
           * On tente de créer un aperçu à partir
           * du fichier existant.
           */
          try {
            const bytes = await readFile(
              inmate.photo_path
            );

            const extension = inmate.photo_path
              .split(".")
              .pop()
              ?.toLowerCase();

            const mimeType =
              extension === "png"
                ? "image/png"
                : extension === "webp"
                ? "image/webp"
                : "image/jpeg";

            const blob = new Blob([bytes], {
              type: mimeType,
            });

            const previewUrl =
              URL.createObjectURL(blob);

            setImagePreview(previewUrl);
          } catch (photoError) {
            console.warn(
              "Impossible de charger l'aperçu de la photo :",
              photoError
            );
          }
        }
      } catch (error) {
        console.error(
          "Erreur chargement détenu :",
          error
        );

        toast.error(
          "Impossible de charger le détenu",
          {
            description: getErrorMessage(error),
          }
        );

        navigate("/inmates");
      } finally {
        setLoadingInmate(false);
      }
    };

    loadInmate();
  }, [id, navigate]);

  // ==========================================================
  // CLEAN PREVIEW URL
  // ==========================================================

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ==========================================================
  // PRISON OPTIONS
  // ==========================================================

  // const prisonOptions = useMemo(
  //   () =>
  //     prisons.map((prison) => ({
  //       value: prison.id,
  //       label: prison.prison_name,
  //     })),
  //   [prisons]
  // );

  // ==========================================================
  // CELLULE OPTIONS
  // ==========================================================

  const celluleOptions = useMemo(
    () =>
      cellules.map((cellule) => {
        const prisonName =
          cellule.prison_name?.trim() ||
          "Prison inconnue";

        const code =
          cellule.code?.trim() || "";

        const name =
          cellule.cellule_name?.trim() || "";

        const celluleLabel = [
          code,
          name,
        ]
          .filter(Boolean)
          .join(" - ");

        return {
          value: cellule.id,
          label: celluleLabel
            ? `${prisonName} — ${celluleLabel}`
            : prisonName,
        };
      }),
    [cellules]
  );

  // ==========================================================
  // CRIME OPTIONS
  // ==========================================================

  const crimeOptions = useMemo(
    () =>
      crimes.map((crime) => ({
        value: crime.id,
        label: crime.crime_name,
      })),
    [crimes]
  );

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = (): boolean => {
    const nextErrors: Partial<
      Record<keyof InmateForm, string>
    > = {};

    const firstname = cleanString(form.firstname);
    const lastname = cleanString(form.lastname);
    const address = cleanString(form.address);

    // --------------------------------------------------------
    // Identification
    // --------------------------------------------------------

    if (!form.cellule_id) {
      nextErrors.cellule_id =
        "La cellule est obligatoire.";
    }

    if (!firstname) {
      nextErrors.firstname =
        "Le prénom est obligatoire.";
    }

    if (!lastname) {
      nextErrors.lastname =
        "Le nom est obligatoire.";
    }

    if (!form.dob) {
      nextErrors.dob =
        "La date de naissance est obligatoire.";
    } else if (dayjs(form.dob).isAfter(dayjs(), "day")) {
      nextErrors.dob =
        "La date de naissance ne peut pas être dans le futur.";
    }

    if (!form.sex) {
      nextErrors.sex =
        "Le sexe est obligatoire.";
    }

    if (!address) {
      nextErrors.address =
        "L'adresse est obligatoire.";
    }

    if (!form.marital_status) {
      nextErrors.marital_status =
        "L'état matrimonial est obligatoire.";
    }

    // --------------------------------------------------------
    // Dossier judiciaire
    // --------------------------------------------------------

    if (!form.date_from) {
      nextErrors.date_from =
        "La date de début de peine est obligatoire.";
    }

    if (
      form.date_to &&
      form.date_from &&
      dayjs(form.date_to).isBefore(
        dayjs(form.date_from),
        "day"
      )
    ) {
      nextErrors.date_to =
        "La fin de peine ne peut pas être antérieure au début.";
    }

    // --------------------------------------------------------
    // Contact d'urgence
    // --------------------------------------------------------

    const emergencyName =
      cleanString(form.emergency_name);

    const emergencyRelation =
      cleanString(form.emergency_relation);

    const emergencyContact =
      cleanString(form.emergency_contact);

    const emergencyFilled =
      Boolean(
        emergencyName ||
          emergencyRelation ||
          emergencyContact
      );

    if (emergencyFilled) {
      if (!emergencyName) {
        nextErrors.emergency_name =
          "Le nom du contact est requis.";
      }

      if (!emergencyRelation) {
        nextErrors.emergency_relation =
          "La relation est requise.";
      }

      if (!emergencyContact) {
        nextErrors.emergency_contact =
          "Le numéro de téléphone est requis.";
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error(
        "Veuillez corriger les erreurs du formulaire.",
        {
          description:
            "Certains champs obligatoires ou certaines dates sont invalides.",
        }
      );

      return false;
    }

    return true;
  };

  // ==========================================================
  // SELECT PHOTO
  // ==========================================================

  const handleSelectPhoto = async () => {
    try {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Images",
            extensions: [
              "jpg",
              "jpeg",
              "png",
              "webp",
            ],
          },
        ],
      });

      if (typeof selected !== "string") {
        return;
      }

      const extension = selected
        .split(".")
        .pop()
        ?.toLowerCase();

      if (
        !extension ||
        ![
          "jpg",
          "jpeg",
          "png",
          "webp",
        ].includes(extension)
      ) {
        toast.error(
          "Format d'image non supporté."
        );

        return;
      }

      setImagePath(selected);

      const bytes = await readFile(selected);

      const mimeType =
        extension === "png"
          ? "image/png"
          : extension === "webp"
          ? "image/webp"
          : "image/jpeg";

      const blob = new Blob([bytes], {
        type: mimeType,
      });

      const previewUrl =
        URL.createObjectURL(blob);

      setImagePreview((oldPreview) => {
        if (oldPreview) {
          URL.revokeObjectURL(oldPreview);
        }

        return previewUrl;
      });

      toast.success("Photo sélectionnée.");
    } catch (error) {
      console.error(
        "Erreur sélection photo :",
        error
      );

      toast.error(
        "Impossible de sélectionner la photo.",
        {
          description: getErrorMessage(error),
        }
      );
    }
  };

  // ==========================================================
  // RESET
  // ==========================================================

  const handleCancel = () => {
    if (saving) {
      return;
    }

    navigate("/inmates");
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const inmate = {
        cellule_id: form.cellule_id,

        firstname: cleanString(
          form.firstname
        ),

        middlename:
          cleanString(form.middlename) || null,

        lastname: cleanString(
          form.lastname
        ),

        dob: form.dob,

        sex: form.sex,

        address: cleanString(
          form.address
        ),

        marital_status:
          form.marital_status,

        crime_ids: form.crime_ids,

        arreter_par: cleanString(form.arreter_par),

        lieu_arreter: cleanString(form.lieu_arreter),

        date_from: form.date_from,

        date_to:
          form.date_to || null,

        emergency_name:
          cleanString(
            form.emergency_name
          ) || null,

        emergency_relation:
          cleanString(
            form.emergency_relation
          ) || null,

        emergency_contact:
          cleanString(
            form.emergency_contact
          ) || null,

        image_path:
          imagePath || null,
      };

      // ======================================================
      // UPDATE
      // ======================================================

      if (isEditing && id) {
        await invoke("update_inmate_cmd", {
          id: id,
          input: inmate,
        });

        toast.success(
          "Détenu modifié avec succès.",
          {
            description:
              `${form.firstname} ${form.lastname} a été mis à jour.`,
          }
        );

        navigate(`/inmates/${id}`);

        return;
      }

      // ======================================================
      // CREATE
      // ======================================================

      const inmateId =
        await invoke<string>(
          "create_inmate_cmd",
          {
            inmate,
          }
        );

      toast.success(
        "Détenu enregistré avec succès.",
        {
          description:
            `${form.firstname} ${form.lastname} a été ajouté au système.`,
        }
      );

      navigate(`/inmates/${inmateId}`);

    } catch (error) {
      console.error(
        "Erreur enregistrement détenu :",
        error
      );

      const message =
        getErrorMessage(error);

      /*
       * Gestion de quelques erreurs SQLite
       * fréquentes.
       */

      toast.error(
        isEditing
          ? "Impossible de modifier le détenu."
          : "Impossible d'enregistrer le détenu.",
        {
          description: message,
        }
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // LOADING GLOBAL
  // ==========================================================

  if (loadingData || loadingInmate) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Stack
          align="center"
          gap="sm"
        >
          <Loader size="md" />

          <Text
            size="sm"
            c="dimmed"
          >
            {loadingInmate
              ? "Chargement du détenu..."
              : "Chargement des données..."}
          </Text>
        </Stack>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            onClick={handleCancel}
            disabled={saving}
            leftSection={
              <IconArrowLeft size={17} />
            }
          >
            Retour
          </Button>

          <div className="mt-3">
            <Title order={2}>
              {isEditing
                ? "Modifier le détenu"
                : "Nouveau détenu"}
            </Title>

            <Text
              size="sm"
              c="dimmed"
              mt={4}
            >
              {isEditing
                ? "Modifiez les informations administratives et judiciaires du détenu."
                : "Enregistrez un nouveau détenu dans le système."}
            </Text>
          </div>
        </div>

        <Badge
          size="lg"
          variant="light"
          color={
            isEditing
              ? "orange"
              : "blue"
          }
        >
          {isEditing
            ? "Modification"
            : "Nouvel enregistrement"}
        </Badge>
      </div>

      {/* ======================================================
          FORM
      ======================================================= */}

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">

          {/* ==================================================
              IDENTIFICATION
          =================================================== */}

          <Card
            withBorder
            radius="md"
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

                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Informations principales du détenu
                  </Text>
                </div>
              </Group>
            </Card.Section>

            <Stack p="lg">

              {/* NOMS */}

              <Grid>

                <Grid.Col
                  span={{
                    base: 12,
                    md: 4,
                  }}
                >
                  <TextInput
                    label="Prénom"
                    placeholder="Jeanne"
                    required
                    value={form.firstname}
                    error={errors.firstname}
                    onChange={(event) =>
                      updateField(
                        "firstname",
                        event.currentTarget.value
                      )
                    }
                    leftSection={
                      <IconUser size={17} />
                    }
                  />
                </Grid.Col>

                <Grid.Col
                  span={{
                    base: 12,
                    md: 4,
                  }}
                >
                  <TextInput
                    label="Postnom"
                    placeholder="Optionnel"
                    value={form.middlename}
                    error={errors.middlename}
                    onChange={(event) =>
                      updateField(
                        "middlename",
                        event.currentTarget.value
                      )
                    }
                  />
                </Grid.Col>

                <Grid.Col
                  span={{
                    base: 12,
                    md: 4,
                  }}
                >
                  <TextInput
                    label="Nom"
                    placeholder="Mukendi"
                    required
                    value={form.lastname}
                    error={errors.lastname}
                    onChange={(event) =>
                      updateField(
                        "lastname",
                        event.currentTarget.value
                      )
                    }
                  />
                </Grid.Col>

              </Grid>

              {/* INFOS PERSONNELLES */}

              <Grid>

                <Grid.Col
                  span={{
                    base: 12,
                    md: 4,
                  }}
                >
                  <DateInput
                    label="Date de naissance"
                    placeholder="Sélectionner une date"
                    required
                    value={
                      form.dob
                        ? new Date(form.dob)
                        : null
                    }
                    error={errors.dob}
                    onChange={(date) =>
                      updateField(
                        "dob",
                        date
                          ? dayjs(date).format(
                              "YYYY-MM-DD"
                            )
                          : ""
                      )
                    }
                    valueFormat="DD/MM/YYYY"
                    maxDate={new Date()}
                    clearable
                  />
                </Grid.Col>

                <Grid.Col
                  span={{
                    base: 12,
                    md: 4,
                  }}
                >
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
                    error={errors.sex}
                    onChange={(value) =>
                      updateField(
                        "sex",
                        value ?? "Male"
                      )
                    }
                  />
                </Grid.Col>

                <Grid.Col
                  span={{
                    base: 12,
                    md: 4,
                  }}
                >
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
                    value={
                      form.marital_status
                    }
                    error={
                      errors.marital_status
                    }
                    onChange={(value) =>
                      updateField(
                        "marital_status",
                        value ?? "Single"
                      )
                    }
                  />
                </Grid.Col>

              </Grid>

              {/* ADRESSE */}

              <Textarea
                label="Adresse"
                placeholder="Adresse complète..."
                minRows={3}
                required
                value={form.address}
                error={errors.address}
                onChange={(event) =>
                  updateField(
                    "address",
                    event.currentTarget.value
                  )
                }
                leftSection={
                  <IconMapPin size={17} />
                }
              />

            </Stack>
          </Card>

          {/* ==================================================
              DOSSIER JUDICIAIRE
          =================================================== */}

          <Card
            withBorder
            radius="md"
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
                  <IconScale size={20} />
                </Paper>

                <div>
                  <Text fw={600}>
                    Dossier judiciaire
                  </Text>

                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Informations relatives à l'arrestation et à l'incarcération
                  </Text>
                </div>
              </Group>
            </Card.Section>

            <Stack p="lg">

              {/* CRIMES */}

              <MultiSelect
                label="Infractions / crimes"
                placeholder={
                  crimes.length > 0
                    ? "Sélectionner les crimes"
                    : "Aucun crime disponible"
                }
                searchable
                clearable
                data={crimeOptions}
                value={form.crime_ids}
                onChange={(value) =>
                  updateField(
                    "crime_ids",
                    value
                  )
                }
                nothingFoundMessage="Aucun crime trouvé"
              />

              <Grid>

                <Grid.Col
                  span={{
                    base: 12,
                    md: 6,
                  }}
                >
                  <TextInput
                    label="Arrêtée par"
                    placeholder="Ex. Police nationale"
                    value={form.arreter_par}
                    error={errors.arreter_par}
                    onChange={(event) =>
                      updateField(
                        "arreter_par",
                        event.currentTarget.value
                      )
                    }
                  />
                </Grid.Col>

                <Grid.Col
                  span={{
                    base: 12,
                    md: 6,
                  }}
                >
                  <TextInput
                    label="Lieu d'arrestation"
                    placeholder="Ville, commune ou quartier"
                    value={form.lieu_arreter}
                    error={errors.lieu_arreter}
                    onChange={(event) =>
                      updateField(
                        "lieu_arreter",
                        event.currentTarget.value
                      )
                    }
                    leftSection={<IconMapPin size={17} />}
                  />
                </Grid.Col>

              </Grid>

              {/* DATES */}

              <Grid>

                <Grid.Col
                  span={{
                    base: 12,
                    md: 6,
                  }}
                >
                  <DatePickerInput
                    label="Date d'arrivé"
                    placeholder="Sélectionner une date"
                    required
                    value={
                      form.date_from
                        ? new Date(
                            form.date_from
                          )
                        : null
                    }
                    error={errors.date_from}
                    onChange={(date) =>
                      updateField(
                        "date_from",
                        date
                          ? dayjs(date).format(
                              "YYYY-MM-DD"
                            )
                          : ""
                      )
                    }
                    valueFormat="DD/MM/YYYY"
                    clearable
                  />
                </Grid.Col>

                <Grid.Col
                  span={{
                    base: 12,
                    md: 6,
                  }}
                >
                  <DatePickerInput
                    label="Date de sortie"
                    placeholder="Optionnel"
                    value={
                      form.date_to
                        ? new Date(
                            form.date_to
                          )
                        : null
                    }
                    error={errors.date_to}
                    onChange={(date) =>
                      updateField(
                        "date_to",
                        date
                          ? dayjs(date).format(
                              "YYYY-MM-DD"
                            )
                          : ""
                      )
                    }
                    valueFormat="DD/MM/YYYY"
                    minDate={
                      form.date_from
                        ? new Date(
                            form.date_from
                          )
                        : undefined
                    }
                    clearable
                  />
                </Grid.Col>

              </Grid>

              <Grid>

              {/* CELLULE */}
              <Grid.Col
                span={{
                  base: 12,
                  md: 12,
                }}
              >
                <Select
                  label="Prison & cellule"
                  placeholder={
                    cellules.length > 0
                      ? "Sélectionner une cellule"
                      : "Aucune cellule disponible"
                  }
                  required
                  searchable
                  clearable
                  data={celluleOptions}
                  value={form.cellule_id}
                  error={errors.cellule_id}
                  onChange={(value) =>
                    updateField(
                      "cellule_id",
                      value ?? ""
                    )
                  }
                  leftSection={
                    <IconHome size={17} />
                  }
                  nothingFoundMessage="Aucune cellule trouvée"
                />
              </Grid.Col>

              </Grid>

            </Stack>
          </Card>

          {/* ==================================================
              CONTACT D'URGENCE
          =================================================== */}

          <Card
            withBorder
            radius="md"
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

                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Personne à contacter en cas d'urgence
                  </Text>
                </div>
              </Group>
            </Card.Section>

            <Stack p="lg">

              <Grid>

                <Grid.Col
                  span={{
                    base: 12,
                    md: 6,
                  }}
                >
                  <TextInput
                    label="Nom"
                    placeholder="Nom du contact"
                    value={
                      form.emergency_name
                    }
                    error={
                      errors.emergency_name
                    }
                    onChange={(event) =>
                      updateField(
                        "emergency_name",
                        event.currentTarget.value
                      )
                    }
                  />
                </Grid.Col>

                <Grid.Col
                  span={{
                    base: 12,
                    md: 6,
                  }}
                >
                  <TextInput
                    label="Relation"
                    placeholder="Ex : Père, mère, frère..."
                    value={
                      form.emergency_relation
                    }
                    error={
                      errors.emergency_relation
                    }
                    onChange={(event) =>
                      updateField(
                        "emergency_relation",
                        event.currentTarget.value
                      )
                    }
                  />
                </Grid.Col>

              </Grid>

              <TextInput
                label="Téléphone"
                placeholder="+243 ..."
                value={
                  form.emergency_contact
                }
                error={
                  errors.emergency_contact
                }
                onChange={(event) =>
                  updateField(
                    "emergency_contact",
                    event.currentTarget.value
                  )
                }
                leftSection={
                  <IconPhone size={17} />
                }
              />

            </Stack>
          </Card>

          {/* ==================================================
              PHOTO
          =================================================== */}

          {/* <Card
            withBorder
            radius="md"
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

                  <Text
                    size="xs"
                    c="dimmed"
                  >
                    Ajoutez une photo d'identification
                  </Text>
                </div>
              </Group>
            </Card.Section>

            <Stack p="lg">

              <Grid align="center">

                <Grid.Col
                  span={{
                    base: 12,
                    md: 6,
                  }}
                >

                  <Button
                    type="button"
                    leftSection={
                      <IconCamera size={17} />
                    }
                    onClick={
                      handleSelectPhoto
                    }
                    disabled={saving}
                  >
                    {imagePath
                      ? "Changer la photo"
                      : "Sélectionner une photo"}
                  </Button>

                  {imagePath && (
                    <Text
                      size="xs"
                      c="dimmed"
                      mt="xs"
                    >
                      Photo sélectionnée
                    </Text>
                  )}

                </Grid.Col>

                <Grid.Col
                  span={{
                    base: 12,
                    md: 6,
                  }}
                >

                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      h={180}
                      w="100%"
                      fit="contain"
                      radius="md"
                      alt="Photo du détenu"
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
          </Card> */}

          <Card withBorder radius="md">

            {/* En-tête */}
            <Card.Section
            withBorder
            px="lg"
            py="md"

            >

            <Group gap="sm">
              <ThemeIcon
                size={38}
                radius="md"
                variant="light"
                color="violet"
              >
                <IconCamera size={20} />
              </ThemeIcon>

              <div>
                <Text fw={600} size="sm">
                  Photo du détenu
                </Text>

                <Text size="xs" c="dimmed">
                  Ajoutez une photo d’identification du détenu
                </Text>
              </div>
            </Group>

            </Card.Section>

              <Stack p="lg" gap="lg">

            {/* Zone principale */}
            <Grid align="center">

              {/* Aperçu */}
              <Grid.Col
                span={{
                  base: 12,
                  sm: 5,
                }}
              >
                <Stack align="center" gap="sm">

                  <Paper
                    withBorder
                    radius="md"
                    w="100%"
                    h={220}
                    bg="gray.0"
                    className="flex items-center justify-center overflow-hidden"
                  >
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        h="100%"
                        w="100%"
                        fit="contain"
                        alt="Photo du détenu"
                      />
                    ) : (
                      <Stack
                        align="center"
                        justify="center"
                        gap="xs"
                        c="dimmed"
                      >
                        <ThemeIcon
                          size={52}
                          radius="xl"
                          variant="light"
                          color="gray"
                        >
                          <IconCamera size={26} />
                        </ThemeIcon>

                        <Text size="sm" fw={500}>
                          Aucune photo
                        </Text>

                        <Text
                          size="xs"
                          ta="center"
                          maw={220}
                        >
                          La photo d’identification apparaîtra ici
                        </Text>
                      </Stack>
                    )}
                  </Paper>

                  {imagePreview && (
                    <Badge
                      size="sm"
                      variant="light"
                      color="green"
                      leftSection={<IconCheck size={13} />}
                    >
                      Photo sélectionnée
                    </Badge>
                  )}

                </Stack>
              </Grid.Col>

              {/* Actions */}
              <Grid.Col
                span={{
                  base: 12,
                  sm: 7,
                }}
              >
                <Stack gap="md">

                  <div>
                    <Text size="sm" fw={600} mb={4}>
                      Photo d’identification
                    </Text>

                    <Text size="xs" c="dimmed">
                      Sélectionnez une photo claire et récente du détenu.
                      Utilisez de préférence une image au format JPG ou PNG.
                    </Text>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant={imagePath ? "light" : "filled"}
                    color="blue"
                    leftSection={
                      <IconCamera size={17} />
                    }
                    onClick={handleSelectPhoto}
                    disabled={saving}
                    fullWidth
                  >
                    {imagePath
                      ? "Changer la photo"
                      : "Sélectionner une photo"}
                  </Button>

                  {imagePath && (
                    <Paper
                      withBorder
                      radius="sm"
                      p="sm"
                      bg="gray.0"
                    >
                      <Group gap="xs" wrap="nowrap">
                        <ThemeIcon
                          size={28}
                          radius="sm"
                          variant="light"
                          color="green"
                        >
                          <IconCheck size={15} />
                        </ThemeIcon>

                        <div style={{ flex: 1 }}>
                          <Text size="xs" fw={500}>
                            Photo prête
                          </Text>

                          <Text
                            size="xs"
                            c="dimmed"
                            truncate
                          >
                            La photo sera enregistrée avec le dossier
                          </Text>
                        </div>
                      </Group>
                    </Paper>
                  )}

                </Stack>
              </Grid.Col>

            </Grid>

              </Stack>
            </Card>


          {/* ==================================================
              INFORMATION
          =================================================== */}

          <Paper
            withBorder
            p="md"
            radius="md"
          >
            <Group
              align="flex-start"
              gap="sm"
            >
              <IconAlertCircle
                size={20}
              />

              <Text
                size="sm"
                c="dimmed"
              >
                Vérifiez attentivement les informations
                avant d'enregistrer le détenu. Les champs
                marqués d'un astérisque sont obligatoires.
              </Text>
            </Group>
          </Paper>

          {/* ==================================================
              ACTIONS
          =================================================== */}

          <div
            className="
              flex
              flex-col-reverse
              gap-3
              sm:flex-row
              sm:justify-end
            "
          >

            <Button
              type="button"
              variant="default"
              onClick={handleCancel}
              disabled={saving}
            >
              Annuler
            </Button>

            <Button
              type="submit"
              loading={saving}
              disabled={
                loadingData ||
                loadingInmate
              }
              leftSection={
                !saving ? (
                  <IconDeviceFloppy
                    size={18}
                  />
                ) : undefined
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
