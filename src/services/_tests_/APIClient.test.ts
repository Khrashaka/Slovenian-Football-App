// src/services/APIClient.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Configuration constants
const API_FOOTBALL_BASE = 'https://api-football-v1.p.rapidapi.com/v2';
const FOOTBALL_NEWS_BASE = 'https://football-api-news.p.rapidapi.com';

// League IDs for Slovenian competitions
export const LEAGUE_IDS = {
  SNL: 211, // 1. SNL
  POKAL_SLOVENIJE: 212, // Pokal Slovenije
  UCL: 2, // Champions League
  UEL: 3, // Europa League
  CONFERENCE_LEAGUE: 848 // Conference League
};

// Types for API responses
export interface Fixture {
  fixture_id: number;
  league_id: number;
  league: {
    name: string;
    country: string;
    logo: string;
  };
  event_date: string;
  event_timestamp: number;
  firstHalfStart: number;
  secondHalfStart: number;
  round: string;
  status: string;
  statusShort: string;
  elapsed: number;
  venue: string;
  referee: string;
  homeTeam: {
    team_id: number;
    team_name: string;
    logo: string;
  };
  awayTeam: {
    team_id: number;
    team_name: string;
    logo: string;
  };
  goalsHomeTeam: number;
  goalsAwayTeam: number;
  score: {
    halftime: string;
    fulltime: string;
    extratime: string;
    penalty: string;
  };
}

export interface Standing {
  rank: number;
  team_id: number;
  teamName: string;
  logo: string;
  group: string;
  forme: string;
  status: string;
  description: string;
  all: {
    matchsPlayed: number;
    win: number;
    draw: number;
    lose: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  home: {
    matchsPlayed: number;
    win: number;
    draw: number;
    lose: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  away: {
    matchsPlayed: number;
    win: number;
    draw: number;
    lose: number;
    goalsFor: number;
    goalsAgainst: number;
  };
  goalsDiff: number;
  points: number;
  lastUpdate: string;
}

export interface PlayerStatistics {
  player_id: number;
  player_name: string;
  firstname: string;
  lastname: string;
  number: number;
  position: string;
  age: number;
  birth_date: string;
  birth_place: string;
  birth_country: string;
  nationality: string;
  height: string;
  weight: string;
  injured: boolean;
  rating: string;
  team_id: number;
  team_name: string;
  league_id: number;
  season: string;
  captain: boolean;
  games: {
    appearences: number;
    lineups: number;
    minutes: number;
    position: string;
    rating: string;
    captain: boolean;
  };
  substitutes: {
    in: number;
    out: number;
    bench: number;
  };
  shots: {
    total: number;
    on: number;
  };
  goals: {
    total: number;
    conceded: number;
    assists: number;
    saves: number;
  };
  passes: {
    total: number;
    key: number;
    accuracy: number;
  };
  tackles: {
    total: number;
    blocks: number;
    interceptions: number;
  };
  duels: {
    total: number;
    won: number;
  };
  dribbles: {
    attempts: number;
    success: number;
    past: number;
  };
  fouls: {
    drawn: number;
    committed: number;
  };
  cards: {
    yellow: number;
    yellowred: number;
    red: number;
  };
  penalty: {
    won: number;
    commited: number;
    success: number;
    missed: number;
    saved: number;
  };
}

export interface Transfer {
  player_id: number;
  player_name: string;
  transfer_date: string;
  type: string;
  team_in: {
    team_id: number;
    team_name: string;
    logo: string;
  };
  team_out: {
    team_id: number;
    team_name: string;
    logo: string;
  };
}

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage?: string;
  description?: string;
  content?: string;
}

// Cache interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class APIClient {
  private footballAPI: AxiosInstance;
  private newsAPI: AxiosInstance;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private requestCounts: Map<string, number> = new Map();
  private readonly CACHE_TTL = {
    LIVE_FIXTURES: 30 * 1000, // 30 seconds
    FIXTURES: 5 * 60 * 1000, // 5 minutes
    STANDINGS: 15 * 60 * 1000, // 15 minutes
    PLAYER_STATS: 60 * 60 * 1000, // 1 hour
    TRANSFERS: 24 * 60 * 60 * 1000, // 24 hours
    NEWS: 10 * 60 * 1000 // 10 minutes
  };

  constructor(
    private footballApiKey: string,
    private newsApiKey: string
  ) {
    // Initialize Football API client
    this.footballAPI = axios.create({
      baseURL: API_FOOTBALL_BASE,
      headers: {
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        'X-RapidAPI-Key': footballApiKey
      }
    });

    // Initialize News API client for Football API News
    this.newsAPI = axios.create({
      baseURL: FOOTBALL_NEWS_BASE,
      headers: {
        'X-RapidAPI-Host': 'football-api-news.p.rapidapi.com',
        'X-RapidAPI-Key': newsApiKey
      }
    });

    this.setupInterceptors();
    this.startCacheCleanup();
  }

  private setupInterceptors(): void {
    // Add request interceptors for rate limiting
    this.footballAPI.interceptors.request.use((config) => {
      const host = config.headers['X-RapidAPI-Host'] as string;
      const count = this.requestCounts.get(host) || 0;
      this.requestCounts.set(host, count + 1);
      return config;
    });

    this.newsAPI.interceptors.request.use((config) => {
      const host = config.headers['X-RapidAPI-Host'] as string;
      const count = this.requestCounts.get(host) || 0;
      this.requestCounts.set(host, count + 1);
      return config;
    });

    // Add response interceptors for error handling
    this.footballAPI.interceptors.response.use(
      (response) => response,
      this.handleAPIError
    );

    this.newsAPI.interceptors.response.use(
      (response) => response,
      this.handleAPIError
    );
  }

  private handleAPIError = async (error: any) => {
    if (error.response?.status === 429) {
      // Rate limit exceeded - implement exponential backoff
      const retryAfter = parseInt(error.response.headers['retry-after']) || 60;
      console.warn(`Rate limit exceeded. Retrying after ${retryAfter} seconds`);
      await this.delay(retryAfter * 1000);
      return axios.request(error.config);
    }
    
    if (error.response?.status >= 500) {
      // Server error - retry once after delay
      console.warn('Server error, retrying...');
      await this.delay(2000);
      return axios.request(error.config);
    }

    return Promise.reject(error);
  };

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}:${paramString}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.timestamp + entry.ttl) {
          this.cache.delete(key);
        }
      }
    }, 5 * 60 * 1000); // Clean every 5 minutes
  }

  // Football API methods
  async getLiveFixtures(): Promise<Fixture[]> {
    const cacheKey = this.getCacheKey('live-fixtures');
    const cached = this.getFromCache<Fixture[]>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse = await this.footballAPI.get('/fixtures/live');
      const fixtures = response.data.api.fixtures;
      
      // Filter for Slovenian teams or relevant competitions
      const relevantFixtures = fixtures.filter((fixture: Fixture) => 
        Object.values(LEAGUE_IDS).includes(fixture.league_id) ||
        this.isSlovenianTeam(fixture.homeTeam.team_name) ||
        this.isSlovenianTeam(fixture.awayTeam.team_name)
      );

      this.setCache(cacheKey, relevantFixtures, this.CACHE_TTL.LIVE_FIXTURES);
      return relevantFixtures;
    } catch (error) {
      console.error('Error fetching live fixtures:', error);
      return [];
    }
  }

  async getFixturesByLeague(leagueId: number, season?: string): Promise<Fixture[]> {
    const params = { season };
    const cacheKey = this.getCacheKey(`fixtures-league-${leagueId}`, params);
    const cached = this.getFromCache<Fixture[]>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse = await this.footballAPI.get(
        `/fixtures/league/${leagueId}`,
        { params }
      );
      const fixtures = response.data.api.fixtures;
      
      this.setCache(cacheKey, fixtures, this.CACHE_TTL.FIXTURES);
      return fixtures;
    } catch (error) {
      console.error(`Error fetching fixtures for league ${leagueId}:`, error);
      return [];
    }
  }

  async getStandings(leagueId: number): Promise<Standing[]> {
    const cacheKey = this.getCacheKey(`standings-${leagueId}`);
    const cached = this.getFromCache<Standing[]>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse = await this.footballAPI.get(`/standings/${leagueId}`);
      const standings = response.data.api.standings[0]; // First group (usually main table)
      
      this.setCache(cacheKey, standings, this.CACHE_TTL.STANDINGS);
      return standings;
    } catch (error) {
      console.error(`Error fetching standings for league ${leagueId}:`, error);
      return [];
    }
  }

  async getPlayerStatistics(leagueId: number, season: string): Promise<PlayerStatistics[]> {
    const params = { league: leagueId, season };
    const cacheKey = this.getCacheKey('player-statistics', params);
    const cached = this.getFromCache<PlayerStatistics[]>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse = await this.footballAPI.get('/players/statistics', { params });
      const players = response.data.api.players;
      
      this.setCache(cacheKey, players, this.CACHE_TTL.PLAYER_STATS);
      return players;
    } catch (error) {
      console.error('Error fetching player statistics:', error);
      return [];
    }
  }

  async getTransfers(leagueId: number): Promise<Transfer[]> {
    const params = { league: leagueId };
    const cacheKey = this.getCacheKey('transfers', params);
    const cached = this.getFromCache<Transfer[]>(cacheKey);
    if (cached) return cached;

    try {
      const response: AxiosResponse = await this.footballAPI.get('/transfers', { params });
      const transfers = response.data.api.transfers;
      
      this.setCache(cacheKey, transfers, this.CACHE_TTL.TRANSFERS);
      return transfers;
    } catch (error) {
      console.error('Error fetching transfers:', error);
      return [];
    }
  }

  // Updated News API methods for Football API News
  async getNews(): Promise<NewsArticle[]> {
    const cacheKey = this.getCacheKey('news');
    const cached = this.getFromCache<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    try {
      // Use Football API News endpoints
      const response = await this.newsAPI.get('/news', {
        params: {
          q: 'Slovenia football OR NK Maribor OR Slovenian league',
          sortBy: 'publishedAt',
          pageSize: 20
        }
      });

      const articles = response.data.articles || response.data || [];
      
      // Transform and filter for Slovenian football
      const transformedNews = this.transformNewsArticles(articles);
      const slovenianNews = this.filterSlovenianFootballNews(transformedNews);
      
      this.setCache(cacheKey, slovenianNews, this.CACHE_TTL.NEWS);
      return slovenianNews;
    } catch (error) {
      console.error('Error fetching news:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  // Transform news articles to our format
  private transformNewsArticles(articles: any[]): NewsArticle[] {
    return articles.map(article => ({
      title: article.title || '',
      url: article.url || article.link || '',
      source: article.source?.name || article.source || 'Football API News',
      publishedAt: article.publishedAt || article.published_at || article.pubDate || new Date().toISOString(),
      urlToImage: article.urlToImage || article.image || article.media || undefined,
      description: article.description || article.summary || '',
      content: article.content || article.description || ''
    }));
  }

  // Utility methods
  private isSlovenianTeam(teamName: string): boolean {
    const slovenianTeams = [
      'NK Maribor', 'NK Olimpija', 'NK Celje', 'NK Domžale', 'NK Koper',
      'NK Bravo', 'NK Mura', 'NK Radomlje', 'NK Primorje', 'NK Kalcer Radomlje'
    ];
    return slovenianTeams.some(team => 
      teamName.toLowerCase().includes(team.toLowerCase())
    );
  }

  private deduplicateNews(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    return articles.filter(article => {
      if (seen.has(article.url)) {
        return false;
      }
      seen.add(article.url);
      return true;
    });
  }

  private filterSlovenianFootballNews(articles: NewsArticle[]): NewsArticle[] {
    const keywords = [
      'maribor', 'nk maribor', 'ljudski vrt',
      'olimpija', 'nk olimpija', 'slovenia', 'slovenian',
      'celje', 'domžale', 'koper', 'bravo', 'mura',
      '1. snl', 'primera liga', 'slovenian league'
    ];
    
    return articles.filter(article => 
      keywords.some(keyword => 
        article.title.toLowerCase().includes(keyword) ||
        (article.description && article.description.toLowerCase().includes(keyword)) ||
        (article.content && article.content.toLowerCase().includes(keyword))
      )
    );
  }

  private filterMariborNews(articles: NewsArticle[]): NewsArticle[] {
    const keywords = ['maribor', 'nk maribor', 'ljudski vrt'];
    return articles.filter(article => 
      keywords.some(keyword => 
        article.title.toLowerCase().includes(keyword) ||
        (article.description && article.description.toLowerCase().includes(keyword)) ||
        (article.content && article.content.toLowerCase().includes(keyword))
      )
    );
  }

  // Analytics methods
  calculatePlayerAverageRating(player: PlayerStatistics): number {
    if (!player.games?.appearences || player.games.appearences === 0) return 0;
    const totalRating = parseFloat(player.rating) || 0;
    return totalRating / player.games.appearences;
  }

  getTopPlayersByPosition(players: PlayerStatistics[], position: string, limit: number = 5): PlayerStatistics[] {
    return players
      .filter(player => player.position.toLowerCase().includes(position.toLowerCase()))
      .sort((a, b) => this.calculatePlayerAverageRating(b) - this.calculatePlayerAverageRating(a))
      .slice(0, limit);
  }

  // Rate limit info
  getRateLimitInfo(): Record<string, number> {
    return Object.fromEntries(this.requestCounts);
  }

  // Clear cache method
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
let apiClientInstance: APIClient | null = null;

export const initializeAPIClient = (footballApiKey: string, newsApiKey: string): APIClient => {
  if (!apiClientInstance) {
    apiClientInstance = new APIClient(footballApiKey, newsApiKey);
  }
  return apiClientInstance;
};

export const getAPIClient = (): APIClient => {
  if (!apiClientInstance) {
    throw new Error('API Client not initialized. Call initializeAPIClient first.');
  }
  return apiClientInstance;
};

export default APIClient;
