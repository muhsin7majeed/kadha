import { screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render";
import ProviderUsagePage from "./index";

vi.mock("@chakra-ui/charts", () => {
  const Root = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  const Tooltip = () => null;
  const Legend = () => null;

  return {
    Chart: { Root, Tooltip, Legend },
    useChart: ({ data, series }: { data: unknown[]; series: unknown[] }) => ({
      data,
      series,
      color: (value: string) => value,
      key: (value: string) => value,
    }),
  };
});

vi.mock("recharts", () => {
  const ChartElement = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );

  return {
    CartesianGrid: ChartElement,
    Legend: ChartElement,
    Line: ChartElement,
    LineChart: ChartElement,
    Tooltip: ChartElement,
    XAxis: ChartElement,
    YAxis: ChartElement,
  };
});

vi.mock("@/features/provider-usage/api/use-provider-usage", () => ({
  default: () => ({
    data: {
      from: "2026-09-21T00:00:00.000Z",
      to: "2026-09-22T00:00:00.000Z",
      summary: {
        requestCount: 1234,
        successCount: 1200,
        errorCount: 34,
        rateLimitedCount: 2,
        cacheHitCount: 456,
        totalDurationMs: 123400,
        averageDurationMs: 100,
        cacheHitRate: 0.27,
      },
      series: [
        {
          bucketStart: "2026-09-21T12:00:00.000Z",
          requestCount: 25,
          successCount: 24,
          errorCount: 1,
          rateLimitedCount: 1,
          cacheHitCount: 10,
          totalDurationMs: 2500,
          averageDurationMs: 100,
          cacheHitRate: 0.29,
        },
      ],
      operations: [
        {
          provider: "tmdb",
          operation: "movie-details",
          requestCount: 25,
          successCount: 24,
          errorCount: 1,
          rateLimitedCount: 1,
          cacheHitCount: 10,
          totalDurationMs: 2500,
          averageDurationMs: 100,
          cacheHitRate: 0.29,
        },
      ],
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}));

describe("ProviderUsagePage", () => {
  it("renders provider usage summaries and operation details", () => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/app/admin/provider-usage"]}>
        <ProviderUsagePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Provider Usage" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("27.0%")).toBeInTheDocument();
    expect(screen.getByText("movie-details")).toBeInTheDocument();
    expect(screen.getByText(/TMDB 429 response/)).toBeInTheDocument();
  });
});
