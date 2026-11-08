export interface BlogPost {
  readonly id: number;
  readonly slug: string;
  readonly title: string;
  readonly date: string;
  readonly category: string;
  readonly excerpt: string;
  readonly image: string;
  readonly imageAlt: string;
  readonly contentHtml: string;
  readonly showLeadImage: boolean;
}
