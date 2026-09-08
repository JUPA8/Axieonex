"use client";

import { useState } from "react";
import { ServiceEcosystemDiagram } from "@/components/services/ServiceEcosystemDiagram";
import { ServiceModulePanel } from "@/components/services/ServiceModulePanel";
import { SERVICES, getService } from "@/content/services";

export function ServicesHubInteractive() {
  const [active, setActive] = useState(SERVICES[0].slug);
  const service = getService(active) ?? SERVICES[0];

  return (
    <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
      <ServiceEcosystemDiagram active={active} onSelect={setActive} />
      <ServiceModulePanel service={service} />
    </div>
  );
}
