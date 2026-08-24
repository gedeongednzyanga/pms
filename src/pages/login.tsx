// import { useState } from "react";
import { Link } from "react-router";
import {
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconShieldCheck,
} from "@tabler/icons-react";

import {
  Checkbox,
  PasswordInput,
  TextInput,
} from "@mantine/core";

export default function Login() {
//   const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* =========================
          LEFT - BRANDING
      ========================== */}
      <div className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:w-1/2">
        {/* Background decoration */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

          {/* Logo */}
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

          {/* Content */}
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

          {/* Footer */}
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Gestion pénitentiaire. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* =========================
          RIGHT - LOGIN
      ========================== */}
      <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">

        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <IconShieldCheck size={24} />
            </div>

            <div>
              <h1 className="font-semibold text-slate-900">
                Prison Management
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

          {/* Form */}
          <form className="space-y-5">

            {/* Email */}
            <TextInput
              label="Adresse email"
              placeholder="admin@example.com"
              size="md"
              leftSection={
                <IconMail
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

            {/* Password */}
            <PasswordInput
              label="Mot de passe"
              placeholder="Votre mot de passe"
              size="md"
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

            {/* Options */}
            <div className="flex items-center justify-between">
              <Checkbox
                label="Se souvenir de moi"
                size="sm"
              />

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Login button */}
            <Link to={'/dashboard'}>Ok</Link>
            {/* <Button
              type="submit"
              fullWidth
              size="md"
              rightSection={
                <IconArrowRight size={18} />
              }
              className="mt-2"
            >
              Se connecter
            </Button> */}
          </form>

          {/* Footer */}
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