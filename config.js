// Self-hosted Renovate for the orgs no other runner watches.
//
// Two runners already exist. go-ruby-stdlib/renovate-runner takes the 205
// go-ruby-* orgs; go-pdfkit/renovate-runner takes the four of the PDF fleet.
// This one takes the remaining 109, which hold 685 repositories between
// them, and which nothing was watching at all.
//
// It lives here because keeping a dependency current is the same work as
// signing a release and listing what went into it: this org already holds
// sign and sbom.
//
// The filter is an explicit list rather than a glob. Almost every org here is
// named go-something, and so are the 205 the other runner takes — 'go-*' would
// cover both and two runners would work the same repositories. Regenerate it
// with:
//
//	gh api user/orgs --paginate --jq '.[].login'
//
// minus the orgs the other two runners name.
module.exports = {
  platform: 'github',
  // The account blocks pushes that expose a non-noreply email, and Renovate's
  // default author is bot@renovateapp.com. Left alone, every branch push is
  // rejected and the run still reports success.
  gitAuthor: 'tannevaled <tannevaled@users.noreply.github.com>',
  autodiscover: true,
  autodiscoverFilter: [
    'Polytechnique-IDCS/**',
    'apple-vz/**',
    'claimward/**',
    'cloud-boot/**',
    'cloud-pool-managers/**',
    'configuration-management-tool/**',
    'deskplan/**',
    'go-asmgen/**',
    'go-atproto/**',
    'go-attest/**',
    'go-augeas/**',
    'go-avkit/**',
    'go-birdsite/**',
    'go-bootloaders/**',
    'go-browserhttp/**',
    'go-coff/**',
    'go-commonmark/**',
    'go-composites/**',
    'go-compressions/**',
    'go-coord/**',
    'go-crdt/**',
    'go-datetime/**',
    'go-deltasync/**',
    'go-desktop/**',
    'go-dimail/**',
    'go-diskimages/**',
    'go-doom/**',
    'go-embedded-ruby/**',
    'go-encryptions/**',
    'go-erasure/**',
    'go-extractors/**',
    'go-eyaml/**',
    'go-facter/**',
    'go-fde/**',
    'go-fft/**',
    'go-filesystems/**',
    'go-freedesktop/**',
    'go-fsctl/**',
    'go-graphdrawing/**',
    'go-grub/**',
    'go-hackernews/**',
    'go-hiera/**',
    'go-hocon/**',
    'go-iconoir/**',
    'go-icons/**',
    'go-images/**',
    'go-instagram/**',
    'go-keyring/**',
    'go-kramdown/**',
    'go-lemmy/**',
    'go-liquid/**',
    'go-lsp-bridge/**',
    'go-macos/**',
    'go-mastodon/**',
    'go-mswin/**',
    'go-mustache/**',
    'go-ndarray/**',
    'go-net-dhcp/**',
    'go-net-health/**',
    'go-news-reader/**',
    'go-newsgroups/**',
    'go-nokogiri/**',
    'go-odf/**',
    'go-pcore/**',
    'go-pkgx/**',
    'go-proc/**',
    'go-puppet/**',
    'go-puppet-bolt/**',
    'go-puppetdb/**',
    'go-quake1/**',
    'go-quake2/**',
    'go-quake3/**',
    'go-reddit/**',
    'go-regexp/**',
    'go-richdoc/**',
    'go-rouge/**',
    'go-rtf/**',
    'go-scss/**',
    'go-sicp/**',
    'go-simd/**',
    'go-streamkit/**',
    'go-synctex/**',
    'go-syndication/**',
    'go-tex/**',
    'go-thumbnail/**',
    'go-tiktok/**',
    'go-tpm2/**',
    'go-typeset/**',
    'go-versions/**',
    'go-vet-analyzers/**',
    'go-virtio/**',
    'go-volumes/**',
    'go-webengine/**',
    'go-xrkit/**',
    'go-xslt/**',
    'go-yjs-relay/**',
    'grpc-transports/**',
    'jupytercloud-project/**',
    'libfw/**',
    'libhcl/**',
    'mash-installers/**',
    'nano-container-linux/**',
    'openstack-continuous-integration/**',
    'openstack-terraform-modules/**',
    'plmteam-mathrice/**',
    'pocketdesk/**',
    'resinfo-gt-cloud/**',
    'ssh-tools/**',
    'wasmdesk/**',
  ],
  onboarding: false,          // a repo that wants none is left alone
  requireConfig: 'optional',  // process a repo even if it has no renovate.json
  dependencyDashboard: true,  // one "Dependency Dashboard" issue per repo

  // Throttles, because a first pass over 685 repositories trips GitHub's
  // secondary rate limit. Renovate backs off and retries, so the fleet is
  // covered across several daily runs rather than all in one.
  prConcurrentLimit: 10,
  prHourlyLimit: 10,
  branchConcurrentLimit: 20,

  packageRules: [
    {
      matchManagers: ['github-actions'],
      groupName: 'github actions',
      groupSlug: 'github-actions',
    },
  ],
};
