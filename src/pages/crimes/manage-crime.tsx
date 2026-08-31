
// import { invoke } from "@tauri-apps/api/core";

// import {
//   IconAlertCircle,
//   IconDeviceFloppy,
//   IconGavel,
//   IconX,
// } from "@tabler/icons-react";

// import {
//   Alert,
//   Button,
//   Card,
//   Group,
//   Select,
//   Stack,
//   TextInput,
//   Title,
//   Text,
//   Textarea,
// } from "@mantine/core";

// import { notifications } from "@mantine/notifications";
// import { useNavigate, useParams } from "react-router";
// import { useState } from "react";

// type Crime = {
//   id: number;
//   name: string;
//   status: number;
//   delete_flag: number;
//   date_created: string;
// };

// export default function ManageCrime() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const crimeId = id ? Number(id) : undefined;
//   const isEdit = !!crimeId;

//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [status, setStatus] = useState("active");

//   const [loading, setLoading] = useState(false);
//   // const [loadingCrime, setLoadingCrime] = useState(false);

//   const [error, setError] = useState("");

//   /**
//    * ============================
//    * Enregistrer
//    * ============================
//    */
//   const handleSubmit = async (
//     event: React.SyntheticEvent
//   ) => {
//     event.preventDefault();

//     setError("");

//     try {
//       setLoading(true);

//        await invoke<Crime>("create_crime_cmd",
//         { 
//           data :{
//             crime_name: name,
//             description_crime: description,
//             statut_crime: status,
//           }
//         }
//       );

//       notifications.show({
//         title: isEdit
//           ? "Infraction modifiée"
//           : "Infraction créé",
//         message: isEdit
//           ? "L'infraction a été modifiée avec succès."
//           : "L'infraction a été créée avec succès.",
//         color: "green",
//       });

//       // // Aller vers la page de détails
//       // navigate(`/crimes/${crime.id}`);
//     } catch (error) {
//       console.error(error);

//       setError(
//         typeof error === "string"
//           ? error
//           : "Une erreur est survenue lors de l'enregistrement."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * ============================
//    * Annuler
//    * ============================
//    */
//   const handleCancel = () => {
//     if (isEdit && crimeId) {
//       navigate(`/crimes/${crimeId}`);
//     } else {
//       navigate("/crimes");
//     }
//   };

//   return (
//     <div className="mx-auto w-full max-w-2xl">
//       <Stack gap="lg">

//         {/* =========================
//             HEADER
//         ========================== */}
//         <div>
//           <Group gap="sm">
//             <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
//               <IconGavel size={23} />
//             </div>

//             <div>
//               <Title order={2}>
//                 {isEdit
//                   ? "Modifier le crime"
//                   : "Nouveau crime"}
//               </Title>

//               <Text size="sm" c="dimmed">
//                 {isEdit
//                   ? "Modifier les informations de cette infraction"
//                   : "Enregistrer une nouvelle infraction"}
//               </Text>
//             </div>
//           </Group>
//         </div>

//         {/* =========================
//             FORM
//         ========================== */}
//         <Card
//           withBorder
//           radius="md"
//           shadow="sm"
//           padding="xl"
//         >
//           <form onSubmit={handleSubmit}>
//             <Stack gap="lg">

//               {/* Error */}
//               {error && (
//                 <Alert
//                   icon={<IconAlertCircle size={18} />}
//                   color="red"
//                   variant="light"
//                 >
//                   {error}
//                 </Alert>
//               )}

//               {/* Nom */}
//               <TextInput
//                 label="Nom du crime"
//                 placeholder="Ex. Vol, Meurtre, Escroquerie..."
//                 required
//                 value={name}
//                 onChange={(event) =>
//                   setName(
//                     event.currentTarget.value
//                   )
//                 }
//                 disabled={loading}
//               />

//               <Textarea
//                 label="Description"
//                 placeholder="Description de l'infraction..."
//                 minRows={5}
//                 required
//                 value={description}
//                 onChange={(e) =>
//                   setDescription(
//                     e.currentTarget.value
//                   )
//                 }
//               />

//               {/* Statut */}
//               <Select
//                 label="Statut"
//                 placeholder="Sélectionner un statut"
//                 required
//                 value={status}
//                 onChange={(value) =>
//                   setStatus(value ?? 'active')
//                 }
//                 data={[
//                   {
//                     value: 'active',
//                     label: "Actif",
//                   },
//                   {
//                     value: 'desactive',
//                     label: "Inactif",
//                   },
//                 ]}
//                 disabled={loading}
//               />

//               {/* Actions */}
//               <Group
//                 justify="flex-end"
//                 mt="md"
//               >
//                 <Button
//                   type="button"
//                   variant="default"
//                   leftSection={
//                     <IconX size={17} />
//                   }
//                   onClick={handleCancel}
//                   disabled={loading}
//                 >
//                   Annuler
//                 </Button>

//                 <Button
//                   type="submit"
//                   loading={loading}
//                   leftSection={
//                     <IconDeviceFloppy
//                       size={17}
//                     />
//                   }
//                 >
//                   {isEdit
//                     ? "Enregistrer les modifications"
//                     : "Enregistrer"}
//                 </Button>
//               </Group>
//             </Stack>
//           </form>
//         </Card>
//       </Stack>
//     </div>
//   );
// }

import { invoke } from "@tauri-apps/api/core";

import {
  IconAlertCircle,
  IconDeviceFloppy,
  IconGavel,
  IconX,
} from "@tabler/icons-react";

import {
  Alert,
  Button,
  Card,
  Group,
  Select,
  Stack,
  TextInput,
  Title,
  Text,
  Textarea,
  Loader,
  Center,
} from "@mantine/core";

import { notifications } from "@mantine/notifications";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";

type Crime = {
  id: number;
  name: string;
  description: string;
  status: string;
  delete_flag: number;
  date_created: string;
};

type CrimeFormData = {
  crime_name: string;
  description_crime: string;
  statut_crime: string;
};

export default function ManageCrime() {
  const { id } = useParams();
  const navigate = useNavigate();

  const crimeId = id ? Number(id) : undefined;
  const isEdit = crimeId !== undefined && !Number.isNaN(crimeId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(false);
  const [loadingCrime, setLoadingCrime] = useState(false);

  const [error, setError] = useState("");

  /**
   * ============================
   * Charger le crime en modification
   * ============================
   */
  useEffect(() => {
    if (!isEdit || !crimeId) {
      return;
    }

    const loadCrime = async () => {
      try {
        setLoadingCrime(true);
        setError("");

        const crime = await invoke<Crime>("get_crime_cmd", {
          id: crimeId,
        });

        setName(crime.name ?? "");
        setDescription(crime.description ?? "");
        setStatus(
          crime.status === "desactive"
            ? "desactive"
            : "active"
        );
      } catch (error) {
        console.error(error);

        setError(
          typeof error === "string"
            ? error
            : "Impossible de charger les informations de cette infraction."
        );
      } finally {
        setLoadingCrime(false);
      }
    };

    loadCrime();
  }, [crimeId, isEdit]);

  /**
   * ============================
   * Enregistrer
   * ============================
   */
  const handleSubmit = async (
    event: React.SyntheticEvent
  ) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Le nom de l'infraction est obligatoire.");
      return;
    }

    if (!description.trim()) {
      setError("La description est obligatoire.");
      return;
    }

    try {
      setLoading(true);

      const data: CrimeFormData = {
        crime_name: name.trim(),
        description_crime: description.trim(),
        statut_crime: status,
      };

      if (isEdit && crimeId) {
        /**
         * ============================
         * MODIFICATION
         * ============================
         */
        await invoke("update_crime_cmd", {
          id: crimeId,
          data,
        });

        notifications.show({
          title: "Infraction modifiée",
          message:
            "L'infraction a été modifiée avec succès.",
          color: "green",
        });

        navigate(`/crimes/${crimeId}`);
      } else {
        /**
         * ============================
         * CREATION
         * ============================
         */

        await invoke<Crime>(
          "create_crime_cmd",
          {
            data,
          }
        );

        notifications.show({
          title: `Infraction créée`,
          message:
            "L'infraction a été créée avec succès.",
          color: "green",
        });

        navigate("/crimes");
      }
    } catch (error) {
      console.error(error);

      setError(
        typeof error === "string"
          ? error
          : "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================
   * Annuler
   * ============================
   */
  const handleCancel = () => {
    if (isEdit && crimeId) {
      navigate(`/crimes/${crimeId}`);
    } else {
      navigate("/crimes");
    }
  };

  /**
   * ============================
   * Chargement du crime
   * ============================
   */
  if (loadingCrime) {
    return (
      <Center py="xl">
        <Stack align="center" gap="sm">
          <Loader size="md" />
          <Text c="dimmed">
            Chargement de l'infraction...
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Stack gap="lg">

        {/* =========================
            HEADER
        ========================== */}
        <div>
          <Group gap="sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
              <IconGavel size={23} />
            </div>

            <div>
              <Title order={2}>
                {isEdit
                  ? "Modifier le crime"
                  : "Nouveau crime"}
              </Title>

              <Text size="sm" c="dimmed">
                {isEdit
                  ? "Modifier les informations de cette infraction"
                  : "Enregistrer une nouvelle infraction"}
              </Text>
            </div>
          </Group>
        </div>

        {/* =========================
            FORM
        ========================== */}
        <Card
          withBorder
          radius="md"
          shadow="sm"
          padding="xl"
        >
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">

              {/* Error */}
              {error && (
                <Alert
                  icon={
                    <IconAlertCircle size={18} />
                  }
                  color="red"
                  variant="light"
                >
                  {error}
                </Alert>
              )}

              {/* Nom */}
              <TextInput
                label="Nom du crime"
                placeholder="Ex. Vol, Meurtre, Escroquerie..."
                required
                value={name}
                onChange={(event) =>
                  setName(
                    event.currentTarget.value
                  )
                }
                disabled={loading}
              />

              {/* Description */}
              <Textarea
                label="Description"
                placeholder="Description de l'infraction..."
                minRows={5}
                required
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.currentTarget.value
                  )
                }
                disabled={loading}
              />

              {/* Statut */}
              <Select
                label="Statut"
                placeholder="Sélectionner un statut"
                required
                value={status}
                onChange={(value) =>
                  setStatus(value ?? "active")
                }
                data={[
                  {
                    value: "active",
                    label: "Actif",
                  },
                  {
                    value: "desactive",
                    label: "Inactif",
                  },
                ]}
                disabled={loading}
              />

              {/* Actions */}
              <Group
                justify="flex-end"
                mt="md"
              >
                <Button
                  type="button"
                  variant="default"
                  leftSection={
                    <IconX size={17} />
                  }
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Annuler
                </Button>

                <Button
                  type="submit"
                  loading={loading}
                  leftSection={
                    <IconDeviceFloppy size={17} />
                  }
                >
                  {isEdit
                    ? "Enregistrer les modifications"
                    : "Enregistrer"}
                </Button>
              </Group>

            </Stack>
          </form>
        </Card>
      </Stack>
    </div>
  );
}

