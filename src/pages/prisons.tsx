import { useState } from "react";
import PrisonList, { Prison } from "./prisons/prisons-list";
import PrisonFormModal from "../components/forms/prison-form-modal";


export default function Prisons() {
  const [formOpened, setFormOpened] = useState(false);

  const [selectedPrison, setSelectedPrison] =
    useState<Prison | null>(null);

  const handleCreate = () => {
    setSelectedPrison(null);
    setFormOpened(true);
  };

  const handleEdit = (prison: Prison) => {
    setSelectedPrison(prison);
    setFormOpened(true);
  };

  const handleClose = () => {
    setFormOpened(false);
    setSelectedPrison(null);
  };

  return (
    <>
      <PrisonList
        onCreate={handleCreate}
        onEdit={handleEdit}
        onView={(prison: any) => {
          console.log("Voir :", prison);
        }}
      />

      <PrisonFormModal
        opened={formOpened}
        onClose={handleClose}
        prison={selectedPrison}
        onSuccess={() => {
          // On rechargera la liste ici
        }}
      />
    </>
  );
}