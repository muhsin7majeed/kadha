import { Box, Flex, Skeleton, Stack, Text } from "@chakra-ui/react";
import { Suspense, type ReactNode } from "react";
import { Outlet, useLocation } from "react-router";
import { LuActivity, LuLayoutDashboard, LuMessageSquare, LuUsers } from "react-icons/lu";

import NavLink from "@/components/nav-link";

interface AdminNavigationItem {
  label: string;
  to: string;
  icon: ReactNode;
}

const navigationItems: AdminNavigationItem[] = [
  { label: "Overview", to: "/app/admin", icon: <LuLayoutDashboard aria-hidden /> },
  { label: "Feedback", to: "/app/admin/feedback", icon: <LuMessageSquare aria-hidden /> },
  { label: "Users", to: "/app/admin/users", icon: <LuUsers aria-hidden /> },
  { label: "Provider Usage", to: "/app/admin/provider-usage", icon: <LuActivity aria-hidden /> },
];

const isNavigationItemActive = (pathname: string, to: string) =>
  pathname === to || (to !== "/app/admin" && pathname.startsWith(`${to}/`));

const AdminNavigation = () => {
  const { pathname } = useLocation();

  return (
    <Box
      as="nav"
      aria-label="Admin navigation"
      width={{ base: "full", lg: "14rem" }}
      borderWidth="1px"
      borderColor="border"
      rounded="lg"
      bg="bg.subtle"
      overflowX="auto"
      flexShrink={0}
    >
      <Flex
        as="ul"
        listStyleType="none"
        m="0"
        p="2"
        gap="1"
        direction={{ base: "row", lg: "column" }}
        minW={{ base: "max-content", lg: "0" }}
      >
        {navigationItems.map((item) => {
          const active = isNavigationItemActive(pathname, item.to);

          return (
            <Box as="li" key={item.to} flex={{ base: "0 0 auto", lg: "initial" }}>
              <NavLink
                to={item.to}
                aria-current={active ? "page" : undefined}
                display="flex"
                alignItems="center"
                gap="2"
                width={{ base: "auto", lg: "full" }}
                px="3"
                py="2"
                rounded="md"
                color={active ? "brand.fg" : "fg.muted"}
                bg={active ? "brand.subtle" : "transparent"}
                textDecoration="none"
                whiteSpace="nowrap"
                _hover={{
                  bg: active ? "brand.subtle" : "bg.muted",
                  color: active ? "brand.fg" : "fg",
                }}
                _focusVisible={{
                  outline: "2px solid",
                  outlineColor: "brand.focusRing",
                  outlineOffset: "-2px",
                }}
              >
                {item.icon}
                <Text textStyle="compactLabel">{item.label}</Text>
              </NavLink>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};

const AdminPageFallback = () => (
  <Stack as="section" role="status" gap="6" aria-label="Loading admin page">
    <Stack gap="2">
      <Skeleton height="7" width="40%" />
      <Skeleton height="4" width="60%" />
    </Stack>
    <Stack gap="4">
      <Skeleton height="24" />
      <Skeleton height="48" />
    </Stack>
  </Stack>
);

const AdminLayout = () => (
  <Flex align="start" direction={{ base: "column", lg: "row" }} gap={{ base: "4", lg: "6" }} minW="0">
    <AdminNavigation />
    <Box flex="1" minW="0" width="full">
      <Suspense fallback={<AdminPageFallback />}>
        <Outlet />
      </Suspense>
    </Box>
  </Flex>
);

export default AdminLayout;
