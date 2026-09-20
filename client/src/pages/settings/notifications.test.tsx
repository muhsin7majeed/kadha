import { screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render";
import NotificationsSettings from "./notifications";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("@/lib/axios-instance", () => ({
  default: {
    get: mocks.get,
  },
}));

describe("NotificationsSettings", () => {
  it("explains when browser push is unavailable", async () => {
    mocks.get.mockResolvedValueOnce({
      data: { data: { enabled: false, publicKey: null } },
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    renderWithProviders(
      <QueryClientProvider client={queryClient}>
        <NotificationsSettings />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(mocks.get).toHaveBeenCalledWith("/api/notifications/push/config"),
    );
    expect(
      screen.getByText("This browser does not support web push notifications."),
    ).toBeInTheDocument();
  });
});
