import api from "./client";

export const simulatorApi = {
  listScenarios: () =>
    api.get("/api/simulator/scenarios").then((r) => r.data.data.scenarios),

  charge: (data) =>
    api.post("/api/simulator/charge", data).then((r) => r.data.data),
};
