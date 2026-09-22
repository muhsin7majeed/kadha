import { Chart, useChart } from "@chakra-ui/charts";
import {
  Box,
  Card,
  HStack,
  NativeSelect,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import EmptyState from "@/components/info-states/empty-state";
import ErrorState from "@/components/info-states/error-state";
import PageHeader from "@/components/page-header";
import CommonSpinner from "@/components/spinners/common-spinner";
import useProviderUsage from "@/features/provider-usage/api/use-provider-usage";
import type { ProviderUsageRange } from "@/features/provider-usage/provider-usage.types";

const rangeOptions: Array<{ value: ProviderUsageRange; label: string }> = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);

const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

const UsageMetricCard = ({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) => (
  <Card.Root>
    <Card.Body gap="1">
      <Text color="fg.muted" textStyle="supporting">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="semibold">
        {value}
      </Text>
      {detail ? (
        <Text color="fg.muted" textStyle="supporting">
          {detail}
        </Text>
      ) : null}
    </Card.Body>
  </Card.Root>
);

const ProviderUsagePage = () => {
  const [range, setRange] = useState<ProviderUsageRange>("7d");
  const usage = useProviderUsage(range);
  const report = usage.data;
  const chart = useChart({
    data: report?.series ?? [],
    series: [
      { name: "requestCount", color: "brand.solid", label: "Requests" },
      { name: "rateLimitedCount", color: "red.solid", label: "Rate limited" },
    ],
  });

  return (
    <Box>
      <PageHeader
        isFetching={usage.isFetching}
        subHeader="Monitor outbound provider requests and rate-limit responses."
      >
        Provider Usage
      </PageHeader>

      <Stack gap="6">
        <HStack
          justifyContent="space-between"
          alignItems="end"
          flexWrap="wrap"
          gap="3"
        >
          <Text color="fg.muted" textStyle="supporting">
            Metrics represent this Kadha instance. TMDB image delivery is not
            included.
          </Text>
          <NativeSelect.Root maxW={{ base: "full", md: "52" }}>
            <NativeSelect.Field
              aria-label="Provider usage range"
              value={range}
              onChange={(event) =>
                setRange(event.target.value as ProviderUsageRange)
              }
            >
              {rangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </HStack>

        {usage.isLoading ? (
          <CommonSpinner />
        ) : usage.isError || !report ? (
          <ErrorState
            title="Error"
            description="Failed to load provider usage"
            onRetry={usage.refetch}
          />
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4">
              <UsageMetricCard
                label="API requests"
                value={formatNumber(report.summary.requestCount)}
              />
              <UsageMetricCard
                label="Rate limited"
                value={formatNumber(report.summary.rateLimitedCount)}
              />
              <UsageMetricCard
                label="Cache hit rate"
                value={formatPercentage(report.summary.cacheHitRate)}
                detail={`${formatNumber(report.summary.cacheHitCount)} avoided requests`}
              />
              <UsageMetricCard
                label="Average latency"
                value={`${formatNumber(report.summary.averageDurationMs)} ms`}
                detail={`${formatNumber(report.summary.errorCount)} errors`}
              />
            </SimpleGrid>

            {report.series.length === 0 ? (
              <EmptyState
                title="No provider usage yet"
                description="Requests will appear here as Kadha uses a provider."
              />
            ) : (
              <Card.Root>
                <Card.Header>
                  <Text textStyle="sectionTitle">Requests over time</Text>
                  <Text color="fg.muted" textStyle="supporting">
                    Rate-limited responses are shown separately so bursts are
                    easy to spot.
                  </Text>
                </Card.Header>
                <Card.Body>
                  <Chart.Root
                    width="full"
                    maxH="sm"
                    minH="xs"
                    chart={chart}
                    aria-label="Provider requests over time"
                  >
                    <LineChart data={chart.data}>
                      <CartesianGrid
                        stroke={chart.color("border.muted")}
                        vertical={false}
                      />
                      <XAxis
                        dataKey={chart.key("bucketStart")}
                        tickFormatter={(value) =>
                          dayjs(value).format(
                            range === "24h"
                              ? "HH:mm"
                              : range === "7d"
                                ? "DD MMM HH:mm"
                                : "DD MMM",
                          )
                        }
                      />
                      <YAxis
                        tickFormatter={(value) => formatNumber(Number(value))}
                      />
                      <Tooltip cursor={false} content={<Chart.Tooltip />} />
                      <Legend content={<Chart.Legend />} />
                      <Line
                        type="monotone"
                        dataKey={chart.key("requestCount")}
                        stroke={chart.color("brand.solid")}
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey={chart.key("rateLimitedCount")}
                        stroke={chart.color("red.solid")}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </Chart.Root>
                  <Text color="fg.muted" textStyle="supporting" mt="4">
                    The chart shows recorded five-minute buckets. A zero
                    rate-limit count means Kadha did not observe a TMDB 429
                    response; it does not represent remaining TMDB quota.
                  </Text>
                </Card.Body>
              </Card.Root>
            )}

            <Card.Root>
              <Card.Header>
                <Text textStyle="sectionTitle">Requests by operation</Text>
              </Card.Header>
              <Card.Body>
                {report.operations.length === 0 ? (
                  <Text color="fg.muted">
                    No provider operations recorded in this range.
                  </Text>
                ) : (
                  <Box overflowX="auto">
                    <Table.Root size="sm" minW="680px">
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>Provider</Table.ColumnHeader>
                          <Table.ColumnHeader>Operation</Table.ColumnHeader>
                          <Table.ColumnHeader textAlign="right">
                            Requests
                          </Table.ColumnHeader>
                          <Table.ColumnHeader textAlign="right">
                            Cache hits
                          </Table.ColumnHeader>
                          <Table.ColumnHeader textAlign="right">
                            Rate limited
                          </Table.ColumnHeader>
                          <Table.ColumnHeader textAlign="right">
                            Avg. latency
                          </Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {report.operations.map((operation) => (
                          <Table.Row
                            key={`${operation.provider}-${operation.operation}`}
                          >
                            <Table.Cell>{operation.provider}</Table.Cell>
                            <Table.Cell>{operation.operation}</Table.Cell>
                            <Table.Cell textAlign="right">
                              {formatNumber(operation.requestCount)}
                            </Table.Cell>
                            <Table.Cell textAlign="right">
                              {formatNumber(operation.cacheHitCount)}
                            </Table.Cell>
                            <Table.Cell textAlign="right">
                              {formatNumber(operation.rateLimitedCount)}
                            </Table.Cell>
                            <Table.Cell textAlign="right">
                              {formatNumber(operation.averageDurationMs)} ms
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                )}
              </Card.Body>
            </Card.Root>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default ProviderUsagePage;
