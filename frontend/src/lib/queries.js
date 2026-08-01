import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const fetcher = (url) => api.get(url).then((r) => r.data);

export const useServices = () =>
  useQuery({ queryKey: ["services"], queryFn: () => fetcher("/services") });

export const useInvoices = () =>
  useQuery({ queryKey: ["invoices"], queryFn: () => fetcher("/invoices") });

export const useWallet = () =>
  useQuery({ queryKey: ["wallet"], queryFn: () => fetcher("/wallet") });

export const useProducts = () =>
  useQuery({ queryKey: ["products"], queryFn: () => fetcher("/products") });

export const useService = (id) =>
  useQuery({ queryKey: ["service", id], queryFn: () => fetcher(`/services/${id}`), enabled: !!id });

export const useNotifications = () =>
  useQuery({ queryKey: ["notifications"], queryFn: () => fetcher("/notifications") });

export const useDomains = () =>
  useQuery({ queryKey: ["domains"], queryFn: () => fetcher("/domains") });

export const useDomain = (id) =>
  useQuery({ queryKey: ["domain", id], queryFn: () => fetcher(`/domains/${id}`), enabled: !!id });

export const useTlds = () =>
  useQuery({ queryKey: ["tlds"], queryFn: () => fetcher("/tlds") });

export const useAffiliate = () =>
  useQuery({ queryKey: ["affiliate"], queryFn: () => fetcher("/affiliate") });
