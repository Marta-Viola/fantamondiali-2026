export const PHASE_SCHEDULE = {
    GIRONI: {
        label: "Fase a Gironi",
        defaultOpen: "2026-06-08T09:00:00:00Z",
        defaultClosed: "2026-06-10T21:00:00:00Z",
        nextPhaseOpen: "2026-06-28T09:00:00:00Z"
    },
    SEDICESIMI: {
        label: "Sedicesimi di Finale",
        defaultOpen: "2026-06-28T09:00:00:00Z",
        defaultClosed: "2026-06-28T21:00:00:00Z",
        nextPhaseOpen: "2026-07-04T07:00:00:00Z"
    },
    OTTAVI: {
        label: "Ottavi di Finale",
        defaultOpen: "2026-07-04T07:00:00:00Z",
        defaultClosed: "2026-07-04T19:00:00:00Z",
        nextPhaseOpen: "2026-07-08T09:00:00:00Z"
    },
    QUARTI: {
        label: "Quarti di Finale",
        defaultOpen: "2026-07-08T09:00:00:00Z",
        defaultClosed: "2026-07-09T21:00:00:00Z",
        nextPhaseOpen: "2026-07-12T09:00:00:00Z"
    },
    SEMIFINALI: {
        label: "Semifinali",
        defaultOpen: "2026-07-12T09:00:00:00Z",
        defaultClosed: "2026-07-14T21:00:00:00Z",
        nextPhaseOpen: "2026-07-16T09:00:00:00Z"
    },
    FINALE: {
        label: "Finale",
        defaultOpen: "2026-07-16T09:00:00:00Z",
        defaultClosed: "2026-07-18T21:00:00:00Z",
        nextPhaseOpen: null
    }
} as const