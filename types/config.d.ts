interface OrgConfig {
    public: string[];
    private: string[];
    unknown: string[];
}

interface OrgConfig {
    [org: string]: OrgConfig;
}

interface RepoConfig {
    [repos: string]: string[]
}