// src/services/FootballAPIService.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_FOOTBALL_BASE = 'https://api-football-v1.p.rapidapi.com/v3';
const FOOTBALL_NEWS_BASE = 'https://api-football-beta.p.rapidapi.com/news';

// League IDs for Slovenian and European competitions
export const LEAGUE_IDS = {
  SLOVENIA_1_SNL: 211, // Prva Liga Telekom Slovenije
  SLOVENIA_CUP: 212, // Pokal Slovenije
  UEFA_CHAMPIONS_LEAGUE: 2,
  UEFA_EUROPA_LEAGUE: 3,
  UEFA_CONFERENCE_LEAGUE: 848
};

// Team IDs for 2025/26 Slovenian PrvaLiga teams
export const TEAM_IDS = {
  // Current 2025/26 PrvaLiga teams (10 teams total)
  NK_OLIMPIJA_LJUBLJANA: 4772, // 2024/25 champions
  NK_MARIBOR: 790, // 16-time champions, most successful club
  NK_CELJE: 710, // 2023/24 champions
  FC_KOPER: 433,
  NS_MURA: 4059,
  NK_BRAVO: 26985, // Also plays as AŠK Bravo Publikum
  NK_DOMZALE: 711,
  ND_PRIMORJE: 712, // Continuing from 2024/25
  NK_ALUMINIJ: 26986, // Full name: NK Aluminij Kidričevo
  NK_RADOMLJE: 26987 // Also known as Kalcer Radomlje
};

// Current season info
export const CURRENT_SEASON = {
  YEAR: 2025, // 2025/26 season
  START_DATE: '2025-07-18', // Season starts July 18, 2025
  END_DATE: '2026-05-24', // Expected end date
  PREVIOUS_CHAMPION: 'NK Olimpija Ljubljana', // 2024/25 champions
  DEFENDING_CHAMPION: 'NK Olimpija Ljubljana', // 2024/25 champions
  MOST_SUCCESSFUL: 'NK Maribor', // 16 titles
  TOTAL_TEAMS: 10,
  TOTAL_MATCHES: 36, // Each team plays 36 matches (4 times against each other team)
  MATCHES_PER_TEAM_VS_EACH: 4 // Twice home, twice away
};

// Slovenian team name variations for better detection
export const SLOVENIAN_TEAM_NAMES = [
  // Official names
  'NK Olimpija Ljubljana', 'Olimpija Ljubljana', 'Olimpija',
  'NK Maribor', 'Maribor',
  'NK Celje', 'Celje',
  'FC Koper', 'NK Koper', 'Koper',
  'NŠ Mura', 'NS Mura', 'Mura',
  'NK Bravo', 'Bravo', 'AŠK Bravo',
  'NK Domžale', 'Domžale',
  'ND Primorje', 'NK Primorje', 'Primorje',
  'NK Aluminij', 'Aluminij',
  'NK Radomlje', 'Radomlje', 'Kalcer Radomlje'
];

// Data interfaces matching real API responses
export interface APIFixture {
  fixture: {
    id: number;
    referee: string;
    timezone: string;
    date: string;
    timestamp: number;
    status: {
      long: string;
      short: string;
      elapsed: number;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
  };
}

export interface APIStanding {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  update: string;
}

export interface APIPlayer {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    birth: {
      date: string;
      place: string;
      country: string;
    };
    nationality: string;
    height: string;
    weight: string;
    injured: boolean;
    photo: string;
  };
  statistics: Array<{
    team: {
      id: number;
      name: string;
      logo: string;
    };
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      flag: string;
      season: number;
    };
    games: {
      appearences: number;
      lineups: number;
      minutes: number;
      number: number;
      position: string;
      rating: string;
      captain: boolean;
    };
    goals: {
      total: number;
      conceded: number;
      assists: number;
      saves: number;
    };
  }>;
}

export interface APITransfer {
  player: {
    id: number;
    name: string;
  };
  update: string;
  transfers: Array<{
    date: string;
    type: string;
    teams: {
      in: {
        id: number;
        name: string;
        logo: string;
      };
      out: {
        id: number;
        name: string;
        logo: string;
      };
    };
  }>;
}

export interface APINewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  image: string;
  published: string;
}

// Error handling interface
export interface APIError {
  message: string;
  status: number;
  endpoint: string;
}

class FootballAPIService {
  private footballAPI: AxiosInstance;
  private newsAPI: AxiosInstance;
  private requestCount = 0;
  private readonly MAX_REQUESTS_PER_MINUTE = 100;

  constructor(private footballApiKey: string, private newsApiKey?: string) {
    // Initialize Football API client
    this.footballAPI = axios.create({
      baseURL: API_FOOTBALL_BASE,
      headers: {
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        'X-RapidAPI-Key': footballApiKey,
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    // Initialize News API client if key is provided
    if (newsApiKey) {
      this.newsAPI = axios.create({
        baseURL: FOOTBALL_NEWS_BASE,
        headers: {
          'X-RapidAPI-Host': 'api-football-beta.p.rapidapi.com',
          'X-RapidAPI-Key': newsApiKey,
          'Accept': 'application/json'
        },
        timeout: 15000
      });
    }

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for rate limiting
    this.footballAPI.interceptors.request.use((config) => {
      this.requestCount++;
      console.log(`Football API Request #${this.requestCount}: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Response interceptor for error handling
    this.footballAPI.interceptors.response.use(
      (response) => {
        console.log(`Football API Response: ${response.status} - ${response.config.url}`);
        return response;
      },
      this.handleAPIError
    );

    if (this.newsAPI) {
      this.newsAPI.interceptors.request.use((config) => {
        console.log(`News API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      });

      this.newsAPI.interceptors.response.use(
        (response) => response,
        this.handleAPIError
      );
    }
  }

  private handleAPIError = async (error: AxiosError): Promise<never> => {
    const apiError: APIError = {
      message: error.message,
      status: error.response?.status || 0,
      endpoint: error.config?.url || 'unknown'
    };

    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded, waiting before retry...');
      await this.delay(3000);
      if (error.config) {
        return axios.request(error.config);
      }
    }

    if (error.response?.status === 403) {
      throw new Error('API key invalid or subscription expired. Please check your RapidAPI subscription.');
    }

    if (error.response?.status >= 500) {
      console.warn('Server error, retrying...');
      await this.delay(2000);
      if (error.config) {
        return axios.request(error.config);
      }
    }

    console.error('Football API Error:', apiError);
    throw error;
  };

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get live fixtures
  async getLiveFixtures(): Promise<APIFixture[]> {
    try {
      console.log('Fetching live fixtures for Slovenian teams...');
      const response = await this.footballAPI.get('/fixtures', {
        params: {
          live: 'all'
        }
      });

      const fixtures = response.data.response || [];
      
      // Filter for Slovenian teams or competitions
      const slovenianFixtures = fixtures.filter((fixture: APIFixture) => 
        this.isSlovenianFixture(fixture)
      );

      console.log(`Found ${slovenianFixtures.length} live Slovenian fixtures`);
      return slovenianFixtures;
    } catch (error) {
      console.error('Error fetching live fixtures:', error);
      return [];
    }
  }

  // Get fixtures by league for current season
  async getFixturesByLeague(leagueId: number, season: number = CURRENT_SEASON.YEAR): Promise<APIFixture[]> {
    try {
      console.log(`Fetching fixtures for league ${leagueId}, season ${season}...`);
      const response = await this.footballAPI.get('/fixtures', {
        params: {
          league: leagueId,
          season: season,
          timezone: 'Europe/Ljubljana'
        }
      });

      const fixtures = response.data.response || [];
      console.log(`Loaded ${fixtures.length} fixtures for league ${leagueId}`);
      return fixtures;
    } catch (error) {
      console.error(`Error fetching fixtures for league ${leagueId}:`, error);
      return [];
    }
  }

  // Get recent fixtures (last 30 days)
  async getRecentFixtures(): Promise<APIFixture[]> {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      console.log('Fetching recent Slovenian fixtures...');
      const response = await this.footballAPI.get('/fixtures', {
        params: {
          league: LEAGUE_IDS.SLOVENIA_1_SNL,
          season: CURRENT_SEASON.YEAR,
          from: thirtyDaysAgo.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0],
          timezone: 'Europe/Ljubljana'
        }
      });

      const fixtures = response.data.response || [];
      console.log(`Loaded ${fixtures.length} recent fixtures`);
      return fixtures;
    } catch (error) {
      console.error('Error fetching recent fixtures:', error);
      return [];
    }
  }

  // Get upcoming fixtures (next 30 days)
  async getUpcomingFixtures(): Promise<APIFixture[]> {
    try {
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      console.log('Fetching upcoming Slovenian fixtures...');
      const response = await this.footballAPI.get('/fixtures', {
        params: {
          league: LEAGUE_IDS.SLOVENIA_1_SNL,
          season: CURRENT_SEASON.YEAR,
          from: today.toISOString().split('T')[0],
          to: thirtyDaysFromNow.toISOString().split('T')[0],
          timezone: 'Europe/Ljubljana'
        }
      });

      const fixtures = response.data.response || [];
      console.log(`Loaded ${fixtures.length} upcoming fixtures`);
      return fixtures;
    } catch (error) {
      console.error('Error fetching upcoming fixtures:', error);
      return [];
    }
  }

  // Get league standings for current season
  async getStandings(leagueId: number, season: number = CURRENT_SEASON.YEAR): Promise<APIStanding[]> {
    try {
      console.log(`Fetching standings for league ${leagueId}, season ${season}...`);
      const response = await this.footballAPI.get('/standings', {
        params: {
          league: leagueId,
          season: season
        }
      });

      const standings = response.data.response?.[0]?.league?.standings?.[0] || [];
      console.log(`Loaded ${standings.length} team standings`);
      return standings;
    } catch (error) {
      console.error(`Error fetching standings for league ${leagueId}:`, error);
      return [];
    }
  }

  // Get player statistics for current season
  async getPlayerStatistics(leagueId: number, season: number = CURRENT_SEASON.YEAR): Promise<APIPlayer[]> {
    try {
      console.log('Fetching player statistics for 2025/26 season...');
      const allPlayers: APIPlayer[] = [];
      
      // Get top players from each Slovenian team
      const teamIds = Object.values(TEAM_IDS);
      for (let i = 0; i < teamIds.length; i++) {
        const teamId = teamIds[i];
        try {
          console.log(`Fetching players for team ${teamId}...`);
          const response = await this.footballAPI.get('/players', {
            params: {
              league: leagueId,
              season: season,
              team: teamId,
              page: 1
            }
          });

          const players = response.data.response || [];
          allPlayers.push(...players);
          console.log(`Added ${players.length} players from team ${teamId}`);
          
          // Add delay to respect rate limits
          await this.delay(500);
        } catch (teamError) {
          console.warn(`Failed to fetch players for team ${teamId}:`, teamError);
          continue;
        }
      }

      console.log(`Total players loaded: ${allPlayers.length}`);
      return allPlayers;
    } catch (error) {
      console.error('Error fetching player statistics:', error);
      return [];
    }
  }

  // Get transfers for current transfer window
  async getTransfers(): Promise<APITransfer[]> {
    try {
      console.log('Fetching recent transfers for Slovenian teams...');
      const allTransfers: APITransfer[] = [];
      
      const teamIds = Object.values(TEAM_IDS);
      for (let i = 0; i < Math.min(teamIds.length, 6); i++) { // Limit to 6 teams to avoid rate limits
        const teamId = teamIds[i];
        try {
          console.log(`Fetching transfers for team ${teamId}...`);
          const response = await this.footballAPI.get('/transfers', {
            params: {
              team: teamId
            }
          });

          const transfers = response.data.response || [];
          allTransfers.push(...transfers);
          console.log(`Added ${transfers.length} transfers from team ${teamId}`);
          
          // Add delay to respect rate limits
          await this.delay(500);
        } catch (teamError) {
          console.warn(`Failed to fetch transfers for team ${teamId}:`, teamError);
          continue;
        }
      }

      console.log(`Total transfers loaded: ${allTransfers.length}`);
      return allTransfers;
    } catch (error) {
      console.error('Error fetching transfers:', error);
      return [];
    }
  }

  // Get football news (requires news API key)
  async getNews(): Promise<APINewsArticle[]> {
    if (!this.newsAPI) {
      console.warn('News API key not configured');
      return [];
    }

    try {
      console.log('Fetching Slovenian football news...');
      const response = await this.newsAPI.get('', {
        params: {
          search: 'Slovenia football OR NK Maribor OR NK Olimpija OR PrvaLiga',
          language: 'en',
          limit: 20
        }
      });

      const articles = response.data.articles || [];
      console.log(`Loaded ${articles.length} news articles`);
      return articles;
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  // Test API connection
  async testConnection(): Promise<{ success: boolean; message: string; requestsUsed: number }> {
    try {
      console.log('Testing API connection...');
      const response = await this.footballAPI.get('/status');
      const status = response.data.response;
      
      return {
        success: true,
        message: `API connection successful. Subscription: ${status?.subscription || 'Unknown'}`,
        requestsUsed: this.requestCount
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        requestsUsed: this.requestCount
      };
    }
  }

  // Helper methods
  private isSlovenianFixture(fixture: APIFixture): boolean {
    // Check if it's Slovenian league
    if (fixture.league.id === LEAGUE_IDS.SLOVENIA_1_SNL || fixture.league.id === LEAGUE_IDS.SLOVENIA_CUP) {
      return true;
    }

    // Check if any Slovenian team is playing
    return SLOVENIAN_TEAM_NAMES.some(teamName => {
      const homeTeamMatch = fixture.teams.home.name.toLowerCase().includes(teamName.toLowerCase());
      const awayTeamMatch = fixture.teams.away.name.toLowerCase().includes(teamName.toLowerCase());
      return homeTeamMatch || awayTeamMatch;
    });
  }

  // Get current season info
  getCurrentSeasonInfo() {
    return {
      ...CURRENT_SEASON,
      teamsInLeague: Object.keys(TEAM_IDS).length,
      seasonStatus: this.getSeasonStatus()
    };
  }

  private getSeasonStatus(): string {
    const now = new Date();
    const seasonStart = new Date(CURRENT_SEASON.START_DATE);
    const seasonEnd = new Date(CURRENT_SEASON.END_DATE);

    if (now < seasonStart) {
      return 'Pre-season';
    } else if (now > seasonEnd) {
      return 'Completed';
    } else {
      return 'In Progress';
    }
  }

  // Get API usage statistics
  getUsageStats(): { requestsUsed: number; rateLimitReached: boolean } {
    return {
      requestsUsed: this.requestCount,
      rateLimitReached: this.requestCount >= this.MAX_REQUESTS_PER_MINUTE
    };
  }
}

export default FootballAPIService;