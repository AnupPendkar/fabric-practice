import React from "react";

function withInstanceCollection<T>(
  WrappedComponent: React.ComponentType<{
    instanceCollection: InstanceCollectionProps<T>;
  }>
) {}
