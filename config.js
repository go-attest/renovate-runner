// Self-hosted Renovate for the orgs no other runner watches.
//
// Two runners already exist: go-ruby-stdlib/renovate-runner takes the 205
// go-ruby-* orgs, go-pdfkit/renovate-runner the four of the PDF fleet. This one
// takes the remaining 109, holding 685 repositories, which nothing watched.
//
// It runs a SLICE of that list at a time, and that is the whole point.
//
// A token has five thousand API requests an hour. 685 repositories want far
// more than that, and the first full pass proved it: it reached 32 orgs, hit
// rate-limit-exceeded on the 33rd, and exited. The failure itself is not the
// problem — Renovate would have been re-run the next day. The problem is that
// it walks the list in the same order every time, so it would have died at the
// same place every time, and the last 77 orgs would NEVER have been looked at.
//
// So each run takes one slice, on its own hour, with an hour's budget to
// itself. RENOVATE_SLICE says which; the workflow maps a cron to a number.
const orgs = require('./orgs.js');

const slices = 6;
const slice = parseInt(process.env.RENOVATE_SLICE || '1', 10);
const size = Math.ceil(orgs.length / slices);
const mine = orgs.slice((slice - 1) * size, slice * size);

module.exports = {
  platform: 'github',
  // The account blocks pushes that expose a non-noreply email, and Renovate's
  // default author is bot@renovateapp.com. Left alone, every branch push is
  // rejected and the run still reports success.
  gitAuthor: 'tannevaled <tannevaled@users.noreply.github.com>',
  autodiscover: true,
  autodiscoverFilter: mine.map((o) => `${o}/**`),
  onboarding: false,          // a repo that wants none is left alone
  requireConfig: 'optional',  // process a repo even if it has no renovate.json
  dependencyDashboard: true,  // one "Dependency Dashboard" issue per repo
  // Carries what it learned from one run to the next, which is most of the
  // requests it would otherwise spend.
  repositoryCache: 'enabled',

  prConcurrentLimit: 10,
  prHourlyLimit: 10,
  branchConcurrentLimit: 20,

  packageRules: [
    {
      // A library that breaks is one library. A toolchain that breaks is every
      // architecture at once, and the failure is not in the change: it is
      // somewhere else, later, in code nobody touched.
      //
      // One is broken today. go1.27.0 miscompiles on loong64 — golang/go#81000,
      // bisected on real hardware — and go-gfx/gfx fails its loong64 lane on
      // exactly this bump while its other ten pass. A repository without a
      // loong64 lane sees nothing and would merge it unattended, because a
      // toolchain bump counts as a minor gomod update.
      //
      // This is set here, on the runner, rather than in each org's preset:
      // it then holds for every repository this watches, including the ones
      // that have no preset of their own.
      matchManagers: ['gomod', 'github-actions'],
      matchDepNames: ['go'],
      automerge: false,
    },
    {
      matchManagers: ['github-actions'],
      groupName: 'github actions',
      groupSlug: 'github-actions',
    },
  ],
};
