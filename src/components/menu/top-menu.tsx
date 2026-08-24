import {
  IconBell,
  IconChevronDown,
  IconLogout,
  IconMenu2,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";

import {
  ActionIcon,
  Avatar,
  Button,
  Divider,
  Menu,
  Text,
} from "@mantine/core";

type Props = {
  onToggleSidebar?: () => void;
};

export default function TopMenu({
  onToggleSidebar,
}: Props) {
  return (
    <header
      className="
        sticky
        top-0
        z-40
        flex
        h-16
        shrink-0
        items-center
        justify-between
        border-b
        border-slate-200
        bg-white
        px-4
        shadow-sm
      "
    >
      {/* =========================
          LEFT
      ========================== */}

      <div className="flex items-center gap-3">

        {/* Sidebar toggle */}
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <IconMenu2
            size={21}
            stroke={1.7}
          />
        </ActionIcon>

        {/* Application name */}
        <div className="hidden sm:block">
          <Text
            fw={600}
            size="sm"
            className="text-slate-800"
          >
            Gestion pénitentiaire
          </Text>

          <Text
            size="xs"
            c="dimmed"
          >
            Administration
          </Text>
        </div>

      </div>

      {/* =========================
          RIGHT
      ========================== */}

      <div className="flex items-center gap-1">

        {/* Notifications */}
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          aria-label="Notifications"
        >
          <IconBell
            size={20}
            stroke={1.7}
          />
        </ActionIcon>

        {/* User menu */}
        <Menu
          shadow="md"
          width={220}
          position="bottom-end"
          withArrow
        >
          <Menu.Target>
            <Button
              variant="subtle"
              color="gray"
              className="
                h-10
                px-2
                hover:bg-slate-100
              "
              rightSection={
                <IconChevronDown
                  size={16}
                />
              }
            >
              <div className="flex items-center gap-2">

                <Avatar
                  src={null}
                  alt="User"
                  radius="xl"
                  size={30}
                  color="blue"
                >
                  GN
                </Avatar>

                <div className="hidden text-left sm:block">

                  <Text
                    size="sm"
                    fw={500}
                    lh={1.2}
                    className="text-slate-800"
                  >
                    Gédéon
                  </Text>

                  <Text
                    size="xs"
                    c="dimmed"
                    lh={1.2}
                  >
                    Administrateur
                  </Text>

                </div>

              </div>
            </Button>
          </Menu.Target>

          <Menu.Dropdown>

            {/* User information */}
            <div className="px-3 py-2">

              <Text
                size="sm"
                fw={600}
              >
                Gédéon
              </Text>

              <Text
                size="xs"
                c="dimmed"
              >
                Administrateur
              </Text>

            </div>

            <Divider />

            <Menu.Item
              leftSection={
                <IconUser
                  size={17}
                  stroke={1.7}
                />
              }
            >
              Mon compte
            </Menu.Item>

            <Menu.Item
              leftSection={
                <IconSettings
                  size={17}
                  stroke={1.7}
                />
              }
            >
              Paramètres
            </Menu.Item>

            <Divider />

            <Menu.Item
              color="red"
              leftSection={
                <IconLogout
                  size={17}
                  stroke={1.7}
                />
              }
              onClick={() => {
                console.log("Logout");
              }}
            >
              Déconnexion
            </Menu.Item>

          </Menu.Dropdown>
        </Menu>

      </div>
    </header>
  );
}