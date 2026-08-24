import { useState } from "react";
import UserList, { User } from "./users/users-list";
import UserFormModal from "../components/forms/user-form-modal";



export default function Users() {
  const [opened, setOpened] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const handleCreate = () => {
    setSelectedUser(null);
    setOpened(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpened(true);
  };

  return (
    <>
      <UserList
        onCreate={handleCreate}
        onEdit={handleEdit}
      />

      <UserFormModal
              opened={opened}
              onClose={() => {
                  setOpened(false);
                  setSelectedUser(null);
              } }
              user={selectedUser} onSuccess={function (): void {
                  throw new Error("Function not implemented.");
              } }      />
    </>
  );
}