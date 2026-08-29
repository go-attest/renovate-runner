# renovate-runner

Runs [Renovate](https://docs.renovatebot.com) over the 109 organisations no
other runner watches — 685 repositories — from one daily GitHub Actions job.

## Who watches what

| runner | orgs | repos |
|---|---|---|
| `go-ruby-stdlib/renovate-runner` | the 205 `go-ruby-*` | ~900 |
| `go-pdfkit/renovate-runner` | `go-pdfkit`, `go-gfx`, `go-opentype`, `go-widgets` | ~40 |
| **this one** | **the remaining 109** | **685** |

Before these existed, nothing watched any of them. That is not a theoretical
cost: an app shipped eight releases behind its own renderer, and a co-editing
library spent a day showing every reader in a session the wrong letters,
because a two-release-old dependency was never flagged.

## Why not the app

Installing the hosted Mend app on an organisation is an OAuth flow a person
clicks through, and there is no API behind it — 109 times. A token does the
rest, so a token does.

## What it needs

One secret, `RENOVATE_TOKEN`, a personal access token with `repo` and
`workflow`. The `workflow` scope is not optional: without it every pull request
that touches `.github/workflows/*` is refused, and those are the ones the
`github-actions` manager opens.

## The filter is a list, and that is deliberate

Almost every org here is named `go-something` — and so are the 205 the other
runner takes. `go-*` would cover both, and two runners would work the same
repositories. Regenerate the list with `gh api user/orgs --paginate`, minus the
orgs the other two name.

## The trap that makes a green run do nothing

Renovate pushes as `bot@renovateapp.com` by default, and this account blocks
pushes that expose a non-noreply email. Left alone, **every branch push is
rejected and the run still reports success**. `gitAuthor` in `config.js` is what
stops that.

So a run is not verified by its own green tick. It is verified by there being
`renovate/*` branches and open pull requests on a repository that had something
to update.
