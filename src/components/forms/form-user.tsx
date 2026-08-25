import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  Modal,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
  Alert,
  Avatar,
  Text,
  Paper,
  Divider,
  ThemeIcon,
  Box,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconUser,
  IconUserCircle,
  IconLock,
  IconDeviceFloppy,
  IconX,
  IconAt,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

export interface User {
    id: number;
    first_name?: string | null;
    last_name?: string | null;
    user_name?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

interface UserModalProps {
    opened: boolean;
    onClose: () => void;
    user?: User | null;
    onSuccess: () => void;
}

interface UserFormData {
    id: number | null;
    first_name: string;
    last_name: string;
    user_name: string;
    password: string | null;
}

export default function UserFormModal({
  opened,
  onClose,
  user,
  onSuccess,
}: UserModalProps) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isEdit = !!user;

    useEffect(() => {
        if (!opened) return;

        setFirstName(user?.first_name ?? "");
        setLastName(user?.last_name ?? "");
        setUserName(user?.user_name ?? "");
        setPassword("");
        setError("");
    }, [opened, user]);

    const getInitials = () => {
        const first = firstName.trim().charAt(0);
        const last = lastName.trim().charAt(0);

        return `${first}${last}`.toUpperCase() || "U";
    };

    const handleSubmit = async () => {
        setError("");

        if (!firstName.trim()) {
            setError("Le prénom est obligatoire.");
            return;
        }

        if (!lastName.trim()) {
            setError("Le nom est obligatoire.");
            return;
        }

        if (!userName.trim()) {
            setError("Le nom d'utilisateur est obligatoire.");
        return;
        }

        if (!isEdit && !password.trim()) {
            setError("Le mot de passe est obligatoire.");
            return;
        }

        try {
            setLoading(true);

            const userData: UserFormData = {
                id: user?.id ?? null,
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                user_name: userName.trim(),
                password: password.trim() || null,
            };

            if(isEdit){
                await invoke("update_user_cmd", { 
                    id: user.id,
                    data: userData
                });
            }else{
                await invoke("create_user_cmd", {data: userData});
            }
            
            onSuccess();
            onClose();
            notifications.show({
                title: isEdit ? "Modification compte" : "Nouvau compte",
                message: isEdit ? "Utilisateur modifié avec succès." : "Utilisateur créé avec succès.",
                color: "green",
            });
        } catch (err) {
            console.error("Erreur utilisateur :", err);
            setError(typeof err === "string" ? err : "Une erreur est survenue lors de l'enregistrement.");
        
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
        opened={opened}
        onClose={onClose}
        centered
        size={520}
        radius="md"
        padding={0}
        withCloseButton
        title={null}
        >
        {/* Header */}
        <Box px="xl" pt="xl" pb="md">
            <Group align="center" gap="md">
                <Avatar size={58} radius="xl" color="blue" variant="filled">
                    {getInitials()}
                </Avatar>
                <div>
                    <Text fw={700} size="lg">
                        {isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
                    </Text>
                    <Text size="sm" c="dimmed">
                        {isEdit ? "Modifiez les informations du compte" : "Créez un nouveau compte utilisateur"}
                    </Text>
                </div>
            </Group>
        </Box>

        <Divider />

        <Stack gap="lg" px="xl" py="xl">

            {/* Erreur */}
            {error && (
            <Alert color="red" radius="md" variant="light" icon={<IconAlertCircle size={18} />}>
                {error}
            </Alert>
            )}

            {/* Informations personnelles */}
            <Group gap="sm">
                <ThemeIcon size={34} radius="md" variant="light" color="blue">
                    <IconUserCircle size={19} />
                </ThemeIcon>

                <div>
                    <Text fw={600} size="sm">
                        Informations personnelles
                    </Text>
                    <Text size="xs" c="dimmed">
                        Identité de l'utilisateur
                    </Text>
                </div>
            </Group>

            <Group grow align="flex-start">
            <TextInput
                label="Prénom"
                placeholder="Ex. Gédéon"
                value={firstName}
                onChange={(event) =>
                    setFirstName(event.currentTarget.value)
                }
                leftSection={<IconUser size={17} />}
                radius="md"
                required
            />

            <TextInput
                label="Nom"
                placeholder="Ex. Nzyanga"
                value={lastName}
                onChange={(event) =>
                setLastName(event.currentTarget.value)
                }
                leftSection={<IconUser size={17} />}
                radius="md"
                required
            />
            </Group>

            {/* Compte */}
            <Group gap="sm" mt="xs">
            <ThemeIcon
                size={34}
                radius="md"
                variant="light"
                color="violet"
            >
                <IconAt size={19} />
            </ThemeIcon>

            <div>
                <Text fw={600} size="sm">
                    Compte utilisateur
                </Text>

                <Text size="xs" c="dimmed">
                    Identifiants de connexion
                </Text>
            </div>
            </Group>

            <TextInput
            label="Nom d'utilisateur"
            placeholder="Ex. gedeon"
            value={userName}
            onChange={(event) =>
                setUserName(event.currentTarget.value)
            }
            leftSection={<IconAt size={17} />}
            radius="md"
            required
            />

            <PasswordInput
            label="Mot de passe"
            placeholder={
                isEdit
                ? "Laisser vide pour conserver l'ancien mot de passe"
                : "Entrez un mot de passe sécurisé"
            }
            value={password}
            onChange={(event) =>
                setPassword(event.currentTarget.value) 
            }
            leftSection={<IconLock size={17} />}
            radius="md"
            required={!isEdit}
            />

            {!isEdit && (
            <Paper
                p="sm"
                radius="md"
                withBorder
                bg="var(--mantine-color-gray-0)"
            >
                <Group gap="xs">
                <IconLock size={15} />
                <Text size="xs" c="dimmed">
                    Utilisez un mot de passe suffisamment sécurisé
                    pour protéger ce compte.
                </Text>
                </Group>
            </Paper>
            )}
        </Stack>

        {/* Footer */}
        <Divider />

        <Group
            justify="flex-end"
            px="xl"
            py="md"
        >
            <Button
            variant="subtle"
            color="gray"
            leftSection={<IconX size={17} />}
            onClick={onClose}
            disabled={loading}
            >
            Annuler
            </Button>

            <Button
            leftSection={<IconDeviceFloppy size={17} />}
            onClick={handleSubmit}
            loading={loading}
            radius="md"
            >
            {isEdit ? "Enregistrer les modifications" : "Créer le compte"}
            </Button>
        </Group>
        </Modal>
    );
}