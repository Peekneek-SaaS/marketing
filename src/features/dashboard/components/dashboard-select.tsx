import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export default function DashboardSelect() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.getAllProducts.queryOptions());

  return (
    <Select defaultValue="SEO">
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          <SelectLabel>Maketing</SelectLabel>
          <SelectItem value="SEO">SEO</SelectItem>
          <SelectItem value="Email Marketing">Email Marketing</SelectItem>
          <SelectItem value="Social Media">Social Media</SelectItem>
          <SelectItem value="Content Marketing">Content Marketing</SelectItem>
          <SelectItem value="Paid Advertising">Paid Advertising</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
