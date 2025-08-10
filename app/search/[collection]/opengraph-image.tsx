

import OpengraphImage from "@/app/components/opengraph-image";
import { getCollection } from "@/app/lib/constants";

export default async function Image({
  params
}: {
  params: { collection: string };
}) {
  const collection = await getCollection(params.collection);
  const title = collection?.title;

  return await OpengraphImage({ title });
}
