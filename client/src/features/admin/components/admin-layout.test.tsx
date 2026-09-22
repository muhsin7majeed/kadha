import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/render";

import AdminLayout from "./admin-layout";

const renderAdminLayout = (initialEntry: string) =>
  renderWithProviders(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/app/admin" element={<AdminLayout />}>
          <Route index element={<div>Overview content</div>} />
          <Route path="feedback/:id" element={<div>Feedback detail</div>} />
          <Route path="users" element={<div>Users content</div>} />
          <Route path="provider-usage" element={<div>Provider content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("AdminLayout", () => {
  it("renders the admin navigation and outlet content", () => {
    renderAdminLayout("/app/admin");

    expect(screen.getByRole("navigation", { name: "Admin navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("href", "/app/admin");
    expect(screen.getByRole("link", { name: "Feedback" })).toHaveAttribute("href", "/app/admin/feedback");
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute("href", "/app/admin/users");
    expect(screen.getByRole("link", { name: "Provider Usage" })).toHaveAttribute("href", "/app/admin/provider-usage");
    expect(screen.getByText("Overview content")).toBeInTheDocument();
  });

  it("marks the parent section active on detail routes", () => {
    renderAdminLayout("/app/admin/feedback/feedback-1");

    expect(screen.getByRole("link", { name: "Feedback" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
    expect(screen.getByText("Feedback detail")).toBeInTheDocument();
  });
});
