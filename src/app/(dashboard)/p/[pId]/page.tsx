async function Page({ params }: { params: Promise<{ pId: string }> }) {
  const productId = await params;
  return <div>{JSON.stringify(productId, null, 2)}</div>;
}

export default Page;
