interface OrgConfig {
    public: string[];
    private: string[];
    others: string[];
}

interface OrgConfig {
    [org: string]: OrgConfig;
}

interface RepoConfig {
    [repos: string]: string[]
}

interface HeadersConfig {
    [key: string]: string | null
}