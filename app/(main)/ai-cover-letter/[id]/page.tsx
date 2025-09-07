import React from "react";

type Props = {
  params: { id: string };
};

const CoverLetter = ({ params }: Props) => {
  const { id } = params;
  return (
    <div>
      CoverLetter: {id}
    </div>
  );
};

export default CoverLetter;
