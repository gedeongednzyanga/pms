import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Modal,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
  FileInput,
  Avatar,
  Text,
  Select,
  Alert,
} from "@mantine/core";
import { IconUpload, IconAlertCircle } from "@tabler/icons-react";

export interface User {
  id: number;
  firstname: string;
  middlename?: string | null;
  lastname: string;
  username: string;
  type: number;
  avatar?: string | null;
  date_updated?: string;
}

interface UserModalProps {
  opened: boolean;
  onClose: () => void;
  user?: User | null;
  onSuccess: () => void;
}

export default function UserFormModal({
  opened,
  onClose,
  user,
  onSuccess,
}: UserModalProps) {
  const [firstname, setFirstname] = useState("");
  const [middlename, setMiddlename] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState<string>("2");

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!user;

  useEffect(() => {
    if (!opened) return;

    setFirstname(user?.firstname ?? "");
    setMiddlename(user?.middlename ?? "");
    setLastname(user?.lastname ?? "");
    setUsername(user?.username ?? "");
    setPassword("");
    setType(String(user?.type ?? 2));

    setAvatar(null);
    setAvatarPreview(user?.avatar ?? null);

    setError("");
  }, [opened, user]);

  const handleAvatarChange = (file: File | null) => {
    setAvatar(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    } else {
      setAvatarPreview(user?.avatar ?? null);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!firstname.trim()) {
      setError("Le prénom est obligatoire.");
      return;
    }

    if (!lastname.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }

    if (!username.trim()) {
      setError("Le nom d'utilisateur est obligatoire.");
      return;
    }

    if (!isEdit && !password.trim()) {
      setError("Le mot de passe est obligatoire.");
      return;
    }

    try {
      setLoading(true);

      await invoke("save_user_cmd", {
        user: {
          id: user?.id ?? null,
          firstname: firstname.trim(),
          middlename: middlename.trim() || null,
          lastname: lastname.trim(),
          username: username.trim(),
          password: password || null,
          type: Number(type),
          avatar: user?.avatar ?? null,
        },
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erreur utilisateur :", err);

      setError(
        typeof err === "string"
          ? err
          : "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
      centered
      size="md"
    >
      <Stack gap="md">

        {error && (
          <Alert
            color="red"
            icon={<IconAlertCircle size={18} />}
          >
            {error}
          </Alert>
        )}

        <Group justify="center">
          <Stack align="center" gap={5}>
            <Avatar
              src={avatarPreview}
              size={90}
              radius="xl"
            >
              {firstname?.charAt(0)}
            </Avatar>

            <Text size="xs" c="dimmed">
              Photo de profil
            </Text>
          </Stack>
        </Group>

        <FileInput
          label="Avatar"
          placeholder="Choisir une image"
          leftSection={<IconUpload size={16} />}
          value={avatar}
          onChange={handleAvatarChange}
          accept="image/png,image/jpeg"
          clearable
        />

        <TextInput
          label="Prénom"
          placeholder="Entrez le prénom"
          value={firstname}
          onChange={(event) =>
            setFirstname(event.currentTarget.value)
          }
          required
        />

        <TextInput
          label="Deuxième prénom"
          placeholder="Entrez le deuxième prénom"
          value={middlename}
          onChange={(event) =>
            setMiddlename(event.currentTarget.value)
          }
        />

        <TextInput
          label="Nom"
          placeholder="Entrez le nom"
          value={lastname}
          onChange={(event) =>
            setLastname(event.currentTarget.value)
          }
          required
        />

        <TextInput
          label="Nom d'utilisateur"
          placeholder="Entrez le nom d'utilisateur"
          value={username}
          onChange={(event) =>
            setUsername(event.currentTarget.value)
          }
          required
        />

        <PasswordInput
          label="Mot de passe"
          placeholder={
            isEdit
              ? "Laisser vide pour conserver l'ancien"
              : "Entrez le mot de passe"
          }
          value={password}
          onChange={(event) =>
            setPassword(event.currentTarget.value)
          }
          required={!isEdit}
        />

        <Select
          label="Type d'utilisateur"
          value={type}
          onChange={(value) => setType(value ?? "2")}
          data={[
            {
              value: "1",
              label: "Administrateur",
            },
            {
              value: "2",
              label: "Personnel",
            },
          ]}
        />

        <Group justify="flex-end" mt="md">
          <Button
            variant="default"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>

          <Button
            onClick={handleSubmit}
            loading={loading}
          >
            {isEdit ? "Modifier" : "Créer"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}