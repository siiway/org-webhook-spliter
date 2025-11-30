interface SingleHook {
	name: string | null = null;
	url: string;
	headers: Headers = {};
}

interface OrgConfig {
	public: SingleHook[];
	private: SingleHook[];
	others: SingleHook[];
}

interface OrgConfig {
	[org: string]: OrgConfig;
}

interface RepoConfig {
	[repos: string]: SingleHook[];
}
