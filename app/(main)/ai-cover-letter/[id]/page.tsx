import React from "react";

interface Props {
  params: {
    id: any;
  };
}

const CoverLetter = async ({ params }: Props) => {
  const id = params.id;
  return <div>CoverLetter: {id}</div>;
};

export default CoverLetter;
