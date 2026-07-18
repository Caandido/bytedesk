/**
 * Integração (leitura) com a GitHub API pública — sem autenticação, sujeito ao
 * rate limit de 60 req/h por IP. Chamada direto do frontend (a API do GitHub
 * habilita CORS para GETs públicos).
 */

export interface GitHubRepoInfo {
  branch: string;
  lastCommit: string;
  tags: string[];
  stars: number;
  description: string;
}

/** True se a URL parece um repositório do github.com. */
export function isGitHubUrl(url: string): boolean {
  return /github\.com\/[^/]+\/[^/#?]+/.test(url);
}

/** Busca dados públicos de um repositório do GitHub a partir da URL. */
export async function fetchGitHubRepo(repoUrl: string): Promise<GitHubRepoInfo> {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/);
  if (!match) throw new Error('URL do GitHub inválida.');
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '');
  const base = `https://api.github.com/repos/${owner}/${repo}`;

  const repoRes = await fetch(base);
  if (!repoRes.ok) {
    throw new Error(
      repoRes.status === 404
        ? 'Repositório não encontrado (ou privado).'
        : repoRes.status === 403
          ? 'Limite da API do GitHub atingido. Tente mais tarde.'
          : `Erro do GitHub (${repoRes.status}).`,
    );
  }
  const repoData = await repoRes.json();

  const [commitsRes, tagsRes] = await Promise.all([
    fetch(`${base}/commits?per_page=1`),
    fetch(`${base}/tags?per_page=10`),
  ]);
  const commits = commitsRes.ok ? await commitsRes.json() : [];
  const tags = tagsRes.ok ? await tagsRes.json() : [];

  return {
    branch: repoData.default_branch ?? '',
    lastCommit:
      (commits[0]?.commit?.message as string | undefined)?.split('\n')[0] ?? '',
    tags: Array.isArray(tags)
      ? tags.map((t: { name: string }) => t.name).slice(0, 10)
      : [],
    stars: repoData.stargazers_count ?? 0,
    description: repoData.description ?? '',
  };
}
