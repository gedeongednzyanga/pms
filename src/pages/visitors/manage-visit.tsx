import { useEffect, useState } from "react";

import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconPhone,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

import {
  Button,
  Card,
  Group,
  Select,
  Text,
  TextInput,
} from "@mantine/core";

import {
  useNavigate,
  useParams,
} from "react-router";

interface Inmate {
  id: number;
  code: string;
  name: string;
  visiting_privilege: number;
  status: number;
  date_to: string | null;
}

interface VisitForm {
  id?: number;
  inmate_id: string;
  fullname: string;
  contact: string;
  relation: string;
}

const inmates: Inmate[] = [
  {
    id: 1,
    code: "INM-0001",
    name: "Doe, John",
    visiting_privilege: 1,
    status: 1,
    date_to: null,
  },
  {
    id: 2,
    code: "INM-0002",
    name: "Smith, Michael",
    visiting_privilege: 1,
    status: 1,
    date_to: null,
  },
  {
    id: 3,
    code: "INM-0003",
    name: "Johnson, David",
    visiting_privilege: 0,
    status: 1,
    date_to: null,
  },
];

export default function ManageVisit() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<VisitForm>({
    inmate_id: "",
    fullname: "",
    contact: "",
    relation: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof VisitForm, string>>
  >({});

  /*
   * =========================
   * LOAD VISIT
   * =========================
   *
   * Ici tu remplaceras cette partie
   * par ton API / ta commande Tauri.
   */
  useEffect(() => {
    if (!id) return;

    // Exemple temporaire
    const visit = {
      id: Number(id),
      inmate_id: "1",
      fullname: "Jane Doe",
      contact: "+243 970 000 001",
      relation: "Sister",
    };

    setForm(visit);
  }, [id]);

  /*
   * =========================
   * INMATE OPTIONS
   * =========================
   */

  const inmateOptions = inmates.map((inmate) => ({
    value: String(inmate.id),

    label:
      `Inmate-${inmate.code} ${inmate.name}` +
      (inmate.visiting_privilege === 0
        ? " (Disallowed)"
        : ""),

    disabled: inmate.visiting_privilege === 0,
  }));

  /*
   * =========================
   * CHANGE
   * =========================
   */

  const updateField = (
    field: keyof VisitForm,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  /*
   * =========================
   * VALIDATION
   * =========================
   */

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!form.inmate_id) {
      newErrors.inmate_id =
        "Please select an inmate.";
    }

    if (!form.fullname.trim()) {
      newErrors.fullname =
        "Visitor's full name is required.";
    }

    if (!form.contact.trim()) {
      newErrors.contact =
        "Contact number is required.";
    }

    if (!form.relation.trim()) {
      newErrors.relation =
        "Relation is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
   * =========================
   * SUBMIT
   * =========================
   */

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      console.log(
        isEditing
          ? "Update visit"
          : "Create visit",
        form
      );

      /*
       * Exemple futur :
       *
       * await invoke("save_visit_cmd", {
       *   id: form.id,
       *   inmateId: Number(form.inmate_id),
       *   fullname: form.fullname,
       *   contact: form.contact,
       *   relation: form.relation,
       * });
       */

      // Simulation
      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      /*
       * Après création :
       * /visits/:id
       */

      const visitId = form.id ?? 1;

      navigate(`/visits/${visitId}`);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">

      {/* =========================
          HEADER
      ========================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <IconUsers
              size={23}
              stroke={1.7}
            />
          </div>

          <div>

            <Text
              fw={700}
              size="xl"
              className="text-slate-900"
            >
              {isEditing
                ? "Edit Visitor"
                : "Add New Visitor"}
            </Text>

            <Text
              size="sm"
              className="text-slate-500"
            >
              {isEditing
                ? "Update visitor information"
                : "Register a new visitor"}
            </Text>

          </div>

        </div>

        <Button
          variant="light"
          color="gray"
          leftSection={
            <IconArrowLeft size={17} />
          }
          onClick={() =>
            navigate("/visits")
          }
        >
          Back to List
        </Button>

      </div>

      {/* =========================
          FORM
      ========================== */}

      <Card
        radius="lg"
        withBorder
        className="border-slate-200"
      >

        <div className="mb-6">

          <Text
            fw={600}
            size="lg"
            className="text-slate-800"
          >
            Visitor Information
          </Text>

          <Text
            size="sm"
            className="text-slate-500"
          >
            Enter the visitor's information and
            select the inmate they want to visit.
          </Text>

        </div>

        <div className="space-y-5">

          {/* =====================
              INMATE
          ====================== */}

          <Select
            label="Inmate"
            placeholder="Select an inmate"
            searchable
            clearable
            required
            data={inmateOptions}
            value={form.inmate_id || null}
            onChange={(value) =>
              updateField(
                "inmate_id",
                value ?? ""
              )
            }
            error={errors.inmate_id}
            leftSection={
              <IconUser
                size={17}
                stroke={1.7}
              />
            }
          />

          {/* =====================
              NAME
          ====================== */}

          <TextInput
            label="Visitor's Full Name"
            placeholder="Enter visitor's full name"
            required
            value={form.fullname}
            onChange={(event) =>
              updateField(
                "fullname",
                event.currentTarget.value
              )
            }
            error={errors.fullname}
            leftSection={
              <IconUser
                size={17}
                stroke={1.7}
              />
            }
          />

          {/* =====================
              CONTACT + RELATION
          ====================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <TextInput
              label="Contact Number"
              placeholder="+243 ..."
              required
              value={form.contact}
              onChange={(event) =>
                updateField(
                  "contact",
                  event.currentTarget.value
                )
              }
              error={errors.contact}
              leftSection={
                <IconPhone
                  size={17}
                  stroke={1.7}
                />
              }
            />

            <TextInput
              label="Relation"
              placeholder="e.g. Brother, Sister, Mother..."
              required
              value={form.relation}
              onChange={(event) =>
                updateField(
                  "relation",
                  event.currentTarget.value
                )
              }
              error={errors.relation}
            />

          </div>

        </div>

        {/* =========================
            ACTIONS
        ========================== */}

        <Group
          justify="flex-end"
          mt="xl"
          pt="md"
          className="border-t border-slate-200"
        >

          <Button
            variant="default"
            onClick={() =>
              navigate("/visits")
            }
          >
            Cancel
          </Button>

          <Button
            loading={loading}
            leftSection={
              !loading ? (
                <IconDeviceFloppy
                  size={17}
                />
              ) : undefined
            }
            onClick={handleSubmit}
          >
            {isEditing
              ? "Update Visitor"
              : "Save Visitor"}
          </Button>

        </Group>

      </Card>

    </div>
  );
}