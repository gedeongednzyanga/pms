import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { IconArrowsExchange, IconEdit, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { ActionIcon, Button, Card, Group, Loader, Modal, Select, Stack, Table, Text, TextInput, Textarea, Title } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";
import { toast } from "sonner";
import { CelluleOption, InmateOption, Transfer } from "../../interfaces/movements";

type TransferForm = { inmate_id: string; to_cellule_id: string; transfer_date: string; reason: string; notes: string };
const emptyForm: TransferForm = { inmate_id: "", to_cellule_id: "", transfer_date: "", reason: "", notes: "" };
const formatDate = (value: string) => value ? dayjs(value).format("DD/MM/YYYY") : "—";
const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

export default function Transfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [inmates, setInmates] = useState<InmateOption[]>([]);
  const [cellules, setCellules] = useState<CelluleOption[]>([]);
  const [search, setSearch] = useState("");
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<Transfer | null>(null);
  const [form, setForm] = useState<TransferForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [transferData, inmateData, celluleData] = await Promise.all([
        invoke<Transfer[]>("get_transfers_cmd"),
        invoke<InmateOption[]>("get_inmate_options_cmd"),
        invoke<CelluleOption[]>("get_cellule_options_cmd"),
      ]);
      setTransfers(transferData); setInmates(inmateData); setCellules(celluleData);
    } catch (error) {
      toast.error("Impossible de charger les transferts", { description: errorMessage(error) });
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const inmateOptions = useMemo(() => {
    if (!editing || inmates.some((inmate) => inmate.id === editing.inmate_id)) return inmates;
    return [...inmates, { id: editing.inmate_id, label: editing.inmate_name, cellule_id: editing.from_cellule_id }];
  }, [editing, inmates]);
  const celluleOptions = useMemo(() => {
    if (!editing || cellules.some((cellule) => cellule.id === editing.to_cellule_id)) return cellules;
    return [...cellules, { id: editing.to_cellule_id, label: editing.to_cellule_name }];
  }, [cellules, editing]);
  const filteredTransfers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return transfers;
    return transfers.filter((transfer) => [transfer.inmate_name, transfer.from_cellule_name, transfer.to_cellule_name, transfer.reason, transfer.transfer_date].some((value) => value.toLocaleLowerCase().includes(query)));
  }, [search, transfers]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpened(true); };
  const openEdit = (transfer: Transfer) => {
    setEditing(transfer);
    setForm({ inmate_id: transfer.inmate_id, to_cellule_id: transfer.to_cellule_id, transfer_date: transfer.transfer_date, reason: transfer.reason, notes: transfer.notes ?? "" });
    setOpened(true);
  };
  const save = async () => {
    if (!form.inmate_id || !form.to_cellule_id || !form.transfer_date || !form.reason.trim()) {
      toast.error("Veuillez renseigner la détenue, la destination, la date et le motif."); return;
    }
    setSaving(true);
    try {
      const data = { ...form, reason: form.reason.trim(), notes: form.notes.trim() || null };
      if (editing) await invoke("update_transfer_cmd", { id: editing.id, data });
      else await invoke("create_transfer_cmd", { data });
      toast.success(editing ? "Transfert modifié." : "Transfert enregistré.");
      setOpened(false); await load();
    } catch (error) { toast.error("Enregistrement impossible", { description: errorMessage(error) }); }
    finally { setSaving(false); }
  };
  const remove = async (transfer: Transfer) => {
    if (!window.confirm(`Supprimer le transfert de ${transfer.inmate_name} ?`)) return;
    try { await invoke("delete_transfer_cmd", { id: transfer.id }); toast.success("Transfert supprimé."); await load(); }
    catch (error) { toast.error("Suppression impossible", { description: errorMessage(error) }); }
  };

  return <div className="mx-auto space-y-6 pb-5">
    <Group justify="space-between" align="end"><div><Title order={2}>Transferts</Title><Text c="dimmed" size="sm" mt={4}>Gérez les mouvements entre les cellules et les prisons.</Text></div><Button leftSection={<IconPlus size={18} />} onClick={openCreate}>Nouveau transfert</Button></Group>
    <Card withBorder radius="md">
      <Card.Section withBorder inheritPadding py="md"><Group justify="space-between"><Text fw={600}>Historique des transferts</Text><TextInput w={280} placeholder="Rechercher…" value={search} onChange={(event) => setSearch(event.currentTarget.value)} leftSection={<IconSearch size={16} />} /></Group></Card.Section>
      {loading ? <Stack align="center" py="xl"><Loader /><Text size="sm" c="dimmed">Chargement…</Text></Stack> :
        <Table.ScrollContainer minWidth={900}><Table striped highlightOnHover verticalSpacing="sm"><Table.Thead><Table.Tr><Table.Th>Détenue</Table.Th><Table.Th>Date</Table.Th><Table.Th>Origine</Table.Th><Table.Th>Destination</Table.Th><Table.Th>Motif</Table.Th><Table.Th ta="right">Actions</Table.Th></Table.Tr></Table.Thead><Table.Tbody>
          {filteredTransfers.length === 0 ? <Table.Tr><Table.Td colSpan={6}><Text ta="center" c="dimmed" py="lg">Aucun transfert enregistré.</Text></Table.Td></Table.Tr> : filteredTransfers.map((transfer) => <Table.Tr key={transfer.id}><Table.Td fw={500}>{transfer.inmate_name}</Table.Td><Table.Td>{formatDate(transfer.transfer_date)}</Table.Td><Table.Td>{transfer.from_cellule_name}</Table.Td><Table.Td>{transfer.to_cellule_name}</Table.Td><Table.Td>{transfer.reason}</Table.Td><Table.Td><Group justify="flex-end" gap="xs"><ActionIcon variant="subtle" color="blue" aria-label="Modifier" onClick={() => openEdit(transfer)}><IconEdit size={18} /></ActionIcon><ActionIcon variant="subtle" color="red" aria-label="Supprimer" onClick={() => remove(transfer)}><IconTrash size={18} /></ActionIcon></Group></Table.Td></Table.Tr>)}
        </Table.Tbody></Table></Table.ScrollContainer>}
    </Card>
    <Modal opened={opened} onClose={() => !saving && setOpened(false)} title={editing ? "Modifier le transfert" : "Nouveau transfert"} centered>
      <Stack>
        <Select label="Détenue" required searchable disabled={Boolean(editing)} data={inmateOptions.map((inmate) => ({ value: inmate.id, label: inmate.label }))} value={form.inmate_id} onChange={(value) => setForm({ ...form, inmate_id: value ?? "" })} nothingFoundMessage="Aucune détenue trouvée" />
        {editing && <Text size="xs" c="dimmed">La détenue ne peut pas être changée après l'enregistrement du transfert.</Text>}
        <Select label="Cellule de destination" required searchable data={celluleOptions.map((cellule) => ({ value: cellule.id, label: cellule.label }))} value={form.to_cellule_id} onChange={(value) => setForm({ ...form, to_cellule_id: value ?? "" })} nothingFoundMessage="Aucune cellule trouvée" />
        <DateInput label="Date du transfert" required value={form.transfer_date ? new Date(form.transfer_date) : null} onChange={(date) => setForm({ ...form, transfer_date: date ? dayjs(date).format("YYYY-MM-DD") : "" })} valueFormat="DD/MM/YYYY" clearable />
        <TextInput label="Motif" required placeholder="Ex. Rapprochement familial, sécurité…" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.currentTarget.value })} leftSection={<IconArrowsExchange size={16} />} />
        <Textarea label="Notes" placeholder="Informations complémentaires" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.currentTarget.value })} minRows={3} />
        <Group justify="flex-end"><Button variant="default" onClick={() => setOpened(false)} disabled={saving}>Annuler</Button><Button onClick={save} loading={saving}>Enregistrer</Button></Group>
      </Stack>
    </Modal>
  </div>;
}
