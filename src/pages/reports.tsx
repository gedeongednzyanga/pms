import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { openPath } from "@tauri-apps/plugin-opener";
import {
  IconArrowsExchange,
  IconDownload,
  IconFileTypePdf,
  IconLogout,
  IconUsers,
} from "@tabler/icons-react";
import { Button, Card, Group, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { toast } from "sonner";
import PdfPreview from "../components/preview-pdf";
import { X } from "lucide-react";

type Report = {
  id: "prisoners" | "transfers" | "releases";
  title: string;
  description: string;
  command: string;
  icon: typeof IconUsers;
  color: string;
};

const reports: Report[] = [
  {
    id: "prisoners",
    title: "Liste des détenues",
    description: "Liste des détenues actuellement enregistrées avec leur cellule, leur identité et leur état civil.",
    command: "export_prisoners_report_pdf",
    icon: IconUsers,
    color: "blue",
  },
  {
    id: "transfers",
    title: "Liste des transferts",
    description: "Historique des transferts avec les cellules d'origine, de destination et les motifs.",
    command: "export_transfers_report_pdf",
    icon: IconArrowsExchange,
    color: "violet",
  },
  {
    id: "releases",
    title: "Liste des libérations",
    description: "Historique des libérations, dates, motifs et notes associées.",
    command: "export_releases_report_pdf",
    icon: IconLogout,
    color: "green",
  },
];

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default function Reports() {
  const [generating, setGenerating] = useState<Report["id"] | null>(null);
  const [pdfFile, setPdfFile] = useState<string | null>(null);

  const generate = async (report: Report) => {
    setGenerating(report.id);
    try {
      const path = await invoke<string>(report.command);
      toast.success("Rapport PDF généré.", { description: path });
      setPdfFile(path ?? "");

      try {
        await openPath(path);
      } catch (openError) {
        console.warn("Le PDF a été généré mais ne peut pas être ouvert automatiquement :", openError);
      }
    } catch (error) {
      toast.error("Génération du rapport impossible", { description: errorMessage(error) });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div>
        <Title order={2}>Rapports</Title>
        <Text size="sm" c="dimmed" mt={4}>
          Générez les rapports administratifs au format PDF.
        </Text>
      </div>

      <Paper withBorder radius="md" p="lg" bg="blue.0">
        <Group align="flex-start" wrap="nowrap">
          <ThemeIcon size={42} radius="md" variant="light" color="blue">
            <IconFileTypePdf size={24} />
          </ThemeIcon>
          <div>
            <Text fw={600}>Exports PDF</Text>
            <Text size="sm" c="dimmed">
              Chaque fichier est enregistré dans le dossier Documents/PMS/PDF, puis ouvert automatiquement.
            </Text>
          </div>
        </Group>
      </Paper>

      <div className="grid gap-5 md:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} withBorder radius="md" padding="lg">
              <Stack justify="space-between" h="100%" gap="lg">
                <div>
                  <ThemeIcon size={42} radius="md" variant="light" color={report.color}>
                    <Icon size={23} />
                  </ThemeIcon>
                  <Text fw={600} mt="md">{report.title}</Text>
                  <Text size="sm" c="dimmed" mt={6}>{report.description}</Text>
                </div>
                <Button
                  leftSection={<IconDownload size={17} />}
                  variant="light"
                  color={report.color}
                  loading={generating === report.id}
                  disabled={generating !== null && generating !== report.id}
                  onClick={() => generate(report)}
                >
                  Générer le PDF
                </Button>
              </Stack>
            </Card>
          );
        })}
      </div>

      {pdfFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-sm bg-card shadow-xl">
                  <div className="flex items-center justify-between border-b border-border px-5 py-3">
                      <div>
                          <h2 className="text-sm font-semibold">Aperçu du rapport des paiements</h2>
                          <p className="text-[13px] text-muted-foreground">
                              Vérifiez le document avant impression.
                          </p>
                      </div>
                      <button
                          onClick={() => setPdfFile(null)}
                          className="text-muted-foreground hover:text-red-700"
                      >
                          <X className="h-4 w-4" />
                      </button>
                  </div>
                  <div className="flex-1 overflow-hidden p-4">
                      <PdfPreview file={pdfFile} />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
