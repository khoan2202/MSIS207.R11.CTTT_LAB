export interface Laptop {
  id: string;
  name: string;
  brand: string;
  price: number;
}

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  sortable?: boolean;
}

export interface DataGridProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  ariaLabel: string;
  onRowSelect?: (item: T) => void;
}

export const laptops: Laptop[] = Array.from(
  { length: 23 },
  (_, index) => ({
    id: `laptop-${index + 1}`,

    name: `Laptop ${String(index + 1).padStart(2, "0")}`,

    brand: ["Dell", "Asus", "Lenovo", "HP"][index % 4],

    price: 12000000 + index * 750000,
  }),
);

export const columns: ColumnDef<Laptop>[] = [
  {
    header: "Tên laptop",
    accessorKey: "name",
    sortable: true,
  },
  {
    header: "Hãng",
    accessorKey: "brand",
    sortable: true,
  },
  {
    header: "Giá (VND)",
    accessorKey: "price",
    sortable: true,
  },
];