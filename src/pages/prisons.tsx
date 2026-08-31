import { useState } from "react";
import PrisonList, { Prison } from "./prisons/prisons-list";
import PrisonFormModal from "../components/forms/prison-form-modal";

export default function Prisons() {
  const [formOpened, setFormOpened] = useState(false);

  const [selectedPrison, setSelectedPrison] =
    useState<Prison | null>(null);

  // Permet de déclencher le rechargement de la liste
  const [refreshKey, setRefreshKey] = useState(0);

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

  const handleSuccess = () => {
    // Fermer le modal
    handleClose();

    // Déclencher le rechargement de PrisonList
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <PrisonList
        refreshKey={refreshKey}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onView={(prison) => {
          console.log("Voir :", prison);
        }}
      />

      <PrisonFormModal
        opened={formOpened}
        onClose={handleClose}
        prison={selectedPrison}
        onSuccess={handleSuccess}
      />
    </>
  );
}