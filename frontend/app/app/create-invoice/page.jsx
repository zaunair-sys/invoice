import CreateInvoice from "@/components/CreateInvoice";

export default async function CreateInvoicePage({ searchParams }) {
  const params = await searchParams;
  return <CreateInvoice initialTemplate={params?.template} />;
}
