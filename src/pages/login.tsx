
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import {
  IconArrowRight,
  IconEye,
  IconEyeOff,
  IconLock,
  IconShieldCheck,
  IconUser,
} from "@tabler/icons-react";

import {
  Button,
  Checkbox,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import { useAuth } from "../services/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event: React.SyntheticEvent) => {

        event.preventDefault();

        setError("");

        try {

            setLoading(true);
            await login(userName, password );
            navigate("/dashboard", { replace: true });

        } catch (error) {

            console.error(error);
            setError(
                typeof error === "string"
                ? error
                : "Nom d'utilisateur ou mot de passe incorrect."
            );

        } finally {

        setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">

            {/* LEFT */}
            <div className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:w-1/2">

            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

            <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

                <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    <IconShieldCheck size={24} stroke={1.8} />
                </div>

                <div>
                    <h1 className="text-lg font-semibold text-white">
                    Gestion pénitentiaire
                    </h1>

                    <p className="text-xs text-slate-400">
                    Administration System
                    </p>
                </div>
                </div>

                <div className="max-w-lg">

                <p className="mb-4 text-sm font-medium uppercase tracking-widest text-blue-400">
                    Administration
                </p>

                <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                    Gérez votre établissement
                    <span className="text-blue-500">
                    {" "}simplement.
                    </span>
                </h2>

                <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
                    Une plateforme centralisée pour gérer les détenus,
                    les visiteurs, les établissements, les rapports et
                    les opérations administratives.
                </p>

                <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
                    <IconShieldCheck size={16} />
                    </div>

                    <span>
                    Accès sécurisé à votre espace d'administration
                    </span>

                </div>
                </div>

                <p className="text-xs text-slate-600">
                © {new Date().getFullYear()} Gestion pénitentiaire.
                Tous droits réservés.
                </p>

            </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">

            <div className="w-full max-w-md">

                {/* Mobile logo */}
                <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <IconShieldCheck size={24} />
                </div>

                <div>
                    <h1 className="font-semibold text-slate-900">
                    Gestion pénitentiaire
                    </h1>

                    <p className="text-xs text-slate-500">
                    Administration System
                    </p>
                </div>

                </div>

                {/* Header */}
                <div className="mb-8">

                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Bienvenue 👋
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Connectez-vous pour accéder à votre espace.
                </p>

                </div>

                {/* ERROR */}
                {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
                )}

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                {/* USERNAME */}
                <TextInput
                    label="Nom d'utilisateur"
                    placeholder="admin"
                    size="md"
                    value={userName}
                    onChange={(event) =>
                    setUserName(event.currentTarget.value)
                    }
                    leftSection={
                    <IconUser
                        size={18}
                        stroke={1.7}
                    />
                    }
                    styles={{
                    input: {
                        height: 46,
                    },
                    }}
                />

                {/* PASSWORD */}
                <PasswordInput
                    label="Mot de passe"
                    placeholder="Votre mot de passe"
                    size="md"
                    value={password}
                    onChange={(event) =>
                    setPassword(event.currentTarget.value)
                    }
                    leftSection={
                    <IconLock
                        size={18}
                        stroke={1.7}
                    />
                    }
                    visibilityToggleIcon={({ reveal }) =>
                    reveal ? (
                        <IconEyeOff size={18} />
                    ) : (
                        <IconEye size={18} />
                    )
                    }
                    styles={{
                    input: {
                        height: 46,
                    },
                    }}
                />

                {/* OPTIONS */}
                <div className="flex items-center justify-between">

                    <Checkbox
                    label="Se souvenir de moi"
                    size="sm"
                    checked={rememberMe}
                    onChange={(event) =>
                        setRememberMe(event.currentTarget.checked)
                    }
                    />

                    <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                    >
                    Mot de passe oublié ?
                    </Link>

                </div>

                {/* LOGIN */}
                <Button
                    type="submit"
                    fullWidth
                    size="md"
                    loading={loading}
                    disabled={loading}
                    rightSection={
                    !loading && <IconArrowRight size={18} />
                    }
                    className="mt-2"
                >
                    {loading ? "Connexion..." : "Se connecter"}
                </Button>

                </form>

                {/* FOOTER */}
                <div className="mt-8 text-center">

                <p className="text-xs text-slate-400">
                    Connexion sécurisée · Version 1.0.0
                </p>

                </div>

            </div>
            </div>
        </div>
    );
}

