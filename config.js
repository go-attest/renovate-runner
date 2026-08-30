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
//
// The org list lives HERE, inline, and must stay here. renovatebot/github-action
// mounts the configuration file ALONE into the container:
//
//     --volume <configurationFile>:/github-action/config.js
//
// Nothing else from the checkout is mounted. A sibling `require('./orgs.js')`
// therefore resolves to /github-action/orgs.js, which does not exist, and
// Renovate dies with "FATAL: Error parsing config file" — which names no path,
// so it reads like a syntax error and is not one. It validates locally, where
// the sibling is present, and fails only in CI. Do not split this list out.
//
// Regenerate with `gh api user/orgs --paginate --jq '.[].login'`, minus the orgs
// the other two runners name (the 205 go-ruby-* and the four of the PDF fleet).
const orgs = [
  'Polytechnique-IDCS',
  'apple-vz',
  'claimward',
  'cloud-boot',
  'cloud-pool-managers',
  'configuration-management-tool',
  'deskplan',
  'go-asmgen',
  'go-atproto',
  'go-attest',
  'go-augeas',
  'go-avkit',
  'go-birdsite',
  'go-bootloaders',
  'go-browserhttp',
  'go-coff',
  'go-commonmark',
  'go-composites',
  'go-compressions',
  'go-coord',
  'go-crdt',
  'go-datetime',
  'go-deltasync',
  'go-desktop',
  'go-dimail',
  'go-diskimages',
  'go-doom',
  'go-embedded-ruby',
  'go-encryptions',
  'go-erasure',
  'go-extractors',
  'go-eyaml',
  'go-facter',
  'go-fde',
  'go-fft',
  'go-filesystems',
  'go-freedesktop',
  'go-fsctl',
  'go-graphdrawing',
  'go-grub',
  'go-hackernews',
  'go-hiera',
  'go-hocon',
  'go-iconoir',
  'go-icons',
  'go-images',
  'go-instagram',
  'go-keyring',
  'go-kramdown',
  'go-lemmy',
  'go-liquid',
  'go-lsp-bridge',
  'go-macos',
  'go-mastodon',
  'go-mswin',
  'go-mustache',
  'go-ndarray',
  'go-net-dhcp',
  'go-net-health',
  'go-news-reader',
  'go-newsgroups',
  'go-nokogiri',
  'go-odf',
  'go-pcore',
  'go-pkgx',
  'go-proc',
  'go-puppet',
  'go-puppet-bolt',
  'go-puppetdb',
  'go-quake1',
  'go-quake2',
  'go-quake3',
  'go-reddit',
  'go-regexp',
  'go-richdoc',
  'go-rouge',
  'go-rtf',
  'go-scss',
  'go-sicp',
  'go-simd',
  'go-streamkit',
  'go-synctex',
  'go-syndication',
  'go-tex',
  'go-thumbnail',
  'go-tiktok',
  'go-tpm2',
  'go-typeset',
  'go-versions',
  'go-vet-analyzers',
  'go-virtio',
  'go-volumes',
  'go-webengine',
  'go-xrkit',
  'go-xslt',
  'go-yjs-relay',
  'grpc-transports',
  'jupytercloud-project',
  'libfw',
  'libhcl',
  'mash-installers',
  'nano-container-linux',
  'openstack-continuous-integration',
  'openstack-terraform-modules',
  'plmteam-mathrice',
  'pocketdesk',
  'resinfo-gt-cloud',
  'ssh-tools',
  'wasmdesk',
];

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
