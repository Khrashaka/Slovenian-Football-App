// Simple hook without JSX
export const useFootballData = () => {
  return {
    liveFixtures: [],
    fixtures: {},
    standings: {},
    players: [],
    transfers: [],
    news: [],
    isLoadingLive: false,
    isLoadingFixtures: false,
    isLoadingStandings: false,
    isLoadingPlayers: false,
    isLoadingTransfers: false,
    isLoadingNews: false,
    errors: {},
    refreshLiveFixtures: async () => {},
    refreshFixtures: async () => {},
    refreshStandings: async () => {},
    refreshPlayers: async () => {},
    refreshTransfers: async () => {},
    refreshNews: async () => {},
    refreshAll: async () => {},
    getTopPlayers: () => [],
    getLeagueLeader: () => null,
    getRecentTransfers: () => []
  };
};