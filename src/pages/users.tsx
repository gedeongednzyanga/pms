import { useState } from "react";
import UserList from "./users/users-list";
import UserFormModal from "../components/forms/form-user";
import { Utilisateur } from "../interfaces/user";

export default function Users() {
  const [opened, setOpened] = useState(false);

  const [selectedUser, setSelectedUser] =
    useState<Utilisateur | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setSelectedUser(null);
    setOpened(true);
  };

  const handleEdit = (user: Utilisateur) => {
    setSelectedUser(user);
    setOpened(true);
  };

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <UserList
        onCreate={handleCreate}
        onEdit={handleEdit}
        refreshKey={refreshKey}
      />

      <UserFormModal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={handleSuccess}
      />
    </>
  );
}