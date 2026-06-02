// Lightweight in-process counters — good enough for /metrics on a single instance
const counters = {
  httpRequestsTotal: 0,
  reservationsCreated: 0,
  reservationsExpired: 0,
  checkoutsCompleted: 0,
  reservationConflicts: 0,
};

export const metrics = {
  incrementHttp(): void {
    counters.httpRequestsTotal += 1;
  },
  incrementReservation(): void {
    counters.reservationsCreated += 1;
  },
  incrementExpiry(count: number): void {
    counters.reservationsExpired += count;
  },
  incrementCheckout(): void {
    counters.checkoutsCompleted += 1;
  },
  incrementConflict(): void {
    counters.reservationConflicts += 1;
  },
  snapshot(): Record<string, number> {
    return { ...counters };
  },
};
