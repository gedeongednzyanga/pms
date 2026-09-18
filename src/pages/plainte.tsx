import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  IconEdit,
  IconFileDescription,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";
import { toast } from "sonner";

// ============================================================
// TYPES
// ============================================================

type Plainte = {
    id: string;
    objet: string;
    description: string;
    date_faits: string;
    lieu_faits: string;
    statut: string;
    created_at: string;
    updated_at: string;
};

type PlainteForm = {
    objet: string;
    description: string;
    date_faits: string;
    lieu_faits: string;
    statut: string;
};

const emptyForm: PlainteForm = {
    objet: "",
    description: "",
    date_faits: "",
    lieu_faits: "",
    statut: "ENREGISTREE",
};

// ============================================================
// HELPERS
// ============================================================

const formatDate = (value: string) => value ? dayjs(value).format("DD/MM/YYYY") : "—";

const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

const statutLabel = (statut: string) => {
    switch (statut) {
        case "ENREGISTREE":
        return "Enregistrée";

        case "EN_COURS":
        return "En cours";

        case "TRAITEE":
        return "Traitée";

        case "CLASSEE":
        return "Classée";

        default:
        return statut;
    }
};

// ============================================================
// COMPONENT
// ============================================================

export default function Plaintes() {
    const [plaintes, setPlaintes] = useState<Plainte[]>([]);
    const [search, setSearch] = useState("");

    const [opened, setOpened] = useState(false);
    const [editing, setEditing] = useState<Plainte | null>(null);

    const [form, setForm] = useState<PlainteForm>(emptyForm);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // ============================================================
    // CHARGEMENT
    // ============================================================

    const load = async () => {
        setLoading(true);

        try {
        const data = await invoke<Plainte[]>("get_plaintes_cmd");

        setPlaintes(data);
        } catch (error) {
        toast.error("Impossible de charger les plaintes", {
            description: errorMessage(error),
        });
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // ============================================================
    // RECHERCHE
    // ============================================================

    const filteredPlaintes = useMemo(() => {
        const query = search.trim().toLocaleLowerCase();

        if (!query) {
        return plaintes;
        }

        return plaintes.filter((plainte) =>
        [
            plainte.objet,
            plainte.description,
            plainte.date_faits,
            plainte.lieu_faits,
            plainte.statut,
        ].some((value) =>
            String(value ?? "")
            .toLocaleLowerCase()
            .includes(query)
        )
        );
    }, [search, plaintes]);

    // ============================================================
    // NOUVELLE PLAINTE
    // ============================================================

    const openCreate = () => {
        setEditing(null);
        setForm({
        ...emptyForm,
        date_faits: dayjs().format("YYYY-MM-DD"),
        });

        setOpened(true);
    };

    // ============================================================
    // MODIFICATION
    // ============================================================

    const openEdit = (plainte: Plainte) => {
        setEditing(plainte);

        setForm({
        objet: plainte.objet,
        description: plainte.description,
        date_faits: plainte.date_faits,
        lieu_faits: plainte.lieu_faits,
        statut: plainte.statut,
        });

        setOpened(true);
    };

    // ============================================================
    // ENREGISTREMENT
    // ============================================================

    const save = async () => {
        const objet = form.objet.trim();
        const description = form.description.trim();
        const date_faits = form.date_faits.trim();
        const lieu_faits = form.lieu_faits.trim();

        if (!objet) {
            toast.error("Veuillez renseigner l'objet de la plainte.");
            return;
        }

        if (!description) {
            toast.error("Veuillez renseigner la description des faits.");
            return;
        }

        if (!date_faits) {
            toast.error("Veuillez renseigner la date des faits.");
            return;
        }

        if (!lieu_faits) {
            toast.error("Veuillez renseigner le lieu des faits.");
            return;
        }

        if (!form.statut) {
            toast.error("Veuillez sélectionner le statut.");
            return;
        }

        setSaving(true);

        try {
            const data = {
                objet: objet,
                description,
                date_faits,
                lieu_faits,
                statut: form.statut,
            };

            if (editing) {
                await invoke("update_plainte_cmd", {
                    id: editing.id,
                    data,
                });

                toast.success("Plainte modifiée avec succès.");
            } else {
                await invoke("create_plainte_cmd", {
                    plainte: data,
                });

                toast.success("Plainte enregistrée avec succès.");
            }

            setOpened(false);
            setEditing(null);
            setForm(emptyForm);

            await load();
        } catch (error) {
            toast.error("Enregistrement impossible", {
                description: errorMessage(error),
            });
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // SUPPRESSION
    // ============================================================

    const remove = async (plainte: Plainte) => {
        const confirmed = window.confirm(
        `Supprimer la plainte "${plainte.objet}" ?`
        );

        if (!confirmed) {
        return;
        }

        try {
        await invoke("delete_plainte_cmd", {
            id: plainte.id,
        });

        toast.success("Plainte supprimée.");

        await load();
        } catch (error) {
        toast.error("Suppression impossible", {
            description: errorMessage(error),
        });
        }
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="mx-auto max-w-6xl space-y-6 pb-10">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <Group justify="space-between" align="end">
            <div>
            <Title order={2}>Plaintes</Title>

            <Text c="dimmed" size="sm" mt={4}>
                Enregistrez et gérez les plaintes et les faits signalés.
            </Text>
            </div>

            <Button
            leftSection={<IconPlus size={18} />}
            onClick={openCreate}
            >
            Nouvelle plainte
            </Button>
        </Group>

        {/* ======================================================
            LISTE
        ====================================================== */}

        <Card withBorder radius="md">
            <Card.Section withBorder inheritPadding py="md">
            <Group justify="space-between">
                <Text fw={600}>
                Liste des plaintes
                </Text>

                <TextInput
                w={300}
                placeholder="Rechercher…"
                value={search}
                onChange={(event) =>
                    setSearch(event.currentTarget.value)
                }
                leftSection={<IconSearch size={16} />}
                />
            </Group>
            </Card.Section>

            {loading ? (
            <Stack align="center" py="xl">
                <Loader />

                <Text size="sm" c="dimmed">
                Chargement…
                </Text>
            </Stack>
            ) : (
            <Table.ScrollContainer minWidth={950}>
                <Table
                striped
                highlightOnHover
                verticalSpacing="sm"
                >
                <Table.Thead>
                    <Table.Tr>
                    <Table.Th>Objet</Table.Th>
                    <Table.Th>Date des faits</Table.Th>
                    <Table.Th>Lieu</Table.Th>
                    <Table.Th>Description</Table.Th>
                    <Table.Th>Statut</Table.Th>
                    <Table.Th ta="right">
                        Actions
                    </Table.Th>
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {filteredPlaintes.length === 0 ? (
                    <Table.Tr>
                        <Table.Td colSpan={6}>
                        <Text
                            ta="center"
                            c="dimmed"
                            py="lg"
                        >
                            Aucune plainte enregistrée.
                        </Text>
                        </Table.Td>
                    </Table.Tr>
                    ) : (
                    filteredPlaintes.map((plainte) => (
                        <Table.Tr key={plainte.id}>
                        <Table.Td fw={500}>
                            {plainte.objet}
                        </Table.Td>

                        <Table.Td>
                            {formatDate(plainte.date_faits)}
                        </Table.Td>

                        <Table.Td>
                            {plainte.lieu_faits}
                        </Table.Td>

                        <Table.Td>
                            <Text
                            size="sm"
                            lineClamp={2}
                            maw={320}
                            >
                            {plainte.description}
                            </Text>
                        </Table.Td>

                        <Table.Td>
                            <Text size="sm">
                            {statutLabel(plainte.statut)}
                            </Text>
                        </Table.Td>

                        <Table.Td>
                            <Group
                            justify="flex-end"
                            gap="xs"
                            >
                            <ActionIcon
                                variant="subtle"
                                color="blue"
                                aria-label="Modifier"
                                onClick={() =>
                                openEdit(plainte)
                                }
                            >
                                <IconEdit size={18} />
                            </ActionIcon>

                            <ActionIcon
                                variant="subtle"
                                color="red"
                                aria-label="Supprimer"
                                onClick={() =>
                                remove(plainte)
                                }
                            >
                                <IconTrash size={18} />
                            </ActionIcon>
                            </Group>
                        </Table.Td>
                        </Table.Tr>
                    ))
                    )}
                </Table.Tbody>
                </Table>
            </Table.ScrollContainer>
            )}
        </Card>

        {/* ======================================================
            MODAL
        ====================================================== */}

        <Modal
            opened={opened}
            onClose={() =>
            !saving && setOpened(false)
            }
            title={
            editing
                ? "Modifier la plainte"
                : "Nouvelle plainte"
            }
            centered
            size="lg"
        >
            <Stack>
            <TextInput
                label="Objet de la plainte"
                placeholder="Ex. Violence, agression, vol, menace…"
                required
                value={form.objet}
                onChange={(event) =>
                setForm({
                    ...form,
                    objet: event.currentTarget.value,
                })
                }
                leftSection={
                <IconFileDescription size={16} />
                }
            />

            <Textarea
                label="Description des faits"
                placeholder="Décrivez les faits de manière détaillée…"
                required
                minRows={5}
                autosize
                maxRows={10}
                value={form.description}
                onChange={(event) =>
                setForm({
                    ...form,
                    description:
                    event.currentTarget.value,
                })
                }
            />

            <Group grow>
                <DateInput
                label="Date des faits"
                required
                value={
                    form.date_faits
                    ? new Date(form.date_faits)
                    : null
                }
                onChange={(date) =>
                    setForm({
                    ...form,
                    date_faits: date
                        ? dayjs(date).format(
                            "YYYY-MM-DD"
                        )
                        : "",
                    })
                }
                valueFormat="DD/MM/YYYY"
                clearable
                />

                <TextInput
                label="Lieu des faits"
                placeholder="Ex. Q. Mabanga Nord…"
                required
                value={form.lieu_faits}
                onChange={(event) =>
                    setForm({
                    ...form,
                    lieu_faits:
                        event.currentTarget.value,
                    })
                }
                />
            </Group>

            <Select
                label="Statut"
                required
                data={[
                {
                    value: "ENREGISTREE",
                    label: "Enregistrée",
                },
                {
                    value: "EN_COURS",
                    label: "En cours",
                },
                {
                    value: "TRAITEE",
                    label: "Traitée",
                },
                {
                    value: "CLASSEE",
                    label: "Classée",
                },
                ]}
                value={form.statut}
                onChange={(value) =>
                setForm({
                    ...form,
                    statut:
                    value ?? "ENREGISTREE",
                })
                }
            />

            <Group justify="flex-end" mt="sm">
                <Button
                variant="default"
                onClick={() => setOpened(false)}
                disabled={saving}
                >
                Annuler
                </Button>

                <Button
                onClick={save}
                loading={saving}
                >
                {editing
                    ? "Modifier"
                    : "Enregistrer"}
                </Button>
            </Group>
            </Stack>
        </Modal>
        </div>
    );
}