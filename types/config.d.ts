interface OrgConfig {
    public: string[];
    private: string[];
    unknown: string[];
}

interface Config {
    [org: string]: OrgConfig;
}
