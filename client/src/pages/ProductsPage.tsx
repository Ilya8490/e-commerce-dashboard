import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Download, PackageSearch, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { apiClient } from "../api/client";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { cn } from "../utils/cn";
import { formatEuroCurrency, formatNumber } from "../utils/formatters";

type ProductSort = "revenue" | "units";
type SortOrder = "asc" | "desc";

interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  soldUnits: number;
  revenue: number;
  unitsSold: number;
}

interface ProductsResponse {
  products: ProductRow[];
  total: number;
  page: number;
}

function useDebouncedValue(value: string, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timeout);
  }, [delayMs, value]);

  return debouncedValue;
}

function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

function TableSkeleton({ limit }: { limit: number }) {
  return (
    <>
      {Array.from({ length: Math.min(limit, 8) }, (_, index) => (
        <tr className="border-b border-border last:border-0" key={index}>
          {Array.from({ length: 7 }, (_, cellIndex) => (
            <td className="px-4 py-4" key={cellIndex}>
              <SkeletonLine className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function LowStockBadge({ stock }: { stock: number }) {
  if (stock >= 10) {
    return null;
  }

  return (
    <span className="ml-2 inline-flex rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
      Low stock
    </span>
  );
}

async function downloadProductsCsv() {
  const response = await apiClient.get<Blob>("/export/csv", {
    params: { entity: "products" },
    responseType: "blob"
  });
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = "products.csv";
  document.body.append(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProductSort>("revenue");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);
  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      sort,
      order,
      page,
      limit
    }),
    [debouncedSearch, limit, order, page, sort]
  );
  const productsQuery = useQuery({
    queryKey: ["products", queryParams],
    queryFn: async () => {
      const response = await apiClient.get<ProductsResponse>("/products", {
        params: queryParams
      });
      return response.data;
    }
  });
  const totalPages = Math.max(1, Math.ceil((productsQuery.data?.total ?? 0) / limit));
  const startIndex = (page - 1) * limit;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit, order, sort]);

  async function handleExport() {
    setIsExporting(true);
    setExportError(null);

    try {
      await downloadProductsCsv();
    } catch {
      setExportError("CSV export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search, sort, and export product performance from the seeded commerce dataset.
          </p>
        </div>
        <Button disabled={isExporting} onClick={() => void handleExport()} variant="outline">
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting" : "Export CSV"}
        </Button>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Product performance</CardTitle>
          <CardDescription>Sort by revenue or units sold, then page through the product catalog.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[minmax(240px,1fr)_160px_140px_120px]">
            <div className="space-y-2">
              <Label htmlFor="product-search">Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  id="product-search"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name or category"
                  value={search}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-sort">Sort</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="product-sort"
                onChange={(event) => setSort(event.target.value as ProductSort)}
                value={sort}
              >
                <option value="revenue">Revenue</option>
                <option value="units">Units</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-order">Order</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="product-order"
                onChange={(event) => setOrder(event.target.value as SortOrder)}
                value={order}
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-limit">Limit</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="product-limit"
                onChange={(event) => setLimit(Number(event.target.value))}
                value={limit}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {exportError ? (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {exportError}
            </div>
          ) : null}

          <div className="mt-6 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Product name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Units sold</th>
                  <th className="px-4 py-3 font-medium">Revenue</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {productsQuery.isLoading ? <TableSkeleton limit={limit} /> : null}
                {productsQuery.isError ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-sm text-destructive" colSpan={7}>
                      Product data could not be loaded.
                    </td>
                  </tr>
                ) : null}
                {!productsQuery.isLoading && !productsQuery.isError && productsQuery.data?.products.length === 0 ? (
                  <tr>
                    <td className="px-4 py-12 text-center" colSpan={7}>
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <PackageSearch className="h-8 w-8" />
                        <p className="font-medium text-foreground">No products found</p>
                        <p className="text-sm">Try a different search term or clear the filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : null}
                {!productsQuery.isLoading && !productsQuery.isError
                  ? productsQuery.data?.products.map((product, index) => (
                      <tr className="border-b border-border last:border-0 hover:bg-muted/40" key={product.id}>
                        <td className="px-4 py-4 text-muted-foreground">{startIndex + index + 1}</td>
                        <td className="px-4 py-4 font-medium">{product.name}</td>
                        <td className="px-4 py-4 text-muted-foreground">{product.category}</td>
                        <td className="px-4 py-4">{formatEuroCurrency(product.price)}</td>
                        <td className="px-4 py-4">{formatNumber(product.unitsSold)}</td>
                        <td className="px-4 py-4 font-medium">{formatEuroCurrency(product.revenue)}</td>
                        <td className="px-4 py-4">
                          {formatNumber(product.stock)}
                          <LowStockBadge stock={product.stock} />
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 text-sm text-muted-foreground md:flex-row md:items-center">
            <p>
              Showing page {page} of {totalPages} · {formatNumber(productsQuery.data?.total ?? 0)} products
            </p>
            <div className="flex items-center gap-2">
              <Button
                disabled={page <= 1 || productsQuery.isLoading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                variant="outline"
              >
                Previous
              </Button>
              <Button
                disabled={page >= totalPages || productsQuery.isLoading}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
