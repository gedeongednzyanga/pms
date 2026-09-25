

// import { useState } from "react";
// import { invoke } from "@tauri-apps/api/core";
// import { openPath } from "@tauri-apps/plugin-opener";
// import {
//   IconArrowsExchange,
//   IconDownload,
//   IconFileDescription,
//   IconFileTypePdf,
//   IconLogout,
//   IconUsers,
// } from "@tabler/icons-react";
// import {
//   Button,
//   Card,
//   Group,
//   Paper,
//   Stack,
//   Text,
//   ThemeIcon,
//   Title,
// } from "@mantine/core";
// import { toast } from "sonner";
// import PdfPreview from "../components/preview-pdf";
// import { X } from "lucide-react";

// type Report = {
//   id: "prisoners" | "transfers" | "releases" | "plaintes";
//   title: string;
//   description: string;
//   command: string;
//   icon: typeof IconUsers;
//   color: string;
// };

// const reports: Report[] = [
//   {
//     id: "prisoners",
//     title: "Liste des détenues",
//     description:
//       "Liste des détenues actuellement enregistrées avec leur cellule, leur identité et leur état civil.",
//     command: "export_prisoners_report_pdf",
//     icon: IconUsers,
//     color: "blue",
//   },
//   {
//     id: "transfers",
//     title: "Liste des transferts",
//     description:
//       "Historique des transferts avec les cellules d'origine, de destination et les motifs.",
//     command: "export_transfers_report_pdf",
//     icon: IconArrowsExchange,
//     color: "violet",
//   },
//   {
//     id: "releases",
//     title: "Liste des libérations",
//     description:
//       "Historique des libérations, dates, motifs et notes associées.",
//     command: "export_releases_report_pdf",
//     icon: IconLogout,
//     color: "green",
//   },
//   {
//     id: "plaintes",
//     title: "Liste des plaintes",
//     description:
//       "Liste des plaintes enregistrées avec leur objet, la date, le lieu des faits et leur statut.",
//     command: "export_plaintes_report_pdf",
//     icon: IconFileDescription,
//     color: "red",
//   },
// ];

// function errorMessage(error: unknown): string {
//   return error instanceof Error ? error.message : String(error);
// }

// export default function Reports() {
//   const [generating, setGenerating] = useState<Report["id"] | null>(null);
//   const [pdfFile, setPdfFile] = useState<string | null>(null);

//   const generate = async (report: Report) => {
//     setGenerating(report.id);

//     try {
//       const path = await invoke<string>(report.command);

//       toast.success("Rapport PDF généré.", {
//         description: path,
//       });

//       setPdfFile(path ?? "");

//       try {
//         await openPath(path);
//       } catch (openError) {
//         console.warn(
//           "Le PDF a été généré mais ne peut pas être ouvert automatiquement :",
//           openError
//         );
//       }
//     } catch (error) {
//       toast.error("Génération du rapport impossible", {
//         description: errorMessage(error),
//       });
//     } finally {
//       setGenerating(null);
//     }
//   };

//   return (
//     <div className="mx-auto max-w-5xl space-y-6 pb-10">
//       <div>
//         <Title order={2}>Rapports</Title>

//         <Text size="sm" c="dimmed" mt={4}>
//           Générez les rapports administratifs au format PDF.
//         </Text>
//       </div>

//       <Paper withBorder radius="md" p="lg" bg="blue.0">
//         <Group align="flex-start" wrap="nowrap">
//           <ThemeIcon
//             size={42}
//             radius="md"
//             variant="light"
//             color="blue"
//           >
//             <IconFileTypePdf size={24} />
//           </ThemeIcon>

//           <div>
//             <Text fw={600}>Exports PDF</Text>

//             <Text size="sm" c="dimmed">
//               Chaque fichier est enregistré dans le dossier
//               Documents/PMS/PDF, puis ouvert automatiquement.
//             </Text>
//           </div>
//         </Group>
//       </Paper>

//       <div className="grid gap-5 md:grid-cols-3">
//         {reports.map((report) => {
//           const Icon = report.icon;

//           return (
//             <Card
//               key={report.id}
//               withBorder
//               radius="md"
//               padding="lg"
//             >
//               <Stack
//                 justify="space-between"
//                 h="100%"
//                 gap="lg"
//               >
//                 <div>
//                   <ThemeIcon
//                     size={42}
//                     radius="md"
//                     variant="light"
//                     color={report.color}
//                   >
//                     <Icon size={23} />
//                   </ThemeIcon>

//                   <Text fw={600} mt="md">
//                     {report.title}
//                   </Text>

//                   <Text size="sm" c="dimmed" mt={6}>
//                     {report.description}
//                   </Text>
//                 </div>

//                 <Button
//                   leftSection={
//                     <IconDownload size={17} />
//                   }
//                   variant="light"
//                   color={report.color}
//                   loading={
//                     generating === report.id
//                   }
//                   disabled={
//                     generating !== null &&
//                     generating !== report.id
//                   }
//                   onClick={() =>
//                     generate(report)
//                   }
//                 >
//                   Générer le PDF
//                 </Button>
//               </Stack>
//             </Card>
//           );
//         })}
//       </div>

//       {pdfFile && (
//         <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-3 sm:p-5">
//           {/* CONTENEUR MODAL */}
//           <div className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl ">

//             {/* HEADER */}
//             <div className="flex shrink-0 items-center justify-between border-b px-5 py-3 ">
//               <div className="min-w-0">
//                 <h2 className="truncate text-sm font-semibold">
//                   Aperçu du rapport
//                 </h2>

//                 <p className="mt-1 text-xs text-muted-foreground">
//                   Vérifiez le document avant impression.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={() => setPdfFile(null)}
//                 className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
//                 aria-label="Fermer"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             {/* PDF */}
//             <div className="min-h-0 flex-1 bg-slate-100 p-2 sm:p-4">
//               <div className="h-full w-full overflow-hidden rounded-md bg-white shadow-sm">
//                 <PdfPreview file={pdfFile} />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }


import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { openPath } from "@tauri-apps/plugin-opener";

import {
  IconArrowsExchange,
  IconCalendar,
  IconDownload,
  IconFileDescription,
  IconFileTypePdf,
  IconLogout,
  IconUsers,
} from "@tabler/icons-react";

import {
  Button,
  Card,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";

import { toast } from "sonner";
import PdfPreview from "../components/preview-pdf";
import { X } from "lucide-react";

type Report = {
  id: "prisoners" | "transfers" | "releases" | "plaintes";
  title: string;
  description: string;
  command: string;
  icon: typeof IconUsers;
  color: string;
  dateFilter?: boolean;
};

const reports: Report[] = [
  {
    id: "prisoners",
    title: "Liste des détenues",
    description:
      "Liste des détenues actuellement enregistrées avec leur cellule, leur identité et leur état civil.",
    command: "export_prisoners_report_pdf",
    icon: IconUsers,
    color: "blue",
  },
  {
    id: "transfers",
    title: "Liste des transferts",
    description:
      "Historique des transferts avec les cellules d'origine, de destination et les motifs.",
    command: "export_transfers_report_pdf",
    icon: IconArrowsExchange,
    color: "violet",
    dateFilter: true,
  },
  {
    id: "releases",
    title: "Liste des libérations",
    description:
      "Historique des libérations, dates, motifs et notes associées.",
    command: "export_releases_report_pdf",
    icon: IconLogout,
    color: "green",
    dateFilter: true,
  },
  {
    id: "plaintes",
    title: "Liste des plaintes",
    description:
      "Liste des plaintes enregistrées avec leur objet, la date, le lieu des faits et leur statut.",
    command: "export_plaintes_report_pdf",
    icon: IconFileDescription,
    color: "red",
    dateFilter: true,
  },
];

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default function Reports() {
  const [generating, setGenerating] = useState<Report["id"] | null>(null);

  const [pdfFile, setPdfFile] = useState<string | null>(null);

  // Rapport actuellement sélectionné pour le filtre
  const [selectedReport, setSelectedReport] =
    useState<Report | null>(null);

  // Dates du filtre
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  /**
   * Ouvre le modal de sélection des dates
   */
  const openDateModal = (report: Report) => {
    setSelectedReport(report);

    // Dates vides par défaut
    setDateDebut("");
    setDateFin("");
  };

  /**
   * Génération d'un rapport sans filtre de dates
   */
  const generate = async (
    report: Report,
    dates?: {
      date_debut: string;
      date_fin: string;
    }
  ) => {
    setGenerating(report.id);

    try {
      let path: string;

      if (dates) {
        path = await invoke<string>(report.command, {
          dateDebut: dates.date_debut,
          dateFin: dates.date_fin,
        });
      } else {
        path = await invoke<string>(report.command);
      }

      toast.success("Rapport PDF généré.", {
        description: path,
      });

      setPdfFile(path ?? "");

      try {
        await openPath(path);
      } catch (openError) {
        console.warn(
          "Le PDF a été généré mais ne peut pas être ouvert automatiquement :",
          openError
        );
      }
    } catch (error) {
      toast.error("Génération du rapport impossible", {
        description: errorMessage(error),
      });
    } finally {
      setGenerating(null);
    }
  };

  /**
   * Validation du filtre de dates
   */
  const generateWithDates = async () => {
    if (!selectedReport) {
      return;
    }

    if (!dateDebut) {
      toast.error("Veuillez sélectionner la date de début.");
      return;
    }

    if (!dateFin) {
      toast.error("Veuillez sélectionner la date de fin.");
      return;
    }

    if (dateDebut > dateFin) {
      toast.error(
        "La date de début ne peut pas être supérieure à la date de fin."
      );
      return;
    }

    const report = selectedReport;

    setSelectedReport(null);

    await generate(report, {
      date_debut: dateDebut,
      date_fin: dateFin,
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">

      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <div>
        <Title order={2}>Rapports</Title>

        <Text size="sm" c="dimmed" mt={4}>
          Générez les rapports administratifs au format PDF.
        </Text>
      </div>

      {/* ========================================================= */}
      {/* INFO PDF */}
      {/* ========================================================= */}

      <Paper
        withBorder
        radius="md"
        p="lg"
        bg="blue.0"
      >
        <Group align="flex-start" wrap="nowrap">

          <ThemeIcon
            size={42}
            radius="md"
            variant="light"
            color="blue"
          >
            <IconFileTypePdf size={24} />
          </ThemeIcon>

          <div>
            <Text fw={600}>Exports PDF</Text>

            <Text size="sm" c="dimmed">
              Chaque fichier est enregistré dans le dossier
              Documents/PMS/PDF, puis ouvert automatiquement.
            </Text>
          </div>

        </Group>
      </Paper>

      {/* ========================================================= */}
      {/* RAPPORTS */}
      {/* ========================================================= */}

      <div className="grid gap-5 md:grid-cols-3">

        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <Card
              key={report.id}
              withBorder
              radius="md"
              padding="lg"
            >
              <Stack
                justify="space-between"
                h="100%"
                gap="lg"
              >

                <div>

                  <ThemeIcon
                    size={42}
                    radius="md"
                    variant="light"
                    color={report.color}
                  >
                    <Icon size={23} />
                  </ThemeIcon>

                  <Text fw={600} mt="md">
                    {report.title}
                  </Text>

                  <Text
                    size="sm"
                    c="dimmed"
                    mt={6}
                  >
                    {report.description}
                  </Text>

                </div>

                <Button
                  leftSection={
                    <IconDownload size={17} />
                  }
                  variant="light"
                  color={report.color}
                  loading={
                    generating === report.id
                  }
                  disabled={
                    generating !== null &&
                    generating !== report.id
                  }
                  onClick={() => {
                    if (report.dateFilter) {
                      openDateModal(report);
                    } else {
                      generate(report);
                    }
                  }}
                >
                  Générer le PDF
                </Button>

              </Stack>
            </Card>
          );
        })}

      </div>

      {/* ========================================================= */}
      {/* MODAL FILTRE PAR DATES */}
      {/* ========================================================= */}

      <Modal
        opened={selectedReport !== null}
        onClose={() => setSelectedReport(null)}
        title={
          selectedReport
            ? `Période — ${selectedReport.title}`
            : "Sélection de la période"
        }
        centered
        radius="md"
      >

        <Stack gap="md">

          <Text size="sm" c="dimmed">
            Sélectionnez l'intervalle de dates à inclure
            dans le rapport.
          </Text>

          <TextInput
            label="Date de début"
            placeholder="YYYY-MM-DD"
            type="date"
            leftSection={
              <IconCalendar size={17} />
            }
            value={dateDebut}
            onChange={(event) =>
              setDateDebut(event.currentTarget.value)
            }
          />

          <TextInput
            label="Date de fin"
            placeholder="YYYY-MM-DD"
            type="date"
            leftSection={
              <IconCalendar size={17} />
            }
            value={dateFin}
            onChange={(event) =>
              setDateFin(event.currentTarget.value)
            }
          />

          <Group justify="flex-end" mt="sm">

            <Button
              variant="default"
              onClick={() =>
                setSelectedReport(null)
              }
            >
              Annuler
            </Button>

            <Button
              color={selectedReport?.color}
              leftSection={
                <IconFileTypePdf size={17} />
              }
              onClick={generateWithDates}
              loading={
                selectedReport !== null &&
                generating === selectedReport.id
              }
            >
              Générer le PDF
            </Button>

          </Group>

        </Stack>

      </Modal>

      {/* ========================================================= */}
      {/* APERÇU PDF */}
      {/* ========================================================= */}

      {pdfFile && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-3 sm:p-5">

          <div className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">

            {/* HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b px-5 py-3">

              <div className="min-w-0">

                <h2 className="truncate text-sm font-semibold">
                  Aperçu du rapport
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Vérifiez le document avant impression.
                </p>

              </div>

              <button
                type="button"
                onClick={() => setPdfFile(null)}
                className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* PDF */}
            <div className="min-h-0 flex-1 bg-slate-100 p-2 sm:p-4">

              <div className="h-full w-full overflow-hidden rounded-md bg-white shadow-sm">

                <PdfPreview file={pdfFile} />

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
