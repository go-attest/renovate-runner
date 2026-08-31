# renovate-runner — retired

**Disabled on 2026-08-31.** Every organisation this watched now runs Renovate
from its own `.github` repository, beside the preset it already held.

## Why

It was given a token's whole hourly request budget and still ran out of it. Its
first full pass reached 32 organisations of 109 and stopped on
`rate-limit-exceeded`.

The failure was not the problem — it would have been re-run the next day. The
problem is that it walked the list **in the same order every time**, so it would
have died in the same place every time, and the last 77 organisations would
never have been looked at at all. Silently, run after run, while the first 32
kept opening pull requests and the whole thing kept looking like it worked.

Slicing the list across six hourly runs fixed that, and was a workaround for a
shape that did not need to exist. One organisation is a few repositories: a run
over it never comes near five thousand requests. There is nothing to slice,
nothing to schedule around, and no list of names to keep current when an
organisation is added — which is the other thing this repository had to carry,
because `go-*` would have collided with the `go-ruby-*` runner.

## Why this had to be written twice

That conclusion was already written here on 2026-08-30, and **the workflow was
left enabled**. It kept running — two scheduled runs on 2026-08-31 alone, both
green. A README saying "retired" over a runner that still runs is worse than no
README, because it is the thing that stops anyone looking.

What it was still doing, measured on 2026-08-31 before the workflow was
disabled:

- **All 109 organisations in its `autodiscover` list already run their own
  runner.** Each has a live `.github` repository holding
  `.github/workflows/renovate.yml` in state `active`, and each of the 109 had
  run within the previous two days. This repository uniquely covered nothing.
  The one organisation whose `.github` is archived, `go-iconoir`, is archived
  entirely — every repository in it — so no runner can act there and none is
  owed one.
- **The duplication produced nothing to notice.** Both runners read the same
  per-organisation preset, which groups every non-breaking update under
  `groupSlug: deps`, so both write the same branch: `renovate/deps`. Two runners
  over one repository do not open two pull requests. They overwrite each other's
  branch, and the result looks exactly like one runner working.
- **Thirty of those per-organisation runners are scheduled inside this one's own
  slice hours, 05–10 UTC**, drawing on the same token's five thousand requests an
  hour. That is precisely the starvation the 24-hour stagger was installed to
  prevent.

The config stays in the history, and so do the two traps written down in it:
Renovate's default git author makes every branch it writes rejected **while the
run still reports success**, and a toolchain bump counts as a minor update and
will merge itself.
