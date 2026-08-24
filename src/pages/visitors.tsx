import { useMemo, useState } from "react";

import {
  IconEye,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUsers,
  IconDotsVertical,
  IconPhone,
} from "@tabler/icons-react";

import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Menu,
  Pagination,
  Text,
  TextInput,
} from "@mantine/core";

import { useNavigate } from "react-router";

interface Visitor {
  id: number;
  date_created: string;
  inmate_id: number;
  inmate: string;
  code: string;
  fullname: string;
  relation: string;
  contact: string;
}

const visitors: Visitor[] = [
  {
    id: 1,
    date_created: "2026-08-24 08:30",
    inmate_id: 1,
    inmate: "Doe, John",
    code: "INM-0001",
    fullname: "Jane Doe",
    relation: "Sister",
    contact: "+243 970 000 001",
  },
  {
    id: 2,
    date_created: "2026-08-23 14:20",
    inmate_id: 2,
    inmate: "Smith, Michael",
    code: "INM-0002",
    fullname: "Robert Smith",
    relation: "Brother",
    contact: "+243 970 000 002",
  },
  {
    id: 3,
    date_created: "2026-08-22 10:15",
    inmate_id: 3,
    inmate: "Johnson, David",
    code: "INM-0003",
    fullname: "Mary Johnson",
    relation: "Mother",
    contact: "+243 970 000 003",
  },
];

export default function Visitors() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const perPage = 8;

  const filteredVisitors = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return visitors;
    }

    return visitors.filter((visitor) =>
      [
        visitor.inmate,
        visitor.code,
        visitor.fullname,
        visitor.relation,
        visitor.contact,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }, [search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVisitors.length / perPage)
  );

  const paginatedVisitors = filteredVisitors.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = (visitor: Visitor) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the visitor "${visitor.fullname}"?`
    );

    if (!confirmed) return;

    console.log("Delete visitor:", visitor.id);

    // Ici tu remplaceras par ton appel API/Tauri
  };

  return (
    <div className="space-y-5">

      {/* =========================
          HEADER
      ========================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <IconUsers
                size={22}
                stroke={1.7}
              />
            </div>

            <div>
              <Text
                fw={700}
                size="xl"
                className="text-slate-900"
              >
                Visitors
              </Text>

              <Text
                size="sm"
                className="text-slate-500"
              >
                Manage inmate visitors and visitation records
              </Text>
            </div>
          </div>
        </div>

        <Button
          leftSection={
            <IconPlus
              size={17}
              stroke={2}
            />
          }
          onClick={() => navigate("/visits/new")}
          radius="md"
        >
          Add Visitor
        </Button>

      </div>

      {/* =========================
          CONTENT
      ========================== */}

      <Card
        radius="lg"
        padding={0}
        withBorder
        className="overflow-hidden border-slate-200"
      >

        {/* =========================
            TOOLBAR
        ========================== */}

        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <Text
              fw={600}
              className="text-slate-800"
            >
              Visitor List
            </Text>

            <Text
              size="xs"
              className="text-slate-500"
            >
              {filteredVisitors.length} visitor
              {filteredVisitors.length !== 1 ? "s" : ""}
            </Text>
          </div>

          <TextInput
            value={search}
            onChange={(event) =>
              handleSearch(event.currentTarget.value)
            }
            placeholder="Search visitors..."
            leftSection={
              <IconSearch
                size={17}
                stroke={1.7}
              />
            }
            className="w-full sm:w-72"
            radius="md"
          />

        </div>

        {/* =========================
            TABLE
        ========================== */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-212.5">

            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">

                <th className="w-14 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  #
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date Created
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Inmate
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Visitor
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact
                </th>

                <th className="w-24 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {paginatedVisitors.length > 0 ? (
                paginatedVisitors.map((visitor, index) => (

                  <tr
                    key={visitor.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >

                    {/* NUMBER */}

                    <td className="px-4 py-4 text-center text-sm text-slate-500">
                      {(page - 1) * perPage + index + 1}
                    </td>

                    {/* DATE */}

                    <td className="px-4 py-4">
                      <Text
                        size="sm"
                        className="text-slate-700"
                      >
                        {visitor.date_created}
                      </Text>
                    </td>

                    {/* INMATE */}

                    <td className="px-4 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <IconUsers
                            size={18}
                            stroke={1.7}
                          />
                        </div>

                        <div className="min-w-0">

                          <Text
                            size="sm"
                            fw={600}
                            className="truncate text-slate-800"
                          >
                            {visitor.inmate}
                          </Text>

                          <Text
                            size="xs"
                            className="text-slate-500"
                          >
                            Inmate · {visitor.code}
                          </Text>

                        </div>

                      </div>

                    </td>

                    {/* VISITOR */}

                    <td className="px-4 py-4">

                      <div>

                        <Text
                          size="sm"
                          fw={600}
                          className="text-slate-800"
                        >
                          {visitor.fullname}
                        </Text>

                        <Badge
                          size="xs"
                          variant="light"
                          color="blue"
                          mt={4}
                        >
                          {visitor.relation}
                        </Badge>

                      </div>

                    </td>

                    {/* CONTACT */}

                    <td className="px-4 py-4">

                      <div className="flex items-center gap-2">

                        <IconPhone
                          size={15}
                          className="text-slate-400"
                          stroke={1.7}
                        />

                        <Text
                          size="sm"
                          className="text-slate-700"
                        >
                          {visitor.contact}
                        </Text>

                      </div>

                    </td>

                    {/* ACTION */}

                    <td className="px-4 py-4 text-center">

                      <Menu
                        shadow="md"
                        width={170}
                        position="bottom-end"
                      >

                        <Menu.Target>

                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            radius="md"
                          >
                            <IconDotsVertical
                              size={18}
                              stroke={1.7}
                            />
                          </ActionIcon>

                        </Menu.Target>

                        <Menu.Dropdown>

                          <Menu.Item
                            leftSection={
                              <IconEye
                                size={16}
                              />
                            }
                            onClick={() =>
                              navigate(
                                `/visits/${visitor.id}`
                              )
                            }
                          >
                            View
                          </Menu.Item>

                          <Menu.Item
                            leftSection={
                              <IconEdit
                                size={16}
                              />
                            }
                            onClick={() =>
                              navigate(
                                `/visits/${visitor.id}/edit`
                              )
                            }
                          >
                            Edit
                          </Menu.Item>

                          <Menu.Divider />

                          <Menu.Item
                            color="red"
                            leftSection={
                              <IconTrash
                                size={16}
                              />
                            }
                            onClick={() =>
                              handleDelete(visitor)
                            }
                          >
                            Delete
                          </Menu.Item>

                        </Menu.Dropdown>

                      </Menu>

                    </td>

                  </tr>

                ))
              ) : (

                <tr>

                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <IconUsers size={24} />
                      </div>

                      <Text
                        fw={600}
                        className="text-slate-700"
                      >
                        No visitors found
                      </Text>

                      <Text
                        size="sm"
                        className="text-slate-400"
                      >
                        Try changing your search.
                      </Text>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* =========================
            FOOTER
        ========================== */}

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

          <Text
            size="sm"
            className="text-slate-500"
          >
            Showing{" "}
            {filteredVisitors.length === 0
              ? 0
              : (page - 1) * perPage + 1}{" "}
            to{" "}
            {Math.min(
              page * perPage,
              filteredVisitors.length
            )}{" "}
            of {filteredVisitors.length}
          </Text>

          <Pagination
            value={page}
            onChange={setPage}
            total={totalPages}
            size="sm"
            radius="md"
          />

        </div>

      </Card>

    </div>
  );
}