# Everend Forge live sync v0.1

Live sync has its own version from `runtime-package`. Messages are envelopes with a session, project, story, base revision, revision, origin, and typed payload. Narrative ownership is `pathbranching`, Unity presentation ownership is `unity`, and generated manifest/hash/orphan state is `adapter`.

The loopback daemon transports snapshots, change sets, inventories, validation reports, apply results, heartbeats, and errors. It does not read `.everend`, the Vault, Unity assets, or modify narrative content.

Offline bundles use the following files:

```text
runtime-package.json
sinpo-projection.json
adapter-manifest.json
validation-report.json
Ink/<sequence>/<event>.ink
```

The Unity dashboard consumes the bundle folder or the runtime package directly and runs both through the same analysis/apply coordinator used by live snapshots.
