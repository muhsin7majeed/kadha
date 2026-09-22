import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

import api from "@/lib/axios-instance";
import { queryKeys } from "@/lib/query-keys";
import type { BaseResponse } from "@/types/common";
import type {
  ProviderUsageRange,
  ProviderUsageReport,
} from "../provider-usage.types";

const getRangeDates = (range: ProviderUsageRange) => {
  const to = dayjs();
  const from = to.subtract(
    range === "24h" ? 1 : Number.parseInt(range, 10),
    range === "24h" ? "day" : "day",
  );

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
};

const getProviderUsage = async (range: ProviderUsageRange) => {
  const response = await api.get<BaseResponse<ProviderUsageReport>>(
    "/api/admin/provider-usage",
    {
      params: getRangeDates(range),
    },
  );

  return response.data.data;
};

const useProviderUsage = (range: ProviderUsageRange) =>
  useQuery({
    queryKey: queryKeys.adminProviderUsage(range),
    queryFn: () => getProviderUsage(range),
    staleTime: 30_000,
  });

export default useProviderUsage;
