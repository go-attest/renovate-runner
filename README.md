# renovate-runner — retired

**Disabled on 2026-08-30.** Every organisation this watched now runs Renovate
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

The config stays in the history, and so do the two traps written down in it:
Renovate's default git author makes every branch it writes rejected **while the
run still reports success**, and a toolchain bump counts as a minor update and
will merge itself.
