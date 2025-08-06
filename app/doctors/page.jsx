import React, { Suspense } from "react";

import Doctor from "../../components/doctor";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[200px] flex items-center justify-center">
          Loading doctors...
        </div>
      }
    >
      <Doctor />
    </Suspense>
  );
}
