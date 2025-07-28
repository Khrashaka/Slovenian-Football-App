// src/hooks/useFootballAPI.ts
import { useState, useEffect, useCallback } from 'react';
import FootballAPIService, { 
  APIFixture, 
  APIStanding, 
  APIPlayer, 
  APITransfer, 
  APINewsArticle,
  LEAGUE_IDS,
  CURRENT_SEASON
} from '../services/FootballAPIService';

// Transformed data interfaces for the UI
export interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  competition: string;
  date: string;
  isLive: boolean;
  round: string;
}

export interface Standing {
  position: number;
  team: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDifference: number;
  form: string;
  goalsFor: number;
  goalsAgainst: number;
}

export interface Player {
  name: string;
  club: string;
  position: string;
  games: number;
  rating: number;
  avgRating: number;
  goals: number;
  assists: number;
  nationality: string;
  age: number;
}

export interface Transfer {
  player: string;
  from: string;
  to: string;
  date: string;
  type: string;
  fee?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  url: string;
}

interface UseFootballAPIResult {
  // Data
  liveFixtures: Fixture[];
  recentFixtures: Fixture[];
  upcomingFixtures: Fixture[];
  standings: Standing[];
  players: Player[];
  transfers: Transfer[];
  news: NewsItem[];
  
  // Loading states
  isLoadingLive: boolean;
  isLoadingFixtures: boolean;
  isLoadingUpcoming: boolean;
  isLoadingStandings: boolean;
  isLoadingPlayers: boolean;
  isLoadingTransfers: boolean;
  isLoadingNews: boolean;
  isLoadingAny: boolean;
  
  // Error states
  errors: {
    live?: string;
    fixtures?: string;
    upcoming?: string;
    standings?: string;
    players?: string;
    transfers?: string;
    news?: string;
  };
  
  // Methods
  refreshAll: () => Promise<void>;
  refreshLive: () => Promise<void>;
  refreshFixtures: () => Promise<void>;
  refreshUpcoming: () => Promise<void>;
  refreshStandings: () => Promise<void>;
  refreshPlayers: () => Promise<void>;
  refreshTransfers: () => Promise<void>;
  refreshNews: () => Promise<void>;
  testConnection: () => Promise<{ success: boolean; message: string }>;
  
  // Stats and info
  apiStats: {
    requestsUsed: number;
    rateLimitReached: boolean;
  };
  seasonInfo: {
    year: number;
    status: string;
    champion: string;
    totalTeams: number;
  };
}

export const useFootballAPI = (footballApiKey?: string, newsApiKey?: string): UseFootballAPIResult => {
  // Data state
  const [liveFixtures, setLiveFixtures] = useState<Fixture[]>([]);
  const [recentFixtures, setRecentFixtures] = useState<Fixture[]>([]);
  const [upcomingFixtures, setUpcomingFixtures] = useState<Fixture[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  
  // Loading state
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [isLoadingFixtures, setIsLoadingFixtures] = useState(false);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(false);
  const [isLoadingStandings, setIsLoadingStandings] = useState(false);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [isLoadingTransfers, setIsLoadingTransfers] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  
  // Error state
  const [errors, setErrors] = useState<UseFootballAPIResult['errors']>({});
  
  // API service instance
  const [apiService, setApiService] = useState<FootballAPIService | null>(null);
  
  // Initialize API service when keys change
  useEffect(() => {
    if (footballApiKey) {
      console.log('Initializing Football API service for 2025/26 season with key:', footballApiKey.substring(0, 8) + '...');
      setApiService(new FootballAPIService(footballApiKey, newsApiKey));
    } else {
      setApiService(null);
    }
  }, [footballApiKey, newsApiKey]);

  // Transform API data to UI format
  const transformFixture = (apiFixture: APIFixture): Fixture => ({
    id: apiFixture.fixture.id,
    homeTeam: apiFixture.teams.home.name,
    awayTeam: apiFixture.teams.away.name,
    homeScore: apiFixture.goals.home,
    awayScore: apiFixture.goals.away,
    status: apiFixture.fixture.status.short,
    competition: apiFixture.league.name,
    date: apiFixture.fixture.date,
    round: apiFixture.league.round,
    isLive: ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(apiFixture.fixture.status.short)
  });

  const transformStanding = (apiStanding: APIStanding): Standing => ({
    position: apiStanding.rank,
    team: apiStanding.team.name,
    points: apiStanding.points,
    played: apiStanding.all.played,
    won: apiStanding.all.win,
    drawn: apiStanding.all.draw,
    lost: apiStanding.all.lose,
    goalDifference: apiStanding.goalsDiff,
    form: apiStanding.form,
    goalsFor: apiStanding.all.goals.for,
    goalsAgainst: apiStanding.all.goals.against
  });

  const transformPlayer = (apiPlayer: APIPlayer): Player => {
    const stats = apiPlayer.statistics[0]; // Use first team stats
    return {
      name: apiPlayer.player.name,
      club: stats?.team.name || 'Unknown',
      position: stats?.games.position || 'Unknown',
      games: stats?.games.appearences || 0,
      rating: parseFloat(stats?.games.rating || '0') * (stats?.games.appearences || 1),
      avgRating: parseFloat(stats?.games.rating || '0'),
      goals: stats?.goals.total || 0,
      assists: stats?.goals.assists || 0,
      nationality: apiPlayer.player.nationality,
      age: apiPlayer.player.age
    };
  };

  const transformTransfer = (apiTransfer: APITransfer): Transfer[] => {
    return apiTransfer.transfers.map(transfer => ({
      player: apiTransfer.player.name,
      from: transfer.teams.out.name,
      to: transfer.teams.in.name,
      date: transfer.date,
      type: transfer.type,
      fee: undefined // Fee not provided by free API
    }));
  };

  const transformNews = (apiNews: APINewsArticle): NewsItem => ({
    id: apiNews.url,
    title: apiNews.title,
    summary: apiNews.description,
    source: apiNews.source,
    publishedAt: apiNews.published,
    imageUrl: apiNews.image,
    url: apiNews.url
  });

  // API methods
  const refreshLive = useCallback(async () => {
    if (!apiService) return;
    
    setIsLoadingLive(true);
    setErrors(prev => ({ ...prev, live: undefined }));
    
    try {
      console.log('Fetching live fixtures for 2025/26 season...');
      const apiFixtures = await apiService.getLiveFixtures();
      const transformedFixtures = apiFixtures.map(transformFixture);
      setLiveFixtures(transformedFixtures);
      console.log(`Loaded ${transformedFixtures.length} live fixtures`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load live fixtures';
      setErrors(prev => ({ ...prev, live: errorMessage }));
      console.error('Error loading live fixtures:', error);
    } finally {
      setIsLoadingLive(false);
    }
  }, [apiService]);

  const refreshFixtures = useCallback(async () => {
    if (!apiService) return;
    
    setIsLoadingFixtures(true);
    setErrors(prev => ({ ...prev, fixtures: undefined }));
    
    try {
      console.log('Fetching recent fixtures for 2025/26 season...');
      const apiFixtures = await apiService.getRecentFixtures();
      const transformedFixtures = apiFixtures.map(transformFixture);
      setRecentFixtures(transformedFixtures);
      console.log(`Loaded ${transformedFixtures.length} recent fixtures`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load fixtures';
      setErrors(prev => ({ ...prev, fixtures: errorMessage }));
      console.error('Error loading fixtures:', error);
    } finally {
      setIsLoadingFixtures(false);
    }
  }, [apiService]);

  const refreshUpcoming = useCallback(async () => {
    if (!apiService) return;
    
    setIsLoadingUpcoming(true);
    setErrors(prev => ({ ...prev, upcoming: undefined }));
    
    try {
      console.log('Fetching upcoming fixtures for 2025/26 season...');
      const apiFixtures = await apiService.getUpcomingFixtures();
      const transformedFixtures = apiFixtures.map(transformFixture);
      setUpcomingFixtures(transformedFixtures);
      console.log(`Loaded ${transformedFixtures.length} upcoming fixtures`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load upcoming fixtures';
      setErrors(prev => ({ ...prev, upcoming: errorMessage }));
      console.error('Error loading upcoming fixtures:', error);
    } finally {
      setIsLoadingUpcoming(false);
    }
  }, [apiService]);

  const refreshStandings = useCallback(async () => {
    if (!apiService) return;
    
    setIsLoadingStandings(true);
    setErrors(prev => ({ ...prev, standings: undefined }));
    
    try {
      console.log('Fetching 2025/26 PrvaLiga standings...');
      const apiStandings = await apiService.getStandings(LEAGUE_IDS.SLOVENIA_1_SNL);
      const transformedStandings = apiStandings.map(transformStanding);
      setStandings(transformedStandings);
      console.log(`Loaded ${transformedStandings.length} team standings`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load standings';
      setErrors(prev => ({ ...prev, standings: errorMessage }));
      console.error('Error loading standings:', error);
    } finally {
      setIsLoadingStandings(false);
    }
  }, [apiService]);

  const refreshPlayers = useCallback(async () => {
    if (!apiService) return;
    
    setIsLoadingPlayers(true);
    setErrors(prev => ({ ...prev, players: undefined }));
    
    try {
      console.log('Fetching player statistics for 2025/26 season...');
      const apiPlayers = await apiService.getPlayerStatistics(LEAGUE_IDS.SLOVENIA_1_SNL);
      const transformedPlayers = apiPlayers.map(transformPlayer)
        .filter(player => player.games > 0)
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 25); // Top 25 players
      setPlayers(transformedPlayers);
      console.log(`Loaded ${transformedPlayers.length} player statistics`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load player statistics';
      setErrors(prev => ({ ...prev, players: errorMessage }));
      console.error('Error loading players:', error);
    } finally {
      setIsLoadingPlayers(false);
    }
  }, [apiService]);

  const refreshTransfers = useCallback(async () => {
    if (!apiService) return;
    
    setIsLoadingTransfers(true);
    setErrors(prev => ({ ...prev, transfers: undefined }));
    
    try {
      console.log('Fetching recent transfers for 2025/26 season...');
      const apiTransfers = await apiService.getTransfers();
      const allTransfers = apiTransfers.flatMap(transformTransfer)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 15); // Most recent 15 transfers
      setTransfers(allTransfers);
      console.log(`Loaded ${allTransfers.length} transfers`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load transfers';
      setErrors(prev => ({ ...prev, transfers: errorMessage }));
      console.error('Error loading transfers:', error);
    } finally {
      setIsLoadingTransfers(false);
    }
  }, [apiService]);

  const refreshNews = useCallback(async () => {
    if (!apiService) return;
    
    setIsLoadingNews(true);
    setErrors(prev => ({ ...prev, news: undefined }));
    
    try {
      console.log('Fetching Slovenian football news...');
      const apiNews = await apiService.getNews();
      const transformedNews = apiNews.map(transformNews);
      setNews(transformedNews);
      console.log(`Loaded ${transformedNews.length} news articles`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load news';
      setErrors(prev => ({ ...prev, news: errorMessage }));
      console.error('Error loading news:', error);
    } finally {
      setIsLoadingNews(false);
    }
  }, [apiService]);

  const refreshAll = useCallback(async () => {
    if (!apiService) return;
    
    console.log('Refreshing all 2025/26 season data...');
    await Promise.allSettled([
      refreshLive(),
      refreshFixtures(),
      refreshUpcoming(),
      refreshStandings(),
      refreshPlayers(),
      refreshTransfers(),
      refreshNews()
    ]);
    console.log('All data refresh completed');
  }, [refreshLive, refreshFixtures, refreshUpcoming, refreshStandings, refreshPlayers, refreshTransfers, refreshNews]);

  const testConnection = useCallback(async () => {
    if (!apiService) {
      return { success: false, message: 'API service not initialized' };
    }
    
    try {
      const result = await apiService.testConnection();
      return result;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }, [apiService]);

  // Computed values
  const isLoadingAny = isLoadingLive || isLoadingFixtures || isLoadingUpcoming || 
                     isLoadingStandings || isLoadingPlayers || isLoadingTransfers || isLoadingNews;

  const apiStats = apiService ? apiService.getUsageStats() : { requestsUsed: 0, rateLimitReached: false };

  const seasonInfo = {
    year: CURRENT_SEASON.YEAR,
    status: apiService ? apiService.getCurrentSeasonInfo().seasonStatus : 'Unknown',
    champion: CURRENT_SEASON.PREVIOUS_CHAMPION,
    totalTeams: CURRENT_SEASON.TOTAL_TEAMS
  };

  return {
    // Data
    liveFixtures,
    recentFixtures,
    upcomingFixtures,
    standings,
    players,
    transfers,
    news,
    
    // Loading states
    isLoadingLive,
    isLoadingFixtures,
    isLoadingUpcoming,
    isLoadingStandings,
    isLoadingPlayers,
    isLoadingTransfers,
    isLoadingNews,
    isLoadingAny,
    
    // Error states
    errors,
    
    // Methods
    refreshAll,
    refreshLive,
    refreshFixtures,
    refreshUpcoming,
    refreshStandings,
    refreshPlayers,
    refreshTransfers,
    refreshNews,
    testConnection,
    
    // Stats and info
    apiStats,
    seasonInfo
  };
};