// interface SingleHook {
// 	name?: string; // 可选
// 	url: string; // 必填
// 	headers?: Record<string, string | null>; // 可选，支持 null 删除
// }

interface OrgRepoConfig {
	public?: SingleHook[];
	private?: SingleHook[];
	others?: SingleHook[];
}

interface OrgConfig {
	[org: string]: OrgRepoConfig;
}

interface RepoConfig {
	[fullName: string]: SingleHook[];
}
