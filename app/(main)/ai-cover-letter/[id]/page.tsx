import React from "react";

interface Props = {
  params: Promise<{ id: string }>;
};

const CoverLetter = async ({ params }: Props) => {
  const { id } = await params;
  return <div>CoverLetter: {id}</div>;
};

export default CoverLetter;
