
    // Get upcoming events (startDate > now)
    const now = new Date();
    const upcomingEvents = events
      .filter((e) => e.startDate && new Date(e.startDate) > now)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      })
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        name: e.name,
        status: e.status,
        createdAt: e.createdAt,
      }));

    // Get recent events (last 5, sorted by createdAt)
    const recentEvents = events
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        name: e.name,
        status: e.status,
        createdAt: e.createdAt,
      }));

    return {
      ...stats,
      upcomingEvents,
      recentEvents,
    };
  }
}
