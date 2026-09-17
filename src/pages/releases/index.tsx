import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { IconEdit, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { ActionIcon, Button, Card, Group, Loader, Modal, Select, Stack, Table, Text, TextInput, Textarea, Title } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";
import { toast } from "sonner";
import { InmateOption, Release } from "../../interfaces/movements";

type ReleaseForm = { inmate_id: string; release_date: string; reason: string; notes: string };
const emptyForm: ReleaseForm = { inmate_id: "", release_date: "", reason: "", notes: "" };

const formatDate = (value: string) => value ? dayjs(value).format("DD/MM/YYYY") : "—";
const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

export default function Releases() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [inmates, setInmates] = useState<InmateOption[]>([]);
  const [search, setSearch] = useState("");
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<Release | null>(null);
  const [form, setForm] = useState<ReleaseForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [releaseData, inmateData] = await Promise.all([
        invoke<Release[]>("get_releases_cmd"),
        invoke<InmateOption[]>("get_inmate_options_cmd"),
      ]);
      setReleases(releaseData);
      setInmates(inmateData);
    } catch (error) {
      toast.error("Impossible de charger les libérations", { description: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const inmateOptions = useMemo(() => {
    if (!editing || inmates.some((inmate) => inmate.id === editing.inmate_id)) return inmates;
    return [...inmates, { id: editing.inmate_id, label: editing.inmate_name, cellule_id: "" }];
  }, [editing, inmates]);

  const filteredReleases = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return releases;
    return releases.filter((release) =>
      [release.inmate_name, release.reason, release.release_date]
        .some((value) => value.toLocaleLowerCase().includes(query))
    );
  }, [releases, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpened(true);
  };

  const openEdit = (release: Release) => {
    setEditing(release);
    setForm({ inmate_id: release.inmate_id, release_date: release.release_date, reason: release.reason, notes: release.notes ?? "" });
    setOpened(true);
  };

  const save = async () => {
    if (!form.inmate_id || !form.release_date || !form.reason.trim()) {
      toast.error("Veuillez renseigner la détenue, la date et le motif.");
      return;
    }
    setSaving(true);
    try {
      const data = { ...form, reason: form.reason.trim(), notes: form.notes.trim() || null };
      if (editing) await invoke("update_release_cmd", { id: editing.id, data });
      else await invoke("create_release_cmd", { data });
      toast.success(editing ? "Libération modifiée." : "Libération enregistrée.");
      setOpened(false);
      await load();
    } catch (error) {
      toast.error("Enregistrement impossible", { description: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (release: Release) => {
    if (!window.confirm(`Supprimer la libération de ${release.inmate_name} ?`)) return;
    try {
      await invoke("delete_release_cmd", { id: release.id });
      toast.success("Libération supprimée.");
      await load();
    } catch (error) {
      toast.error("Suppression impossible", { description: errorMessage(error) });
    }
  };

  return <div className="mx-auto max-w-6xl space-y-6 pb-10">
    <Group justify="space-between" align="end">
      <div><Title order={2}>Libérations</Title><Text c="dimmed" size="sm" mt={4}>Enregistrez et suivez les sorties des détenues.</Text></div>
      <Button leftSection={<IconPlus size={18} />} onClick={openCreate}>Nouvelle libération</Button>
    </Group>
    <Card withBorder radius="md">
      <Card.Section withBorder inheritPadding py="md"><Group justify="space-between"><Text fw={600}>Historique des libérations</Text><TextInput w={280} placeholder="Rechercher…" value={search} onChange={(event) => setSearch(event.currentTarget.value)} leftSection={<IconSearch size={16} />} /></Group></Card.Section>
      {loading ? <Stack align="center" py="xl"><Loader /><Text size="sm" c="dimmed">Chargement…</Text></Stack> :
        <Table.ScrollContainer minWidth={700}><Table striped highlightOnHover verticalSpacing="sm"><Table.Thead><Table.Tr><Table.Th>Détenue</Table.Th><Table.Th>Date</Table.Th><Table.Th>Motif</Table.Th><Table.Th>Notes</Table.Th><Table.Th ta="right">Actions</Table.Th></Table.Tr></Table.Thead><Table.Tbody>
          {filteredReleases.length === 0 ? <Table.Tr><Table.Td colSpan={5}><Text ta="center" c="dimmed" py="lg">Aucune libération enregistrée.</Text></Table.Td></Table.Tr> : filteredReleases.map((release) => <Table.Tr key={release.id}><Table.Td fw={500}>{release.inmate_name}</Table.Td><Table.Td>{formatDate(release.release_date)}</Table.Td><Table.Td>{release.reason}</Table.Td><Table.Td>{release.notes || "—"}</Table.Td><Table.Td><Group justify="flex-end" gap="xs"><ActionIcon variant="subtle" color="blue" aria-label="Modifier" onClick={() => openEdit(release)}><IconEdit size={18} /></ActionIcon><ActionIcon variant="subtle" color="red" aria-label="Supprimer" onClick={() => remove(release)}><IconTrash size={18} /></ActionIcon></Group></Table.Td></Table.Tr>)}
        </Table.Tbody></Table></Table.ScrollContainer>}
    </Card>
    <Modal opened={opened} onClose={() => !saving && setOpened(false)} title={editing ? "Modifier la libération" : "Nouvelle libération"} centered>
      <Stack>
        <Select label="Détenue" required searchable data={inmateOptions.map((inmate) => ({ value: inmate.id, label: inmate.label }))} value={form.inmate_id} onChange={(value) => setForm({ ...form, inmate_id: value ?? "" })} nothingFoundMessage="Aucune détenue trouvée" />
        <DateInput label="Date de libération" required value={form.release_date ? new Date(form.release_date) : null} onChange={(date) => setForm({ ...form, release_date: date ? dayjs(date).format("YYYY-MM-DD") : "" })} valueFormat="DD/MM/YYYY" clearable />
        <TextInput label="Motif" required placeholder="Ex. Fin de peine, acquittement…" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.currentTarget.value })} />
        <Textarea label="Notes" placeholder="Informations complémentaires" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.currentTarget.value })} minRows={3} />
        <Group justify="flex-end"><Button variant="default" onClick={() => setOpened(false)} disabled={saving}>Annuler</Button><Button onClick={save} loading={saving}>Enregistrer</Button></Group>
      </Stack>
    </Modal>
  </div>;
}
