import { defineRoute } from "$fresh/server.ts";

import { renderMarkdown } from "@/utils/content/markdow.ts";
import { getPost } from "@/utils/content//posts.ts";
import { isPostComplete } from "@/utils/db.ts";

import { ProgressToggle } from "@/islands/ProgressToggle.tsx";

import Head from "@/components/Head.tsx";
import { Partial } from "$fresh/runtime.ts";
import { TableOfContents } from "@/islands/TableOfContents.tsx";

export default defineRoute(async (_req, ctx) => {
  const post = await getPost(ctx.params.module, ctx.params.slug);
  if (post === null) return await ctx.renderNotFound();

  const isComplete = ctx.state.sessionUser
    ? await isPostComplete(
      ctx.state.sessionUser.login,
      post.moduleSlug,
      post.slug,
    )
    : false;

  const { html, headings } = renderMarkdown(post.content);

  return (
    <>
      <Head title={post.title} href={ctx.url.href}>
        <link rel="stylesheet" href="/markdown.css" />
      </Head>
      <div class="max-w-3xl mx-auto px-4 py-8">
        <article class="prose prose-gray max-w-none">
          {ctx.state.sessionUser && (
            <div class="mb-8">
              <ProgressToggle
                initialComplete={isComplete}
                userId={ctx.state.sessionUser.login}
                moduleSlug={post.moduleSlug}
                postSlug={post.slug}
              />
            </div>
          )}

          <Partial name="docs-main">
            <div class="w-full min-w-0">
              <main class="lg:ml-[18rem] mt-4 min-w-0 mx-auto">
                <div class="flex gap-6 md:gap-8 xl:gap-[8%] flex-col xl:flex-row md:mx-8 lg:mx-16 2xl:mx-0 lg:justify-end">
                  <TableOfContents headings={headings} />

                  <div class="lg:order-1 min-w-0 max-w-3xl w-full">
                    <h1 class="text-4xl text-gray-900 tracking-tight font-bold md:mt-0 px-4 md:px-0 mb-4">
                      {post.title}
                    </h1>
                    <div
                      class="markdown-body mb-8"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />

                    <div class="mb-8">
                      {
                        /* <ForwardBackButtons
                      slug={page.slug}
                      version={page.version}
                      prev={page.prevNav}
                      next={page.nextNav}
                    /> */
                      }
                    </div>
                    <hr />
                    <div class="px-4 md:px-0 flex justify-between my-6">
                      <a
                        href={`https://github.com/sammarxz/fresh/edit/main/${post.slug}`}
                        class="text-green-600 underline flex items-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg class="w-4 h-4 inline-block mr-1">
                          <use href="/icons.svg#external" />
                        </svg>
                        Edite essa página no GitHub
                      </a>
                    </div>
                  </div>
                </div>
                {
                  /* <div class="xl:ml-[3.75rem]">
                <Footer />
              </div> */
                }
              </main>
            </div>
          </Partial>
        </article>
      </div>
    </>
  );
});